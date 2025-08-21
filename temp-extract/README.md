# I.V.O.R. - Intelligent Virtual Organizing Resource

## Overview

I.V.O.R. is a completely standalone AI-powered community assistant specifically designed to support Black queer men in the UK with resources, community connections, and guidance for liberation and wellbeing.

This is a **full-stack separation** from the main BLKOUT platform, featuring:

- **Independent backend API** (Express.js + Supabase)  
- **Standalone frontend** (React + TypeScript + Vite)
- **Separate database** instance for conversations
- **Complete deployment isolation**

## Architecture

### Backend (`/backend/`)
- **Express.js** API server
- **Supabase** database for conversation storage  
- **Winston** logging
- **CORS** configured for frontend domains
- **Comprehensive community resource responses**

### Frontend (`/frontend/`)  
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Real-time chat interface**

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account and project

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   FRONTEND_URL=http://localhost:5173
   ```

4. Set up database schema in Supabase:
   - Run the SQL in `database-schema.sql` in your Supabase SQL editor

5. Start development server:
   ```bash
   npm run dev
   ```

Backend runs on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend  
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```env
   VITE_API_BASE=http://localhost:3001
   VITE_NODE_ENV=development
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:5173`

## Community Resources

I.V.O.R. provides intelligent responses for:

- **Mental Health Support** - Culturally competent therapy and crisis support
- **Housing Assistance** - LGBTQ+ friendly housing resources and emergency accommodation
- **Legal Advocacy** - Discrimination support and civil rights guidance  
- **Community Connections** - Local QTIPOC events and support groups
- **Career Development** - Workplace support and cooperative alternatives
- **Crisis Intervention** - 24/7 helplines and emergency services

## Deployment

### Backend Deployment (Vercel)

```bash
cd backend
vercel --prod
```

### Frontend Deployment (Vercel)

```bash
cd frontend  
vercel --prod
```

Update environment variables in Vercel dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`  
- `FRONTEND_URL` (production domain)
- `VITE_API_BASE` (backend production URL)

## Database Schema

The application uses these Supabase tables:

- `ivor_conversations` - Chat conversations and message history
- `ivor_feedback` - User feedback for improving responses  
- `ivor_usage_analytics` - Usage tracking and performance metrics

## API Endpoints

### Chat
- `POST /api/chat` - Send message to I.V.O.R.
- `GET /api/conversation/:id` - Get conversation history
- `GET /api/conversations` - List user conversations

### Health
- `GET /health` - Health check endpoint

## Security

- Row Level Security (RLS) enabled on all database tables
- CORS configured for specific allowed origins
- Helmet.js for security headers
- Input validation and sanitization
- Rate limiting (planned)

## Community Values

I.V.O.R. is built with BLKOUT's core values:

- **Trans Liberation** - Centering trans joy and safety
- **Cooperative Ownership** - Community-owned, democratically governed  
- **Black Power** - Liberation through collective action
- **Data Sovereignty** - Community control over data and technology

## Contributing

This project follows cooperative development principles. All contributions should center Black queer liberation and community wellbeing.

## License

Built for the BLKOUT community platform - Community-owned technology for liberation.

---

**I.V.O.R.** - *Intelligent Virtual Organizing Resource*  
Part of the BLKOUT Community Platform