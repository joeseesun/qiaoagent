import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { WorkflowModelConfig } from '@/types/llm'

const CONFIG_FILE = path.join(process.cwd(), 'config', 'workflow-models.json')

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
    return JSON.parse(data)
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
  try {
    const body = await request.json()
    const configs = loadWorkflowConfigs()
    
    const index = configs.findIndex(c => c.workflowId === body.workflowId)
    
    if (index !== -1) {
      // Update existing config
      configs[index] = body
    } else {
      // Create new config
      configs.push(body)
    }
    
    saveWorkflowConfigs(configs)
    
    return NextResponse.json(body)
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

