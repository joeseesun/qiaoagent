import { NextRequest } from 'next/server'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { requireAdminRequest } from '@/lib/admin-auth'
import {
  loadAllowedWorkflowIds,
  spawnWorkflowProcess,
  validateWorkflowRunInput,
} from '@/lib/workflow-runner'

export async function GET(request: NextRequest) {
  const authError = requireAdminRequest(request)
  if (authError) return authError

  const searchParams = request.nextUrl.searchParams
  let allowedWorkflowIds: ReadonlySet<string>
  try {
    allowedWorkflowIds = loadAllowedWorkflowIds()
  } catch (error) {
    console.error('Failed to load workflow allowlist:', error)
    return new Response('Workflow configuration unavailable', { status: 500 })
  }

  const validation = validateWorkflowRunInput(
    searchParams.get('topic'),
    searchParams.get('workflow_id'),
    allowedWorkflowIds
  )
  if (!validation.ok) {
    return new Response(validation.error, { status: validation.status })
  }

  const encoder = new TextEncoder()
  let python: ChildProcessWithoutNullStreams | null = null

  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false
      let stdout = ''
      let stderrBuffer = ''

      const sendEvent = (data: unknown) => {
        if (isClosed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          isClosed = true
        }
      }

      const handleProgressLine = (line: string) => {
        if (!line.startsWith('PROGRESS:')) return

        try {
          sendEvent(JSON.parse(line.slice('PROGRESS:'.length).trim()))
        } catch {
          // Ignore malformed diagnostic output from the worker.
        }
      }

      const closeController = () => {
        if (isClosed) return
        isClosed = true
        request.signal.removeEventListener('abort', handleAbort)
        controller.close()
      }

      const handleAbort = () => {
        python?.kill('SIGTERM')
        closeController()
      }

      sendEvent({ type: 'task', message: '正在加载工作流配置...' })
      python = spawnWorkflowProcess(validation.value, true)

      request.signal.addEventListener('abort', handleAbort, { once: true })
      if (request.signal.aborted) {
        handleAbort()
        return
      }

      python.stdout.on('data', data => {
        stdout += data.toString()
      })

      python.stderr.on('data', data => {
        stderrBuffer += data.toString()

        let newlineIndex = stderrBuffer.indexOf('\n')
        while (newlineIndex !== -1) {
          handleProgressLine(stderrBuffer.slice(0, newlineIndex).trim())
          stderrBuffer = stderrBuffer.slice(newlineIndex + 1)
          newlineIndex = stderrBuffer.indexOf('\n')
        }
      })

      python.on('close', code => {
        handleProgressLine(stderrBuffer.trim())

        if (code !== 0) {
          sendEvent({ type: 'error', message: 'Workflow execution failed' })
          closeController()
          return
        }

        try {
          const result = JSON.parse(stdout)
          if (result?.error) {
            sendEvent({ type: 'error', message: 'Workflow execution failed' })
          } else {
            sendEvent({ type: 'complete', message: '生成完成', result })
          }
        } catch {
          sendEvent({ type: 'error', message: 'Failed to parse workflow output' })
        }
        closeController()
      })

      python.on('error', () => {
        sendEvent({ type: 'error', message: 'Workflow process unavailable' })
        closeController()
      })
    },
    cancel() {
      python?.kill('SIGTERM')
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

export const maxDuration = 300
