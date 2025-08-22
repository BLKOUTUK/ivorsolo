-- IVOR Knowledge Base Schema
-- Creates tables for dynamic resource management

-- Categories table for organizing resources
CREATE TABLE IF NOT EXISTS ivor_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table for storing knowledge base content
CREATE TABLE IF NOT EXISTS ivor_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  website_url VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(100),
  address TEXT,
  category_id UUID REFERENCES ivor_categories(id) ON DELETE SET NULL,
  keywords TEXT[], -- Array of keywords for search
  location VARCHAR(100), -- Geographic location if relevant
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher numbers = higher priority
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table for flexible categorization
CREATE TABLE IF NOT EXISTS ivor_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for many-to-many relationship between resources and tags
CREATE TABLE IF NOT EXISTS ivor_resource_tags (
  resource_id UUID REFERENCES ivor_resources(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES ivor_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ivor_resources_category ON ivor_resources(category_id);
CREATE INDEX IF NOT EXISTS idx_ivor_resources_active ON ivor_resources(is_active);
CREATE INDEX IF NOT EXISTS idx_ivor_resources_priority ON ivor_resources(priority DESC);
CREATE INDEX IF NOT EXISTS idx_ivor_resources_keywords ON ivor_resources USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_ivor_resources_location ON ivor_resources(location);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_ivor_resources_search ON ivor_resources USING GIN(
  to_tsvector('english', title || ' ' || description || ' ' || content)
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_ivor_categories_updated_at 
  BEFORE UPDATE ON ivor_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ivor_resources_updated_at 
  BEFORE UPDATE ON ivor_resources 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();