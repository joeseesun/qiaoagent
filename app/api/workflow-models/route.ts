import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { WorkflowModelConfig } from '@/types/llm'
import { requireAdminRequest } from '@/lib/admin-auth'
import {
  isDeepSeekProvider,
  lockDeepSeekWorkflowConfig,
  mergeWorkflowModelConfigs,
} from '@/lib/llm-provider-security'

const CONFIG_FILE = path.join(process.cwd(), 'config', 'workflow-models.json')
const PROVIDERS_FILE = path.join(process.cwd(), 'config', 'llm-providers.json')

function loadDeepSeekProviderIds(): Set<string> {
  const providerIds = new Set(['deepseek'])

  try {
    const providers = JSON.parse(fs.readFileSync(PROVIDERS_FILE, 'utf-8'))
    if (Array.isArray(providers)) {
      for (const provider of providers) {
        if (provider?.id && provider?.type && isDeepSeekProvider(provider)) {
          providerIds.add(String(provider.id).toLowerCase())
        }
      }
    }
  } catch (error) {
    console.error('Error loading DeepSeek provider IDs:', error)
  }

  return providerIds
}

function isWorkflowModelConfig(value: unknown): value is WorkflowModelConfig {
  if (!value || typeof value !== 'object') return false
  const config = value as Partial<WorkflowModelConfig>
  return Boolean(
    typeof config.workflowId === 'string' && config.workflowId &&
    typeof config.defaultProviderId === 'string' &&
    typeof config.defaultModel === 'string' &&
    Array.isArray(config.agentConfigs) &&
    config.agentConfigs.every(agentConfig =>
      agentConfig &&
      typeof agentConfig.agentName === 'string' &&
      typeof agentConfig.providerId === 'string' &&
      typeof agentConfig.model === 'string'
    )
  )
}

function usesForbiddenDeepSeekPro(config: WorkflowModelConfig): boolean {
  const isPro = (model: string) => model.trim().toLowerCase() === 'deepseek-v4-pro'
  return isPro(config.defaultModel) ||
    config.agentConfigs.some(agentConfig => isPro(agentConfig.model))
}

// Ensure config directory exists
function ensureConfigDir() {
  const configDir = path.dirname(CONFIG_FILE)
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }
}

// Load workflow model configs from file
function loadWorkflowConfigs(): WorkflowModelConfig[] {
  ensureConfigDir()

  if (!fs.existsSync(CONFIG_FILE)) {
    return []
  }

  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8')
    const parsed = JSON.parse(data)

    // Validate and fix the structure
    if (!Array.isArray(parsed)) {
      console.error('Invalid workflow-models.json: root is not an array')
      return []
    }

    // Flatten any nested arrays (fix corrupted data)
    const flattened: WorkflowModelConfig[] = []
    for (const item of parsed) {
      if (Array.isArray(item)) {
        // Nested array found, flatten it
        console.warn('Found nested array in workflow-models.json, flattening...')
        flattened.push(...item)
      } else if (item && typeof item === 'object' && item.workflowId) {
        // Valid config object
        flattened.push(item)
      } else {
        console.warn('Invalid item in workflow-models.json:', item)
      }
    }

    return flattened
  } catch (error) {
    console.error('Error loading workflow model configs:', error)
    return []
  }
}

// Save workflow model configs to file
function saveWorkflowConfigs(configs: WorkflowModelConfig[]) {
  ensureConfigDir()
  
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configs, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving workflow model configs:', error)
    throw error
  }
}

// GET - Get workflow model config
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('workflowId')
    
    const configs = loadWorkflowConfigs()
    
    if (workflowId) {
      const config = configs.find(c => c.workflowId === workflowId)
      return NextResponse.json(config || null)
    }
    
    return NextResponse.json(configs)
  } catch (error) {
    console.error('Error in GET /api/workflow-models:', error)
    return NextResponse.json(
      { error: 'Failed to load workflow model configs' },
      { status: 500 }
    )
  }
}

// POST - Create or update workflow model config
export async function POST(request: NextRequest) {
  const authError = requireAdminRequest(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const existingConfigs = loadWorkflowConfigs()

    const submittedConfigs = Array.isArray(body) ? body : [body]
    if (submittedConfigs.length === 0 || !submittedConfigs.every(isWorkflowModelConfig)) {
      return NextResponse.json({ error: 'Invalid workflow model config' }, { status: 400 })
    }

    if (submittedConfigs.some(usesForbiddenDeepSeekPro)) {
      return NextResponse.json(
        { error: 'deepseek-v4-pro is forbidden; use deepseek-v4-flash.' },
        { status: 400 }
      )
    }

    const deepSeekProviderIds = loadDeepSeekProviderIds()
    const lockedConfigs = submittedConfigs.map(config =>
      lockDeepSeekWorkflowConfig(config, deepSeekProviderIds)
    )

    const mergedConfigs = mergeWorkflowModelConfigs(existingConfigs, lockedConfigs)
    saveWorkflowConfigs(mergedConfigs)

    return NextResponse.json(Array.isArray(body) ? lockedConfigs : lockedConfigs[0])
  } catch (error) {
    console.error('Error in POST /api/workflow-models:', error)
    return NextResponse.json(
      { error: 'Failed to save workflow model config' },
      { status: 500 }
    )
  }
}

// DELETE - Delete workflow model config
export async function DELETE(request: NextRequest) {
  const authError = requireAdminRequest(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('workflowId')
    
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      )
    }
    
    const configs = loadWorkflowConfigs()
    const filteredConfigs = configs.filter(c => c.workflowId !== workflowId)
    
    saveWorkflowConfigs(filteredConfigs)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/workflow-models:', error)
    return NextResponse.json(
      { error: 'Failed to delete workflow model config' },
      { status: 500 }
    )
  }
}
