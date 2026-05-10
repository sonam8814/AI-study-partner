import { createClient } from '@/lib/supabase/client'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function authHeader(): Promise<HeadersInit> {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeader()),
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
  const res = await fetch(`${BASE}/api/v1${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
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
