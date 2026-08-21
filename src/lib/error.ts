// DeepVision - Frontend error capture & relay
//
// Captures errors thrown anywhere in the app (API calls, render, uncaught JS)
// and relays them to the backend /api/v1/feedback/errors for logging and
// investigation. Reporting is fire-and-forget and never interrupts the flow
// that produced the error.

export const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:8076'

let currentComponent = ''
let currentAction = ''

export interface CapturedError {
  type: string
  message: string
  stack: string
  component: string
  action: string
  endpoint: string
  timestamp: string
  userAgent: string
}

/** Set the current component/action context for the next captured error. */
export function setContext(component: string, action = '') {
  currentComponent = component
  currentAction = action
}

/** Build a CapturedError payload from a thrown value. */
export function buildPayload(
  error: any,
  opts: { component?: string; action?: string; endpoint?: string } = {}
): CapturedError {
  return {
    type: error?.name || 'Error',
    message: error?.message || String(error),
    stack: error?.stack || '',
    component: opts.component || currentComponent,
    action: opts.action || currentAction,
    endpoint: opts.endpoint || '',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  }
}

/**
 * Send a captured error to the backend. Fire-and-forget: any failure to report
 * must never throw into the caller.
 */
export function reportError(
  error: any,
  opts: { component?: string; action?: string; endpoint?: string } = {}
): Promise<void> {
  try {
    fetch(`${API_BASE}/api/v1/feedback/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(error, opts)),
    })
  } catch {
    // swallow — reporting must never break the original flow
  }
  return Promise.resolve()
}

/**
 * Extract a readable "caller" frame from a stack trace, skipping this module's
 * own frames so we attribute the error to the page/code that raised it.
 */
export function callerFromStack(stack: string): string {
  if (!stack) return ''
  const skip = /(src\/lib\/(error|api)\.ts)/
  const frames = stack
    .split('\n')
    .map((l) => l.replace(/^\s+/, ''))
    .filter((l) => !skip.test(l) && /\(.*\)$/.test(l))
  return frames[0] || ''
}
