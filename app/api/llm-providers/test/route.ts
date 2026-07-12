import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/admin-auth'
import {
  isCallerOwnedApiKey,
  validateProviderTestTarget,
} from '@/lib/llm-provider-security'

export async function POST(request: NextRequest) {
  const authError = requireAdminRequest(request)
  if (authError) return authError

  try {
    const { baseURL, apiKey, model, providerId } = await request.json()

    const targetError = validateProviderTestTarget({ baseURL, model, providerId })
    if (targetError) {
      return NextResponse.json(
        { error: targetError },
        { status: 400 }
      )
    }

    // Never combine a server-side credential with caller-controlled routing.
    // Connection tests must always use a one-time key supplied by the caller.
    if (!isCallerOwnedApiKey(apiKey)) {
      return NextResponse.json(
        {
          error: '测试连接必须提供调用者自有 API Key；服务端环境 Key 不会用于测试。',
          hint: '该 Key 仅用于本次测试请求，不会保存。',
        },
        { status: 400 }
      )
    }

    // 构建测试请求
    const testModel = model.trim()
    const endpoint = `${baseURL.trim().replace(/\/+$/, '')}/chat/completions`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
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
