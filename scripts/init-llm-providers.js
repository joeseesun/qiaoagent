/**
 * Initialize LLM providers with default configurations
 */
const fs = require('fs')
const path = require('path')

const configDir = path.join(__dirname, '..', 'config')
const providersFile = path.join(configDir, 'llm-providers.json')

// Ensure config directory exists
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true })
}

// Default LLM providers
const defaultProviders = [
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
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'kimi',
    name: 'Kimi (Moonshot AI)',
    type: 'kimi',
    baseURL: 'https://api.moonshot.cn/v1',
    apiKey: 'sk-fYmID3PPGRKWAavrsVRJR0yAnF6210ya4rAoc5TZZKFRDAH5',
    models: [
      'moonshot-v1-8k',
      'moonshot-v1-32k',
      'moonshot-v1-128k',
      'kimi-k2-turbo-preview',
    ],
    defaultModel: 'kimi-k2-turbo-preview',
    enabled: true,
    description: 'Kimi (Moonshot AI) - 支持长上下文',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

// Write to file
fs.writeFileSync(providersFile, JSON.stringify(defaultProviders, null, 2), 'utf-8')

console.log('✅ LLM providers initialized successfully!')
console.log(`📁 Config file: ${providersFile}`)
console.log(`📊 Providers: ${defaultProviders.length}`)
defaultProviders.forEach(p => {
  console.log(`   - ${p.name} (${p.models.length} models)`)
})

