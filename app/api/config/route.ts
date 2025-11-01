import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const workflowsPath = path.join(process.cwd(), 'public', 'workflows.json')
    const data = fs.readFileSync(workflowsPath, 'utf-8')
    const config = JSON.parse(data)

    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workflows, password } = body

    // Verify password
    const adminPassword = process.env.ADMIN_PASSWORD || 'ai_admin_2025'
    if (password !== adminPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      )
    }

    // Save configuration
    const workflowsPath = path.join(process.cwd(), 'public', 'workflows.json')
    const config = { workflows }
    fs.writeFileSync(workflowsPath, JSON.stringify(config, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update configuration' },
      { status: 500 }
    )
  }
}

