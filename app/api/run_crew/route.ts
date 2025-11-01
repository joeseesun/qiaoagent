import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, workflow_id } = body

    if (!topic || !workflow_id) {
      return NextResponse.json(
        { error: 'Missing topic or workflow_id' },
        { status: 400 }
      )
    }

    // Call Python script
    const result = await runPythonScript(topic, workflow_id)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error running crew:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run workflow' },
      { status: 500 }
    )
  }
}

function runPythonScript(topic: string, workflowId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'crew', 'main.py')
    
    const python = spawn('python', [
      '-c',
      `
import sys
import json
sys.path.insert(0, '${process.cwd()}')
from crew.main import run_workflow

try:
    result = run_workflow('${topic.replace(/'/g, "\\'")}', '${workflowId}')
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)
`
    ])

    let stdout = ''
    let stderr = ''

    python.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    python.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || 'Python script failed'))
      } else {
        try {
          const result = JSON.parse(stdout)
          resolve(result)
        } catch (e) {
          reject(new Error('Failed to parse Python output'))
        }
      }
    })

    python.on('error', (error) => {
      reject(error)
    })
  })
}

// Increase timeout for this route (60 seconds)
export const maxDuration = 60

