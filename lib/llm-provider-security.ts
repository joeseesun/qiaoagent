import type { LLMProvider, WorkflowModelConfig } from '@/types/llm'

export const DEEPSEEK_OFFICIAL_BASE_URL = 'https://api.deepseek.com/v1'
export const DEEPSEEK_FLASH_MODEL = 'deepseek-v4-flash'

const REDACTED_API_KEY = '***'
const FORBIDDEN_DEEPSEEK_MODELS = new Set(['deepseek-v4-pro'])

type ProviderIdentity = Pick<LLMProvider, 'id' | 'type' | 'baseURL'>

function canonicalizeBaseURL(baseURL: string): string {
  return baseURL.replace(/\/+$/, '')
}

export function isDeepSeekProvider(provider: ProviderIdentity): boolean {
  let usesOfficialDeepSeekHost = false
  try {
    const hostname = new URL(provider.baseURL).hostname.toLowerCase().replace(/\.+$/, '')
    usesOfficialDeepSeekHost = hostname === 'api.deepseek.com'
  } catch {
    // Invalid custom URLs are handled by the caller's validation path.
  }

  return String(provider.id).toLowerCase() === 'deepseek' ||
    String(provider.type).toLowerCase() === 'deepseek' ||
    usesOfficialDeepSeekHost
}

export function lockDeepSeekProvider<T extends LLMProvider>(provider: T): T {
  if (!isDeepSeekProvider(provider)) {
    return provider
  }

  return {
    ...provider,
    baseURL: DEEPSEEK_OFFICIAL_BASE_URL,
    models: [DEEPSEEK_FLASH_MODEL],
    defaultModel: DEEPSEEK_FLASH_MODEL,
  }
}

export function sanitizeProvider<T extends LLMProvider>(provider: T): T {
  return {
    ...provider,
    apiKey: provider.apiKey ? REDACTED_API_KEY : '',
  }
}

export function isCallerOwnedApiKey(apiKey: unknown): apiKey is string {
  if (typeof apiKey !== 'string') {
    return false
  }

  const trimmed = apiKey.trim()
  return Boolean(
    trimmed &&
    trimmed !== REDACTED_API_KEY &&
    trimmed.toLowerCase() !== 'configured' &&
    !trimmed.startsWith('your-')
  )
}

export function validateProviderTestTarget(input: {
  baseURL: unknown
  model: unknown
  providerId: unknown
}): string | null {
  if (typeof input.baseURL !== 'string' || !input.baseURL.trim()) {
    return '缺少必要参数：baseURL'
  }

  if (typeof input.model !== 'string' || !input.model.trim()) {
    return '缺少必要参数：model'
  }

  let parsedURL: URL
  try {
    parsedURL = new URL(input.baseURL)
  } catch {
    return 'baseURL 格式无效'
  }

  if (!['http:', 'https:'].includes(parsedURL.protocol)) {
    return 'baseURL 仅支持 HTTP(S)'
  }

  const providerId = typeof input.providerId === 'string'
    ? input.providerId.trim().toLowerCase()
    : ''
  const model = input.model.trim()
  const canonicalBaseURL = canonicalizeBaseURL(input.baseURL.trim())
  const targetHostname = parsedURL.hostname.toLowerCase().replace(/\.+$/, '')
  const targetsDeepSeek = providerId === 'deepseek' || targetHostname === 'api.deepseek.com'

  if (FORBIDDEN_DEEPSEEK_MODELS.has(model.toLowerCase())) {
    return `禁止使用模型 ${model}；DeepSeek 仅允许 ${DEEPSEEK_FLASH_MODEL}`
  }

  if (targetsDeepSeek && canonicalBaseURL !== DEEPSEEK_OFFICIAL_BASE_URL) {
    return `DeepSeek 仅允许官方地址 ${DEEPSEEK_OFFICIAL_BASE_URL}`
  }

  if (targetsDeepSeek && model !== DEEPSEEK_FLASH_MODEL) {
    return `DeepSeek 仅允许模型 ${DEEPSEEK_FLASH_MODEL}`
  }

  return null
}

export function lockDeepSeekWorkflowConfig(
  config: WorkflowModelConfig,
  deepSeekProviderIds: ReadonlySet<string>
): WorkflowModelConfig {
  const isDeepSeekId = (providerId: string) => deepSeekProviderIds.has(providerId.toLowerCase())

  return {
    ...config,
    defaultModel: isDeepSeekId(config.defaultProviderId)
      ? DEEPSEEK_FLASH_MODEL
      : config.defaultModel,
    agentConfigs: config.agentConfigs.map(agentConfig => ({
      ...agentConfig,
      model: isDeepSeekId(agentConfig.providerId)
        ? DEEPSEEK_FLASH_MODEL
        : agentConfig.model,
    })),
  }
}

export function mergeWorkflowModelConfigs(
  existingConfigs: WorkflowModelConfig[],
  submittedConfigs: WorkflowModelConfig[]
): WorkflowModelConfig[] {
  const configsByWorkflow = new Map<string, WorkflowModelConfig>()

  for (const config of existingConfigs) {
    configsByWorkflow.set(config.workflowId, config)
  }
  for (const config of submittedConfigs) {
    configsByWorkflow.set(config.workflowId, config)
  }

  return Array.from(configsByWorkflow.values())
}
