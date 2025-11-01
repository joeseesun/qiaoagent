/**
 * LLM Provider Types
 */

export type LLMProviderType =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'openrouter'
  | 'groq'
  | 'together'
  | 'fireworks'
  | 'perplexity'
  | 'deepseek'
  | 'kimi'
  | 'zhipu'
  | 'qwen'
  | 'ollama'
  | 'custom'

export interface LLMProvider {
  id: string
  name: string
  type: LLMProviderType
  baseURL: string
  apiKey: string
  models: string[]
  defaultModel: string
  enabled: boolean
  description?: string
  createdAt?: number
  updatedAt?: number
}

export interface AgentModelConfig {
  agentName: string
  providerId: string
  model: string
}

export interface WorkflowModelConfig {
  workflowId: string
  defaultProviderId: string
  defaultModel: string
  agentConfigs: AgentModelConfig[]
}

/**
 * Predefined LLM Provider Templates
 */
export const LLM_PROVIDER_TEMPLATES: Record<LLMProviderType, Partial<LLMProvider>> = {
  openai: {
    type: 'openai',
    baseURL: 'https://api.openai.com/v1',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'o1',
      'o1-mini',
    ],
    defaultModel: 'gpt-4o',
    description: 'OpenAI - GPT-4o / o1 推理模型',
  },
  kimi: {
    type: 'kimi',
    baseURL: 'https://api.moonshot.cn/v1',
    models: [
      'kimi-k2',
      'kimi-k2-0905-preview',
      'kimi-k2-0711-preview',
      'kimi-latest',
      'kimi-thinking-preview',
      'moonshot-v1-8k',
      'moonshot-v1-32k',
      'moonshot-v1-128k',
    ],
    defaultModel: 'kimi-k2',
    description: 'Kimi (Moonshot AI) - K2 万亿参数 MoE 模型',
  },
  anthropic: {
    type: 'anthropic',
    baseURL: 'https://api.anthropic.com/v1',
    models: [
      'claude-opus-4-20250514',
      'claude-sonnet-4-20250514',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307',
    ],
    defaultModel: 'claude-sonnet-4-20250514',
    description: 'Anthropic Claude - 最强推理和代码能力',
  },
  gemini: {
    type: 'gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.0-pro',
    ],
    defaultModel: 'gemini-2.0-flash-exp',
    description: 'Google Gemini - 多模态模型，支持长上下文',
  },
  qwen: {
    type: 'qwen',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      'qwen-turbo',
      'qwen-plus',
      'qwen-max',
      'qwen-max-longcontext',
    ],
    defaultModel: 'qwen-turbo',
    description: '阿里通义千问',
  },
  deepseek: {
    type: 'deepseek',
    baseURL: 'https://api.deepseek.com/v1',
    models: [
      'deepseek-chat',
      'deepseek-coder',
    ],
    defaultModel: 'deepseek-chat',
    description: 'DeepSeek Models',
  },
  zhipu: {
    type: 'zhipu',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      'glm-4.6',
      'glm-4.5-flash',
      'glm-4.5-air',
      'glm-4.5v',
      'glm-4v-flash',
      'cogview-4',
      'cogview-3-flash',
      'cogvideox-3',
      'cogvideox-flash',
    ],
    defaultModel: 'glm-4.6',
    description: '智谱 AI - GLM-4.6 旗舰 / GLM-4.5 系列（Flash 免费 / Air 高性价比）',
  },
  openrouter: {
    type: 'openrouter',
    baseURL: 'https://openrouter.ai/api/v1',
    models: [
      'anthropic/claude-opus-4',
      'anthropic/claude-sonnet-4',
      'openai/gpt-4o',
      'openai/gpt-4-turbo',
      'google/gemini-2.0-flash-exp',
      'meta-llama/llama-3.3-70b-instruct',
      'deepseek/deepseek-chat',
      'qwen/qwen-2.5-72b-instruct',
    ],
    defaultModel: 'anthropic/claude-sonnet-4',
    description: 'OpenRouter - 聚合多个 LLM 提供商，自动路由到最优价格',
  },
  groq: {
    type: 'groq',
    baseURL: 'https://api.groq.com/openai/v1',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ],
    defaultModel: 'llama-3.3-70b-versatile',
    description: 'Groq - 超快推理速度（500+ tokens/s）',
  },
  together: {
    type: 'together',
    baseURL: 'https://api.together.xyz/v1',
    models: [
      'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      'mistralai/Mixtral-8x7B-Instruct-v0.1',
      'Qwen/Qwen2.5-72B-Instruct-Turbo',
      'deepseek-ai/deepseek-llm-67b-chat',
    ],
    defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    description: 'Together AI - 开源模型托管，高性价比',
  },
  fireworks: {
    type: 'fireworks',
    baseURL: 'https://api.fireworks.ai/inference/v1',
    models: [
      'accounts/fireworks/models/llama-v3p3-70b-instruct',
      'accounts/fireworks/models/llama-v3p1-70b-instruct',
      'accounts/fireworks/models/qwen2p5-72b-instruct',
      'accounts/fireworks/models/deepseek-v3',
    ],
    defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    description: 'Fireworks AI - 快速推理，支持函数调用',
  },
  perplexity: {
    type: 'perplexity',
    baseURL: 'https://api.perplexity.ai',
    models: [
      'llama-3.1-sonar-large-128k-online',
      'llama-3.1-sonar-small-128k-online',
      'llama-3.1-sonar-large-128k-chat',
      'llama-3.1-sonar-small-128k-chat',
    ],
    defaultModel: 'llama-3.1-sonar-large-128k-online',
    description: 'Perplexity - 搜索增强的 LLM，实时联网',
  },
  ollama: {
    type: 'ollama',
    baseURL: 'http://localhost:11434/v1',
    models: [
      'llama3.3',
      'llama3.1',
      'qwen2.5',
      'deepseek-r1',
      'mistral',
      'gemma2',
    ],
    defaultModel: 'llama3.3',
    description: 'Ollama - 本地部署开源模型',
  },
  custom: {
    type: 'custom',
    baseURL: '',
    models: [],
    defaultModel: '',
    description: 'Custom OpenAI-compatible API',
  },
}

/**
 * Default LLM Providers (for initial setup)
 */
export const DEFAULT_LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'tuzi',
    name: 'Tu-Zi (Claude Sonnet 4.5)',
    type: 'custom',
    baseURL: 'https://api.tu-zi.com/v1',
    apiKey: process.env.TUZI_API_KEY || '',
    models: ['claude-sonnet-4.5'],
    defaultModel: 'claude-sonnet-4.5',
    enabled: true,
    description: 'Tu-Zi API (Claude Sonnet 4.5)',
  },
]

