import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RefreshCw, Trash2, Bot, User, AlertCircle } from 'lucide-react'
import { useChat } from '../hooks/useChat'
import type { ChatMessage } from '../types/chat'

interface ChatInterfaceProps {
  className?: string
}

const MessageBubble: React.FC<{ message: ChatMessage; isLast: boolean }> = ({ message }) => {
  const isUser = message.role === 'user'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-600 to-indigo-600 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-emerald-600 to-indigo-600 text-white'
              : 'bg-gray-800 text-gray-100'
          } shadow-lg`}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
        
        <div className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-300" />
        </div>
      )}
    </motion.div>
  )
}

const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-3 justify-start mb-6"
  >
    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-600 to-indigo-600 rounded-full flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
    
    <div className="bg-gray-800 px-4 py-3 rounded-2xl">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
)

const ErrorMessage: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 mb-4 flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-red-400" />
      <span className="text-red-300 text-sm">{error}</span>
    </div>
    <button
      onClick={onRetry}
      className="text-red-400 hover:text-red-300 transition-colors"
      aria-label="Retry last message"
    >
      <RefreshCw className="w-4 h-4" />
    </button>
  </motion.div>
)

const WelcomeMessage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-8 mb-8"
  >
    <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Bot className="w-8 h-8 text-white" />
    </div>
    
    <h2 className="text-2xl font-bold text-white mb-2">Welcome to I.V.O.R.</h2>
    <p className="text-emerald-300 text-sm font-mono uppercase tracking-wider mb-4">
      Intelligent Virtual Organizing Resource
    </p>
    <p className="text-gray-300 max-w-md mx-auto">
      I'm here to support Black queer men with resources, community connections, 
      and guidance. How can I help you today?
    </p>
  </motion.div>
)

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    retryLastMessage,
  } = useChat({
    onError: (error) => {
      console.error('Chat error:', error)
    }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const message = inputValue.trim()
    setInputValue('')
    await sendMessage(message)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className={`flex flex-col h-full bg-gray-900 ${className}`}>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <WelcomeMessage />
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={`${message.timestamp}-${index}`}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}
              
              <AnimatePresence>
                {isLoading && <TypingIndicator />}
              </AnimatePresence>
              
              {error && (
                <ErrorMessage error={error} onRetry={retryLastMessage} />
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask I.V.O.R. for support, resources, or community connections..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                disabled={isLoading}
                maxLength={1000}
              />
              
              <div className="absolute right-3 top-3 text-xs text-gray-500">
                {inputValue.length}/1000
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Sending...' : 'Send'}
            </button>
            
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearConversation}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-xl transition-colors flex items-center gap-2"
                aria-label="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </form>
          
          <div className="mt-2 text-xs text-gray-400 text-center">
            I.V.O.R. provides community support and resources. For emergencies, please contact appropriate services directly.
          </div>
        </div>
      </div>
    </div>
  )
}