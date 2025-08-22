# IVOR Knowledge Base Setup Guide

## Overview
This guide will help you set up IVOR's expanded knowledge base with dynamic resource management. The knowledge base uses Supabase tables to store and manage community resources.

## 📋 Manual Setup Instructions

### Step 1: Create Tables in Supabase Dashboard

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your IVOR project: `bgjengudzfickgomjqmz`
3. Go to **SQL Editor** in the left sidebar
4. Copy and paste the following SQL commands:

#### Create Categories Table
```sql
CREATE TABLE IF NOT EXISTS ivor_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Create Resources Table
```sql
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
  keywords TEXT[],
  location VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Create Tags Table
```sql
CREATE TABLE IF NOT EXISTS ivor_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Create Resource-Tags Junction Table
```sql
CREATE TABLE IF NOT EXISTS ivor_resource_tags (
  resource_id UUID REFERENCES ivor_resources(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES ivor_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);
```

#### Create Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_ivor_resources_category ON ivor_resources(category_id);
CREATE INDEX IF NOT EXISTS idx_ivor_resources_active ON ivor_resources(is_active);
CREATE INDEX IF NOT EXISTS idx_ivor_resources_priority ON ivor_resources(priority DESC);
CREATE INDEX IF NOT EXISTS idx_ivor_resources_keywords ON ivor_resources USING GIN(keywords);
```

### Step 2: Seed Initial Data

#### Insert Categories
```sql
INSERT INTO ivor_categories (name, description, icon, color) VALUES
('Housing', 'Housing support, accommodation, and homelessness services', '🏠', '#4CAF50'),
('Mental Health', 'Mental health support, therapy, and wellbeing services', '🧠', '#2196F3'),
('Healthcare', 'General healthcare, LGBTQ+ friendly medical services', '🏥', '#FF5722'),
('Legal Aid', 'Legal support, advice, and representation services', '⚖️', '#9C27B0'),
('Support Groups', 'Community support groups and peer networks', '👥', '#FF9800'),
('Education', 'Educational resources and training opportunities', '📚', '#795548'),
('Employment', 'Job search support and workplace rights', '💼', '#607D8B'),
('Youth Services', 'Services specifically for young people', '🌟', '#E91E63'),
('Crisis Support', 'Emergency and crisis intervention services', '🚨', '#F44336'),
('Identity & Coming Out', 'Resources for exploring identity and coming out', '🌈', '#673AB7')
ON CONFLICT (name) DO NOTHING;
```

#### Insert Sample Resources
```sql
-- Get category IDs first
WITH category_ids AS (
  SELECT 
    id as housing_id,
    (SELECT id FROM ivor_categories WHERE name = 'Mental Health') as mental_health_id,
    (SELECT id FROM ivor_categories WHERE name = 'Crisis Support') as crisis_id,
    (SELECT id FROM ivor_categories WHERE name = 'Legal Aid') as legal_id
  FROM ivor_categories WHERE name = 'Housing'
)
INSERT INTO ivor_resources (title, description, content, website_url, phone, category_id, keywords, priority)
SELECT * FROM (VALUES
  ('Stonewall Housing', 'Specialist LGBTQ+ housing support', 'Stonewall Housing provides specialist housing services for LGBTQ+ people. They offer supported accommodation, advice on housing rights, and assistance with finding safe, affordable housing. Services include emergency accommodation referrals, housing benefit advice, and support with landlord disputes.', 'https://www.stonewallhousing.org', '020 7359 5767', (SELECT housing_id FROM category_ids), ARRAY['housing', 'accommodation', 'lgbtq+', 'support', 'emergency'], 10),
  
  ('Albert Kennedy Trust', 'LGBTQ+ youth housing (16-25)', 'The Albert Kennedy Trust (AKT) provides safe homes and support for LGBTQ+ young people aged 16-25 who are homeless or living in hostile environments. Services include emergency accommodation, supported housing, floating support, and mentoring programs.', 'https://www.akt.org.uk', '020 7831 6562', (SELECT housing_id FROM category_ids), ARRAY['youth', 'housing', 'lgbtq+', '16-25', 'emergency', 'mentoring'], 10),
  
  ('Mind LGBTQ+ Support', 'Mental health support for LGBTQ+ community', 'Mind provides mental health support specifically tailored for LGBTQ+ individuals. Services include counselling, support groups, crisis support, and information on mental health rights. They offer both online and in-person support options.', 'https://www.mind.org.uk/information-support/tips-for-everyday-living/lgbtiq-mental-health/', '0300 123 3393', (SELECT mental_health_id FROM category_ids), ARRAY['mental health', 'lgbtq+', 'counselling', 'support groups', 'crisis'], 9),
  
  ('Samaritans', '24/7 emotional support helpline', 'Samaritans provides confidential emotional support 24/7 for anyone experiencing feelings of distress or despair. Free to call from any phone, they offer a safe space to talk about anything troubling you.', 'https://www.samaritans.org', '116 123', (SELECT crisis_id FROM category_ids), ARRAY['crisis', '24/7', 'emotional support', 'helpline', 'free', 'confidential'], 10),
  
  ('Stonewall Legal Line', 'LGBTQ+ legal advice service', 'Stonewall Legal Line provides free legal advice for LGBTQ+ individuals facing discrimination or requiring legal support. They can advise on employment discrimination, hate crimes, family law, and other legal issues.', 'https://www.stonewall.org.uk/help-advice/whats-your-area/legal-line', '0800 050 2020', (SELECT legal_id FROM category_ids), ARRAY['legal advice', 'lgbtq+', 'discrimination', 'free', 'employment', 'hate crime'], 9)
) AS v(title, description, content, website_url, phone, category_id, keywords, priority);
```

### Step 3: Verify Setup

Run this query to verify everything is working:

```sql
SELECT 
  c.name as category,
  r.title,
  r.phone,
  r.website_url
FROM ivor_resources r
JOIN ivor_categories c ON r.category_id = c.id
ORDER BY c.name, r.priority DESC;
```

You should see your resources organized by category.

## 🚀 Testing the Knowledge Base

1. **Restart your backend server:**
   ```bash
   cd /home/robbe/BLKOUTNXT_Projects/ivorsolo-repo/backend
   npm run dev
   ```

2. **Test IVOR responses:**
   - Ask about housing: "I need help with housing"
   - Ask about mental health: "I need mental health support"
   - Ask about crisis support: "I'm in crisis"
   - Ask about legal aid: "I need legal advice"

## 📈 Adding More Resources

### Via Supabase Dashboard
1. Go to **Database** > **Tables** in Supabase
2. Select `ivor_resources` table
3. Click **Insert** > **Insert row**
4. Fill in the resource details
5. Set `is_active` to `true` and `priority` to appropriate level (1-10)

### Via API (Future Admin Interface)
The backend now includes API endpoints for managing resources:
- `POST /api/admin/resources` - Add new resource
- `PUT /api/admin/resources/:id` - Update resource
- `DELETE /api/admin/resources/:id` - Delete resource

## 🔧 Knowledge Service Features

The new `KnowledgeService` provides:

- **Smart Search**: Full-text search across titles, descriptions, and content
- **Category Filtering**: Get resources by specific categories
- **Tag-based Queries**: Find resources by multiple tags
- **Crisis Detection**: Prioritized emergency resources
- **Formatted Responses**: Consistent, helpful response formatting
- **Admin Management**: CRUD operations for resource management

## 🎯 What's Changed

### Before (Hardcoded)
- Resources were embedded in code
- Limited to ~5 housing, mental health, and legal resources
- Required code changes to add new resources
- No search capabilities
- Static responses

### After (Dynamic Knowledge Base)
- Resources stored in searchable database
- Organized by categories and tags
- Easy to add/update through admin interface
- Smart search and filtering
- Expandable to any resource type
- Consistent, rich response formatting

## 🌟 Impact

IVOR can now:
- Provide more comprehensive, up-to-date resources
- Search across all resource types intelligently
- Prioritize emergency/crisis resources automatically
- Scale to hundreds of resources without performance impact
- Maintain resources through admin interface
- Offer location-specific and tag-filtered resources

**IVOR's knowledge base is now expanded and ready to better serve the BLKOUT community!** 🎉