import assert from 'node:assert/strict'
import test from 'node:test'
import { adminPasswordMatches, isUsableAdminPassword } from '../lib/admin-security.ts'
import {
  DEEPSEEK_FLASH_MODEL,
  DEEPSEEK_OFFICIAL_BASE_URL,
  isCallerOwnedApiKey,
  lockDeepSeekProvider,
  lockDeepSeekWorkflowConfig,
  sanitizeProvider,
  validateProviderTestTarget,
} from '../lib/llm-provider-security.ts'
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
