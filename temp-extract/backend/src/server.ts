import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import winston from 'winston'

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
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

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

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  })
  next()
})

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

    // Generate IVOR response based on message content
    const response = await generateIVORResponse(message, user_context)

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
  
  // Service selection logic
  if (lowerMessage.includes('wellness') || lowerMessage.includes('habit') || lowerMessage.includes('health')) {
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
    return generateCommunityResourceResponse('mental-health')
  }
  
  if (lowerMessage.includes('housing') || lowerMessage.includes('accommodation') || lowerMessage.includes('homeless')) {
    return `Housing security is fundamental to wellbeing. Here are LGBTQ+ friendly housing resources:

• **Stonewall Housing** - Specialist LGBTQ+ housing support  
• **Albert Kennedy Trust** - For LGBTQ+ youth (16-25)
• **Shelter** - General housing advice with LGBTQ+ awareness
• **Homeless Link** - Emergency accommodation finder
• **Crisis** - Housing support and advocacy

**Emergency numbers:**
- Shelter helpline: 0808 800 4444
- AKT crisis line: 0207 841 3354

I can help you navigate applications, understand your rights, or find emergency accommodation. What's your current situation?`
  }
  
  if (lowerMessage.includes('legal') || lowerMessage.includes('discrimination') || lowerMessage.includes('rights')) {
    return `I can connect you with legal support that understands intersectional discrimination:

• **Equality and Human Rights Commission** - Discrimination advice
• **Liberty** - Civil rights legal support  
• **ACAS** - Workplace discrimination: 0300 123 1100
• **Galop** - LGBTQ+ hate crime support: 0207 704 2040
• **Citizens Advice** - Free legal guidance

**For immediate discrimination:**
- Document everything (dates, witnesses, evidence)
- Report to relevant authorities
- Seek legal advice within time limits

What type of legal support do you need? Workplace, housing, hate crime, or something else?`
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
  return `Hi! I'm I.V.O.R. - your Intelligent Virtual Organizing Resource. I offer both immediate resource support and comprehensive life coaching specifically designed for Black queer liberation and empowerment.

**🚀 Need quick help? Just tell me what you need:**
- Mental health support, therapy
- Housing assistance, accommodation  
- Legal help, discrimination issues
- Community events, local connections
- Crisis support, emergency resources

**📚 Want structured coaching? Choose a program:**

🌱 **Wellness & Habit Coaching** - 15-section personalized wellness plan
🧩 **Strategic Problem Solving** - Mental model frameworks for complex challenges  
📖 **Transformational Journaling** - Daily morning/evening rituals for growth
💕 **Relationship Coaching** - Dating, friendship, and social connections
🚀 **Career Guidance** - Professional development with identity affirmation

**Examples:** *"I need therapy resources"* | *"I want wellness coaching"* | *"Help with housing"* | *"Start journaling"* | *"Start problem solving"*

Whether you need immediate resources or want to dive deep into personal development, I'm here to support your liberation journey. What would be most helpful?`
}

function generateWelcomeResponse(): string {
  return `Welcome! I'm I.V.O.R. - your Intelligent Virtual Organizing Resource, designed specifically to support Black queer men in the UK.

**I can help you in two ways:**

🚀 **Quick Resource Support** - Immediate help with mental health, housing, legal issues, community connections, crisis support
📚 **Comprehensive Life Coaching** - Structured programs for wellness habits, problem-solving, relationships, and career growth

**For immediate resources, just mention what you need:**
- Mental health, therapy, counseling
- Housing, accommodation support  
- Legal help, discrimination issues
- Community events, meetups
- Crisis or emergency support

**For deeper coaching, choose a structured program:**
🌱 **Wellness & Habit Coaching** - 15-section personalized plan
🧩 **Strategic Problem Solving** - Mental model frameworks  
📖 **Transformational Journaling** - Daily growth rituals
💕 **Relationship Coaching** - Dating, friendships, connections
🚀 **Career Guidance** - Professional development

Your liberation and wellbeing matter. What kind of support would be most helpful right now?`
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
    return `**Community Resources Available**

I can provide immediate resources for:
🧠 **Mental Health** - Culturally competent therapy and crisis support
🏠 **Housing** - LGBTQ+ friendly accommodation and emergency help
⚖️ **Legal Support** - Discrimination guidance and civil rights advocacy
🌈 **Community** - Local QTIPOC events and support groups
🚨 **Crisis Support** - 24/7 helplines and emergency services

**Plus comprehensive coaching programs:**
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

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: error.stack })
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Start server
app.listen(PORT, () => {
  logger.info(`IVOR Backend running on port ${PORT}`)
  console.log(`🤖 IVOR Backend running on port ${PORT}`)
})