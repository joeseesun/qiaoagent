import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { LLMProvider, DEFAULT_LLM_PROVIDERS } from '@/types/llm'

const CONFIG_FILE = path.join(process.cwd(), 'config', 'llm-providers.json')

// Ensure config directory exists
function ensureConfigDir() {
  const configDir = path.dirname(CONFIG_FILE)
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }
}

// Load LLM providers from file
function loadProviders(): LLMProvider[] {
  ensureConfigDir()
  
  if (!fs.existsSync(CONFIG_FILE)) {
    // Initialize with default providers
    saveProviders(DEFAULT_LLM_PROVIDERS)
    return DEFAULT_LLM_PROVIDERS
  }
  
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading LLM providers:', error)
    return DEFAULT_LLM_PROVIDERS
  }
}

// Save LLM providers to file
function saveProviders(providers: LLMProvider[]) {
  ensureConfigDir()
  
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(providers, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving LLM providers:', error)
    throw error
  }
}

// GET - List all LLM providers
export async function GET(request: NextRequest) {
  try {
    const providers = loadProviders()
    
    // Don't expose API keys in the response
    const sanitizedProviders = providers.map(p => ({
      ...p,
      apiKey: p.apiKey ? '***' + p.apiKey.slice(-4) : '',
    }))
    
    return NextResponse.json(sanitizedProviders)
  } catch (error) {
    console.error('Error in GET /api/llm-providers:', error)
    return NextResponse.json(
      { error: 'Failed to load LLM providers' },
      { status: 500 }
    )
  }
}

// POST - Create a new LLM provider
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const providers = loadProviders()

    // Generate provider ID if not provided
    const providerId = body.id || `provider_${Date.now()}`

    // Generate placeholder for API key
    // SECURITY: Never save real API keys to JSON file
    // Users should set API keys via environment variables
    const apiKeyPlaceholder = `your-${providerId.toLowerCase().replace(/_/g, '-')}-api-key-here`

    const newProvider: LLMProvider = {
      id: providerId,
      name: body.name,
      type: body.type,
      baseURL: body.baseURL,
      apiKey: apiKeyPlaceholder, // Always use placeholder
      models: body.models || [],
      defaultModel: body.defaultModel,
      enabled: body.enabled !== false,
      description: body.description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    providers.push(newProvider)
    saveProviders(providers)

    // Return the provider with instructions
    return NextResponse.json({
      ...newProvider,
      _instructions: {
        message: 'Provider created successfully. Please set API key via environment variable.',
        envVarName: `${providerId.toUpperCase()}_API_KEY`,
        example: `${providerId.toUpperCase()}_API_KEY=your-real-api-key-here`
      }
    })
  } catch (error) {
    console.error('Error in POST /api/llm-providers:', error)
    return NextResponse.json(
      { error: 'Failed to create LLM provider' },
      { status: 500 }
    )
  }
}

// PUT - Update an existing LLM provider
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const providers = loadProviders()

    const index = providers.findIndex(p => p.id === body.id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    // SECURITY: Preserve the placeholder API key, don't allow updating it
    // API keys should only be set via environment variables
    const currentProvider = providers[index]
    const apiKeyPlaceholder = currentProvider.apiKey.startsWith('your-')
      ? currentProvider.apiKey
      : `your-${body.id.toLowerCase().replace(/_/g, '-')}-api-key-here`

    providers[index] = {
      ...providers[index],
      ...body,
      apiKey: apiKeyPlaceholder, // Always preserve/use placeholder
      updatedAt: Date.now(),
    }

    saveProviders(providers)

    // Return with instructions
    return NextResponse.json({
      ...providers[index],
      _instructions: {
        message: 'Provider updated successfully. API key should be set via environment variable.',
        envVarName: `${body.id.toUpperCase()}_API_KEY`,
        example: `${body.id.toUpperCase()}_API_KEY=your-real-api-key-here`
      }
    })
  } catch (error) {
    console.error('Error in PUT /api/llm-providers:', error)
    return NextResponse.json(
      { error: 'Failed to update LLM provider' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an LLM provider
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }
    
    const providers = loadProviders()
    const filteredProviders = providers.filter(p => p.id !== id)
    
    if (filteredProviders.length === providers.length) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }
    
    saveProviders(filteredProviders)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/llm-providers:', error)
    return NextResponse.json(
      { error: 'Failed to delete LLM provider' },
      { status: 500 }
    )
  }
}

