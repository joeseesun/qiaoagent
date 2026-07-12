import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

export const MAX_TOPIC_LENGTH = 20_000

export interface WorkflowRunInput {
  topic: string
  workflowId: string
}

export type WorkflowRunValidation =
  | { ok: true; value: WorkflowRunInput }
  | { ok: false; status: 400 | 413; error: string }

interface WorkflowCatalog {
  workflows?: Array<{ id?: unknown }>
}

export function loadAllowedWorkflowIds(
  workflowsPath = path.join(process.cwd(), 'public', 'workflows.json')
): ReadonlySet<string> {
  const parsed = JSON.parse(fs.readFileSync(workflowsPath, 'utf8')) as WorkflowCatalog
  const workflowIds = new Set<string>()

  if (Array.isArray(parsed.workflows)) {
    for (const workflow of parsed.workflows) {
      if (typeof workflow?.id === 'string' && workflow.id) {
        workflowIds.add(workflow.id)
      }
    }
  }

  if (workflowIds.size === 0) {
    throw new Error('No runnable workflows are configured')
  }

  return workflowIds
}

export function validateWorkflowRunInput(
  topic: unknown,
  workflowId: unknown,
  allowedWorkflowIds: ReadonlySet<string>
): WorkflowRunValidation {
  if (typeof topic !== 'string' || !topic.trim()) {
    return { ok: false, status: 400, error: 'Topic is required' }
  }

  if (topic.length > MAX_TOPIC_LENGTH) {
    return {
      ok: false,
      status: 413,
      error: `Topic exceeds the ${MAX_TOPIC_LENGTH} character limit`,
    }
  }

  if (typeof workflowId !== 'string' || !allowedWorkflowIds.has(workflowId)) {
    return { ok: false, status: 400, error: 'Unknown workflow_id' }
  }

  return { ok: true, value: { topic, workflowId } }
}

export function buildWorkflowProcessSpec(input: WorkflowRunInput, streaming: boolean) {
  return {
    command: 'python3',
    args: ['-u', '-m', 'crew.run_workflow', ...(streaming ? ['--stream'] : [])],
    stdin: JSON.stringify({ topic: input.topic, workflow_id: input.workflowId }),
  }
}

export function spawnWorkflowProcess(
  input: WorkflowRunInput,
  streaming: boolean
): ChildProcessWithoutNullStreams {
  const spec = buildWorkflowProcessSpec(input, streaming)
  const child = spawn(spec.command, spec.args, {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  child.stdin.end(spec.stdin)
  return child
}
