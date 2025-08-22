import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import winston from 'winston'
import { v4 as uuidv4 } from 'uuid'
import nodemailer from 'nodemailer'
import cron from 'node-cron'
import KnowledgeService from './services/knowledgeService.js'

// Load environment variables
dotenv.config()

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// Initialize Express
const app = express()
const PORT = process.env.PORT || 3001

// Initialize Supabase (separate instance for IVOR)
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize Knowledge Service
const knowledgeService = new KnowledgeService(supabaseUrl, supabaseKey)

// Import admin routes
import adminRoutes from './routes/admin.js'

// Email Configuration
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
}

// Initialize email transporter
const transporter = nodemailer.createTransport(emailConfig)

// Verify email configuration on startup
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter.verify((error: any, success: any) => {
    if (error) {
      logger.error('Email configuration failed:', error)
    } else {
      logger.info('Email service ready for weekly reports')
    }
  })
} else {
  logger.warn('Email not configured - weekly reports will not be sent automatically')
}

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://frontend-fn1pbg49q-robs-projects-54d653d3.vercel.app', 'https://ivor.blkout.uk', 'https://blkout.uk'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve static files from the public directory
app.use(express.static(path.join(process.cwd(), 'public')))

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  })
  next()
})

// Admin routes for knowledge base management
app.use('/api/admin', adminRoutes)

// I.V.O.R. Learning and Analytics System
interface ConversationMetrics {
  id: string
  conversationId: string
  timestamp: Date
  messageType: 'user' | 'assistant'
  serviceUsed?: string
  topicCategory?: string
  responseTime: number
  userSatisfaction?: number // 1-5 scale
  sessionDuration?: number
  deviceType?: string
  location?: string // anonymized region
  weekOfYear: number
  monthOfYear: number
}

interface LearningPattern {
  id: string
  patternType: 'service_demand' | 'topic_trend' | 'user_journey' | 'gap_identification'
  description: string
  frequency: number
  confidence: number
  actionable: boolean
  discovered: Date
  lastSeen: Date
}

interface ServiceGap {
  id: string
  gapType: 'unmet_need' | 'service_limitation' | 'resource_shortage' | 'feature_request'
  description: string
  frequency: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  suggestedAction: string
  communityImpact: string
  discovered: Date
}

// In-memory stores for analytics (in production, use persistent database)
const conversationMetrics = new Map<string, ConversationMetrics[]>()
const learningPatterns = new Map<string, LearningPattern>()
const serviceGaps = new Map<string, ServiceGap>()
const weeklyInsights = new Map<string, any>()
const monthlyReports = new Map<string, any>()

// Analytics tracking function
function trackConversation(data: Partial<ConversationMetrics>) {
  const metric: ConversationMetrics = {
    id: uuidv4(),
    conversationId: data.conversationId || 'anonymous',
    timestamp: new Date(),
    messageType: data.messageType || 'user',
    serviceUsed: data.serviceUsed,
    topicCategory: data.topicCategory,
    responseTime: data.responseTime || 0,
    deviceType: data.deviceType,
    location: data.location,
    weekOfYear: new Date().getWeek(),
    monthOfYear: new Date().getMonth() + 1,
    ...data
  }

  const conversationKey = metric.conversationId
  if (!conversationMetrics.has(conversationKey)) {
    conversationMetrics.set(conversationKey, [])
  }
  conversationMetrics.get(conversationKey)!.push(metric)

  // Real-time learning
  identifyPatterns(metric)
  detectServiceGaps(metric)
}

// Pattern identification for I.V.O.R. learning
function identifyPatterns(metric: ConversationMetrics) {
  // Service demand patterns
  if (metric.serviceUsed) {
    const patternKey = `service_demand_${metric.serviceUsed}`
    const existing = learningPatterns.get(patternKey)
    
    if (existing) {
      existing.frequency++
      existing.lastSeen = new Date()
      existing.confidence = Math.min(existing.confidence + 0.1, 1.0)
    } else {
      learningPatterns.set(patternKey, {
        id: patternKey,
        patternType: 'service_demand',
        description: `High demand for ${metric.serviceUsed} service`,
        frequency: 1,
        confidence: 0.1,
        actionable: true,
        discovered: new Date(),
        lastSeen: new Date()
      })
    }
  }

  // Topic trend analysis
  if (metric.topicCategory) {
    const topicKey = `topic_trend_${metric.topicCategory}`
    const existing = learningPatterns.get(topicKey)
    
    if (existing) {
      existing.frequency++
      existing.lastSeen = new Date()
    } else {
      learningPatterns.set(topicKey, {
        id: topicKey,
        patternType: 'topic_trend',
        description: `Emerging interest in ${metric.topicCategory}`,
        frequency: 1,
        confidence: 0.1,
        actionable: false,
        discovered: new Date(),
        lastSeen: new Date()
      })
    }
  }
}

// Service gap detection
function detectServiceGaps(metric: ConversationMetrics) {
  // Analyze response times for performance gaps
  if (metric.responseTime > 3000) { // Slow responses indicate system strain
    const gapKey = 'performance_gap'
    const existing = serviceGaps.get(gapKey)
    
    if (existing) {
      existing.frequency++
    } else {
      serviceGaps.set(gapKey, {
        id: gapKey,
        gapType: 'service_limitation',
        description: 'Slow response times affecting user experience',
        frequency: 1,
        urgency: 'medium',
        suggestedAction: 'Optimize response generation or scale infrastructure',
        communityImpact: 'Users may abandon conversations due to delays',
        discovered: new Date()
      })
    }
  }

  // Detect unmet needs (users asking for services we don't offer)
  // This would be enhanced with NLP analysis in production
}

// Helper function to categorize user messages for analytics
function categorizeMessage(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Health & wellness categories
  if (lowerMessage.includes('health') || lowerMessage.includes('medical') || lowerMessage.includes('doctor') || 
      lowerMessage.includes('mental health') || lowerMessage.includes('depression') || lowerMessage.includes('anxiety')) {
    return 'health_wellness'
  }
  
  // Relationship categories
  if (lowerMessage.includes('relationship') || lowerMessage.includes('dating') || lowerMessage.includes('partner') ||
      lowerMessage.includes('family') || lowerMessage.includes('friend') || lowerMessage.includes('love')) {
    return 'relationships'
  }
  
  // Career categories
  if (lowerMessage.includes('job') || lowerMessage.includes('career') || lowerMessage.includes('work') ||
      lowerMessage.includes('employment') || lowerMessage.includes('boss') || lowerMessage.includes('interview')) {
    return 'career_professional'
  }
  
  // Personal development
  if (lowerMessage.includes('goal') || lowerMessage.includes('habit') || lowerMessage.includes('growth') ||
      lowerMessage.includes('motivation') || lowerMessage.includes('confidence') || lowerMessage.includes('journal')) {
    return 'personal_development'
  }
  
  // Identity & community
  if (lowerMessage.includes('identity') || lowerMessage.includes('queer') || lowerMessage.includes('gay') ||
      lowerMessage.includes('community') || lowerMessage.includes('discrimination') || lowerMessage.includes('coming out')) {
    return 'identity_community'
  }
  
  // Crisis & immediate support
  if (lowerMessage.includes('crisis') || lowerMessage.includes('emergency') || lowerMessage.includes('urgent') ||
      lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('suicide')) {
    return 'crisis_support'
  }
  
  // Housing & practical support
  if (lowerMessage.includes('housing') || lowerMessage.includes('homeless') || lowerMessage.includes('accommodation') ||
      lowerMessage.includes('rent') || lowerMessage.includes('eviction')) {
    return 'housing_practical'
  }
  
  return 'general_conversation'
}

// Helper function to detect which service was used in the conversation
function detectServiceUsed(userMessage: string, assistantResponse: string): string | undefined {
  const combinedText = `${userMessage} ${assistantResponse}`.toLowerCase()
  
  // Check for specific service indicators in the response
  if (combinedText.includes('wellness coaching') || combinedText.includes('habit coaching') ||
      combinedText.includes('15-section') || combinedText.includes('wellness assessment')) {
    return 'wellness-coaching'
  }
  
  if (combinedText.includes('problem solving') || combinedText.includes('mental model') ||
      combinedText.includes('strategic thinking') || combinedText.includes('framework')) {
    return 'problem-solving'
  }
  
  if (combinedText.includes('journaling') || combinedText.includes('morning ritual') ||
      combinedText.includes('evening ritual') || combinedText.includes('transformational')) {
    return 'transformational-journaling'
  }
  
  if (combinedText.includes('relationship coaching') || combinedText.includes('attachment style') ||
      combinedText.includes('communication patterns')) {
    return 'relationship-coaching'
  }
  
  if (combinedText.includes('career guidance') || combinedText.includes('professional development') ||
      combinedText.includes('career planning')) {
    return 'career-guidance'
  }
  
  if (combinedText.includes('health advice') || combinedText.includes('medical') ||
      combinedText.includes('healthcare navigation')) {
    return 'health-advice'
  }
  
  // Check for immediate resource responses
  if (combinedText.includes('crisis') || combinedText.includes('emergency') ||
      combinedText.includes('immediate support') || combinedText.includes('hotline')) {
    return 'immediate-resources'
  }
  
  return undefined
}

// Distress Detection and Emergency Protocol System
interface DistressSignal {
  level: 'low' | 'medium' | 'high' | 'critical'
  indicators: string[]
  immediateResponse: boolean
  followUpRequired: boolean
}

function detectDistressLevel(message: string): DistressSignal {
  const lowerMessage = message.toLowerCase()
  
  // Critical distress indicators (immediate emergency response)
  const criticalKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
    'overdose', 'self harm', 'cut myself', 'hurt myself', 
    'emergency', 'crisis', 'immediate danger', 'urgent help'
  ]
  
  // High distress indicators 
  const highKeywords = [
    'depressed', 'hopeless', 'can\'t cope', 'overwhelmed', 'breaking down',
    'panic attack', 'anxiety attack', 'mental breakdown', 'desperate',
    'isolated', 'alone', 'nobody cares', 'worthless'
  ]
  
  // Medium distress indicators
  const mediumKeywords = [
    'stressed', 'worried', 'anxious', 'sad', 'upset', 'struggling',
    'difficult time', 'hard to cope', 'need support', 'feeling down'
  ]
  
  const foundCritical = criticalKeywords.filter(keyword => lowerMessage.includes(keyword))
  const foundHigh = highKeywords.filter(keyword => lowerMessage.includes(keyword))
  const foundMedium = mediumKeywords.filter(keyword => lowerMessage.includes(keyword))
  
  if (foundCritical.length > 0) {
    return {
      level: 'critical',
      indicators: foundCritical,
      immediateResponse: true,
      followUpRequired: true
    }
  }
  
  if (foundHigh.length >= 2 || (foundHigh.length >= 1 && foundMedium.length >= 1)) {
    return {
      level: 'high',
      indicators: [...foundHigh, ...foundMedium],
      immediateResponse: true,
      followUpRequired: true
    }
  }
  
  if (foundHigh.length >= 1 || foundMedium.length >= 2) {
    return {
      level: 'medium',
      indicators: [...foundHigh, ...foundMedium],
      immediateResponse: false,
      followUpRequired: true
    }
  }
  
  if (foundMedium.length >= 1) {
    return {
      level: 'low',
      indicators: foundMedium,
      immediateResponse: false,
      followUpRequired: false
    }
  }
  
  return {
    level: 'low',
    indicators: [],
    immediateResponse: false,
    followUpRequired: false
  }
}

function generateEmergencyResponse(distressSignal: DistressSignal): string {
  if (distressSignal.level === 'critical') {
    return `🚨 **IMMEDIATE EMERGENCY SUPPORT**

**If you are in immediate danger, please contact emergency services:**
• **Emergency Services: 999**
• **Samaritans: 116 123** (free, 24/7)
• **Crisis Text Line: Text SHOUT to 85258**

**LGBTQ+ Specific Crisis Support:**
• **Switchboard LGBT+: 0300 330 0630** (10am-10pm daily)
• **MindLine Trans+: 0300 330 5468** (Mon & Fri 8pm-midnight)

**You are not alone. Your life has value. Help is available right now.**

I'm here to support you, but please prioritize getting immediate professional help. Would you like me to help you find local crisis services or someone to talk to right now?`
  }
  
  if (distressSignal.level === 'high') {
    return `💛 **PRIORITY SUPPORT AVAILABLE**

I can see you're going through a really difficult time. You've taken a brave step by reaching out.

**Immediate Support Options:**
• **Samaritans: 116 123** (free, confidential, 24/7)
• **Mind LGBTQ+: 0300 123 3393**
• **Switchboard LGBT+: 0300 330 0630**
• **Crisis Text Line: Text SHOUT to 85258**

**You don't have to handle this alone.** I'm here to support you through this conversation, and I can help connect you with professional support.

What feels most urgent for you right now? Would you like immediate crisis support or shall we work through this together step by step?`
  }
  
  if (distressSignal.level === 'medium') {
    return `💚 **CARING SUPPORT**

I hear that you're struggling right now, and I want you to know that reaching out shows real strength.

**Support Available:**
• **Samaritans: 116 123** (always available to listen)
• **Mind LGBTQ+: 0300 123 3393** 
• **Switchboard LGBT+: 0300 330 0630**

I'm here to support you through this. Whether you need immediate professional support or want to work through this together, we can take it at your pace.

What kind of support would feel most helpful right now?`
  }
  
  return '' // Low level - no emergency response needed
}

// Extend Date prototype for week calculation
declare global {
  interface Date {
    getWeek(): number
  }
}

Date.prototype.getWeek = function() {
  const date = new Date(this.getTime())
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'ivor-backend',
    version: '1.0.0'
  })
})

// IVOR Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversation_id, user_context } = req.body
    const startTime = Date.now()

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      })
    }

    logger.info('Processing chat message', { 
      messageLength: message.length,
      conversationId: conversation_id,
      hasUserContext: !!user_context
    })

    // Track user message
    const deviceType = req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
    trackConversation({
      conversationId: conversation_id,
      messageType: 'user',
      deviceType,
      topicCategory: categorizeMessage(message)
    })
    
    // Distress detection and emergency protocol
    const distressSignal = detectDistressLevel(message)
    if (distressSignal.immediateResponse) {
      const emergencyResponse = generateEmergencyResponse(distressSignal)
      
      // Log emergency intervention
      logger.warn('Emergency distress detected', {
        conversationId: conversation_id,
        distressLevel: distressSignal.level,
        indicators: distressSignal.indicators,
        timestamp: new Date().toISOString()
      })
      
      // Track emergency response
      trackConversation({
        conversationId: conversation_id,
        messageType: 'assistant',
        responseTime: Date.now() - startTime,
        serviceUsed: 'emergency-support',
        deviceType,
        topicCategory: 'crisis_support'
      })
      
      return res.json({
        response: emergencyResponse,
        conversation_id,
        timestamp: new Date().toISOString(),
        emergency_protocol_activated: true,
        distress_level: distressSignal.level
      })
    }

    // Generate IVOR response based on message content
    const response = await generateIVORResponse(message, user_context)
    const responseTime = Date.now() - startTime

    // Track assistant response
    trackConversation({
      conversationId: conversation_id,
      messageType: 'assistant',
      responseTime,
      serviceUsed: detectServiceUsed(message, response),
      deviceType
    })

    // Store conversation in database
    if (conversation_id) {
      await supabase
        .from('ivor_conversations')
        .upsert({
          id: conversation_id,
          messages: [
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: response, timestamp: new Date() }
          ],
          updated_at: new Date()
        })
    }

    res.json({
      response,
      conversation_id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Error processing chat message', { error })
    res.status(500).json({ 
      error: 'Internal server error processing your message' 
    })
  }
})

// I.V.O.R. Service Framework - Comprehensive Life Coaching
interface IVORService {
  id: string
  name: string
  description: string
  icon: string
  category: string
  intro: string
}

const IVOR_SERVICES: IVORService[] = [
  {
    id: 'wellness-coaching',
    name: 'Wellness & Habit Coaching',
    description: '15-section personalized wellness plan development',
    icon: '🌱',
    category: 'Personal Development',
    intro: 'I\'ll guide you through a comprehensive wellness assessment to create a personalized plan for sustainable habit change and holistic wellbeing.'
  },
  {
    id: 'problem-solving',
    name: 'Strategic Problem Solving',
    description: 'Mental model-based approach to overcome challenges',
    icon: '🧩',
    category: 'Personal Development', 
    intro: 'Using proven mental models, I\'ll help you break down complex problems into clear, actionable solutions with strategic thinking frameworks.'
  },
  {
    id: 'transformational-journaling',
    name: 'Transformational Journaling',
    description: 'Daily morning and evening journaling rituals for growth',
    icon: '📖',
    category: 'Personal Development',
    intro: 'Experience transformative daily journaling through structured morning and evening rituals designed to rewire thought patterns and propel you toward your highest potential.'
  },
  {
    id: 'community-resources',
    name: 'Community Resources & Crisis Support',
    description: 'Black queer-affirming resources and emergency support',
    icon: '🏠',
    category: 'Support Services',
    intro: 'Connect with culturally competent mental health, housing, legal, and community resources specifically designed for Black queer liberation.'
  },
  {
    id: 'relationship-coaching',
    name: 'Relationships & Social Connection',
    description: 'Dating, friendship, and building meaningful connections',
    icon: '💕',
    category: 'Relationships',
    intro: 'Navigate dating, build authentic friendships, and create the social connections that support your authentic self and chosen family.'
  },
  {
    id: 'career-guidance',
    name: 'Career & Professional Development',
    description: 'Navigate workplace challenges and build fulfilling careers',
    icon: '🚀',
    category: 'Professional Growth',
    intro: 'Develop career strategies that honor your identity while advancing your professional goals and economic liberation.'
  },
  {
    id: 'health-advice',
    name: 'Health & Wellbeing Advice',
    description: 'Comprehensive health guidance for Black queer men',
    icon: '🏥',
    category: 'Health & Wellness',
    intro: 'I\'ll provide personalized health advice covering mental health, sexual health, physical wellness, and navigating healthcare systems as a Black queer man, incorporating evidence-based guidance from specialized resources.'
  }
]

// Session state management for multi-step coaching
interface UserSession {
  id: string
  currentService?: string
  currentStep?: string
  progress: Record<string, any>
  startedAt: Date
  lastActivity: Date
}

const userSessions = new Map<string, UserSession>()

// Wellness Coaching Framework (15-section model)
interface WellnessSection {
  id: string
  name: string
  description: string
  questions: string[]
  assessmentPrompt: string
}

const WELLNESS_SECTIONS: WellnessSection[] = [
  {
    id: 'persona-snapshot',
    name: 'Personal Snapshot',
    description: 'Understanding your current identity and life situation',
    questions: ['How would you describe yourself in 3 words?', 'What are your core values?', 'What brings you the most joy?'],
    assessmentPrompt: 'Tell me about yourself - your background, current situation, and what you value most in life. This helps me understand your unique perspective as we build your wellness plan.'
  },
  {
    id: 'wellness-domains',
    name: 'Wellness Domains Inventory',
    description: 'Mapping your wellness across key life areas',
    questions: ['Rate your satisfaction (1-10) in: Physical Health, Mental Health, Relationships, Career, Spirituality, Recreation'],
    assessmentPrompt: 'Let\'s assess your current wellness across different life domains. Rate each area 1-10 and share what\'s working well or challenging: Physical Health, Mental Health, Relationships, Career/Work, Spirituality/Purpose, Recreation/Fun.'
  },
  {
    id: 'current-state-audit',
    name: 'Current State Audit',
    description: 'Honest assessment of where you are now',
    questions: ['What habits support your wellbeing?', 'What habits undermine your goals?', 'What patterns do you notice?'],
    assessmentPrompt: 'Let\'s take an honest look at your current habits and patterns. What daily/weekly habits support your wellbeing? What habits might be holding you back? What patterns do you notice in your behavior?'
  },
  {
    id: 'aspirational-vision',
    name: 'Aspirational Vision',
    description: 'Creating a compelling future vision',
    questions: ['What would your ideal life look like?', 'How would you feel in this ideal state?', 'What would be different about your daily experience?'],
    assessmentPrompt: 'Imagine your ideal life 1 year from now. What would it look like? How would you feel day-to-day? What would be different about your relationships, work, health, and overall experience?'
  },
  {
    id: 'gap-analysis',
    name: 'Gap Analysis',
    description: 'Identifying the bridge between current and desired state',
    questions: ['What\'s the biggest gap between where you are and where you want to be?', 'What obstacles do you anticipate?'],
    assessmentPrompt: 'Looking at where you are now versus your ideal vision, what are the main gaps? What would need to change? What obstacles or challenges do you anticipate?'
  },
  {
    id: 'motivation-mapping',
    name: 'Motivation Mapping',
    description: 'Understanding your deepest drivers for change',
    questions: ['Why is this change important to you?', 'What will happen if you don\'t make changes?', 'What will happen if you do?'],
    assessmentPrompt: 'Let\'s explore your motivation. Why is creating these changes important to you? What might happen if you continue on your current path? What could happen if you make the changes you want?'
  }
]

// Mental Models for Problem-Solving
interface MentalModel {
  id: string
  name: string
  description: string
  application: string
  questions: string[]
}

const MENTAL_MODELS: MentalModel[] = [
  {
    id: 'first-principles',
    name: 'First Principles Thinking',
    description: 'Break down complex problems to fundamental truths',
    application: 'Strip away assumptions and build understanding from the ground up',
    questions: ['What do we know to be absolutely true about this situation?', 'What assumptions am I making?', 'If I had to explain this to someone with no context, what are the basic facts?']
  },
  {
    id: 'inversion',
    name: 'Inversion',
    description: 'Think backwards from the desired outcome',
    application: 'Consider what you want to avoid, then work backwards',
    questions: ['What would failure look like in this situation?', 'What should I absolutely avoid doing?', 'If I wanted the opposite outcome, what would I do?']
  },
  {
    id: 'occams-razor',
    name: 'Occam\'s Razor',
    description: 'The simplest explanation is usually correct',
    application: 'Look for the most straightforward solution first',
    questions: ['What\'s the simplest explanation for this problem?', 'Am I overcomplicating this?', 'What would the most direct solution be?']
  },
  {
    id: 'circle-of-control',
    name: 'Circle of Control',
    description: 'Focus energy on what you can actually influence',
    application: 'Separate controllable factors from uncontrollable ones',
    questions: ['What aspects of this situation can I directly control?', 'What is completely outside my influence?', 'Where should I focus my energy?']
  },
  {
    id: 'second-order-thinking',
    name: 'Second-Order Thinking',
    description: 'Consider the consequences of consequences',
    application: 'Think beyond immediate effects to long-term implications',
    questions: ['If I do X, what happens next?', 'And then what happens after that?', 'What are the unintended consequences?']
  }
]

// Generate IVOR response function
async function generateIVORResponse(message: string, userContext?: any): Promise<string> {
  const lowerMessage = message.toLowerCase()
  const sessionId = userContext?.session_id || 'default'
  
  // Get or create user session
  let session = userSessions.get(sessionId)
  if (!session) {
    session = {
      id: sessionId,
      progress: {},
      startedAt: new Date(),
      lastActivity: new Date()
    }
    userSessions.set(sessionId, session)
  }
  session.lastActivity = new Date()
  
  // Check if user is in an active service session
  if (session.currentService) {
    return await handleServiceConversation(message, session)
  }
  
  // Service selection logic (check for specific resource requests first)
  if (lowerMessage.includes('health advice') || lowerMessage.includes('health guidance') || 
      lowerMessage.includes('sexual health') || lowerMessage.includes('physical health') || 
      lowerMessage.includes('healthcare')) {
    session.currentService = 'health-advice'
    session.currentStep = 'introduction'
    return generateHealthTopicsMenu()
  }
  
  if (lowerMessage.includes('wellness') || lowerMessage.includes('habit')) {
    session.currentService = 'wellness-coaching'
    session.currentStep = 'introduction'
    session.progress = { completedSections: [], currentSection: 'persona-snapshot' }
    return startWellnessCoaching()
  }
  
  if (lowerMessage.includes('problem') || lowerMessage.includes('challenge') || lowerMessage.includes('stuck') || lowerMessage.includes('solve')) {
    session.currentService = 'problem-solving'
    session.currentStep = 'introduction'
    return startProblemSolving()
  }
  
  if (lowerMessage.includes('journal') || lowerMessage.includes('writing') || lowerMessage.includes('reflection') || lowerMessage.includes('ritual')) {
    session.currentService = 'transformational-journaling'
    session.currentStep = 'time-identification'
    session.progress = { journalEntries: {}, currentRitual: null }
    return startTransformationalJournaling()
  }
  
  // Check if user is requesting a specific service
  if (lowerMessage.includes('service') || lowerMessage.includes('help with') || lowerMessage.includes('coaching')) {
    return generateServiceSelectionResponse()
  }
  
  // Legacy community resource responses (now part of service framework)
  if (lowerMessage.includes('mental health') || lowerMessage.includes('therapy') || lowerMessage.includes('counseling')) {
    const resources = await knowledgeService.getResourcesByCategory('Mental Health')
    return knowledgeService.formatResourcesForResponse(resources, 'Mental health support is crucial for our wellbeing. Here are specialized resources for LGBTQ+ community:')
  }
  
  if (lowerMessage.includes('housing') || lowerMessage.includes('accommodation') || lowerMessage.includes('homeless')) {
    const resources = await knowledgeService.getResourcesByCategory('Housing')
    return knowledgeService.formatResourcesForResponse(resources, 'Housing security is fundamental to wellbeing. Here are LGBTQ+ friendly housing resources:')
  }
  
  if (lowerMessage.includes('legal') || lowerMessage.includes('discrimination') || lowerMessage.includes('rights')) {
    const resources = await knowledgeService.getResourcesByCategory('Legal Aid')
    return knowledgeService.formatResourcesForResponse(resources, 'I can connect you with legal support that understands intersectional discrimination:')
  }
  
  if (lowerMessage.includes('crisis') || lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
    const resources = await knowledgeService.getCrisisResources()
    return knowledgeService.formatResourcesForResponse(resources, '🚨 **IMMEDIATE SUPPORT AVAILABLE** - You are not alone and help is available right now:')
  }
  
  // General resource search
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('resource')) {
    const resources = await knowledgeService.searchResources(message, 3)
    if (resources.length > 0) {
      return knowledgeService.formatResourcesForResponse(resources, 'I found some resources that might help:')
    }
  }
  
  if (lowerMessage.includes('community') || lowerMessage.includes('events') || lowerMessage.includes('meetup')) {
    return `Connecting with community is powerful! Here are spaces for Black queer men:

• **BLKOUT Community Events** - Check blkout.uk/events
• **UK Black Pride** - Annual celebration + year-round events
• **House of Ghetto** - Community gatherings and support
• **QTIPOC meetups** - Manchester, Birmingham, Leeds, London
• **Black Gay Men's Advisory Group** - London-based support

**Upcoming:**
- BLKOUT Healing Circles - Weekly Thursdays 7pm
- Pride events across UK cities
- Community skill-shares and workshops

Which city are you in? I can help you find local QTIPOC spaces and events.`
  }
  
  if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
    return `Career advancement is key to liberation. Here are supportive resources:

• **Stonewall Workplace Programmes** - LGBTQ+ career support
• **Black Professionals Network** - Career development
• **Diversity Role Models** - Workplace inclusion training  
• **Out & Equal** - LGBTQ+ workplace advocacy
• **BLKOUT Cooperative Development** - Alternative economic models

**Immediate support:**
- CV reviews and interview prep
- Workplace discrimination guidance  
- Networking opportunities
- Cooperative business development

Are you job searching, dealing with workplace issues, or exploring cooperative alternatives?`
  }

  if (lowerMessage.includes('crisis') || lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
    return `**IMMEDIATE SUPPORT AVAILABLE:**

**Crisis Lines:**
• Samaritans: 116 123 (free, 24/7)  
• LGBT Switchboard: 0300 330 0630
• Crisis Text Line: Text SHOUT to 85258

**Emergency Services:**
• Police: 999 (mention LGBTQ+ liaison if needed)
• NHS: 111 for urgent medical needs
• Local A&E for immediate mental health crisis

**Safe Spaces:**
• The Outside Project (London): 0207 923 0420
• Local LGBTQ+ centers often provide crisis support

You don't have to face this alone. Would you like me to help you find specific support in your area right now?`
  }

  // Check for session reset commands
  if (lowerMessage.includes('main menu') || lowerMessage.includes('services') || lowerMessage.includes('start over')) {
    // Reset session
    session.currentService = undefined
    session.currentStep = undefined
    session.progress = {}
    return generateServiceSelectionResponse()
  }
  
  // Default response - offer service selection
  return generateWelcomeResponse()
}

// Service Framework Functions
function generateServiceSelectionResponse(): string {
  return `😎 **HEY BEAUTIFUL! I'M I.V.O.R.** 🌈

Your Intelligent Virtual Organizing Resource, here to support your Black queer liberation journey with both immediate help and deep coaching. Think of me as your AI bestie who actually knows what they're talking about! 😂

**🚨 NEED QUICK HELP? I'VE GOT YOU:**
• **MENTAL HEALTH** - Therapy, crisis support, culturally competent resources
• **HOUSING** - Emergency accommodation, LGBTQ+ friendly options
• **LEGAL SUPPORT** - Discrimination help, know your rights
• **COMMUNITY** - Events, connections, chosen family vibes
• **CRISIS SUPPORT** - 24/7 helplines, immediate safety

**💎 READY FOR DEEP COACHING? CHOOSE YOUR ADVENTURE:**

🌱 **WELLNESS & HABIT COACHING** - 15-section personalized wellness plan (yes, it's comprehensive!)
🧩 **STRATEGIC PROBLEM SOLVING** - Mental model frameworks for when life gets complicated
📖 **TRANSFORMATIONAL JOURNALING** - Daily rituals that actually transform your mindset
💕 **RELATIONSHIP COACHING** - Dating, friendships, and navigating social connections
🚀 **CAREER GUIDANCE** - Professional development that honors your authentic self
🏥 **HEALTH & WELLBEING ADVICE** - Comprehensive health guidance for Black queer men
🎭 **DAILY JOY & WELLNESS** - Humor, entertainment, and mental health boosts

**🌟 JOIN THE BLKOUT COMMUNITY:**
Check out [BLKOUT Events](https://blkout.uk/events) and [BLKOUTHUB](https://blkouthub.com) for community connections!

**EXAMPLES:** *"I need therapy resources"* | *"Wellness coaching please"* | *"Help with housing"* | *"Start journaling"* | *"I need some joy in my life"*

Whether you need immediate resources or want to dive deep into personal development, I'm here to support your liberation journey. What would be most helpful? 😊`
}

function generateWelcomeResponse(): string {
  return `🌟 **WELCOME TO I.V.O.R., GORGEOUS!** 🌟

I'm your Intelligent Virtual Organizing Resource, specifically designed to support Black queer liberation and empowerment. Think of me as your pocket-sized liberation coach who's always ready to help! 💪🏿

**🚀 I CAN HELP YOU IN TWO WAYS:**

**🎆 QUICK RESOURCE SUPPORT** - When you need help NOW:
• Mental health, therapy, crisis support
• Housing, emergency accommodation
• Legal help, discrimination issues  
• Community events, chosen family connections
• Emergency support, safety resources

**📚 COMPREHENSIVE LIFE COACHING** - When you're ready to level up:
🌱 **WELLNESS & HABIT COACHING** - 15-section personalized wellness plan
🧩 **STRATEGIC PROBLEM SOLVING** - Mental model frameworks for life's puzzles
📖 **TRANSFORMATIONAL JOURNALING** - Daily rituals that actually work
💕 **RELATIONSHIP COACHING** - Dating, friendships, and social navigation
🚀 **CAREER GUIDANCE** - Professional development with authenticity
🏥 **HEALTH & WELLBEING ADVICE** - Complete health guidance for our community
🎭 **DAILY JOY & WELLNESS** - Because laughter is medicine too!

**🌈 CONNECT WITH BLKOUT COMMUNITY:**
Explore [BLKOUT Events](https://blkout.uk/events), [BLKOUTHUB](https://blkouthub.com), and our [Newsletter](https://blkout.uk/newsletter)

Your liberation and wellbeing matter deeply. What kind of support would feel most helpful right now? 😊💖`
}

// Service conversation handlers
async function handleServiceConversation(message: string, session: UserSession): Promise<string> {
  if (session.currentService === 'wellness-coaching') {
    const result = await handleWellnessCoaching(message, session)
    if (result === 'navigate-to-main-menu') {
      session.currentService = undefined
      session.currentStep = undefined
      session.progress = {}
      return generateServiceSelectionResponse()
    }
    return result
  }
  
  if (session.currentService === 'problem-solving') {
    const result = await handleProblemSolving(message, session)
    if (result === 'navigate-to-main-menu') {
      session.currentService = undefined
      session.currentStep = undefined
      session.progress = {}
      return generateServiceSelectionResponse()
    }
    return result
  }
  
  if (session.currentService === 'transformational-journaling') {
    const result = await handleTransformationalJournaling(message, session)
    if (result === 'navigate-to-main-menu') {
      session.currentService = undefined
      session.currentStep = undefined
      session.progress = {}
      return generateServiceSelectionResponse()
    }
    return result
  }

  if (session.currentService === 'health-advice') {
    const result = await handleHealthAdvice(message, session)
    if (result === 'navigate-to-main-menu') {
      session.currentService = undefined
      session.currentStep = undefined
      session.progress = {}
      return generateServiceSelectionResponse()
    }
    return result
  }
  
  // Default to community resources
  return handleCommunityResources(message, session)
}

// Wellness Coaching Service Implementation
function startWellnessCoaching(): string {
  return `🌱 **Welcome to Wellness & Habit Coaching**

I'm excited to guide you through a comprehensive wellness assessment and planning process. This will help us create a personalized plan for sustainable habit change and holistic wellbeing.

**What we'll explore together:**
✨ Personal snapshot and values
🎯 Wellness domains assessment  
🔍 Current state audit
🌟 Aspirational vision creation
📊 Gap analysis
💪 Motivation mapping

This is a journey of self-discovery that honors your unique experience as a Black queer man. We'll take it step by step, and you can pause or revisit any section.

**Let's begin with your Personal Snapshot:**

${WELLNESS_SECTIONS[0].assessmentPrompt}

Take your time - there are no wrong answers, only your authentic truth.`
}

async function handleWellnessCoaching(message: string, session: UserSession): Promise<string> {
  const lowerMessage = message.toLowerCase()
  
  // Check for navigation commands first
  if (lowerMessage.includes('main menu') || lowerMessage.includes('services') || lowerMessage.includes('start over')) {
    return 'navigate-to-main-menu' // This will be handled by the main function
  }
  
  const currentSectionId = session.progress.currentSection
  const currentSection = WELLNESS_SECTIONS.find(s => s.id === currentSectionId)
  
  if (!currentSection) {
    return generateWellnessSummary(session)
  }
  
  // Store the user's response
  if (!session.progress.responses) {
    session.progress.responses = {}
  }
  session.progress.responses[currentSectionId] = message
  
  // Mark current section as completed
  if (!session.progress.completedSections.includes(currentSectionId)) {
    session.progress.completedSections.push(currentSectionId)
  }
  
  // Move to next section
  const currentIndex = WELLNESS_SECTIONS.findIndex(s => s.id === currentSectionId)
  if (currentIndex < WELLNESS_SECTIONS.length - 1) {
    const nextSection = WELLNESS_SECTIONS[currentIndex + 1]
    session.progress.currentSection = nextSection.id
    
    return `✅ **${currentSection.name} Complete**

Thank you for sharing that insight. You're building a strong foundation for your wellness journey.

---

🎯 **Next: ${nextSection.name}**
*${nextSection.description}*

${nextSection.assessmentPrompt}

**Progress:** ${session.progress.completedSections.length}/${WELLNESS_SECTIONS.length} sections completed`
  }
  
  // All sections completed
  return generateWellnessSummary(session)
}

function generateWellnessSummary(session: UserSession): string {
  return `🎉 **Wellness Assessment Complete!**

Congratulations! You've completed all six sections of your wellness assessment. This is a significant step toward creating positive change in your life.

**Your Wellness Journey Summary:**
✨ Personal values and identity explored
🎯 Wellness domains assessed across key life areas
🔍 Current habits and patterns identified
🌟 Aspirational vision created
📊 Gaps and obstacles mapped
💪 Core motivations clarified

**Next Steps:**
Based on your responses, I can help you:
• Create specific, actionable habit goals
• Develop implementation strategies
• Design accountability systems
• Connect you with relevant community resources

Would you like me to analyze your responses and suggest priority areas for habit development? Or would you prefer to explore another service?

*Type "analyze my wellness assessment" to get personalized recommendations, or "main menu" to see all services.*`
}

// Problem-Solving Service Implementation
function startProblemSolving(): string {
  return `🧩 **Strategic Problem Solving**

I'll help you tackle complex challenges using proven mental models and frameworks. This approach will give you tools to think more clearly and find effective solutions.

**Available Mental Models:**
🎯 **First Principles** - Break problems down to fundamental truths
↩️ **Inversion** - Work backwards from desired outcomes
⚡ **Occam's Razor** - Find the simplest, most likely solutions
🎪 **Circle of Control** - Focus energy where you have influence
🔮 **Second-Order Thinking** - Consider long-term consequences

**To get started:**
1. Briefly describe the problem or challenge you're facing
2. I'll help you select the most relevant mental model(s)
3. We'll work through the framework together

What challenge would you like to work on? Share as much or as little detail as you're comfortable with.`
}

async function handleProblemSolving(message: string, session: UserSession): Promise<string> {
  const lowerMessage = message.toLowerCase()
  
  // Check for navigation commands first
  if (lowerMessage.includes('main menu') || lowerMessage.includes('services') || lowerMessage.includes('start over')) {
    return 'navigate-to-main-menu' // This will be handled by the main function
  }
  
  if (!session.progress.problemDescription) {
    // First interaction - capture the problem
    session.progress.problemDescription = message
    return selectMentalModel(message)
  }
  
  // Handle mental model selection or application
  
  // Check if user is selecting a specific mental model
  const selectedModel = MENTAL_MODELS.find(model => 
    lowerMessage.includes(model.id.replace('-', ' ')) || 
    lowerMessage.includes(model.name.toLowerCase())
  )
  
  if (selectedModel) {
    session.progress.selectedModel = selectedModel.id
    return applyMentalModel(selectedModel, session.progress.problemDescription)
  }
  
  // If no model selected, auto-select based on problem type
  return autoSelectMentalModel(message, session.progress.problemDescription)
}

function selectMentalModel(problemDescription: string): string {
  const problem = problemDescription.toLowerCase()
  
  let recommendations = []
  
  if (problem.includes('complex') || problem.includes('complicated') || problem.includes('overwhelm')) {
    recommendations.push('**First Principles** - Break this down to basic components')
  }
  
  if (problem.includes('goal') || problem.includes('outcome') || problem.includes('result')) {
    recommendations.push('**Inversion** - Work backwards from your desired outcome')
  }
  
  if (problem.includes('choice') || problem.includes('option') || problem.includes('decision')) {
    recommendations.push('**Occam\'s Razor** - Find the simplest solution')
  }
  
  if (problem.includes('stress') || problem.includes('worry') || problem.includes('control')) {
    recommendations.push('**Circle of Control** - Focus on what you can influence')
  }
  
  if (problem.includes('consequence') || problem.includes('impact') || problem.includes('future')) {
    recommendations.push('**Second-Order Thinking** - Consider long-term effects')
  }
  
  const modelList = MENTAL_MODELS.map(model => 
    `🎯 **${model.name}** - ${model.description}`
  ).join('\n')
  
  return `**Problem Captured:** "${problemDescription.substring(0, 100)}${problemDescription.length > 100 ? '...' : ''}"

**Recommended Mental Models:**
${recommendations.length > 0 ? recommendations.join('\n') : 'All models could be helpful for this challenge.'}

**All Available Models:**
${modelList}

Which mental model resonates with you? Just tell me the name (e.g., "First Principles" or "Circle of Control").`
}

function applyMentalModel(model: MentalModel, problemDescription: string): string {
  return `🎯 **Applying ${model.name}**

**Your Challenge:** "${problemDescription.substring(0, 150)}${problemDescription.length > 150 ? '...' : ''}"

**${model.name} Framework:**
*${model.application}*

**Let's work through this step by step:**

${model.questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}

Take your time with each question. Answer them one by one, and I'll help you synthesize the insights into actionable next steps.

Start with question 1: **${model.questions[0]}**`
}

function autoSelectMentalModel(userResponse: string, problemDescription: string): string {
  // Default to First Principles for complex problems
  const firstPrinciples = MENTAL_MODELS.find(m => m.id === 'first-principles')!
  return applyMentalModel(firstPrinciples, problemDescription)
}

// Transformational Journaling Service Implementation
function startTransformationalJournaling(): string {
  return `📖 **Welcome to Transformational Journaling**

I'm your guide for daily transformational journaling rituals designed to rewire thought patterns and propel you toward your highest potential. This isn't just writing - it's intentional daily evolution through structured morning and evening practices.

**What makes this transformational:**
🌅 **Morning Rituals** - Vision setting, resistance reframing, affirmations, gratitude, outcome visualization
🌙 **Evening Rituals** - Wins celebration, lesson extraction, growth recognition, tomorrow's planning
🔄 **Daily Integration** - Each session builds on the last, creating compound growth

**To begin, I need to know:**
Are you starting a **morning ritual** or an **evening ritual**?

*This matters because each ritual has different focuses and energy. Morning rituals prime your day with intention, while evening rituals process and prepare for tomorrow.*

Just say "morning" or "evening" to begin your transformational journey.`
}

async function handleTransformationalJournaling(message: string, session: UserSession): Promise<string> {
  const lowerMessage = message.toLowerCase()
  
  // Check for navigation commands first
  if (lowerMessage.includes('main menu') || lowerMessage.includes('services') || lowerMessage.includes('start over')) {
    return 'navigate-to-main-menu'
  }
  
  // Time identification step
  if (session.currentStep === 'time-identification' || !session.progress.currentRitual) {
    if (lowerMessage.includes('morning')) {
      session.progress.currentRitual = 'morning'
      session.progress.morningStep = 'breathwork'
      return startMorningRitual()
    } else if (lowerMessage.includes('evening')) {
      session.progress.currentRitual = 'evening'
      session.progress.eveningStep = 'wins'
      return startEveningRitual()
    } else {
      return `I need to know if you're starting a **morning** or **evening** journaling ritual. 

🌅 **Morning** - Set intentions, vision, and mindset for the day ahead
🌙 **Evening** - Reflect on wins, lessons, and prepare for tomorrow

Which ritual would you like to begin?`
    }
  }
  
  // Handle morning ritual progression
  if (session.progress.currentRitual === 'morning') {
    return await handleMorningRitual(message, session)
  }
  
  // Handle evening ritual progression
  if (session.progress.currentRitual === 'evening') {
    return await handleEveningRitual(message, session)
  }
  
  return startTransformationalJournaling()
}

// Morning Ritual Implementation
function startMorningRitual(): string {
  return `🌅 **Morning Transformational Ritual**

Let's begin with grounding and intention. This ritual will prime your mindset and energy for an intentional, powerful day.

**Step 1: Breathwork & Grounding**

Take a moment to breathe deeply. I want you to take 3 slow, intentional breaths:
- Inhale for 4 counts
- Hold for 4 counts  
- Exhale for 6 counts

Once you've done this, simply type "ready" and we'll move to setting your vision for the day.

*This isn't rushed - take the time you need to center yourself.*`
}

async function handleMorningRitual(message: string, session: UserSession): Promise<string> {
  const lowerMessage = message.toLowerCase()
  const currentStep = session.progress.morningStep
  
  if (!session.progress.morningEntries) {
    session.progress.morningEntries = {}
  }
  
  switch (currentStep) {
    case 'breathwork':
      if (lowerMessage.includes('ready')) {
        session.progress.morningStep = 'vision'
        return `✨ **Vision of the Day**

What is the ONE priority today that will truly move the needle in your life? 

This isn't about a long to-do list. I want you to identify the single most important thing that, if accomplished, would make you feel proud and aligned with your growth.

*Example: "Complete the first draft of my business proposal because it moves me closer to financial independence" or "Have an honest conversation with my partner about our future because authentic communication strengthens our relationship."*

What's your needle-moving priority for today?`
      } else {
        return `Take your time with the breathwork. When you've completed 3 intentional breaths (inhale 4, hold 4, exhale 6), type "ready" to continue.

Remember: This ritual is about depth over speed. Let yourself truly center before we proceed.`
      }
      
    case 'vision':
      session.progress.morningEntries.vision = message
      session.progress.morningStep = 'reframe'
      return `🎯 **Reframe Resistance**

Now that you've identified your priority, let's address what might get in the way.

What's one barrier, fear, or resistance you anticipate facing today as you work toward that priority?

Once you share that, I'll help you reframe it as an opportunity for growth.

*Example: "I'm afraid people will judge my business idea" or "I tend to avoid difficult conversations" or "I get distracted by social media when I need to focus."*

What resistance or barrier do you anticipate?`
      
    case 'reframe':
      const barrier = message
      session.progress.morningEntries.barrier = barrier
      session.progress.morningStep = 'affirmations'
      return `💪 **Reframed as Opportunity**

*Your barrier:* "${barrier}"

**Reframe:** This barrier is actually an invitation to strengthen a crucial skill. Every time you face this resistance and move through it, you're building the exact capability you need for your liberation and growth.

**Now, create 2-3 mission-anchored affirmations** that speak to your authentic power and the person you're becoming.

*These should feel true and inspiring, not fake or forced. Examples:*
- "I trust my voice and my vision deserves to be heard"
- "I choose courage over comfort in service of my growth"
- "My authentic self is my greatest strength"

What are your 2-3 affirmations for today?`
      
    case 'affirmations':
      session.progress.morningEntries.affirmations = message
      session.progress.morningStep = 'gratitude'
      return `🙏 **Gratitude with Purpose**

Share 2-3 specific things you're grateful for today AND explain why they matter to your growth or wellbeing.

*This isn't generic gratitude - I want you to connect each thing to its deeper significance in your life.*

*Examples:*
- "I'm grateful for my morning coffee because those quiet moments help me connect with my intentions before the day takes over"
- "I'm grateful for my friend Marcus because his encouragement reminds me I'm not alone in pursuing my dreams"

What are you specifically grateful for today and why do they matter?`
      
    case 'gratitude':
      session.progress.morningEntries.gratitude = message
      session.progress.morningStep = 'visualization'
      return `🌟 **Visualize Success**

Now, paint a vivid picture of how it looks and feels when you successfully complete your priority today.

Be specific about:
- What you'll see
- How you'll feel in your body
- What thoughts will be running through your mind
- How this success connects to your larger vision

*Example: "I see myself hitting 'send' on the business proposal. I feel confident and proud in my chest. I'm thinking 'I did it - I took the scary step.' This success proves I can turn my ideas into action, which is exactly what I need for the financial freedom I'm building toward."*

Describe your success in vivid detail:`
      
    case 'visualization':
      session.progress.morningEntries.visualization = message
      return generateMorningSummary(session)
      
    default:
      return startMorningRitual()
  }
}

// Evening Ritual Implementation  
function startEveningRitual(): string {
  return `🌙 **Evening Transformational Ritual**

Time to honor your day, extract wisdom, and set yourself up for tomorrow's success. This ritual transforms daily experiences into lasting growth.

**Step 1: Celebrate Your Wins**

Let's start by acknowledging your victories - big and small. Every step forward matters.

**What were your top 3 wins today?**

These can be:
- Tasks completed
- Conversations handled well
- Moments of growth or courage
- Small habits maintained
- Challenges faced head-on

*Remember: Progress, not perfection. Even "I got out of bed despite feeling low" counts as a win.*

What are your 3 wins from today?`
}

async function handleEveningRitual(message: string, session: UserSession): Promise<string> {
  const currentStep = session.progress.eveningStep
  
  if (!session.progress.eveningEntries) {
    session.progress.eveningEntries = {}
  }
  
  switch (currentStep) {
    case 'wins':
      session.progress.eveningEntries.wins = message
      session.progress.eveningStep = 'lesson'
      return `🎓 **Extract the Lesson**

Now, think about a challenge or setback you faced today. This isn't about dwelling on what went wrong - it's about mining wisdom from the experience.

**Describe one setback or challenge from today, and what lesson you can extract from it.**

*Examples:*
- "I procrastinated on my important project → Lesson: I need to break big tasks into smaller, less overwhelming pieces"
- "I got triggered during a difficult conversation → Lesson: I react defensively when I feel misunderstood, so I need to pause and breathe before responding"

What challenge did you face and what can you learn from it?`
      
    case 'lesson':
      session.progress.eveningEntries.lesson = message
      session.progress.eveningStep = 'growth'
      return `🌱 **Recognize Your Growth**

Today, you strengthened something important about yourself. 

**What skill, mindset, or emotional capacity did you develop or strengthen today?**

This might be:
- A skill you practiced (communication, focus, creativity)
- A mindset you shifted (from fear to curiosity, from scarcity to abundance)
- An emotional muscle you flexed (patience, courage, self-compassion)

*Even facing discomfort builds your resilience muscle. Even asking for help builds your vulnerability strength.*

What did you strengthen about yourself today?`
      
    case 'growth':
      session.progress.eveningEntries.growth = message
      session.progress.eveningStep = 'tomorrow-impact'
      return `🎯 **Tomorrow's Big Three: Impact Task**

Now let's design tomorrow for success. We'll identify three key tasks using a strategic framework.

**First: Your IMPACT task**
What's the one task tomorrow that, if completed, would create the biggest positive impact on your goals or wellbeing? This should be meaningful, not just urgent.

*Think about what would make you feel proud and aligned with your bigger vision.*

What's your highest-impact task for tomorrow?`
      
    case 'tomorrow-impact':
      session.progress.eveningEntries.impactTask = message
      session.progress.eveningStep = 'tomorrow-leverage'
      return `⚡ **Tomorrow's Big Three: Leverage Task**

**Second: Your LEVERAGE task**
What task could you do tomorrow that would make other things easier or more efficient? This is about working smarter, not harder.

*Examples: Setting up systems, having conversations that prevent future problems, doing prep work that saves time later.*

What's your leverage task for tomorrow?`
      
    case 'tomorrow-leverage':
      session.progress.eveningEntries.leverageTask = message
      session.progress.eveningStep = 'tomorrow-reality'
      return `✅ **Tomorrow's Big Three: Reality Check Task**

**Third: Your REALITY CHECK task**
What's one essential task that simply needs to get done? This might not be exciting, but it's necessary and achievable.

*This ensures you have momentum and feel productive, even if the bigger tasks get disrupted.*

What's your reality check task for tomorrow?`
      
    case 'tomorrow-reality':
      session.progress.eveningEntries.realityTask = message
      session.progress.eveningStep = 'starter-actions'
      return `🚀 **Starter Actions**

For each of your Big Three tasks, identify the very first small action you'll take to get started:

**Impact Task:** "${session.progress.eveningEntries.impactTask}"
*First action:*

**Leverage Task:** "${session.progress.eveningEntries.leverageTask}"  
*First action:*

**Reality Task:** "${session.progress.eveningEntries.realityTask}"
*First action:*

*Keep these actions small and specific. "Open the document" instead of "work on project." "Text Sarah to schedule the call" instead of "have important conversation."*

List your three starter actions:`
      
    case 'starter-actions':
      session.progress.eveningEntries.starterActions = message
      return generateEveningSummary(session)
      
    default:
      return startEveningRitual()
  }
}

function generateMorningSummary(session: UserSession): string {
  const entries = session.progress.morningEntries
  
  return `🌅 **Morning Ritual Complete!**

You've set powerful intentions for your day. Here's your transformational blueprint:

**📍 Your Vision:** ${entries.vision}

**💪 Barrier Reframed:** Your challenges are growth opportunities

**✨ Your Affirmations:** ${entries.affirmations}

**🙏 Gratitude Foundation:** ${entries.gratitude}

**🎯 Success Visualization:** ${entries.visualization}

**Your mindset is primed for an intentional, powerful day.** Carry these intentions with you, and remember: you've already done the inner work to succeed.

*This evening, return for your Evening Ritual to process today's growth and prepare for tomorrow.*

**Ready to make today meaningful? Your transformation starts now.** 

Type "main menu" anytime to explore other I.V.O.R. services.`
}

function generateEveningSummary(session: UserSession): string {
  const entries = session.progress.eveningEntries
  
  return `🌙 **Evening Ritual Complete!**

You've transformed today's experiences into wisdom and set yourself up for tomorrow's success.

**🏆 Today's Wins:** ${entries.wins}

**🎓 Lesson Learned:** ${entries.lesson}

**🌱 Growth Achieved:** ${entries.growth}

**🎯 Tomorrow's Big Three:**
• **Impact:** ${entries.impactTask}
• **Leverage:** ${entries.leverageTask}  
• **Reality:** ${entries.realityTask}

**🚀 Your Starter Actions:** ${entries.starterActions}

**You've honored today's journey and intentionally designed tomorrow.** This is how daily transformation compounds into life-changing growth.

Sleep well knowing you're building the life you want, one intentional day at a time.

*Tomorrow morning, begin with your Morning Ritual to set powerful intentions for another day of growth.*

Type "main menu" to explore other I.V.O.R. services.`
}

// Health & Wellbeing Advice Service Implementation
async function handleHealthAdvice(message: string, session: UserSession): Promise<string> {
  const lowerMessage = message.toLowerCase()
  
  // Check for navigation commands first
  if (lowerMessage.includes('main menu') || lowerMessage.includes('services') || lowerMessage.includes('start over')) {
    return 'navigate-to-main-menu'
  }

  // Identify health topic or provide menu
  if (lowerMessage.includes('mental health') || lowerMessage.includes('depression') || lowerMessage.includes('anxiety')) {
    return generateMentalHealthAdvice()
  }
  
  if (lowerMessage.includes('sexual health') || lowerMessage.includes('sti') || lowerMessage.includes('hiv') || lowerMessage.includes('prep')) {
    return generateSexualHealthAdvice()
  }
  
  if (lowerMessage.includes('physical health') || lowerMessage.includes('fitness') || lowerMessage.includes('exercise')) {
    return generatePhysicalHealthAdvice()
  }
  
  if (lowerMessage.includes('healthcare') || lowerMessage.includes('doctor') || lowerMessage.includes('gp') || lowerMessage.includes('medical')) {
    return generateHealthcareNavigationAdvice()
  }
  
  if (lowerMessage.includes('substance') || lowerMessage.includes('alcohol') || lowerMessage.includes('drugs') || lowerMessage.includes('chemsex')) {
    return generateSubstanceHealthAdvice()
  }
  
  if (lowerMessage.includes('joy') || lowerMessage.includes('humor') || lowerMessage.includes('entertainment') || lowerMessage.includes('fun') || lowerMessage.includes('laugh')) {
    return generateJoyAndWellnessAdvice()
  }
  
  // Default to health topics menu
  return generateHealthTopicsMenu()
}

function generateHealthTopicsMenu(): string {
  return `🏥 **Health & Wellbeing Guidance**

I'm here to provide evidence-based health advice specifically for Black queer men, incorporating insights from specialized resources and addressing unique community health needs.

**What health topic would you like guidance on?**

🧠 **MENTAL HEALTH** - Depression, anxiety, community-specific mental health support
💊 **SEXUAL HEALTH** - STI prevention, HIV/PrEP information, sexual wellbeing
💪 **PHYSICAL HEALTH** - Fitness, nutrition, preventive care for our community
🏥 **HEALTHCARE NAVIGATION** - Finding LGBT+ friendly providers, advocating for yourself
🍃 **SUBSTANCE & WELLBEING** - Harm reduction, chemsex awareness, healthy relationships with substances
🎭 **DAILY JOY & WELLNESS** - Humor, entertainment, and mental health boosts

Simply tell me which area interests you, or ask a specific health question.

*Remember: This guidance complements but doesn't replace professional medical advice. Always consult healthcare providers for personalized medical care.*

---
*Health information sourced from [MenRUs.co.uk](https://menrus.co.uk) - Supporting Men's Health & Wellbeing*`
}

function generateMentalHealthAdvice(): string {
  return `🧠 **MENTAL HEALTH SUPPORT FOR BLACK QUEER MEN**

**Understanding Our Unique Challenges:**
- Black queer men face higher rates of depression, anxiety, and suicidal ideation
- Intersection of racism, homophobia, and minority stress creates additional mental health pressures
- Community resilience and chosen family are crucial protective factors

**Evidence-Based Strategies:**

**📞 Crisis Support:**
- **Switchboard LGBT+**: 0300 330 0630 (10am-10pm daily)
- **Samaritans**: 116 123 (24/7, free)
- **LGBT National Hotline**: 1-888-843-4564

**🎯 Building Mental Resilience:**
1. **Community Connection** - Prioritize relationships with people who affirm your identity
2. **Identity Affirmation** - Engage with positive Black queer representation and community
3. **Boundaries** - Protect your energy from environments that don't support your wellbeing
4. **Professional Support** - Seek therapists with cultural competence in LGBTQ+ and racial identity

**Finding Mental Health Support:**
- Ask providers directly: "Do you have experience with LGBTQ+ clients?"
- Look for therapists listed with **Pink Therapy** or **BACP LGBT+ division**
- Consider online therapy platforms with LGBTQ+ specialists

**Self-Care Practices:**
- Daily grounding techniques (breathing, meditation, movement)
- Regular connection with affirming community
- Creative expression and joy-centered activities

Would you like specific resources for finding mental health professionals, or guidance on a particular mental health challenge?

---
*Health guidance informed by evidence-based resources including [MenRUs.co.uk](https://menrus.co.uk)*`
}

function generateSexualHealthAdvice(): string {
  return `💊 **SEXUAL HEALTH & WELLBEING**

**Comprehensive Sexual Health for Black Queer Men:**

**🔒 HIV/STI Prevention:**
- **PrEP (Pre-Exposure Prophylaxis)** - Highly effective HIV prevention
- Regular STI testing every 3 months for sexually active individuals
- **Post-Exposure Prophylaxis (PEP)** available within 72 hours of exposure

**🏥 Where to Access Services:**
- **56 Dean Street** (London): Walk-in sexual health clinic
- **CliniQ**: Trans-inclusive sexual health services
- Local GUM (Genitourinary Medicine) clinics - NHS funded

**💬 Sexual Health Conversations:**
- Communicate openly with partners about testing status
- Normalize routine testing as part of health maintenance
- Know your rights to confidential, judgment-free care

**⚠️ Chemsex Awareness:**
Research shows chemsex participants may have:
- More condomless encounters
- Higher HIV rates in some communities
- Need for specialized support services

**🆘 Support Resources:**
- **Antidote** (London): Chemsex support - 020 7833 7606
- **CliniQ**: Trans-inclusive services
- **Terrence Higgins Trust**: Sexual health information and support

**Key Reminders:**
- Regular testing is healthcare, not judgment
- Your sexual health is part of your overall wellbeing
- You deserve respectful, comprehensive care

Need help finding sexual health services in your area, or have specific questions about sexual health and safety?

---
*Sexual health information sourced from [MenRUs.co.uk](https://menrus.co.uk) and specialist LGBTQ+ health resources*`
}

function generatePhysicalHealthAdvice(): string {
  return `💪 **PHYSICAL HEALTH & FITNESS**

**Holistic Physical Wellness for Black Queer Men:**

**🏃‍♂️ Fitness & Movement:**
- Find movement that brings you joy - dancing, walking, sports, gym
- **Community fitness groups** can provide social connection alongside physical health
- LGBTQ+ sports clubs offer affirming environments for physical activity

**🍎 Nutrition Considerations:**
- Access to healthy food can be impacted by economic and geographic factors
- Community gardens and food co-ops may provide affordable fresh options
- Cultural foods can be healthy when prepared mindfully

**⚕️ Preventive Health:**
- Regular check-ups including blood pressure, cholesterol, diabetes screening
- Age-appropriate cancer screenings
- Mental health affects physical health - address both holistically

**🏥 Health Inequalities Awareness:**
Black men face:
- Higher rates of hypertension and diabetes
- Lower life expectancy due to systemic healthcare barriers
- Need for proactive health advocacy

**🤝 Finding Healthcare:**
- Seek providers who understand both racial and LGBTQ+ health disparities
- Ask about cultural competence and LGBTQ+ inclusive care
- Bring trusted friends/chosen family to appointments for support

**💊 Health Advocacy:**
- Research your conditions and treatment options
- Ask questions and seek second opinions when needed
- Document health concerns and track symptoms

**Community Resources:**
- Local LGBTQ+ community centers may offer health programs
- Black men's health initiatives in your area
- Online communities for health accountability and support

Would you like help finding healthcare providers, or guidance on specific physical health concerns?

---
*Physical health guidance informed by [MenRUs.co.uk](https://menrus.co.uk) and culturally competent health resources*`
}

function generateHealthcareNavigationAdvice(): string {
  return `🏥 **NAVIGATING HEALTHCARE AS A BLACK QUEER MAN**

**Finding Affirming Healthcare:**

**🔍 Research Providers:**
- Ask: "Do you have experience with LGBTQ+ patients?"
- Check if practice has non-discrimination policies
- Look for rainbow flags, inclusive forms, gender-neutral restrooms

**📝 Preparing for Appointments:**
- Write down questions beforehand
- Be specific about your identity and health needs
- Bring a trusted friend for support if comfortable

**🗣️ Effective Communication:**
- Be direct about your sexual orientation and gender identity
- Explain any discrimination you've experienced in healthcare
- Advocate for yourself - you deserve respectful care

**🚩 Red Flags to Watch For:**
- Provider seems uncomfortable with LGBTQ+ identity
- Dismissive of concerns or symptoms
- Assumptions about your relationships or lifestyle
- Unwillingness to learn or adapt care

**🔄 When to Find New Care:**
- You don't feel heard or respected
- Provider lacks cultural competence
- Your health concerns aren't being addressed adequately

**📞 Resources for Finding Providers:**
- **Pink Therapy**: LGBTQ+ affirming therapists
- **LGBT Foundation**: Healthcare guidance
- Local LGBTQ+ community centers for provider recommendations

**💰 NHS vs Private Care:**
- NHS provides free healthcare but may have waiting times
- Private options available but consider costs
- Some charities offer sliding scale fees

**🛡️ Know Your Rights:**
- Right to confidential care
- Right to bring support person to appointments
- Right to request different provider if needed

**Emergency Situations:**
- Focus on immediate medical needs
- You can address LGBTQ+ competence issues later
- Bring trusted contact for advocacy if possible

Need help finding specific providers in your area, or have questions about advocating for yourself in medical settings?

---
*Healthcare navigation guidance sourced from [MenRUs.co.uk](https://menrus.co.uk) and LGBTQ+ health advocacy resources*`
}

function generateSubstanceHealthAdvice(): string {
  return `🍃 **SUBSTANCE USE & HARM REDUCTION**

**Understanding Substance Use in Our Community:**

**📊 Community Context:**
- LGBTQ+ individuals have higher rates of substance use
- Often related to minority stress, discrimination, and coping
- Social aspects of community spaces may involve substance use

**🛡️ Harm Reduction Principles:**
- Reducing harm is more important than total abstinence
- Small changes can make big differences in safety
- No judgment - focus on your wellbeing and safety

**🔬 Chemsex Awareness:**
If engaging in chemsex (using drugs during sex):
- Know your substances and their interactions
- Stay hydrated and take breaks
- Have sober friends who know your whereabouts
- Access to clean supplies and testing

**⚠️ Warning Signs:**
- Using alone frequently
- Neglecting responsibilities or relationships
- Physical or mental health declining
- Unable to enjoy activities without substances

**🆘 Getting Support:**
- **Antidote** (London): 020 7833 7606 - Chemsex support
- **Turning Point**: Drug and alcohol services
- **LGBT Foundation**: Community-specific support
- Local drug and alcohol services through your GP

**🏥 Healthcare Integration:**
- Be honest with healthcare providers about substance use
- They can provide medical support and monitoring
- Confidentiality protects you in most situations

**🤝 Building Support:**
- Connect with others in recovery within LGBTQ+ community
- Consider support groups (online or in-person)
- Develop activities and relationships not centered on substance use

**💪 Self-Care During Recovery:**
- Mental health support is crucial during recovery process
- Physical health may need attention and monitoring
- Rebuilding identity and relationships takes time

**🌟 Remember:**
- Recovery looks different for everyone
- Community support accelerates healing
- You deserve health, happiness, and authentic relationships

Need help finding specific substance use services, or support navigating recovery in an LGBTQ+ affirming environment?

---
*Harm reduction information informed by [MenRUs.co.uk](https://menrus.co.uk) and specialist LGBTQ+ substance use resources*`
}

function generateJoyAndWellnessAdvice(): string {
  return `🎭 **DAILY JOY & WELLNESS BOOSTS**

**LAUGHTER IS MEDICINE - ESPECIALLY FOR US! 😂**

**🎉 DAILY JOY PRACTICES:**
• **Meme Therapy**: Follow Black queer content creators who make you laugh
• **Dance Breaks**: Put on your favorite song and move your body (even for 30 seconds!)
• **Affirmation Comedy**: "I'm not just surviving, I'm THRIVING and looking fabulous doing it!"
• **Group Chat Chaos**: Share funny moments with your chosen family

**😂 HUMOR FOR MENTAL HEALTH:**
Research shows laughter:
• Reduces cortisol (stress hormone) levels
• Releases endorphins (natural mood boosters)
• Strengthens immune system
• Builds community connections

**🎬 ENTERTAINMENT RECOMMENDATIONS:**
• **Podcasts**: "Food 4 Thot", "The Read", "2 Dope Queens" (archives)
• **Comedy Specials**: Wanda Sykes, Lil Rel Howery, Robin Thede
• **TV Shows**: "Insecure", "Atlanta", "RuPaul's Drag Race UK"
• **TikTok/Instagram**: @joelhoneyb, @theshaderoom (for the chaos)

**🌈 COMMUNITY FUN:**
• **Drag Bingo**: Most cities have queer-friendly venues
• **Comedy Nights**: Look for QTIPOC-centered events
• **Game Nights**: Host virtual or in-person game sessions
• **Karaoke**: Because singing badly with friends is therapeutic

**😎 SELF-CARE THROUGH PLAY:**
• **Adult Coloring Books**: Surprisingly relaxing
• **Video Games**: Escapism can be healthy in moderation
• **Creative Writing**: Write fanfiction, poetry, or random thoughts
• **Photography**: Document beautiful moments in your daily life

**💪 WHEN JOY FEELS HARD:**
Sometimes depression makes joy feel impossible. That's okay!
• Start micro-small: One funny video, one song you like
• Ask friends to send you memes (they love having a mission!)
• Remember: Forcing joy doesn't work, but creating space for it does
• Professional support is available when joy feels consistently distant

**🌟 BLKOUT COMMUNITY JOY:**
Check out [BLKOUT Events](https://blkout.uk/events) for:
• Community celebrations and parties
• Cultural events and performances
• Social gatherings and networking
• Creative workshops and collaborative projects

**🥰 DAILY REMINDER:**
"Your joy is an act of resistance. Your laughter is revolutionary. Your happiness matters - not because you earn it, but because you ARE it."

Need suggestions for specific types of entertainment, or want help incorporating more joy into your daily routine?

---
*Joy and wellness practices informed by positive psychology research and community wisdom*`
}

function handleCommunityResources(message: string, session: UserSession): string {
  return generateCommunityResourceResponse('general')
}

function generateCommunityResourceResponse(resourceType: string): string {
  if (resourceType === 'mental-health') {
    return `**Mental Health & Therapy Resources**

I can connect you with culturally competent mental health support:

• **Mind LGBTQ+** - Free support: 0300 123 3393
• **Switchboard LGBT+** - 24/7 support: 0300 330 0630  
• **Black, African and Asian Therapy Network** - Culturally specific therapy
• **UK Black Pride** - Community support groups
• **The Outside Project** - LGBTIQ+ community support

**Want more comprehensive support?** I also offer wellness coaching that includes mental health as part of a holistic 15-section plan covering all aspects of wellbeing.

**Next steps:** Need help finding specific services in your area? Want to start wellness coaching? Or do you need other resources?`
  }
  
  if (resourceType === 'general') {
    return `**COMMUNITY RESOURCES AVAILABLE**

**🌟 CONNECT WITH THE BLKOUT COMMUNITY:**
• **[BLKOUT EVENTS](https://blkout.uk/events)** - Community gatherings, workshops, and liberation activities
• **[BLKOUT NEWSROOM](https://blkout.uk/newsroom)** - Latest community updates and advocacy news
• **[BLKOUTHUB](https://blkouthub.com)** - Community platform and resources
• **[BLKOUT NEWSLETTER](https://blkout.uk/newsletter)** - Weekly community updates and opportunities

**🛡️ IMMEDIATE SUPPORT RESOURCES:**
🧠 **MENTAL HEALTH** - Culturally competent therapy and crisis support
🏠 **HOUSING** - LGBTQ+ friendly accommodation and emergency help
⚖️ **LEGAL SUPPORT** - Discrimination guidance and civil rights advocacy
🌈 **COMMUNITY** - Local QTIPOC events and support groups
🚨 **CRISIS SUPPORT** - 24/7 helplines and emergency services

**💎 COMPREHENSIVE COACHING PROGRAMS:**
🌱 Wellness & Habit Development | 🧩 Problem-Solving | 💕 Relationships | 🚀 Career

Just tell me what you need - whether it's immediate resources or structured coaching support!`
  }
  
  return generateServiceSelectionResponse()
}

// Get conversation history
app.get('/api/conversation/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabase
      .from('ivor_conversations')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    res.json({ conversation: data || null })
  } catch (error) {
    logger.error('Error fetching conversation', { error })
    res.status(500).json({ error: 'Failed to fetch conversation' })
  }
})

// Get user's conversation list
app.get('/api/conversations', async (req, res) => {
  try {
    const { user_id } = req.query
    
    const { data, error } = await supabase
      .from('ivor_conversations')
      .select('id, updated_at, messages')
      .eq('user_id', user_id || 'anonymous')
      .order('updated_at', { ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    res.json({ conversations: data || [] })
  } catch (error) {
    logger.error('Error fetching conversations', { error })
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

// Admin Weekly Report - Usage analytics and service gaps
app.get('/api/admin/weekly-report', async (req, res) => {
  try {
    const { week, year } = req.query
    const targetWeek = week ? parseInt(week as string) : new Date().getWeek()
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear()
    
    // Generate comprehensive weekly report
    const report = generateWeeklyAdminReport(targetWeek, targetYear)
    
    logger.info('Generated weekly admin report', {
      week: targetWeek,
      year: targetYear,
      totalConversations: report.metrics.totalConversations
    })
    
    res.json({
      report,
      generated: new Date().toISOString(),
      week: targetWeek,
      year: targetYear
    })
  } catch (error) {
    logger.error('Error generating weekly report', { error })
    res.status(500).json({ error: 'Failed to generate weekly report' })
  }
})

// User Monthly Transparency Report - Community usage insights
app.get('/api/transparency/monthly-report', async (req, res) => {
  try {
    const { month, year } = req.query
    const targetMonth = month ? parseInt(month as string) : new Date().getMonth() + 1
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear()
    
    // Generate privacy-preserving transparency report
    const report = generateMonthlyTransparencyReport(targetMonth, targetYear)
    
    logger.info('Generated monthly transparency report', {
      month: targetMonth,
      year: targetYear
    })
    
    res.json({
      report,
      generated: new Date().toISOString(),
      month: targetMonth,
      year: targetYear,
      transparency_note: "This report aggregates anonymous usage data to show how I.V.O.R. serves the BLKOUT community while protecting individual privacy."
    })
  } catch (error) {
    logger.error('Error generating transparency report', { error })
    res.status(500).json({ error: 'Failed to generate transparency report' })
  }
})

// Admin Analytics Dashboard - Real-time patterns
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const analytics = {
      realTimePatterns: Array.from(learningPatterns.values())
        .filter(p => p.confidence > 0.5)
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 20),
      serviceGaps: Array.from(serviceGaps.values())
        .sort((a, b) => {
          const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 }
          return urgencyWeight[b.urgency] - urgencyWeight[a.urgency]
        })
        .slice(0, 10),
      systemHealth: {
        totalConversations: Array.from(conversationMetrics.values())
          .reduce((sum, metrics) => sum + metrics.length, 0),
        averageResponseTime: calculateAverageResponseTime(),
        activePatterns: learningPatterns.size,
        identifiedGaps: serviceGaps.size
      }
    }
    
    res.json(analytics)
  } catch (error) {
    logger.error('Error fetching analytics', { error })
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

// Helper functions for report generation
function generateWeeklyAdminReport(week: number, year: number) {
  const weeklyMetrics = Array.from(conversationMetrics.values())
    .flat()
    .filter(m => m.weekOfYear === week && m.timestamp.getFullYear() === year)
  
  const serviceUsage = weeklyMetrics
    .filter(m => m.serviceUsed)
    .reduce((acc, m) => {
      acc[m.serviceUsed!] = (acc[m.serviceUsed!] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  const topicTrends = weeklyMetrics
    .filter(m => m.topicCategory)
    .reduce((acc, m) => {
      acc[m.topicCategory!] = (acc[m.topicCategory!] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  const performanceMetrics = {
    averageResponseTime: weeklyMetrics
      .filter(m => m.responseTime > 0)
      .reduce((sum, m, _, arr) => sum + m.responseTime / arr.length, 0),
    slowResponses: weeklyMetrics.filter(m => m.responseTime > 3000).length,
    deviceBreakdown: weeklyMetrics
      .reduce((acc, m) => {
        if (m.deviceType) acc[m.deviceType] = (acc[m.deviceType] || 0) + 1
        return acc
      }, {} as Record<string, number>)
  }
  
  return {
    period: `Week ${week}, ${year}`,
    metrics: {
      totalConversations: Math.floor(weeklyMetrics.length / 2), // Divide by 2 (user + assistant messages)
      uniqueUsers: new Set(weeklyMetrics.map(m => m.conversationId)).size,
      serviceUsage,
      topicTrends,
      performanceMetrics
    },
    insights: {
      mostUsedService: Object.entries(serviceUsage).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None',
      emergingTopics: Object.entries(topicTrends).sort(([,a], [,b]) => b - a).slice(0, 3),
      performanceStatus: performanceMetrics.averageResponseTime < 2000 ? 'Good' : 'Needs Attention'
    },
    serviceGaps: Array.from(serviceGaps.values())
      .filter(gap => gap.discovered.getWeek() === week)
      .sort((a, b) => {
        const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 }
        return urgencyWeight[b.urgency] - urgencyWeight[a.urgency]
      }),
    learningPatterns: Array.from(learningPatterns.values())
      .filter(p => p.confidence > 0.3)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10),
    recommendations: generateAdminRecommendations(weeklyMetrics, serviceUsage)
  }
}

function generateMonthlyTransparencyReport(month: number, year: number) {
  const monthlyMetrics = Array.from(conversationMetrics.values())
    .flat()
    .filter(m => m.monthOfYear === month && m.timestamp.getFullYear() === year)
  
  const totalConversations = Math.floor(monthlyMetrics.length / 2)
  const uniqueUsers = new Set(monthlyMetrics.map(m => m.conversationId)).size
  
  const serviceImpact = monthlyMetrics
    .filter(m => m.serviceUsed)
    .reduce((acc, m) => {
      acc[m.serviceUsed!] = (acc[m.serviceUsed!] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  const communityNeeds = monthlyMetrics
    .filter(m => m.topicCategory)
    .reduce((acc, m) => {
      acc[m.topicCategory!] = (acc[m.topicCategory!] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  return {
    period: `${getMonthName(month)} ${year}`,
    community_impact: {
      total_conversations: totalConversations,
      unique_community_members: uniqueUsers,
      services_provided: Object.keys(serviceImpact).length,
      most_needed_support: Object.entries(communityNeeds)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({
          category: formatCategoryName(category),
          usage_percentage: Math.round((count / monthlyMetrics.length) * 100)
        }))
    },
    service_utilization: Object.entries(serviceImpact)
      .sort(([,a], [,b]) => b - a)
      .map(([service, count]) => ({
        service: formatServiceName(service),
        conversations: count,
        percentage: Math.round((count / totalConversations) * 100)
      })),
    community_growth: {
      new_conversations_trend: 'Growing', // Simplified for demo
      repeat_usage: Math.round((uniqueUsers / totalConversations) * 100) + '%',
      service_expansion: Array.from(serviceGaps.values())
        .filter(gap => gap.discovered.getMonth() + 1 === month)
        .map(gap => gap.description)
    },
    transparency_values: {
      data_sovereignty: "All conversation data is processed transparently with community ownership principles",
      privacy_protection: "Individual conversations remain private while aggregate insights support community needs",
      democratic_governance: "Service improvements are guided by community usage patterns and feedback",
      liberation_focus: "All services are designed specifically for Black queer liberation and empowerment"
    }
  }
}

function calculateAverageResponseTime(): number {
  const allMetrics = Array.from(conversationMetrics.values()).flat()
  const responseMetrics = allMetrics.filter(m => m.responseTime > 0)
  
  if (responseMetrics.length === 0) return 0
  
  return responseMetrics.reduce((sum, m) => sum + m.responseTime, 0) / responseMetrics.length
}

function generateAdminRecommendations(metrics: ConversationMetrics[], serviceUsage: Record<string, number>) {
  const recommendations = []
  
  // Performance recommendations
  const avgResponseTime = metrics
    .filter(m => m.responseTime > 0)
    .reduce((sum, m, _, arr) => sum + m.responseTime / arr.length, 0)
  
  if (avgResponseTime > 2500) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      issue: 'Response times above optimal threshold',
      action: 'Consider optimizing response generation or scaling infrastructure'
    })
  }
  
  // Service utilization recommendations
  const totalUsage = Object.values(serviceUsage).reduce((sum, count) => sum + count, 0)
  const underutilizedServices = Object.entries(serviceUsage)
    .filter(([, count]) => count < totalUsage * 0.1)
    .map(([service]) => service)
  
  if (underutilizedServices.length > 0) {
    recommendations.push({
      type: 'service_promotion',
      priority: 'medium',
      issue: `Low usage for: ${underutilizedServices.join(', ')}`,
      action: 'Consider improving service discovery or user education'
    })
  }
  
  return recommendations
}

function formatCategoryName(category: string): string {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function formatServiceName(service: string): string {
  return service.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || 'Unknown'
}

// Email Service Functions
async function sendWeeklyReportEmail() {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('Email not configured - skipping weekly report email')
      return
    }

    const currentDate = new Date()
    const week = currentDate.getWeek()
    const year = currentDate.getFullYear()
    
    // Generate the weekly report
    const report = generateWeeklyAdminReport(week, year)
    
    // Create HTML email template
    const htmlContent = generateWeeklyReportEmailHTML(report, week, year)
    
    const mailOptions = {
      from: `"I.V.O.R. Analytics" <${process.env.SMTP_USER}>`,
      to: 'rob@blkoutuk.com',
      subject: `I.V.O.R. Weekly Report - Week ${week}, ${year}`,
      html: htmlContent,
      attachments: [{
        filename: `ivor-weekly-report-w${week}-${year}.json`,
        content: JSON.stringify(report, null, 2),
        contentType: 'application/json'
      }]
    }

    const result = await transporter.sendMail(mailOptions)
    
    logger.info('Weekly report email sent successfully', {
      messageId: result.messageId,
      week,
      year,
      recipient: 'rob@blkoutuk.com'
    })
    
    return { success: true, messageId: result.messageId }
  } catch (error) {
    logger.error('Failed to send weekly report email:', error)
    return { success: false, error: (error as Error).message }
  }
}

function generateWeeklyReportEmailHTML(report: any, week: number, year: number): string {
  const { metrics, insights, serviceGaps, recommendations } = report
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .logo { font-size: 2.5em; margin-bottom: 10px; }
    .section { background: #f8f9fa; padding: 25px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .metric-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .metric-number { font-size: 2em; font-weight: bold; color: #667eea; }
    .metric-label { color: #666; font-size: 0.9em; }
    .service-list { list-style: none; padding: 0; }
    .service-item { background: white; margin: 10px 0; padding: 15px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; }
    .gap-item { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .rec-item { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .footer { text-align: center; margin-top: 40px; padding: 20px; color: #666; border-top: 1px solid #ddd; }
    .blkout-brand { color: #e83e8c; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🤖 I.V.O.R.</div>
    <h1>Weekly Analytics Report</h1>
    <p>Week ${week}, ${year} • Generated ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="section">
    <h2>📊 Key Metrics</h2>
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-number">${metrics.totalConversations}</div>
        <div class="metric-label">Total Conversations</div>
      </div>
      <div class="metric-card">
        <div class="metric-number">${metrics.uniqueUsers}</div>
        <div class="metric-label">Unique Users</div>
      </div>
      <div class="metric-card">
        <div class="metric-number">${Math.round(metrics.performanceMetrics.averageResponseTime)}ms</div>
        <div class="metric-label">Avg Response Time</div>
      </div>
      <div class="metric-card">
        <div class="metric-number">${Object.keys(metrics.serviceUsage).length}</div>
        <div class="metric-label">Services Used</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>🌟 Service Usage</h2>
    <ul class="service-list">
      ${Object.entries(metrics.serviceUsage).map(([service, count]) => `
        <li class="service-item">
          <span><strong>${formatServiceName(service)}</strong></span>
          <span><strong>${count}</strong> conversations</span>
        </li>
      `).join('')}
    </ul>
    ${Object.keys(metrics.serviceUsage).length === 0 ? '<p><em>No service usage recorded this week.</em></p>' : ''}
  </div>

  <div class="section">
    <h2>📈 Trending Topics</h2>
    <ul class="service-list">
      ${Object.entries(metrics.topicTrends).map(([topic, count]) => `
        <li class="service-item">
          <span><strong>${formatCategoryName(topic)}</strong></span>
          <span><strong>${count}</strong> mentions</span>
        </li>
      `).join('')}
    </ul>
    ${Object.keys(metrics.topicTrends).length === 0 ? '<p><em>No topic trends identified this week.</em></p>' : ''}
  </div>

  <div class="section">
    <h2>💡 Key Insights</h2>
    <p><strong>Most Used Service:</strong> ${insights.mostUsedService}</p>
    <p><strong>Performance Status:</strong> ${insights.performanceStatus}</p>
    <p><strong>Device Breakdown:</strong></p>
    <ul>
      ${Object.entries(metrics.performanceMetrics.deviceBreakdown).map(([device, count]) => `
        <li><strong>${device}:</strong> ${count} sessions</li>
      `).join('')}
    </ul>
  </div>

  ${serviceGaps.length > 0 ? `
  <div class="section">
    <h2>⚠️ Service Gaps Identified</h2>
    ${serviceGaps.map((gap: any) => `
      <div class="gap-item">
        <h4>${gap.description}</h4>
        <p><strong>Urgency:</strong> ${gap.urgency.toUpperCase()}</p>
        <p><strong>Suggested Action:</strong> ${gap.suggestedAction}</p>
        <p><strong>Community Impact:</strong> ${gap.communityImpact}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${recommendations.length > 0 ? `
  <div class="section">
    <h2>🚀 Recommendations</h2>
    ${recommendations.map((rec: any) => `
      <div class="rec-item">
        <h4>${rec.type.replace('_', ' ').toUpperCase()}</h4>
        <p><strong>Issue:</strong> ${rec.issue}</p>
        <p><strong>Recommended Action:</strong> ${rec.action}</p>
        <p><strong>Priority:</strong> ${rec.priority.toUpperCase()}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <p>This report is generated automatically by I.V.O.R.'s analytics system</p>
    <p>Part of the <span class="blkout-brand">BLKOUT</span> community platform for Black queer liberation</p>
    <p><em>View detailed analytics at: <a href="https://backend-k88mhf7ea-robs-projects-54d653d3.vercel.app/api/admin/analytics">Admin Dashboard</a></em></p>
  </div>
</body>
</html>
  `
}

// Manual email endpoint for testing
app.post('/api/admin/send-weekly-report', async (req, res) => {
  try {
    const result = await sendWeeklyReportEmail()
    
    if (result && result.success) {
      res.json({
        success: true,
        message: 'Weekly report email sent successfully',
        messageId: result.messageId
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result ? result.error : 'Unknown error'
      })
    }
  } catch (error) {
    logger.error('Error in manual email send:', error)
    res.status(500).json({ error: 'Failed to send weekly report email' })
  }
})

// Schedule weekly email reports
// Runs every Monday at 9:00 AM UTC
cron.schedule('0 9 * * 1', async () => {
  logger.info('Starting scheduled weekly report email...')
  await sendWeeklyReportEmail()
}, {
  timezone: "UTC"
})

logger.info('Weekly report email scheduler initialized - emails will be sent every Monday at 9:00 AM UTC')

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: error.stack })
  res.status(500).json({ error: 'Internal server error' })
})

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'))
})

// Tell I.V.O.R. resource submission endpoint
app.post('/api/tell-ivor', async (req, res) => {
  try {
    const { resourceUrl, resourceTitle, category, description, submitterName, submitterEmail } = req.body
    
    // Validate required fields
    if (!resourceUrl || !resourceTitle || !category || !description) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate URL format
    try {
      new URL(resourceUrl)
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' })
    }

    // Create email content
    const emailSubject = `New Resource Submission: ${resourceTitle}`
    const emailBody = `
New resource submitted to I.V.O.R.:

📍 Resource Details:
• Title: ${resourceTitle}
• URL: ${resourceUrl}
• Category: ${category}
• Description: ${description}

👤 Submitted By:
• Name: ${submitterName || 'Anonymous'}
• Email: ${submitterEmail || 'Not provided'}

🕒 Submitted: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}

---
Review this resource for potential inclusion in I.V.O.R.'s knowledge base.

From: I.V.O.R. Tell I.V.O.R. System
`

    // Log the submission
    logger.info('Resource submission received', {
      resourceUrl,
      resourceTitle,
      category,
      submitterName: submitterName || 'Anonymous',
      timestamp: new Date().toISOString()
    })

    // Send email notification (will work when SMTP is configured)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: 'rob@blkoutuk.com',
          subject: emailSubject,
          text: emailBody
        })

        logger.info('Resource submission email sent successfully', {
          resourceTitle,
          timestamp: new Date().toISOString()
        })
      } else {
        logger.warn('SMTP not configured - resource submission logged but not emailed', {
          resourceTitle
        })
      }
    } catch (emailError) {
      logger.error('Failed to send resource submission email', {
        error: emailError,
        resourceTitle
      })
      // Continue without failing the request - log for later follow-up
    }

    res.json({ 
      message: 'Resource submission received successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error processing resource submission', { error })
    res.status(500).json({ error: 'Failed to process resource submission' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🤖 IVOR Backend running on port ${PORT}`)
  logger.info(`IVOR Backend running on port ${PORT}`)
})