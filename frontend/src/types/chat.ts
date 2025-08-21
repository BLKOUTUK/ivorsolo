export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  user_id: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface ChatResponse {
  response: string
  conversation_id: string
  timestamp: string
}

export interface ApiError {
  error: string
  details?: any
}