import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RefreshCw, Trash2, User, AlertCircle } from 'lucide-react'
import { useChat } from '../hooks/useChat'
import type { ChatMessage } from '../types/chat'

interface ChatInterfaceProps {
  className?: string
}

const MessageBubble: React.FC<{ message: ChatMessage; isLast: boolean }> = ({ message, isLast }) => {
  const isUser = message.role === 'user'
  
  // Dynamic avatar expressions based on message content
  const getAvatarExpression = () => {
    const content = message.content.toLowerCase()
    if (content.includes('thank') || content.includes('great') || content.includes('perfect') || content.includes('amazing')) {
      return 'happy'
    }
    if (content.includes('help') || content.includes('support') || content.includes('crisis') || content.includes('urgent')) {
      return 'caring'
    }
    if (content.includes('?')) {
      return 'thoughtful'
    }
    return 'default'
  }

  const expression = getAvatarExpression()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      {!isUser && (
        <motion.div 
          className="flex-shrink-0 relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Enhanced IVOR Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg ring-2 ring-emerald-500/30 relative">
            <img 
              src="/ivor.png" 
              alt="I.V.O.R." 
              className="w-full h-full object-cover"
            />
            {/* Expression overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-indigo-400/20 rounded-full flex items-center justify-center"
            >
              {expression === 'happy' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-yellow-300 text-xs"
                >
                  ✨
                </motion.div>
              )}
              {expression === 'caring' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-pink-300 text-xs"
                >
                  💜
                </motion.div>
              )}
              {expression === 'thoughtful' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-cyan-300 text-xs"
                >
                  🤔
                </motion.div>
              )}
            </motion.div>
          </div>
          
          {/* Status indicator */}
          <motion.div 
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`px-4 py-3 rounded-2xl relative ${
            isUser
              ? 'bg-gradient-to-r from-emerald-600 to-indigo-600 text-white shadow-lg'
              : 'bg-gradient-to-br from-gray-800 to-gray-700 text-gray-100 shadow-xl border border-emerald-500/20'
          }`}
        >
          {/* Personality glow effect for IVOR messages */}
          {!isUser && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-2xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}
          
          <div className="relative whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
          
          {/* Message tail */}
          <div className={`absolute top-3 ${
            isUser 
              ? 'right-[-6px] border-l-6 border-l-emerald-600 border-t-6 border-t-transparent border-b-6 border-b-transparent' 
              : 'left-[-6px] border-r-6 border-r-gray-800 border-t-6 border-t-transparent border-b-6 border-b-transparent'
          }`} />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-xs text-gray-400 mt-2 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          
          {!isUser && isLast && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-emerald-400 text-xs font-mono"
            >
              I.V.O.R.
            </motion.span>
          )}
        </motion.div>
      </div>
      
      {isUser && (
        <motion.div 
          className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.05 }}
        >
          <User className="w-5 h-5 text-gray-300" />
        </motion.div>
      )}
    </motion.div>
  )
}

const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="flex gap-3 justify-start mb-6"
  >
    {/* Enhanced IVOR Avatar with thinking animation */}
    <motion.div 
      className="flex-shrink-0 relative"
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg ring-2 ring-emerald-500/50 relative">
        <img 
          src="/ivor.png" 
          alt="I.V.O.R." 
          className="w-full h-full object-cover"
        />
        {/* Thinking overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-purple-400/30 rounded-full flex items-center justify-center"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="text-cyan-300 text-xs"
          >
            🧠
          </motion.div>
        </motion.div>
      </div>
      
      {/* Active status with pulse */}
      <motion.div 
        className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full border-2 border-gray-900"
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.div>
    
    {/* Enhanced typing bubble */}
    <motion.div 
      className="bg-gradient-to-br from-gray-800 to-gray-700 px-6 py-4 rounded-2xl shadow-xl border border-emerald-500/20 relative"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Glow effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      <div className="relative flex items-center gap-1">
        <span className="text-emerald-300 text-xs font-mono mr-2">I.V.O.R. is thinking</span>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
            animate={{ 
              y: [0, -6, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Message tail */}
      <div className="absolute top-3 left-[-6px] border-r-6 border-r-gray-800 border-t-6 border-t-transparent border-b-6 border-b-transparent" />
    </motion.div>
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
    {/* Enhanced IVOR Hero Avatar - Made Bigger */}
    <motion.div 
      className="relative w-32 h-32 mx-auto mb-6"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, ease: "backOut" }}
    >
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl ring-4 ring-emerald-500/30 relative">
        <img 
          src="/ivor.png" 
          alt="I.V.O.R." 
          className="w-full h-full object-cover"
        />
        
        {/* Animated welcome glow */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-cyan-400/20 to-purple-400/20 rounded-3xl"
          animate={{ 
            background: [
              "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2))",
              "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))",
              "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2), rgba(16, 185, 129, 0.2))"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        {/* Floating emojis - positioned for bigger avatar */}
        <motion.div 
          className="absolute top-2 right-2 text-yellow-300 text-lg"
          animate={{ y: [0, -4, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          ✨
        </motion.div>
        <motion.div 
          className="absolute bottom-2 left-2 text-pink-300 text-lg"
          animate={{ y: [0, -3, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        >
          💜
        </motion.div>
      </div>
      
      {/* Pulsing ring effect - adjusted for bigger size */}
      <motion.div 
        className="absolute inset-0 border-2 border-emerald-400 rounded-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-3xl font-bold text-white mb-3">Welcome to I.V.O.R.</h2>
      <motion.p 
        className="text-emerald-300 text-sm font-mono uppercase tracking-wider mb-6"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Intelligent Virtual Organizing Resource
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 backdrop-blur-sm border border-emerald-500/20 max-w-lg mx-auto"
      >
        <p className="text-gray-300 leading-relaxed mb-4">
          I'm here to support Black queer men with resources, community connections, 
          and guidance. How can I help you today?
        </p>
        
        {/* Quick action suggestions */}
        <motion.div 
          className="flex flex-wrap gap-2 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {['Quick Support', 'Life Coaching', 'Health Guidance', 'Community Resources'].map((suggestion, index) => (
            <motion.span
              key={suggestion}
              className="text-xs px-3 py-1 bg-gradient-to-r from-emerald-600/30 to-indigo-600/30 text-emerald-300 rounded-full border border-emerald-500/20 cursor-pointer hover:from-emerald-600/50 hover:to-indigo-600/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              {suggestion}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
)

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
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

  // Dynamic placeholder based on message count
  const getPlaceholder = () => {
    if (messages.length === 0) {
      return "Ask I.V.O.R. for support, resources, or community connections..."
    }
    const placeholders = [
      "Continue your conversation with I.V.O.R...",
      "What else would you like to explore?",
      "I'm here to help - what's on your mind?",
      "Let's dive deeper into your needs..."
    ]
    return placeholders[messages.length % placeholders.length]
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

      {/* Enhanced Input Area */}
      <motion.div 
        className="border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm relative"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Personality glow bar */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500"
          animate={{ 
            background: [
              "linear-gradient(90deg, #10b981, #06b6d4, #a855f7)",
              "linear-gradient(90deg, #a855f7, #10b981, #06b6d4)",
              "linear-gradient(90deg, #06b6d4, #a855f7, #10b981)"
            ]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              {/* Input field with enhanced styling */}
              <motion.input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={getPlaceholder()}
                className="w-full px-6 py-4 bg-gray-800/70 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 text-base"
                disabled={isLoading}
                maxLength={1000}
                animate={{
                  borderColor: isFocused ? "#10b981" : "#4b5563",
                  boxShadow: isFocused 
                    ? "0 0 0 4px rgba(16, 185, 129, 0.1), 0 4px 12px rgba(0, 0, 0, 0.3)" 
                    : "0 2px 8px rgba(0, 0, 0, 0.2)"
                }}
              />
              
              {/* Character counter with personality */}
              <motion.div 
                className="absolute right-4 top-4 text-xs flex items-center gap-2"
                animate={{ 
                  color: inputValue.length > 800 ? "#ef4444" : inputValue.length > 600 ? "#f59e0b" : "#6b7280"
                }}
              >
                <span>{inputValue.length}/1000</span>
                {inputValue.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                  />
                )}
              </motion.div>
              
              {/* Input suggestions (when focused and empty) */}
              <AnimatePresence>
                {isFocused && inputValue.length === 0 && messages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-gray-800/90 border border-gray-600 rounded-xl p-3 backdrop-blur-sm z-10"
                  >
                    <p className="text-xs text-gray-400 mb-2">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Tell me more', 'What are my options?', 'Can you explain that?', 'Main menu'].map((suggestion) => (
                        <motion.button
                          key={suggestion}
                          type="button"
                          onClick={() => setInputValue(suggestion)}
                          className="text-xs px-3 py-1 bg-emerald-600/20 text-emerald-300 rounded-full hover:bg-emerald-600/30 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Enhanced send button */}
            <motion.button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={{
                boxShadow: inputValue.trim() 
                  ? "0 4px 20px rgba(16, 185, 129, 0.3)"
                  : "0 2px 8px rgba(0, 0, 0, 0.2)"
              }}
            >
              {/* Button glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-indigo-400/20"
                animate={{ opacity: inputValue.trim() ? [0.2, 0.4, 0.2] : 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <motion.div
                animate={{ rotate: isLoading ? 360 : 0 }}
                transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
              >
                <Send className="w-5 h-5" />
              </motion.div>
              <span>{isLoading ? 'Sending...' : 'Send'}</span>
            </motion.button>
            
            {/* Clear conversation button with enhanced styling */}
            {messages.length > 0 && (
              <motion.button
                type="button"
                onClick={clearConversation}
                className="px-5 py-4 bg-gray-700/70 hover:bg-gray-600/70 text-gray-300 hover:text-white rounded-2xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                aria-label="Clear conversation"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Clear</span>
              </motion.button>
            )}
          </form>
          
          {/* I.V.O.R. status indicator */}
          <motion.div 
            className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              className="w-2 h-2 bg-emerald-400 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>I.V.O.R. is online and ready to support you</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}