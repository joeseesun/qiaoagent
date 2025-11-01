'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Save, ArrowLeft, Settings, HelpCircle, Info, Lightbulb, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LLMProvider, WorkflowModelConfig, AgentModelConfig } from '@/types/llm'

interface Agent {
  name: string
  role: string
  goal: string
  prompt: string
}

interface Task {
  description: string
  agent: string
}

interface Workflow {
  name: string
  id: string
  agents: Agent[]
  tasks: Task[]
}

export default function AdminDashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [selectedWorkflowIndex, setSelectedWorkflowIndex] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [showGuide, setShowGuide] = useState(true)
  const [expandedAgents, setExpandedAgents] = useState<Set<number>>(new Set())
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set())
  const [providers, setProviders] = useState<LLMProvider[]>([])
  const [modelConfigs, setModelConfigs] = useState<Record<string, WorkflowModelConfig>>({})
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is authenticated
    const storedPassword = sessionStorage.getItem('admin_password')
    if (!storedPassword) {
      router.push('/admin')
      return
    }
    setPassword(storedPassword)

    // Check if user has dismissed the guide
    const guideDismissed = localStorage.getItem('admin_guide_dismissed')
    if (guideDismissed === 'true') {
      setShowGuide(false)
    }

    // Load workflows and model configs
    loadWorkflows()
    loadProviders()
    loadModelConfigs()
  }, [router])

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/config')
      const data = await response.json()
      setWorkflows(data.workflows || [])
    } catch (error) {
      console.error('Failed to load workflows:', error)
    }
  }

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/llm-providers')
      const data = await response.json()
      setProviders(data.filter((p: LLMProvider) => p.enabled))
    } catch (error) {
      console.error('Failed to load providers:', error)
    }
  }

  const loadModelConfigs = async () => {
    try {
      const response = await fetch('/api/workflow-models')
      const data = await response.json()
      const configsMap: Record<string, WorkflowModelConfig> = {}
      data.forEach((config: WorkflowModelConfig) => {
        configsMap[config.workflowId] = config
      })
      setModelConfigs(configsMap)
    } catch (error) {
      console.error('Failed to load model configs:', error)
    }
  }

  const getModelConfig = (workflowId: string): WorkflowModelConfig => {
    return modelConfigs[workflowId] || {
      workflowId,
      defaultProviderId: providers[0]?.id || '',
      defaultModel: providers[0]?.defaultModel || '',
      agentConfigs: [],
    }
  }

  const getAgentModelConfig = (workflowId: string, agentName: string): AgentModelConfig | null => {
    const config = getModelConfig(workflowId)
    return config.agentConfigs.find(ac => ac.agentName === agentName) || null
  }

  const updateWorkflowDefaultModel = async (
    workflowId: string,
    providerId: string,
    model: string
  ) => {
    const config = getModelConfig(workflowId)
    const newConfig = {
      ...config,
      defaultProviderId: providerId,
      defaultModel: model,
    }

    // Update local state
    setModelConfigs(prev => ({
      ...prev,
      [workflowId]: newConfig,
    }))

    // Save to backend
    try {
      await fetch('/api/workflow-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([newConfig]),
      })
      toast({
        title: '保存成功',
        description: '工作流默认模型已更新',
        variant: 'success',
      })
    } catch (error) {
      console.error('Failed to save workflow default model:', error)
      toast({
        title: '保存失败',
        description: '工作流默认模型保存失败',
        variant: 'error',
      })
    }
  }

  const updateAgentModelConfig = async (
    workflowId: string,
    agentName: string,
    providerId: string | null,
    model: string | null
  ) => {
    const config = getModelConfig(workflowId)
    let agentConfigs = config.agentConfigs.filter(ac => ac.agentName !== agentName)

    if (providerId && model) {
      agentConfigs.push({ agentName, providerId, model })
    }

    const newConfig = { ...config, agentConfigs }

    // Update local state
    setModelConfigs(prev => ({
      ...prev,
      [workflowId]: newConfig,
    }))

    // Save to backend
    try {
      await fetch('/api/workflow-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([newConfig]),
      })
    } catch (error) {
      console.error('Failed to save model config:', error)
      toast({
        title: '保存失败',
        description: '模型配置保存失败',
        variant: 'error',
      })
    }
  }

  const handleSave = async () => {
    if (!password) {
      toast({
        title: '未授权',
        description: '请重新登录',
        variant: 'error',
      })
      router.push('/admin')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflows,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: '保存成功',
          description: '工作流配置已更新',
          variant: 'success',
        })
      } else {
        toast({
          title: '保存失败',
          description: data.error || '未知错误',
          variant: 'error',
        })
      }
    } catch (error) {
      toast({
        title: '保存失败',
        description: String(error),
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const addWorkflow = () => {
    const newWorkflow: Workflow = {
      name: '新工作流',
      id: `workflow_${Date.now()}`,
      agents: [],
      tasks: [],
    }
    setWorkflows([...workflows, newWorkflow])
    setSelectedWorkflowIndex(workflows.length)
  }

  const deleteWorkflow = async (index: number) => {
    const workflowName = workflows[index]?.name || '此工作流'
    if (!confirm(`确定要删除「${workflowName}」吗？\n\n删除后将立即保存，此操作不可撤销。`)) {
      return
    }

    const newWorkflows = workflows.filter((_, i) => i !== index)
    setWorkflows(newWorkflows)
    if (selectedWorkflowIndex >= newWorkflows.length) {
      setSelectedWorkflowIndex(Math.max(0, newWorkflows.length - 1))
    }

    // 自动保存删除后的配置
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workflows: newWorkflows, password }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || '保存失败')
      }

      toast({
        title: '删除成功',
        description: '工作流已删除并保存',
        variant: 'success',
      })
    } catch (error) {
      console.error('Failed to save after delete:', error)
      toast({
        title: '保存失败',
        description: '删除成功，但保存失败，请手动点击"保存配置"',
        variant: 'warning',
        duration: 5000,
      })
    }
  }

  const updateWorkflow = (index: number, field: keyof Workflow, value: any) => {
    const newWorkflows = [...workflows]
    newWorkflows[index] = { ...newWorkflows[index], [field]: value }
    setWorkflows(newWorkflows)
  }

  const addAgent = () => {
    const newAgent: Agent = {
      name: 'NewAgent',
      role: '角色',
      goal: '目标',
      prompt: '提示词',
    }
    const newWorkflows = [...workflows]
    newWorkflows[selectedWorkflowIndex].agents.push(newAgent)
    setWorkflows(newWorkflows)
  }

  const updateAgent = (agentIndex: number, field: keyof Agent, value: string) => {
    const newWorkflows = [...workflows]
    newWorkflows[selectedWorkflowIndex].agents[agentIndex] = {
      ...newWorkflows[selectedWorkflowIndex].agents[agentIndex],
      [field]: value,
    }
    setWorkflows(newWorkflows)
  }

  const deleteAgent = (agentIndex: number) => {
    if (confirm('确定要删除这个 Agent 吗？')) {
      const newWorkflows = [...workflows]
      newWorkflows[selectedWorkflowIndex].agents = newWorkflows[selectedWorkflowIndex].agents.filter(
        (_, i) => i !== agentIndex
      )
      setWorkflows(newWorkflows)
    }
  }

  const addTask = () => {
    const newTask: Task = {
      description: '任务描述',
      agent: workflows[selectedWorkflowIndex].agents[0]?.name || '',
    }
    const newWorkflows = [...workflows]
    newWorkflows[selectedWorkflowIndex].tasks.push(newTask)
    setWorkflows(newWorkflows)
  }

  const updateTask = (taskIndex: number, field: keyof Task, value: string) => {
    const newWorkflows = [...workflows]
    newWorkflows[selectedWorkflowIndex].tasks[taskIndex] = {
      ...newWorkflows[selectedWorkflowIndex].tasks[taskIndex],
      [field]: value,
    }
    setWorkflows(newWorkflows)
  }

  const deleteTask = (taskIndex: number) => {
    if (confirm('确定要删除这个任务吗？')) {
      const newWorkflows = [...workflows]
      newWorkflows[selectedWorkflowIndex].tasks = newWorkflows[selectedWorkflowIndex].tasks.filter(
        (_, i) => i !== taskIndex
      )
      setWorkflows(newWorkflows)
    }
  }

  if (workflows.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <p>加载中...</p>
      </div>
    )
  }

  const currentWorkflow = workflows[selectedWorkflowIndex]

  return (
    <div className="min-h-screen bg-[#f9f9f9] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">工作流配置管理</h1>
            <p className="text-muted-foreground">编辑 Agents 和 Tasks，保存后立即生效</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/llm-providers">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                LLM 提供商
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? '保存中...' : '保存配置'}
            </Button>
          </div>
        </div>

        {/* Quick Start Guide */}
        {showGuide && (
          <Card className="mb-6 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <CardTitle className="text-blue-900">快速入门指南</CardTitle>
                    <CardDescription className="mt-2 text-blue-800">
                      配置一个工作流只需 3 步：
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowGuide(false)
                    localStorage.setItem('admin_guide_dismissed', 'true')
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  关闭
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-blue-900">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-semibold mb-1">配置基本信息</p>
                    <p className="text-blue-800">设置工作流名称（用户看到的）和 ID（系统使用的唯一标识）</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-semibold mb-1">添加 Agents（AI 角色）</p>
                    <p className="text-blue-800">
                      每个 Agent 是一个专业的 AI 角色。配置它的名称、角色定位、目标和详细提示词。
                      <br />
                      <span className="text-xs">💡 提示：名称用英文（如 ContentAnalyzer），角色和提示词用中文描述</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-semibold mb-1">添加 Tasks（执行步骤）</p>
                    <p className="text-blue-800">
                      定义工作流的执行顺序。每个任务描述要做什么，并指定由哪个 Agent 执行。
                      <br />
                      <span className="text-xs">💡 提示：任务会按顺序执行，后面的任务可以使用前面任务的输出</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflow Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>工作流列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {workflows.map((workflow, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Button
                    variant={selectedWorkflowIndex === index ? 'default' : 'outline'}
                    onClick={() => setSelectedWorkflowIndex(index)}
                  >
                    {workflow.name}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteWorkflow(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addWorkflow}>
                <Plus className="w-4 h-4 mr-2" />
                新建工作流
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>配置工作流的基础属性</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>工作流名称</Label>
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border z-10">
                      显示在用户界面的工作流名称，例如："微信爆款标题创作"
                    </div>
                  </div>
                </div>
                <Input
                  value={currentWorkflow.name}
                  onChange={(e) => updateWorkflow(selectedWorkflowIndex, 'name', e.target.value)}
                  placeholder="例如：微信爆款标题创作"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>工作流 ID</Label>
                  <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border z-10">
                      唯一标识符，用于 API 调用。建议使用英文和下划线，例如："wechat_title_creator"
                    </div>
                  </div>
                </div>
                <Input
                  value={currentWorkflow.id}
                  onChange={(e) => updateWorkflow(selectedWorkflowIndex, 'id', e.target.value)}
                  placeholder="例如：wechat_title_creator"
                />
              </div>

              {/* Workflow Default Model Configuration */}
              {providers.length > 0 && currentWorkflow.id && (
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-semibold">工作流默认模型</Label>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border z-10">
                        当 Agent 选择"使用默认"时，将使用此模型。如果未配置，则使用第一个启用的 LLM 提供商。
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const currentWorkflowId = currentWorkflow.id
                    const workflowConfig = getModelConfig(currentWorkflowId)
                    const defaultProvider = workflowConfig.defaultProviderId
                      ? providers.find(p => p.id === workflowConfig.defaultProviderId)
                      : null

                    return (
                      <>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">默认 LLM 提供商</Label>
                          <Select
                            value={workflowConfig.defaultProviderId || '__none__'}
                            onValueChange={(value) => {
                              if (value === '__none__') {
                                updateWorkflowDefaultModel(currentWorkflowId, '', '')
                              } else {
                                const provider = providers.find(p => p.id === value)
                                if (provider) {
                                  updateWorkflowDefaultModel(currentWorkflowId, value, provider.defaultModel)
                                }
                              }
                            }}
                          >
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="未配置（使用第一个提供商）" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">未配置（使用第一个提供商）</SelectItem>
                              {providers.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  {provider.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {defaultProvider && workflowConfig.defaultProviderId && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">默认模型</Label>
                            <Select
                              value={workflowConfig.defaultModel || defaultProvider.defaultModel}
                              onValueChange={(value) => {
                                updateWorkflowDefaultModel(
                                  currentWorkflowId,
                                  workflowConfig.defaultProviderId,
                                  value
                                )
                              }}
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {defaultProvider.models.map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Agents ({currentWorkflow.agents.length})</CardTitle>
                  <CardDescription className="mt-1">
                    配置执行任务的 AI 角色，每个 Agent 负责特定的工作
                  </CardDescription>
                </div>
                <Button size="sm" onClick={addAgent}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加 Agent
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {currentWorkflow.agents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-2">还没有 Agent</p>
                  <p className="text-sm">点击"添加 Agent"开始配置你的第一个 AI 角色</p>
                </div>
              ) : (
                currentWorkflow.agents.map((agent, index) => {
                  const isExpanded = expandedAgents.has(index)
                  return (
                    <Card key={index} className="border-2 hover:border-foreground/20 transition-colors">
                      <CardContent className="pt-4">
                        {/* Header - Always Visible */}
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => {
                            const newExpanded = new Set(expandedAgents)
                            if (isExpanded) {
                              newExpanded.delete(index)
                            } else {
                              newExpanded.add(index)
                            }
                            setExpandedAgents(newExpanded)
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-sm">
                                {agent.name || '未命名 Agent'}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {agent.role || '未设置角色'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteAgent(index)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <ChevronDown
                              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 pt-4 border-t space-y-3"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">名称 (Name)</Label>
                                <div className="group relative">
                                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border z-10">
                                    Agent 的唯一标识符，用于任务分配。例如：ContentAnalyzer
                                  </div>
                                </div>
                              </div>
                              <Input
                                placeholder="例如：ContentAnalyzer"
                                value={agent.name}
                                onChange={(e) => updateAgent(index, 'name', e.target.value)}
                                className="font-mono text-sm"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">角色 (Role)</Label>
                                <div className="group relative">
                                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border z-10">
                                    Agent 的职责定位。例如：内容分析专家、标题创作大师
                                  </div>
                                </div>
                              </div>
                              <Input
                                placeholder="例如：内容分析专家"
                                value={agent.role}
                                onChange={(e) => updateAgent(index, 'role', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">目标 (Goal)</Label>
                                <div className="group relative">
                                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border z-10">
                                    Agent 要达成的具体目标。例如：分析内容核心观点和情感倾向
                                  </div>
                                </div>
                              </div>
                              <Textarea
                                placeholder="例如：分析内容核心观点和情感倾向"
                                value={agent.goal}
                                onChange={(e) => updateAgent(index, 'goal', e.target.value)}
                                rows={2}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">提示词 (Prompt)</Label>
                                <div className="group relative">
                                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border z-10">
                                    详细的工作指令和背景知识。这是 Agent 的"工作手册"，决定了它的行为方式和输出质量。
                                  </div>
                                </div>
                              </div>
                              <Textarea
                                placeholder="例如：你是一位资深的内容分析专家，擅长从文本中提取核心观点..."
                                value={agent.prompt}
                                onChange={(e) => updateAgent(index, 'prompt', e.target.value)}
                                rows={4}
                                className="text-sm"
                              />
                            </div>

                            {/* Model Configuration */}
                            {providers.length > 0 && agent.name && (
                              <div className="pt-3 border-t">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-muted-foreground" />
                                    <Label className="text-sm font-semibold">模型配置（可选）</Label>
                                    <div className="group relative">
                                      <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border z-10">
                                        为此 Agent 指定专属的 LLM 模型。如不设置，将使用工作流的默认模型。
                                      </div>
                                    </div>
                                  </div>

                                  {(() => {
                                    const currentWorkflowId = currentWorkflow.id
                                    const agentConfig = getAgentModelConfig(currentWorkflowId, agent.name)
                                    const selectedProvider = agentConfig
                                      ? providers.find(p => p.id === agentConfig.providerId)
                                      : null

                                    // Get the actual default model that will be used
                                    const workflowConfig = getModelConfig(currentWorkflowId)
                                    const defaultProvider = workflowConfig.defaultProviderId
                                      ? providers.find(p => p.id === workflowConfig.defaultProviderId)
                                      : providers[0]
                                    const defaultModelText = defaultProvider
                                      ? `${defaultProvider.name} - ${workflowConfig.defaultModel || defaultProvider.defaultModel}`
                                      : '第一个启用的提供商'

                                    return (
                                      <>
                                        <div className="space-y-2">
                                          <Label className="text-xs text-muted-foreground">LLM 提供商</Label>
                                          <Select
                                            value={agentConfig?.providerId || '__default__'}
                                            onValueChange={(value) => {
                                              if (value === '__default__') {
                                                updateAgentModelConfig(currentWorkflowId, agent.name, null, null)
                                              } else {
                                                const provider = providers.find(p => p.id === value)
                                                if (provider) {
                                                  updateAgentModelConfig(
                                                    currentWorkflowId,
                                                    agent.name,
                                                    value,
                                                    provider.defaultModel
                                                  )
                                                }
                                              }
                                            }}
                                          >
                                            <SelectTrigger className="h-9 text-sm">
                                              <SelectValue placeholder="使用默认" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="__default__">
                                                使用默认 ({defaultModelText})
                                              </SelectItem>
                                              {providers.map((provider) => (
                                                <SelectItem key={provider.id} value={provider.id}>
                                                  {provider.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        {agentConfig && selectedProvider && (
                                          <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">模型</Label>
                                            <Select
                                              value={agentConfig.model}
                                              onValueChange={(value) => {
                                                updateAgentModelConfig(
                                                  currentWorkflowId,
                                                  agent.name,
                                                  agentConfig.providerId,
                                                  value
                                                )
                                              }}
                                            >
                                              <SelectTrigger className="h-9 text-sm">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {selectedProvider.models.map((model) => (
                                                  <SelectItem key={model} value={model}>
                                                    {model}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        )}
                                      </>
                                    )
                                  })()}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tasks */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tasks ({currentWorkflow.tasks.length})</CardTitle>
                <CardDescription className="mt-1">
                  定义工作流的执行步骤，每个任务由一个 Agent 完成
                </CardDescription>
              </div>
              <Button size="sm" onClick={addTask} disabled={currentWorkflow.agents.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                添加 Task
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentWorkflow.agents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">请先添加 Agent</p>
                <p className="text-sm">任务需要由 Agent 来执行，请先在右侧添加至少一个 Agent</p>
              </div>
            ) : currentWorkflow.tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">还没有任务</p>
                <p className="text-sm">点击"添加 Task"开始配置工作流的执行步骤</p>
              </div>
            ) : (
              currentWorkflow.tasks.map((task, index) => {
                const isExpanded = expandedTasks.has(index)
                return (
                  <Card key={index} className="border-2 hover:border-foreground/20 transition-colors">
                    <CardContent className="pt-4">
                      {/* Header - Always Visible */}
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          const newExpanded = new Set(expandedTasks)
                          if (isExpanded) {
                            newExpanded.delete(index)
                          } else {
                            newExpanded.add(index)
                          }
                          setExpandedTasks(newExpanded)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {task.description.split('\n')[0].substring(0, 60)}
                              {task.description.length > 60 ? '...' : ''}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              执行者: {task.agent || '未指定'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteTask(index)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 pt-4 border-t space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">任务描述</Label>
                              <div className="group relative">
                                <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border z-10">
                                  <p className="mb-1">描述这个任务要做什么。可以使用占位符：</p>
                                  <p className="font-mono bg-muted px-1 rounded">{'{topic}'}</p>
                                  <p className="mt-1">例如：分析以下内容的核心观点：{'{topic}'}</p>
                                </div>
                              </div>
                            </div>
                            <Textarea
                              placeholder="例如：分析以下内容的核心观点：{topic}"
                              value={task.description}
                              onChange={(e) => updateTask(index, 'description', e.target.value)}
                              rows={3}
                              className="text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">执行 Agent</Label>
                              <div className="group relative">
                                <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border z-10">
                                  选择执行此任务的 Agent 名称（必须与上面配置的 Agent 名称完全一致）
                                </div>
                              </div>
                            </div>
                            <select
                              value={task.agent}
                              onChange={(e) => updateTask(index, 'agent', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="">选择 Agent...</option>
                              {currentWorkflow.agents.map((agent) => (
                                <option key={agent.name} value={agent.name}>
                                  {agent.name} ({agent.role})
                                </option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

