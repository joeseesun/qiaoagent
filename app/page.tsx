'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InputPanel } from '@/components/input-panel'
import { TimelineAgent } from '@/components/timeline-agent'
import { ResultPanel } from '@/components/result-panel'

interface Workflow {
  id: string
  name: string
}

interface Result {
  title: string
  article: string
  summary: string
}

interface AgentProcess {
  agent: string
  content: string
  timestamp: number
  status: 'waiting' | 'running' | 'completed' | 'error'
}

export default function Home() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('')
  const [topic, setTopic] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<Result | null>(null)
  const [agentProcesses, setAgentProcesses] = useState<AgentProcess[]>([])

  // Load workflows on mount
  useEffect(() => {
    fetch('/api/workflows')
      .then(res => res.json())
      .then(data => {
        setWorkflows(data.workflows || [])
        if (data.workflows && data.workflows.length > 0) {
          setSelectedWorkflow(data.workflows[0].id)
        }
      })
      .catch(err => console.error('Failed to load workflows:', err))
  }, [])

  const handleGenerate = async () => {
    if (!topic || !selectedWorkflow || loading) return

    setLoading(true)
    setResult(null)
    setAgentProcesses([])

    // Scroll to top to see the timeline
    window.scrollTo({ top: 0, behavior: 'smooth' })

    try {
      const eventSource = new EventSource(
        `/api/run_crew_stream?topic=${encodeURIComponent(topic)}&workflow_id=${encodeURIComponent(selectedWorkflow)}`
      )

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('📨 SSE Event:', data)

        if (data.type === 'agent') {
          // Create a new agent process
          setAgentProcesses(prev => [...prev, {
            agent: data.agent || 'Unknown Agent',
            content: '',
            timestamp: Date.now(),
            status: 'running'
          }])
        } else if (data.type === 'stream') {
          // Update streaming content for the current agent
          const agent = data.agent || 'Unknown'

          // Filter out CrewAI internal thinking patterns
          let message = data.message || ''
          // Remove various forms of CrewAI internal thoughts
          message = message.replace(/Thought:\s*I now can give a great answer[\s\n]*Final Answer:\s*/gi, '')
          message = message.replace(/Thought:\s*I now can give a great answer[\s\n]*/gi, '')
          message = message.replace(/Final Answer:\s*/gi, '')

          if (message.trim()) {
            setAgentProcesses(prev => {
              const existing = prev.find(p => p.agent === agent && p.status === 'running')
              if (existing) {
                return prev.map(p =>
                  p === existing
                    ? { ...p, content: (p.content || '') + message }
                    : p
                )
              }
              return prev
            })
          }
        } else if (data.type === 'output') {
          // Mark agent as completed
          if (data.agent) {
            setAgentProcesses(prev =>
              prev.map(p =>
                p.agent === data.agent && p.status === 'running'
                  ? { ...p, status: 'completed' }
                  : p
              )
            )
          }
        } else if (data.type === 'complete') {
          // Mark all running agents as completed
          setAgentProcesses(prev =>
            prev.map(p =>
              p.status === 'running' ? { ...p, status: 'completed' } : p
            )
          )
          setResult(data.result)
          eventSource.close()
          setLoading(false)
        } else if (data.type === 'error') {
          // Mark current agent as error
          setAgentProcesses(prev => {
            const runningAgent = prev.find(p => p.status === 'running')
            if (runningAgent) {
              return prev.map(p =>
                p === runningAgent
                  ? { ...p, status: 'error', content: p.content + '\n\n❌ ' + data.message }
                  : p
              )
            }
            return prev
          })
          eventSource.close()
          setLoading(false)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error)
        eventSource.close()
        setLoading(false)
      }

    } catch (error) {
      setLoading(false)
      console.error('Request failed:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Replace alert with toast notification
    alert('已复制到剪贴板')
  }

  const downloadMarkdown = () => {
    if (!result) return

    const markdown = `# ${result.title}\n\n${result.article}\n\n---\n\n**摘要:** ${result.summary}`
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.title}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Input Panel - Fixed Left */}
      <InputPanel
        workflows={workflows}
        selectedWorkflow={selectedWorkflow}
        topic={topic}
        loading={loading}
        onWorkflowChange={setSelectedWorkflow}
        onTopicChange={setTopic}
        onGenerate={handleGenerate}
      />

      {/* Main Content - Timeline */}
      <main className="ml-[420px] min-h-screen p-12 pb-32">
        <AnimatePresence mode="wait">
          {agentProcesses.length === 0 && !loading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-50" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-foreground/60 mb-2">
                准备就绪
              </h2>
              <p className="text-muted-foreground max-w-md">
                选择工作流，输入主题，开始见证 AI 的创作过程
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl"
            >
              {/* Timeline Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <h2 className="text-3xl font-bold text-gradient mb-2">
                  创作进行中
                </h2>
                <p className="text-muted-foreground">
                  实时观看 AI Agent 的协作过程
                </p>
              </motion.div>

              {/* Timeline */}
              <div className="space-y-0">
                {agentProcesses.map((process, index) => (
                  <TimelineAgent
                    key={`${process.agent}-${index}`}
                    agent={process.agent}
                    content={process.content}
                    status={process.status}
                    timestamp={process.timestamp}
                    isStreaming={process.status === 'running'}
                  />
                ))}
                
                {/* Loading indicator for next agent */}
                {loading && agentProcesses.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 pl-6 text-muted-foreground"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-sm">等待下一个 Agent...</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Result Panel - Fixed Bottom */}
      <ResultPanel
        result={result}
        onCopy={copyToClipboard}
        onDownload={downloadMarkdown}
      />
    </div>
  )
}

