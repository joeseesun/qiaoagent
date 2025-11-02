import { NextRequest } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const topic = searchParams.get('topic')
  const workflow_id = searchParams.get('workflow_id')

  if (!topic || !workflow_id) {
    return new Response('Missing topic or workflow_id', { status: 400 })
  }

  // Create a readable stream for SSE
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Send initial message
        sendEvent({ type: 'task', message: '正在加载工作流配置...' })

        // Run Python script with streaming output
        const pythonScript = `
import sys
import json
import os
sys.path.insert(0, '${process.cwd()}')

# Redirect print to stderr so we can capture it
import io
from contextlib import redirect_stdout, redirect_stderr

from crew.main import run_workflow_with_progress

try:
    topic = json.loads(${JSON.stringify(JSON.stringify(topic))})
    result = run_workflow_with_progress(topic, '${workflow_id}')
    print(json.dumps(result), file=sys.stdout)
except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)
`

        const python = spawn('python3', ['-u', '-c', pythonScript])

        let stdout = ''
        let stderr = ''

        python.stdout.on('data', (data) => {
          const output = data.toString()
          stdout += output
          
          // Try to parse progress messages
          const lines = output.split('\n')
          for (const line of lines) {
            if (line.trim().startsWith('PROGRESS:')) {
              const progressData = line.replace('PROGRESS:', '').trim()
              try {
                const progressJson = JSON.parse(progressData)
                sendEvent(progressJson)
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        })

        python.stderr.on('data', (data) => {
          const output = data.toString()
          stderr += output
          
          // Check for progress messages in stderr too
          const lines = output.split('\n')
          for (const line of lines) {
            if (line.trim().startsWith('PROGRESS:')) {
              const progressData = line.replace('PROGRESS:', '').trim()
              try {
                const progressJson = JSON.parse(progressData)
                sendEvent(progressJson)
              } catch (e) {
                // Ignore parse errors
              }
            } else if (line.trim() && !line.includes('WARNING')) {
              // Send other stderr output as task messages
              sendEvent({ type: 'task', message: line.trim() })
            }
          }
        })

        python.on('close', (code) => {
          if (code !== 0) {
            sendEvent({ type: 'error', message: stderr || 'Python script failed' })
            controller.close()
          } else {
            try {
              // Extract JSON result from stdout
              const jsonMatch = stdout.match(/\{[\s\S]*\}/)
              if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0])
                if (result.error) {
                  sendEvent({ type: 'error', message: result.error })
                } else {
                  sendEvent({ type: 'complete', message: '生成完成', result })
                }
              } else {
                sendEvent({ type: 'error', message: 'Failed to parse result' })
              }
            } catch (e) {
              sendEvent({ type: 'error', message: 'Failed to parse Python output' })
            }
            controller.close()
          }
        })

        python.on('error', (error) => {
          sendEvent({ type: 'error', message: error.message })
          controller.close()
        })

      } catch (error: any) {
        sendEvent({ type: 'error', message: error.message || 'Unknown error' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// Increase timeout for this route (5 minutes)
export const maxDuration = 300

