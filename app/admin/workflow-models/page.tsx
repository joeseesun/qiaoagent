'use client'

import { useState, useEffect } from 'react'
import { Save, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LLMProvider, WorkflowModelConfig, AgentModelConfig } from '@/types/llm'
import Link from 'next/link'

interface Workflow {
  id: string
  name: string
  agents: Array<{ name: string; role: string }>
}

export default function WorkflowModelsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [providers, setProviders] = useState<LLMProvider[]>([])
  const [configs, setConfigs] = useState<Record<string, WorkflowModelConfig>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load workflows
      const workflowsRes = await fetch('/api/workflows')
      const workflowsData = await workflowsRes.json()
      setWorkflows(workflowsData.workflows || [])

      // Load LLM providers
      const providersRes = await fetch('/api/llm-providers')
      const providersData = await providersRes.json()
      setProviders(providersData.filter((p: LLMProvider) => p.enabled))

      // Load workflow model configs
      const configsRes = await fetch('/api/workflow-models')
      const configsData = await configsRes.json()

      // Convert array to object for easier lookup
      const configsMap: Record<string, WorkflowModelConfig> = {}
      configsData.forEach((config: WorkflowModelConfig) => {
        configsMap[config.workflowId] = config
      })
      setConfigs(configsMap)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getConfig = (workflowId: string): WorkflowModelConfig => {
    return configs[workflowId] || {
      workflowId,
      defaultProviderId: providers[0]?.id || '',
      defaultModel: providers[0]?.defaultModel || '',
      agentConfigs: [],
    }
  }

  const updateConfig = (workflowId: string, updates: Partial<WorkflowModelConfig>) => {
    setConfigs(prev => ({
      ...prev,
      [workflowId]: {
        ...getConfig(workflowId),
        ...updates,
      },
    }))
  }

  const updateAgentConfig = (
    workflowId: string,
    agentName: string,
    providerId: string,
    model: string
  ) => {
    const config = getConfig(workflowId)
    const agentConfigs = config.agentConfigs.filter(ac => ac.agentName !== agentName)
    
    if (providerId && model) {
      agentConfigs.push({ agentName, providerId, model })
    }
    
    updateConfig(workflowId, { agentConfigs })
  }

  const getAgentConfig = (workflowId: string, agentName: string): AgentModelConfig | null => {
    const config = getConfig(workflowId)
    return config.agentConfigs.find(ac => ac.agentName === agentName) || null
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save all configs
      for (const config of Object.values(configs)) {
        await fetch('/api/workflow-models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        })
      }
      alert('保存成功！')
    } catch (error) {
      console.error('Failed to save configs:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const getProviderModels = (providerId: string): string[] => {
    const provider = providers.find(p => p.id === providerId)
    return provider?.models || []
  }

  if (loading) {
    return <div className="p-8">加载中...</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">工作流模型配置</h1>
          <p className="text-sm text-muted-foreground mt-1">
            为每个工作流和 Agent 配置使用的 LLM 模型
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </div>

      {providers.length === 0 && (
        <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-600">
              还没有配置 LLM 提供商。请先{' '}
              <Link href="/admin/llm-providers" className="underline">
                添加 LLM 提供商
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {workflows.map((workflow) => {
          const config = getConfig(workflow.id)
          const defaultProvider = providers.find(p => p.id === config.defaultProviderId)

          return (
            <Card key={workflow.id}>
              <CardHeader>
                <CardTitle>{workflow.name}</CardTitle>
                <CardDescription>ID: {workflow.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Provider and Model */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label>默认 LLM 提供商</Label>
                    <Select
                      value={config.defaultProviderId}
                      onValueChange={(value) => {
                        const provider = providers.find(p => p.id === value)
                        updateConfig(workflow.id, {
                          defaultProviderId: value,
                          defaultModel: provider?.defaultModel || '',
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择提供商" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>默认模型</Label>
                    <Select
                      value={config.defaultModel}
                      onValueChange={(value) => updateConfig(workflow.id, { defaultModel: value })}
                      disabled={!config.defaultProviderId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择模型" />
                      </SelectTrigger>
                      <SelectContent>
                        {getProviderModels(config.defaultProviderId).map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Agent-specific configs */}
                <div>
                  <h4 className="font-semibold mb-3">Agent 专属配置（可选）</h4>
                  <div className="space-y-3">
                    {workflow.agents.map((agent) => {
                      const agentConfig = getAgentConfig(workflow.id, agent.name)
                      const agentProvider = agentConfig
                        ? providers.find(p => p.id === agentConfig.providerId)
                        : null

                      return (
                        <div key={agent.name} className="grid grid-cols-3 gap-4 p-3 border rounded-lg">
                          <div>
                            <Label className="text-xs text-muted-foreground">Agent</Label>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.role}</p>
                          </div>

                          <div>
                            <Label className="text-xs">LLM 提供商</Label>
                            <Select
                              value={agentConfig?.providerId || '__default__'}
                              onValueChange={(value) => {
                                if (value === '__default__') {
                                  // Remove agent config to use default
                                  const currentConfig = getConfig(workflow.id)
                                  updateConfig(workflow.id, {
                                    agentConfigs: currentConfig.agentConfigs.filter(ac => ac.agentName !== agent.name)
                                  })
                                } else {
                                  const provider = providers.find(p => p.id === value)
                                  updateAgentConfig(
                                    workflow.id,
                                    agent.name,
                                    value,
                                    provider?.defaultModel || ''
                                  )
                                }
                              }}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="使用默认" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__default__">使用默认</SelectItem>
                                {providers.map((provider) => (
                                  <SelectItem key={provider.id} value={provider.id}>
                                    {provider.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs">模型</Label>
                            <Select
                              value={agentConfig?.model || ''}
                              onValueChange={(value) => {
                                if (agentConfig) {
                                  updateAgentConfig(
                                    workflow.id,
                                    agent.name,
                                    agentConfig.providerId,
                                    value
                                  )
                                }
                              }}
                              disabled={!agentConfig?.providerId}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="使用默认" />
                              </SelectTrigger>
                              <SelectContent>
                                {agentConfig &&
                                  getProviderModels(agentConfig.providerId).map((model) => (
                                    <SelectItem key={model} value={model}>
                                      {model}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

