import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000'

async function proxyRequest(request: NextRequest): Promise<NextResponse> {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const url = new URL(request.url)
  const backendPath = url.pathname.replace('/api/proxy', '')
  const backendUrl = `${BACKEND_URL}${backendPath}${url.search}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? await request.text()
    : undefined

  let res: Response
  try {
    res = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
    })
  } catch {
    return NextResponse.json(
      { error: { message: 'Backend unavailable', code: 'backend_unavailable' } },
      { status: 503 }
    )
  }

  const responseHeaders = new Headers()
  res.headers.forEach((value, key) => {
    responseHeaders.set(key, value)
  })

  // Ensure SSE streams are not buffered
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('text/event-stream')) {
    responseHeaders.set('Cache-Control', 'no-cache')
    responseHeaders.set('X-Accel-Buffering', 'no')
  }

  return new NextResponse(res.body, {
    status: res.status,
    headers: responseHeaders,
  })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const DELETE = proxyRequest
export const PATCH = proxyRequest
