'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Check, X, ArrowLeft, Zap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LLMProvider, LLMProviderType, LLM_PROVIDER_TEMPLATES } from '@/types/llm'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

export default function LLMProvidersPage() {
  const [providers, setProviders] = useState<LLMProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      const res = await fetch('/api/llm-providers')
      const data = await res.json()
      setProviders(data)
    } catch (error) {
      console.error('Failed to load providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingProvider({
      id: '',
      name: '',
      type: 'custom',
      baseURL: '',
      apiKey: '',
      models: [],
      defaultModel: '',
      enabled: true,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = async (provider: LLMProvider) => {
    // Fetch full provider data (with API key)
    try {
      const res = await fetch(`/api/llm-providers/${provider.id}`)
      const fullProvider = await res.json()
      setEditingProvider(fullProvider)
      setIsDialogOpen(true)
    } catch (error) {
      console.error('Failed to load provider:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个 LLM 提供商吗？')) return

    try {
      await fetch(`/api/llm-providers?id=${id}`, { method: 'DELETE' })
      loadProviders()
    } catch (error) {
      console.error('Failed to delete provider:', error)
    }
  }

  const handleSave = async () => {
    if (!editingProvider) return

    try {
      const method = editingProvider.id ? 'PUT' : 'POST'
      const response = await fetch('/api/llm-providers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProvider),
      })

      const result = await response.json()

      // Show environment variable instructions if provided
      if (result._instructions) {
        alert(
          `${result._instructions.message}\n\n` +
          `环境变量名称: ${result._instructions.envVarName}\n` +
          `示例: ${result._instructions.example}\n\n` +
          `请在 .env 文件或 Vercel 中配置此环境变量。`
        )
      }

      setIsDialogOpen(false)
      setEditingProvider(null)
      loadProviders()
    } catch (error) {
      console.error('Failed to save provider:', error)
      alert('保存失败，请查看控制台错误信息')
    }
  }

  const handleTypeChange = (type: LLMProviderType) => {
    if (!editingProvider) return

    const template = LLM_PROVIDER_TEMPLATES[type]
    setEditingProvider({
      ...editingProvider,
      type,
      baseURL: template.baseURL || '',
      models: template.models || [],
      defaultModel: template.defaultModel || '',
      description: template.description || '',
    })
  }

  const handleTestConnection = async () => {
    if (!editingProvider) return

    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/llm-providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseURL: editingProvider.baseURL,
          apiKey: editingProvider.apiKey,
          model: editingProvider.defaultModel || editingProvider.models[0],
          providerId: editingProvider.id, // Pass provider ID to get API key from env
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setTestResult({
          success: true,
          message: result.message || '连接成功！API 配置正确。',
        })
      } else {
        // Show detailed error message with hint if available
        const errorMessage = result.error || '连接失败，请检查配置。'
        const hint = result.hint ? `\n\n💡 提示: ${result.hint}` : ''
        setTestResult({
          success: false,
          message: errorMessage + hint,
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
      })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return <div className="p-8">加载中...</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">LLM 提供商配置</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理不同的大语言模型提供商和 API 配置
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回后台
            </Button>
          </Link>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            添加提供商
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="border rounded-lg p-4 hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{provider.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-muted rounded">
                    {provider.type}
                  </span>
                  {provider.enabled ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {provider.description || provider.baseURL}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>默认模型: {provider.defaultModel}</span>
                  <span>可用模型: {provider.models.length} 个</span>
                  <div className="flex items-center gap-2">
                    <span>环境变量:</span>
                    <code className="px-1.5 py-0.5 bg-muted rounded font-mono">
                      {provider.id.toUpperCase()}_API_KEY
                    </code>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(provider)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(provider.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProvider?.id ? '编辑' : '添加'} LLM 提供商
            </DialogTitle>
            <DialogDescription>
              配置大语言模型 API 提供商信息
            </DialogDescription>
          </DialogHeader>

          {editingProvider && (
            <div className="space-y-4">
              <div>
                <Label>提供商类型</Label>
                <Select
                  value={editingProvider.type}
                  onValueChange={(value) => handleTypeChange(value as LLMProviderType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="openrouter">OpenRouter</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                    <SelectItem value="together">Together AI</SelectItem>
                    <SelectItem value="fireworks">Fireworks AI</SelectItem>
                    <SelectItem value="perplexity">Perplexity</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                    <SelectItem value="kimi">Kimi (Moonshot)</SelectItem>
                    <SelectItem value="zhipu">智谱 AI (GLM)</SelectItem>
                    <SelectItem value="qwen">通义千问 (Qwen)</SelectItem>
                    <SelectItem value="ollama">Ollama (本地)</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>名称</Label>
                <Input
                  value={editingProvider.name}
                  onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                  placeholder="例如: Kimi API"
                />
              </div>

              <div>
                <Label>Base URL</Label>
                <Input
                  value={editingProvider.baseURL}
                  onChange={(e) => setEditingProvider({ ...editingProvider, baseURL: e.target.value })}
                  placeholder="https://api.example.com/v1"
                />
              </div>

              {/* API Key Configuration Hint */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      🔒 API Key 通过环境变量配置
                    </h4>
                    <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
                      为了安全，API Key 不在此处配置。请在环境变量中设置：
                    </p>
                    <code className="block px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded text-xs font-mono">
                      {editingProvider.id ? `${editingProvider.id.toUpperCase()}_API_KEY` : 'PROVIDER_API_KEY'}=your-real-api-key-here
                    </code>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      💡 本地开发：在 <code className="px-1 bg-blue-100 dark:bg-blue-900 rounded">.env</code> 文件中添加<br/>
                      💡 生产环境：在 Vercel Dashboard 中配置
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label>可用模型（每行一个）</Label>
                <Textarea
                  value={editingProvider.models.join('\n')}
                  onChange={(e) => setEditingProvider({
                    ...editingProvider,
                    models: e.target.value.split('\n')
                  })}
                  onBlur={(e) => setEditingProvider({
                    ...editingProvider,
                    models: e.target.value.split('\n').filter(m => m.trim())
                  })}
                  placeholder="gpt-4&#10;gpt-3.5-turbo&#10;claude-3-opus"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>默认模型</Label>
                <Input
                  value={editingProvider.defaultModel}
                  onChange={(e) => setEditingProvider({ ...editingProvider, defaultModel: e.target.value })}
                  placeholder="gpt-4"
                />
              </div>

              <div>
                <Label>描述</Label>
                <Input
                  value={editingProvider.description || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, description: e.target.value })}
                  placeholder="可选"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingProvider.enabled}
                  onCheckedChange={(checked) => setEditingProvider({ ...editingProvider, enabled: checked })}
                />
                <Label>启用</Label>
              </div>

              {/* Test Connection */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">测试连接</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={testing || !editingProvider.baseURL || !editingProvider.id}
                  >
                    {testing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        测试中...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        测试连接
                      </>
                    )}
                  </Button>
                </div>

                {/* Hint about API key */}
                <p className="text-xs text-muted-foreground">
                  💡 API Key 将从环境变量 <code className="px-1 py-0.5 bg-muted rounded">{editingProvider.id ? `${editingProvider.id.toUpperCase()}_API_KEY` : 'PROVIDER_API_KEY'}</code> 中读取
                </p>

                {testResult && (
                  <div
                    className={`p-3 rounded-md text-sm ${
                      testResult.success
                        ? 'bg-green-50 text-green-900 border border-green-200'
                        : 'bg-red-50 text-red-900 border border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {testResult.success ? (
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

