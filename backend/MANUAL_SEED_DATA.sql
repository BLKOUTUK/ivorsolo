-- Manual Seed Data for IVOR Knowledge Base
-- Run this in Supabase SQL Editor to populate your knowledge base

-- 1. Insert Categories
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

-- 2. Insert Tags
INSERT INTO ivor_tags (name) VALUES
('LGBTQ+'), ('Trans'), ('Youth'), ('Emergency'), ('Free'), ('24/7'), ('Online'), 
('Phone Support'), ('In-Person'), ('Counselling'), ('Legal'), ('Medical'), 
('Housing'), ('Crisis'), ('Support Group'), ('Educational'), ('Workplace'), 
('Coming Out'), ('Identity'), ('Mental Health'), ('Therapy'), ('Peer Support'),
('Training'), ('Advocacy'), ('Rights'), ('Discrimination'), ('Family'), 
('Relationships'), ('Health'), ('HIV/AIDS'), ('PrEP'), ('Sexual Health')
ON CONFLICT (name) DO NOTHING;

-- 3. Insert Resources (using category names to find IDs)
WITH category_ids AS (
  SELECT 
    (SELECT id FROM ivor_categories WHERE name = 'Housing') as housing_id,
    (SELECT id FROM ivor_categories WHERE name = 'Mental Health') as mental_health_id,
    (SELECT id FROM ivor_categories WHERE name = 'Healthcare') as healthcare_id,
    (SELECT id FROM ivor_categories WHERE name = 'Legal Aid') as legal_aid_id,
    (SELECT id FROM ivor_categories WHERE name = 'Crisis Support') as crisis_support_id,
    (SELECT id FROM ivor_categories WHERE name = 'Youth Services') as youth_services_id
)
INSERT INTO ivor_resources (title, description, content, website_url, phone, category_id, keywords, priority) 
SELECT * FROM (VALUES
  (
    'Stonewall Housing',
    'Specialist LGBTQ+ housing support',
    'Stonewall Housing provides specialist housing services for LGBTQ+ people. They offer supported accommodation, advice on housing rights, and assistance with finding safe, affordable housing. Services include emergency accommodation referrals, housing benefit advice, and support with landlord disputes.',
    'https://www.stonewallhousing.org',
    '020 7359 5767',
    (SELECT housing_id FROM category_ids),
    ARRAY['housing', 'accommodation', 'lgbtq+', 'support', 'emergency'],
    10
  ),
  (
    'Albert Kennedy Trust',
    'LGBTQ+ youth housing (16-25)',
    'The Albert Kennedy Trust (AKT) provides safe homes and support for LGBTQ+ young people aged 16-25 who are homeless or living in hostile environments. Services include emergency accommodation, supported housing, floating support, and mentoring programs.',
    'https://www.akt.org.uk',
    '020 7831 6562',
    (SELECT housing_id FROM category_ids),
    ARRAY['youth', 'housing', 'lgbtq+', '16-25', 'emergency', 'mentoring'],
    10
  ),
  (
    'Mind LGBTQ+ Support',
    'Mental health support for LGBTQ+ community',
    'Mind provides mental health support specifically tailored for LGBTQ+ individuals. Services include counselling, support groups, crisis support, and information on mental health rights. They offer both online and in-person support options.',
    'https://www.mind.org.uk/information-support/tips-for-everyday-living/lgbtiq-mental-health/',
    '0300 123 3393',
    (SELECT mental_health_id FROM category_ids),
    ARRAY['mental health', 'lgbtq+', 'counselling', 'support groups', 'crisis'],
    9
  ),
  (
    'Samaritans',
    '24/7 emotional support helpline',
    'Samaritans provides confidential emotional support 24/7 for anyone experiencing feelings of distress or despair. Free to call from any phone, they offer a safe space to talk about anything troubling you.',
    'https://www.samaritans.org',
    '116 123',
    (SELECT crisis_support_id FROM category_ids),
    ARRAY['crisis', '24/7', 'emotional support', 'helpline', 'free', 'confidential'],
    10
  ),
  (
    'CliniQ',
    'LGBTQ+ inclusive sexual health clinic',
    'CliniQ is a sexual health and wellbeing clinic specifically for trans people, non-binary people, and others who may not feel comfortable accessing mainstream services. Located in London with plans to expand.',
    'https://cliniq.org.uk',
    '020 3887 6900',
    (SELECT healthcare_id FROM category_ids),
    ARRAY['sexual health', 'trans', 'non-binary', 'clinic', 'london', 'inclusive'],
    8
  ),
  (
    'LGBT Foundation Health Services',
    'LGBTQ+ health and wellbeing support',
    'LGBT Foundation provides health services including sexual health testing, counselling, and health advocacy. They offer both clinical services and health information resources for the LGBTQ+ community.',
    'https://lgbt.foundation/health',
    '0345 330 3030',
    (SELECT healthcare_id FROM category_ids),
    ARRAY['health', 'lgbtq+', 'sexual health', 'counselling', 'advocacy'],
    8
  ),
  (
    'Stonewall Legal Line',
    'LGBTQ+ legal advice service',
    'Stonewall Legal Line provides free legal advice for LGBTQ+ individuals facing discrimination or requiring legal support. They can advise on employment discrimination, hate crimes, family law, and other legal issues.',
    'https://www.stonewall.org.uk/help-advice/whats-your-area/legal-line',
    '0800 050 2020',
    (SELECT legal_aid_id FROM category_ids),
    ARRAY['legal advice', 'lgbtq+', 'discrimination', 'free', 'employment', 'hate crime'],
    9
  ),
  (
    'Switchboard LGBT+',
    '24/7 LGBTQ+ support and information',
    'Switchboard LGBT+ provides a listening service for LGBTQ+ people. They offer emotional support, practical information, and signposting to other services. Available 24/7 for anyone who needs support.',
    'https://switchboard.lgbt',
    '0300 330 0630',
    (SELECT crisis_support_id FROM category_ids),
    ARRAY['lgbtq+', '24/7', 'support', 'information', 'listening'],
    10
  ),
  (
    'MindLine Trans+',
    'Trans-specific mental health support',
    'MindLine Trans+ is a confidential mental health support helpline for people who identify as transgender, agender, gender fluid, or non-binary. Run by trans volunteers with lived experience.',
    'https://bristolmind.org.uk/help-and-counselling/mindline-transplus/',
    '0300 330 5468',
    (SELECT mental_health_id FROM category_ids),
    ARRAY['trans', 'mental health', 'transgender', 'non-binary', 'support'],
    9
  ),
  (
    'Galop LGBT+ Anti-Violence Charity',
    'LGBTQ+ hate crime and domestic abuse support',
    'Galop is the LGBT+ anti-violence charity. They provide support for LGBT+ people who have experienced hate crime, sexual violence, or domestic abuse. Services include helplines, advocacy, and counselling.',
    'https://galop.org.uk',
    '0207 704 2040',
    (SELECT legal_aid_id FROM category_ids),
    ARRAY['hate crime', 'domestic abuse', 'lgbtq+', 'violence', 'support'],
    9
  )
) AS v(title, description, content, website_url, phone, category_id, keywords, priority)
ON CONFLICT (title) DO NOTHING;

-- 4. Link Resources with Tags
-- First, let's link Stonewall Housing with appropriate tags
INSERT INTO ivor_resource_tags (resource_id, tag_id)
SELECT r.id, t.id 
FROM ivor_resources r, ivor_tags t 
WHERE r.title = 'Stonewall Housing' 
AND t.name IN ('LGBTQ+', 'Housing', 'Emergency')
ON CONFLICT DO NOTHING;

-- Albert Kennedy Trust
INSERT INTO ivor_resource_tags (resource_id, tag_id)
SELECT r.id, t.id 
FROM ivor_resources r, ivor_tags t 
WHERE r.title = 'Albert Kennedy Trust' 
AND t.name IN ('LGBTQ+', 'Youth', 'Housing', 'Emergency')
ON CONFLICT DO NOTHING;

-- Mind LGBTQ+ Support
INSERT INTO ivor_resource_tags (resource_id, tag_id)
SELECT r.id, t.id 
FROM ivor_resources r, ivor_tags t 
WHERE r.title = 'Mind LGBTQ+ Support' 
AND t.name IN ('LGBTQ+', 'Mental Health', 'Counselling', 'Support Group')
ON CONFLICT DO NOTHING;

-- Samaritans
INSERT INTO ivor_resource_tags (resource_id, tag_id)
SELECT r.id, t.id 
FROM ivor_resources r, ivor_tags t 
WHERE r.title = 'Samaritans' 
AND t.name IN ('24/7', 'Crisis', 'Free', 'Phone Support')
ON CONFLICT DO NOTHING;

-- CliniQ
INSERT INTO ivor_resource_tags (resource_id, tag_id)
SELECT r.id, t.id 
FROM ivor_resources r, ivor_tags t 
WHERE r.title = 'CliniQ' 
AND t.name IN ('Trans', 'Sexual Health', 'Medical', 'In-Person')
ON CONFLICT DO NOTHING;

-- LGBT Foundation Health Services
INSERT INTO ivor_resource_tags (resource_id, tag_id)
SELECT r.id, t.id 
FROM ivor_resources r, ivor_tags t 
WHERE r.title = 'LGBT Foundation Health Services' 
AND t.name IN ('LGBTQ+', 'Health', 'Sexual Health', 'Counselling')
ON CONFLICT DO NOTHING;

-- Stonewall Legal Line
INSERT INTO ivor_resource_tags (resource_id, tag_id)
SELECT r.id, t.id 
FROM ivor_resources r, ivor_tags t 
WHERE r.title = 'Stonewall Legal Line' 
AND t.name IN ('LGBTQ+', 'Legal', 'Free', 'Discrimination', 'Phone Support')
ON CONFLICT DO NOTHING;

-- Switchboard LGBT+
INSERT INTO ivor_resource_tags (resource_id, tag_id)
SELECT r.id, t.id 
FROM ivor_resources r, ivor_tags t 
WHERE r.title = 'Switchboard LGBT+' 
AND t.name IN ('LGBTQ+', '24/7', 'Phone Support', 'Crisis', 'Support Group')
ON CONFLICT DO NOTHING;

-- MindLine Trans+
INSERT INTO ivor_resource_tags (resource_id, tag_id)
SELECT r.id, t.id 
FROM ivor_resources r, ivor_tags t 
WHERE r.title = 'MindLine Trans+' 
AND t.name IN ('Trans', 'Mental Health', 'Phone Support', 'Peer Support')
ON CONFLICT DO NOTHING;

-- Galop LGBT+ Anti-Violence Charity
INSERT INTO ivor_resource_tags (resource_id, tag_id)
SELECT r.id, t.id 
FROM ivor_resources r, ivor_tags t 
WHERE r.title = 'Galop LGBT+ Anti-Violence Charity' 
AND t.name IN ('LGBTQ+', 'Legal', 'Crisis', 'Advocacy', 'Phone Support')
ON CONFLICT DO NOTHING;

-- 5. Verification Query (run separately to check results)
SELECT 
  'VERIFICATION RESULTS' as summary,
  (SELECT COUNT(*) FROM ivor_categories) as categories_count,
  (SELECT COUNT(*) FROM ivor_resources) as resources_count,
  (SELECT COUNT(*) FROM ivor_tags) as tags_count,
  (SELECT COUNT(*) FROM ivor_resource_tags) as resource_tag_links;

-- 6. Sample resource view with category and tags
SELECT 
  r.title,
  c.name as category,
  r.phone,
  r.website_url,
  ARRAY_AGG(t.name) as tags
FROM ivor_resources r
LEFT JOIN ivor_categories c ON r.category_id = c.id
LEFT JOIN ivor_resource_tags rt ON r.id = rt.resource_id
LEFT JOIN ivor_tags t ON rt.tag_id = t.id
GROUP BY r.id, r.title, c.name, r.phone, r.website_url, r.priority
ORDER BY r.priority DESC, r.title;