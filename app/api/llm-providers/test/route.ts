import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { baseURL, apiKey, model, providerId } = await request.json()

    if (!baseURL) {
      return NextResponse.json(
        { error: '缺少必要参数：baseURL' },
        { status: 400 }
      )
    }

    // Get real API key from environment variable
    // Priority: environment variable > provided apiKey (for backward compatibility)
    let realApiKey = apiKey

    if (providerId) {
      // Try to get API key from environment variable
      const envKey = `${providerId.toUpperCase()}_API_KEY`
      const envApiKey = process.env[envKey]

      if (envApiKey) {
        realApiKey = envApiKey
      } else if (providerId === 'tuzi' && process.env.OPENAI_API_KEY) {
        // Backward compatibility for tuzi
        realApiKey = process.env.OPENAI_API_KEY
      }
    }

    // Check if we have a valid API key (not a placeholder)
    if (!realApiKey || realApiKey.startsWith('your-')) {
      return NextResponse.json(
        {
          error: `未配置 API Key。请在环境变量中设置 ${providerId ? providerId.toUpperCase() + '_API_KEY' : 'API_KEY'}`,
          hint: providerId ? `在 .env 文件中添加: ${providerId.toUpperCase()}_API_KEY=your-real-api-key-here` : ''
        },
        { status: 400 }
      )
    }

    // 构建测试请求
    const testModel = model || 'gpt-3.5-turbo'
    const endpoint = `${baseURL}/chat/completions`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${realApiKey}`,
      },
      body: JSON.stringify({
        model: testModel,
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a connection test.',
          },
        ],
        max_tokens: 10,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: `API 返回错误 (${response.status}): ${
            errorData.error?.message || errorData.message || response.statusText
          }`,
        },
        { status: 400 }
      )
    }

    const data = await response.json()

    // 验证响应格式
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      return NextResponse.json(
        { error: 'API 响应格式不正确' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `连接成功！模型 ${testModel} 响应正常。`,
      response: data.choices[0].message?.content || '',
    })
  } catch (error) {
    console.error('Test connection error:', error)
    return NextResponse.json(
      {
        error: `连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
      },
      { status: 500 }
    )
  }
}

