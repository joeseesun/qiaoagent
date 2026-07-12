import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/admin-auth'
import {
  loadAllowedWorkflowIds,
  spawnWorkflowProcess,
  validateWorkflowRunInput,
  type WorkflowRunInput,
} from '@/lib/workflow-runner'

export async function POST(request: NextRequest) {
  const authError = requireAdminRequest(request)
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request must contain valid JSON' }, { status: 400 })
  }

  const input = body && typeof body === 'object'
    ? body as Record<string, unknown>
    : {}

  let allowedWorkflowIds: ReadonlySet<string>
  try {
    allowedWorkflowIds = loadAllowedWorkflowIds()
  } catch (error) {
    console.error('Failed to load workflow allowlist:', error)
    return NextResponse.json({ error: 'Workflow configuration unavailable' }, { status: 500 })
  }

  const validation = validateWorkflowRunInput(
    input.topic,
    input.workflow_id,
    allowedWorkflowIds
  )
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status })
  }

  try {
    const result = await runPythonWorkflow(validation.value, request.signal)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Workflow execution failed:', error)
    return NextResponse.json({ error: 'Failed to run workflow' }, { status: 500 })
  }
}

function runPythonWorkflow(input: WorkflowRunInput, signal: AbortSignal): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const python = spawnWorkflowProcess(input, false)
    let stdout = ''
    let stderrLength = 0
    let settled = false

    const finish = (callback: () => void) => {
      if (settled) return
      settled = true
      signal.removeEventListener('abort', handleAbort)
      callback()
    }
    const handleAbort = () => {
      python.kill('SIGTERM')
      finish(() => reject(new Error('Workflow request aborted')))
    }

    signal.addEventListener('abort', handleAbort, { once: true })
    if (signal.aborted) {
      handleAbort()
      return
    }

    python.stdout.on('data', data => {
      stdout += data.toString()
    })

    python.stderr.on('data', data => {
      stderrLength += Buffer.byteLength(data)
    })

    python.on('close', code => {
      if (code !== 0) {
        console.error('Workflow subprocess failed:', { code, stderrLength })
        finish(() => reject(new Error('Workflow subprocess failed')))
        return
      }

      try {
        const result = JSON.parse(stdout)
        finish(() => resolve(result))
      } catch {
        finish(() => reject(new Error('Failed to parse workflow output')))
      }
    })

    python.on('error', error => finish(() => reject(error)))
  })
}

export const maxDuration = 60
