import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { LLMProvider } from '@/types/llm'

const CONFIG_FILE = path.join(process.cwd(), 'config', 'llm-providers.json')

// Load LLM providers from file
function loadProviders(): LLMProvider[] {
  if (!fs.existsSync(CONFIG_FILE)) {
    return []
  }
  
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading LLM providers:', error)
    return []
  }
}

// GET - Get a specific LLM provider (with full API key)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const providers = loadProviders()
    const provider = providers.find(p => p.id === params.id)
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(provider)
  } catch (error) {
    console.error('Error in GET /api/llm-providers/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to load LLM provider' },
      { status: 500 }
    )
  }
}

