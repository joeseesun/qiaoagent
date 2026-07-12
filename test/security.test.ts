import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { adminPasswordMatches, isUsableAdminPassword } from '../lib/admin-security.ts'
import {
  DEEPSEEK_FLASH_MODEL,
  DEEPSEEK_OFFICIAL_BASE_URL,
  isDeepSeekProvider,
  isCallerOwnedApiKey,
  lockDeepSeekProvider,
  lockDeepSeekWorkflowConfig,
  mergeWorkflowModelConfigs,
  sanitizeProvider,
  validateProviderTestTarget,
} from '../lib/llm-provider-security.ts'
import {
  MAX_TOPIC_LENGTH,
  buildWorkflowProcessSpec,
  loadAllowedWorkflowIds,
  validateWorkflowRunInput,
} from '../lib/workflow-runner.ts'
import type { LLMProvider, WorkflowModelConfig } from '../types/llm.ts'

const deepSeekProvider: LLMProvider = {
  id: 'deepseek',
  name: 'DeepSeek',
  type: 'deepseek',
  baseURL: 'https://attacker.invalid/v1',
  apiKey: 'sensitive-value',
  models: ['deepseek-v4-pro'],
  defaultModel: 'deepseek-v4-pro',
  enabled: true,
}

test('admin auth fails closed without a secure configured password', () => {
  assert.equal(isUsableAdminPassword(undefined), false)
  assert.equal(isUsableAdminPassword('ai_admin_2025'), false)
  assert.equal(isUsableAdminPassword('your-secure-password-here'), false)
  assert.equal(adminPasswordMatches(undefined, 'anything'), false)
  assert.equal(adminPasswordMatches('secure-admin-password', 'wrong'), false)
  assert.equal(adminPasswordMatches('secure-admin-password', 'secure-admin-password'), true)
})

test('official DeepSeek providers are locked to the official Flash route', () => {
  const locked = lockDeepSeekProvider(deepSeekProvider)

  assert.equal(locked.baseURL, DEEPSEEK_OFFICIAL_BASE_URL)
  assert.deepEqual(locked.models, [DEEPSEEK_FLASH_MODEL])
  assert.equal(locked.defaultModel, DEEPSEEK_FLASH_MODEL)
})

test('official DeepSeek base URL cannot masquerade as a custom provider', () => {
  assert.equal(isDeepSeekProvider({
    id: 'custom-provider',
    type: 'custom',
    baseURL: `${DEEPSEEK_OFFICIAL_BASE_URL}/`,
  } as LLMProvider), true)
  assert.equal(isDeepSeekProvider({
    id: 'custom-provider',
    type: 'custom',
    baseURL: 'https://api。deepseek。com/v1',
  } as LLMProvider), true)
  assert.equal(isDeepSeekProvider({
    id: 'custom-provider',
    type: 'DeepSeek',
    baseURL: 'https://proxy.invalid/v1',
  } as unknown as LLMProvider), true)
  assert.equal(isDeepSeekProvider({
    id: 'custom-provider',
    type: 'custom',
    baseURL: 'https://api.deepseek.com./v1',
  } as LLMProvider), true)
})

test('workflow routes never compile request data as Python source and require admin auth', () => {
  for (const routePath of [
    'app/api/run_crew/route.ts',
    'app/api/run_crew_stream/route.ts',
  ]) {
    const source = readFileSync(routePath, 'utf8')
    assert.doesNotMatch(source, /['"]-c['"]/, `${routePath} must not use python -c`)
    assert.match(source, /requireAdminRequest/, `${routePath} must fail closed behind admin auth`)
  }
})

test('Docker publishes the application only on loopback behind the reverse proxy', () => {
  const compose = readFileSync('docker-compose.yml', 'utf8')
  assert.match(compose, /127\.0\.0\.1:3355:3355/)
  assert.doesNotMatch(compose, /-\s*["']?3355:3355["']?\s*$/m)
})

test('deployment guides never instruct operators to publish the app port publicly', () => {
  for (const guidePath of [
    'README.md',
    'DOCKER_QUICKSTART.md',
    'BAOTA_QUICKSTART.md',
    'docs/DOCKER_DEPLOYMENT.md',
    'docs/BAOTA_DEPLOYMENT.md',
    'TROUBLESHOOTING.md',
  ]) {
    const guide = readFileSync(guidePath, 'utf8')
    assert.doesNotMatch(guide, /(?:-p\s+|["'])3355:3355/)
    assert.doesNotMatch(guide, /(?:-p\s+|["'])3356:3355/)
    assert.doesNotMatch(guide, /0\.0\.0\.0:3355/)
    assert.doesNotMatch(guide, /https?:\/\/(?:your-server-ip|你的服务器IP|你的IP):3355/)
  }
})

test('workflow subprocess receives hostile request strings only through JSON stdin', () => {
  const hostileTopic = "'); __import__('os').system('touch /tmp/qiaoagent-rce'); #"
  const hostileWorkflow = "wechat_title_creator'); raise RuntimeError('owned'); #"
  const spec = buildWorkflowProcessSpec(
    { topic: hostileTopic, workflowId: hostileWorkflow },
    true
  )

  assert.deepEqual(spec.args, ['-u', '-m', 'crew.run_workflow', '--stream'])
  assert.equal(spec.args.includes('-c'), false)
  assert.equal(spec.args.some(arg => arg.includes(hostileTopic)), false)
  assert.equal(spec.args.some(arg => arg.includes(hostileWorkflow)), false)
  assert.deepEqual(JSON.parse(spec.stdin), {
    topic: hostileTopic,
    workflow_id: hostileWorkflow,
  })
})

test('workflow input is size-limited and workflow IDs come from the configured allowlist', () => {
  const allowedWorkflowIds = loadAllowedWorkflowIds()
  assert.equal(allowedWorkflowIds.has('wechat_title_creator'), true)

  const valid = validateWorkflowRunInput(
    '安全主题',
    'wechat_title_creator',
    allowedWorkflowIds
  )
  assert.equal(valid.ok, true)

  const unknown = validateWorkflowRunInput(
    '安全主题',
    "wechat_title_creator'); raise RuntimeError('owned'); #",
    allowedWorkflowIds
  )
  assert.equal(unknown.ok, false)
  if (!unknown.ok) assert.equal(unknown.status, 400)

  const oversized = validateWorkflowRunInput(
    'x'.repeat(MAX_TOPIC_LENGTH + 1),
    'wechat_title_creator',
    allowedWorkflowIds
  )
  assert.equal(oversized.ok, false)
  if (!oversized.ok) assert.equal(oversized.status, 413)
})

test('provider serialization never returns an API key value', () => {
  assert.equal(sanitizeProvider(deepSeekProvider).apiKey, '***')
})

test('connection tests require an explicit caller-owned key', () => {
  assert.equal(isCallerOwnedApiKey(undefined), false)
  assert.equal(isCallerOwnedApiKey(''), false)
  assert.equal(isCallerOwnedApiKey('***'), false)
  assert.equal(isCallerOwnedApiKey('your-deepseek-api-key-here'), false)
  assert.equal(isCallerOwnedApiKey('caller-owned-key'), true)
})

test('DeepSeek connection tests reject Pro, aliases, and non-official routes', () => {
  assert.match(
    validateProviderTestTarget({
      baseURL: DEEPSEEK_OFFICIAL_BASE_URL,
      model: 'deepseek-chat',
      providerId: 'deepseek',
    }) || '',
    /仅允许模型/
  )
  assert.match(
    validateProviderTestTarget({
      baseURL: DEEPSEEK_OFFICIAL_BASE_URL,
      model: 'deepseek-v4-pro',
      providerId: 'deepseek',
    }) || '',
    /禁止使用模型/
  )
  assert.match(
    validateProviderTestTarget({
      baseURL: 'https://proxy.invalid/v1',
      model: DEEPSEEK_FLASH_MODEL,
      providerId: 'deepseek',
    }) || '',
    /仅允许官方地址/
  )
  assert.equal(
    validateProviderTestTarget({
      baseURL: `${DEEPSEEK_OFFICIAL_BASE_URL}/`,
      model: DEEPSEEK_FLASH_MODEL,
      providerId: 'deepseek',
    }),
    null
  )
  assert.match(
    validateProviderTestTarget({
      baseURL: 'https://api.deepseek.com./v1',
      model: DEEPSEEK_FLASH_MODEL,
      providerId: 'custom-provider',
    }) || '',
    /仅允许官方地址/
  )
})

test('non-DeepSeek providers keep control of their own model namespace', () => {
  assert.equal(
    validateProviderTestTarget({
      baseURL: 'https://openrouter.ai/api/v1',
      model: 'deepseek-chat',
      providerId: 'openrouter',
    }),
    null
  )
})

test('workflow models are locked for every registered DeepSeek provider id', () => {
  const config: WorkflowModelConfig = {
    workflowId: 'example',
    defaultProviderId: 'deepseek',
    defaultModel: 'deepseek-v4-pro',
    agentConfigs: [
      { agentName: 'A', providerId: 'custom-deepseek', model: 'deepseek-chat' },
      { agentName: 'B', providerId: 'kimi', model: 'kimi-latest' },
    ],
  }

  const locked = lockDeepSeekWorkflowConfig(config, new Set(['deepseek', 'custom-deepseek']))
  assert.equal(locked.defaultModel, DEEPSEEK_FLASH_MODEL)
  assert.equal(locked.agentConfigs[0].model, DEEPSEEK_FLASH_MODEL)
  assert.equal(locked.agentConfigs[1].model, 'kimi-latest')
})

test('workflow config overlay removes historical duplicates and submitted config wins', () => {
  const first: WorkflowModelConfig = {
    workflowId: 'example',
    defaultProviderId: 'kimi',
    defaultModel: 'old-first',
    agentConfigs: [],
  }
  const duplicate: WorkflowModelConfig = {
    ...first,
    defaultModel: 'old-last',
  }
  const submitted: WorkflowModelConfig = {
    ...first,
    defaultProviderId: 'deepseek',
    defaultModel: DEEPSEEK_FLASH_MODEL,
  }

  const merged = mergeWorkflowModelConfigs([first, duplicate], [submitted])
  assert.equal(merged.length, 1)
  assert.deepEqual(merged[0], submitted)
})
