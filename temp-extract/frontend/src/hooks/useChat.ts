import { useState, useCallback } from 'react'
import type { ChatMessage, ChatResponse, ApiError } from '../types/chat'

const API_BASE = import.meta.env.VITE_API_BASE || ''

interface UseChatOptions {
  conversationId?: string
  onError?: (error: string) => void
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string>(
    options.conversationId || crypto.randomUUID()
  )

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversation_id: conversationId,
          user_context: {
            timestamp: new Date().toISOString(),
            session: conversationId,
          },
        }),
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data: ChatResponse = await response.json()

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
      }

      setMessages(prev => [...prev, assistantMessage])
      setConversationId(data.conversation_id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1))
      
      if (options.onError) {
        options.onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, isLoading, options])

  const clearConversation = useCallback(() => {
    setMessages([])
    setError(null)
    setConversationId(crypto.randomUUID())
  }, [])

  const retryLastMessage = useCallback(() => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
      if (lastUserMessage) {
        // Remove the last pair of messages (user + assistant)
        setMessages(prev => prev.slice(0, -2))
        sendMessage(lastUserMessage.content)
      }
    }
  }, [messages, sendMessage])

  return {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearConversation,
    retryLastMessage,
  }
}