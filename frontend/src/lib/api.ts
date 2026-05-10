export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// All API calls go through the Next.js proxy to avoid CORS issues.
// The proxy at /api/proxy/[...path] forwards requests server-side to the backend.
const PROXY = '/api/proxy/api/v1'

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${PROXY}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new ApiError(
      err.error?.message || 'Request failed',
      res.status,
      err.error?.code
    )
  }
  if (res.status === 204) return null as T
  return res.json()
}

export interface SSEEvent {
  event: string
  data: unknown
}

function parseSSE(raw: string): SSEEvent | null {
  const lines = raw.trim().split('\n')
  let event = 'message'
  let dataStr = ''
  for (const line of lines) {
    if (line.startsWith('event: ')) event = line.slice(7).trim()
    if (line.startsWith('data: ')) dataStr = line.slice(6).trim()
  }
  if (!dataStr) return null
  try {
    return { event, data: JSON.parse(dataStr) }
  } catch {
    return { event, data: dataStr }
  }
}

export async function* apiStream(
  path: string,
  body: unknown
): AsyncGenerator<SSEEvent> {
  const res = await fetch(`${PROXY}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok || !res.body) {
    throw new ApiError('Stream failed', res.status)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const events = buf.split('\n\n')
    buf = events.pop() ?? ''
    for (const e of events) {
      const ev = parseSSE(e)
      if (ev) yield ev
    }
  }
}
