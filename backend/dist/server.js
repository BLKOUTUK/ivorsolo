import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import winston from 'winston';
// Load environment variables
dotenv.config();
// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});
// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;
// Initialize Supabase (separate instance for IVOR)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://ivor.blkout.uk', 'https://blkout.uk']
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'ivor-backend',
        version: '1.0.0'
    });
});
// IVOR Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversation_id, user_context } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Message is required and must be a string'
            });
        }
        logger.info('Processing chat message', {
            messageLength: message.length,
            conversationId: conversation_id,
            hasUserContext: !!user_context
        });
        // Generate IVOR response based on message content
        const response = await generateIVORResponse(message, user_context);
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
            });
        }
        res.json({
            response,
            conversation_id,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('Error processing chat message', { error });
        res.status(500).json({
            error: 'Internal server error processing your message'
        });
    }
});
// Generate IVOR response function
async function generateIVORResponse(message, userContext) {
    const lowerMessage = message.toLowerCase();
    // Community resource responses
    if (lowerMessage.includes('mental health') || lowerMessage.includes('therapy') || lowerMessage.includes('counseling')) {
        return `I can help you find culturally competent mental health support. Here are some Black queer-affirming therapists and resources:

• **Mind LGBTQ+** - Free mental health support: 0300 123 3393
• **Switchboard LGBT+** - 24/7 support: 0300 330 0630  
• **Black, African and Asian Therapy Network** - Culturally specific therapy
• **UK Black Pride** - Community support groups
• **The Outside Project** - LGBTIQ+ community support

Would you like me to help you find specific services in your area? I can also provide information about accessing NHS mental health services or private therapy options.`;
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

I can help you navigate applications, understand your rights, or find emergency accommodation. What's your current situation?`;
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

What type of legal support do you need? Workplace, housing, hate crime, or something else?`;
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

Which city are you in? I can help you find local QTIPOC spaces and events.`;
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

Are you job searching, dealing with workplace issues, or exploring cooperative alternatives?`;
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

You don't have to face this alone. Would you like me to help you find specific support in your area right now?`;
    }
    // Default supportive responses
    const supportiveResponses = [
        `Thank you for reaching out. As your community AI assistant, I'm here to provide culturally relevant support and resources. Whether you need practical help with housing, mental health, legal issues, or community connections, I understand the unique challenges Black queer men face.

What would be most helpful for you right now?`,
        `I'm IVOR - designed specifically to support Black queer men in the UK with resources, community connections, and guidance. I understand intersectional experiences and can help with everything from mental health support to legal advocacy to finding community.

How can I support you today?`,
        `Your wellbeing and liberation matter. As part of the BLKOUT community platform, I'm here to connect you with resources that understand your experience as a Black queer man. 

Whether you need immediate support or long-term community connections, I'm here to help. What's on your mind?`
    ];
    return supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
}
// Get conversation history
app.get('/api/conversation/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('ivor_conversations')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        res.json({ conversation: data || null });
    }
    catch (error) {
        logger.error('Error fetching conversation', { error });
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});
// Get user's conversation list
app.get('/api/conversations', async (req, res) => {
    try {
        const { user_id } = req.query;
        const { data, error } = await supabase
            .from('ivor_conversations')
            .select('id, updated_at, messages')
            .eq('user_id', user_id || 'anonymous')
            .order('updated_at', { ascending: false })
            .limit(20);
        if (error) {
            throw error;
        }
        res.json({ conversations: data || [] });
    }
    catch (error) {
        logger.error('Error fetching conversations', { error });
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});
// Error handling middleware
app.use((error, req, res, next) => {
    logger.error('Unhandled error', { error: error.stack });
    res.status(500).json({ error: 'Internal server error' });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// Start server
app.listen(PORT, () => {
    logger.info(`IVOR Backend running on port ${PORT}`);
    console.log(`🤖 IVOR Backend running on port ${PORT}`);
});
