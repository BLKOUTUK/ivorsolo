-- I.V.O.R. Database Schema
-- Run this in your Supabase SQL editor to create the necessary tables

-- Enable Row Level Security
ALTER DATABASE postgres SET "row_security" = on;

-- Create conversations table
CREATE TABLE IF NOT EXISTS ivor_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT DEFAULT 'anonymous',
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_ivor_conversations_user_id ON ivor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ivor_conversations_updated_at ON ivor_conversations(updated_at DESC);

-- Create feedback table for improving responses
CREATE TABLE IF NOT EXISTS ivor_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES ivor_conversations(id) ON DELETE CASCADE,
    message_index INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create usage analytics table
CREATE TABLE IF NOT EXISTS ivor_usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT,
    user_id TEXT DEFAULT 'anonymous',
    endpoint TEXT NOT NULL,
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies for conversations (basic security)
CREATE POLICY "Users can view their own conversations" ON ivor_conversations
    FOR SELECT USING (true); -- Allow anonymous access for now

CREATE POLICY "Users can insert their own conversations" ON ivor_conversations
    FOR INSERT WITH CHECK (true); -- Allow anonymous access for now

CREATE POLICY "Users can update their own conversations" ON ivor_conversations
    FOR UPDATE USING (true); -- Allow anonymous access for now

-- Enable RLS
ALTER TABLE ivor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ivor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ivor_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ivor_conversations_updated_at BEFORE UPDATE ON ivor_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- INSERT INTO ivor_conversations (user_id, messages) VALUES 
--     ('test-user', '[{"role": "user", "content": "Hello IVOR", "timestamp": "2024-01-01T00:00:00Z"}, {"role": "assistant", "content": "Hello! I''m IVOR, your community AI assistant. How can I support you today?", "timestamp": "2024-01-01T00:00:01Z"}]');