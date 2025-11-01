import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const workflowsPath = path.join(process.cwd(), 'public', 'workflows.json')
    const data = fs.readFileSync(workflowsPath, 'utf-8')
    const config = JSON.parse(data)

    const workflows = config.workflows.map((w: any) => ({
      id: w.id,
      name: w.name,
      agents: w.agents.map((a: any) => ({
        name: a.name,
        role: a.role
      }))
    }))

    return NextResponse.json({ workflows })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load workflows' },
      { status: 500 }
    )
  }
}

