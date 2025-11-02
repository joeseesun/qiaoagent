"""
CrewAI workflow engine - dynamically loads and executes workflows
"""
import json
import os
import sys
import io
import re
from contextlib import redirect_stdout, redirect_stderr
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from langchain_core.callbacks.base import BaseCallbackHandler
from dotenv import load_dotenv
from crew.llm_config import llm_config_manager

load_dotenv()

class StreamingCallbackHandler(BaseCallbackHandler):
    """Custom callback handler to capture streaming output"""

    def __init__(self, agent_name="Agent"):
        self.agent_name = agent_name
        self.current_text = ""

    def on_llm_start(self, serialized, prompts, **kwargs):
        """Called when LLM starts"""
        send_progress('thinking', f'开始思考...', self.agent_name)

    def on_llm_new_token(self, token: str, **kwargs):
        """Called when LLM generates a new token"""
        self.current_text += token
        # Send every few tokens to avoid too many updates
        if len(self.current_text) > 50:
            send_progress('stream', self.current_text, self.agent_name)
            self.current_text = ""

    def on_llm_end(self, response, **kwargs):
        """Called when LLM finishes"""
        if self.current_text:
            send_progress('stream', self.current_text, self.agent_name)
            self.current_text = ""
        send_progress('thinking', f'思考完成', self.agent_name)

    def on_chain_start(self, serialized, inputs, **kwargs):
        """Called when chain starts"""
        pass

    def on_chain_end(self, outputs, **kwargs):
        """Called when chain ends"""
        pass

    def on_agent_action(self, action, **kwargs):
        """Called when agent takes an action"""
        send_progress('thinking', f'执行动作: {action.tool}', self.agent_name)

    def on_agent_finish(self, finish, **kwargs):
        """Called when agent finishes"""
        send_progress('output', f'任务完成', self.agent_name)

def send_progress(progress_type: str, message: str, agent: str = None):
    """Send progress update to stderr with immediate flush"""
    if agent:
        progress_data = json.dumps({"type": progress_type, "message": message, "agent": agent}, ensure_ascii=False)
    else:
        progress_data = json.dumps({"type": progress_type, "message": message}, ensure_ascii=False)
    # Force immediate output by flushing stderr
    sys.stderr.write(f"PROGRESS:{progress_data}\n")
    sys.stderr.flush()

def load_workflow_config(workflow_id: str):
    """Load workflow configuration from workflows.json"""
    workflows_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'workflows.json')
    
    with open(workflows_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Find the workflow by id
    for workflow in data.get("workflows", []):
        if workflow["id"] == workflow_id:
            return workflow
    
    raise ValueError(f"Workflow '{workflow_id}' not found")

def create_llm(streaming=False, callbacks=None):
    """Create LLM instance with tu-zi.com API"""
    return ChatOpenAI(
        model=os.getenv("OPENAI_MODEL_NAME", "claude-sonnet-4-5-20250929"),
        openai_api_base=os.getenv("OPENAI_API_BASE", "https://api.tu-zi.com/v1"),
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        temperature=0.7,
        streaming=streaming,
        callbacks=callbacks if callbacks else []
    )

def create_agents(workflow_config, workflow_id, callbacks_map=None):
    """Create agents from workflow configuration"""
    agents = {}

    for agent_config in workflow_config.get("agents", []):
        agent_name = agent_config["name"]

        # Get LLM for this specific agent from configuration
        agent_llm = llm_config_manager.get_llm_for_agent(
            workflow_id=workflow_id,
            agent_name=agent_name,
            temperature=0.7,
            max_tokens=4000
        )

        # Add streaming callback for this agent
        agent_callbacks = callbacks_map.get(agent_name, []) if callbacks_map else []
        if agent_callbacks:
            agent_llm.callbacks = agent_callbacks

        agent = Agent(
            role=agent_config["role"],
            goal=agent_config["goal"],
            backstory=agent_config.get("prompt", ""),
            verbose=True,
            allow_delegation=False,
            llm=agent_llm
        )
        agents[agent_name] = agent

    return agents

def create_tasks(workflow_config, agents, topic: str):
    """Create tasks from workflow configuration"""
    tasks = []
    
    for task_config in workflow_config.get("tasks", []):
        # Replace {topic} placeholder with actual topic
        description = task_config["description"].replace("{topic}", topic)
        
        # Get the agent for this task
        agent_name = task_config["agent"]
        agent = agents.get(agent_name)
        
        if not agent:
            raise ValueError(f"Agent '{agent_name}' not found")
        
        task = Task(
            description=description,
            agent=agent,
            expected_output="Detailed output for the task"
        )
        tasks.append(task)
    
    return tasks

def parse_result(raw_output: str, workflow_id: str):
    """Parse CrewAI output into structured format"""
    # For tech_writer workflow, extract title, article, and summary
    if workflow_id == "tech_writer":
        # Simple parsing - in production, you might want more sophisticated parsing
        lines = raw_output.split('\n')
        
        title = ""
        article = ""
        summary = ""
        
        # Try to extract structured content
        current_section = None
        for line in lines:
            line_lower = line.lower().strip()
            
            if '标题' in line_lower or 'title' in line_lower:
                current_section = 'title'
                # Extract title from this line or next
                if ':' in line or '：' in line:
                    title = line.split(':', 1)[-1].split('：', 1)[-1].strip()
            elif '摘要' in line_lower or 'summary' in line_lower:
                current_section = 'summary'
            elif '正文' in line_lower or 'article' in line_lower or 'content' in line_lower:
                current_section = 'article'
            elif current_section == 'title' and not title:
                title = line.strip()
            elif current_section == 'article':
                article += line + '\n'
            elif current_section == 'summary':
                summary += line + '\n'
        
        # If parsing failed, use the whole output as article
        if not article:
            article = raw_output
        
        if not title:
            title = "AI 创作内容"
        
        if not summary:
            summary = article[:200] + "..."
        
        return {
            "title": title.strip(),
            "article": article.strip(),
            "summary": summary.strip()
        }
    
    elif workflow_id == "marketing_writer":
        # For marketing workflow
        return {
            "title": "营销文案",
            "article": raw_output,
            "summary": raw_output[:200] + "..."
        }
    
    # Default format
    return {
        "title": "生成内容",
        "article": raw_output,
        "summary": raw_output[:200] + "..."
    }

def run_workflow(topic: str, workflow_id: str):
    """Main function to run a workflow"""
    try:
        # Load workflow configuration
        workflow_config = load_workflow_config(workflow_id)

        # Create agents
        agents = create_agents(workflow_config, workflow_id)

        # Create tasks
        tasks = create_tasks(workflow_config, agents, topic)

        # Create and run crew
        crew = Crew(
            agents=list(agents.values()),
            tasks=tasks,
            process=Process.sequential,
            verbose=True
        )

        # Execute the crew
        result = crew.kickoff()

        # Parse and return result
        parsed_result = parse_result(str(result), workflow_id)

        return parsed_result

    except Exception as e:
        raise Exception(f"Workflow execution failed: {str(e)}")

def run_workflow_with_progress(topic: str, workflow_id: str):
    """Main function to run a workflow with progress updates"""
    try:
        send_progress('task', '加载工作流配置...')
        workflow_config = load_workflow_config(workflow_id)

        send_progress('task', f'工作流: {workflow_config["name"]}')

        send_progress('task', '初始化 AI 模型...')

        # Create streaming callbacks for each agent
        callbacks_map = {}
        for agent_config in workflow_config["agents"]:
            agent_name = agent_config["name"]
            callbacks_map[agent_name] = [StreamingCallbackHandler(agent_name)]

        send_progress('task', f'创建 {len(workflow_config["agents"])} 个 Agent...')
        agents = create_agents(workflow_config, workflow_id, callbacks_map)

        # Send agent info
        for agent_config in workflow_config["agents"]:
            send_progress('agent', f'{agent_config["name"]} - {agent_config["role"]}', agent_config["name"])

        send_progress('task', f'创建 {len(workflow_config["tasks"])} 个任务...')
        tasks = create_tasks(workflow_config, agents, topic)

        # Send task info
        for i, task_config in enumerate(workflow_config["tasks"], 1):
            send_progress('task', f'任务 {i}: {task_config["description"][:50]}...')

        send_progress('task', '开始执行工作流...')

        # Define step callback for streaming output
        def step_callback(step_output):
            """Callback executed after each step"""
            try:
                # step_output is a CrewAgentExecutorOutput object
                if hasattr(step_output, 'output') and step_output.output:
                    output_text = str(step_output.output)
                    if output_text and len(output_text) > 0:
                        # Send the output as a stream message
                        agent_name = getattr(step_output, 'agent', 'Agent')
                        send_progress('stream', output_text, str(agent_name))

                # Also send action information if available
                if hasattr(step_output, 'action') and step_output.action:
                    action_text = str(step_output.action)
                    if action_text and len(action_text) > 0:
                        agent_name = getattr(step_output, 'agent', 'Agent')
                        send_progress('thinking', f'执行: {action_text}', str(agent_name))
            except Exception as e:
                # Silently ignore callback errors to not break the workflow
                pass

        # Define task callback for task completion
        def task_callback(task_output):
            """Callback executed after each task"""
            try:
                if hasattr(task_output, 'raw') and task_output.raw:
                    output_text = str(task_output.raw)
                    if output_text and len(output_text) > 0:
                        agent_name = getattr(task_output, 'agent', 'Agent')
                        send_progress('output', f'任务完成: {output_text[:200]}...', str(agent_name))
            except Exception as e:
                pass

        # Create crew with callbacks
        crew = Crew(
            agents=list(agents.values()),
            tasks=tasks,
            process=Process.sequential,
            verbose=2,  # Maximum verbosity
            step_callback=step_callback,
            task_callback=task_callback
        )

        # Capture verbose output to send as thinking process
        thinking_buffer = io.StringIO()

        # Execute tasks and capture thinking
        for i, (task, task_config) in enumerate(zip(tasks, workflow_config["tasks"]), 1):
            agent_name = task_config["agent"]

            # Find the corresponding agent config
            agent_config = None
            for ag in workflow_config["agents"]:
                if ag["name"] == agent_name:
                    agent_config = ag
                    break

            send_progress('task', f'正在执行任务 {i}/{len(tasks)}...', agent_name)

            # Send thinking process with correct agent info
            if agent_config:
                send_progress('thinking',
                    f'分析任务: {task_config["description"][:100]}...\n'
                    f'目标: {agent_config["goal"]}\n'
                    f'开始推理和生成内容...',
                    agent_name
                )

        # Execute the crew
        try:
            # Redirect stdout to capture verbose output
            with redirect_stdout(thinking_buffer):
                result = crew.kickoff()

            # Send captured thinking as progress
            thinking_output = thinking_buffer.getvalue()
            if thinking_output:
                # Split by agent actions if possible
                for line in thinking_output.split('\n'):
                    if line.strip() and len(line) > 10:
                        send_progress('thinking', line.strip(), 'System')
        except Exception as e:
            result = crew.kickoff()

        send_progress('output', '正在解析结果...')

        # Parse and return result
        parsed_result = parse_result(str(result), workflow_id)

        send_progress('output', f'生成标题: {parsed_result["title"]}')
        send_progress('output', f'生成内容: {len(parsed_result["article"])} 字符')

        return parsed_result

    except Exception as e:
        send_progress('error', f'执行失败: {str(e)}')
        raise Exception(f"Workflow execution failed: {str(e)}")

