import type { Mode } from '@/lib/constants'
import type { Citation } from '@/lib/citations'

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  timestamp: string
  mode: Mode
}

export interface StudySession {
  id: string
  user_id: string
  material_id: string | null
  mode: Mode
  messages: ChatMessage[]
  duration_seconds: number
  message_count: number
  started_at: string
  ended_at: string | null
}
