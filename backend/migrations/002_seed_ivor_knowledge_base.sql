-- Seed data for IVOR Knowledge Base
-- Populates initial categories, resources, and tags

-- Insert categories
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
('Identity & Coming Out', 'Resources for exploring identity and coming out', '🌈', '#673AB7');

-- Insert tags
INSERT INTO ivor_tags (name) VALUES
('LGBTQ+'), ('Trans'), ('Youth'), ('Emergency'), ('Free'), ('24/7'), ('Online'), 
('Phone Support'), ('In-Person'), ('Counselling'), ('Legal'), ('Medical'), 
('Housing'), ('Crisis'), ('Support Group'), ('Educational'), ('Workplace'), 
('Coming Out'), ('Identity'), ('Mental Health'), ('Therapy'), ('Peer Support'),
('Training'), ('Advocacy'), ('Rights'), ('Discrimination'), ('Family'), 
('Relationships'), ('Health'), ('HIV/AIDS'), ('PrEP'), ('Sexual Health');

-- Get category IDs for inserting resources
DO $$
DECLARE
    housing_id UUID;
    mental_health_id UUID;
    healthcare_id UUID;
    legal_aid_id UUID;
    support_groups_id UUID;
    education_id UUID;
    employment_id UUID;
    youth_services_id UUID;
    crisis_support_id UUID;
    identity_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO housing_id FROM ivor_categories WHERE name = 'Housing';
    SELECT id INTO mental_health_id FROM ivor_categories WHERE name = 'Mental Health';
    SELECT id INTO healthcare_id FROM ivor_categories WHERE name = 'Healthcare';
    SELECT id INTO legal_aid_id FROM ivor_categories WHERE name = 'Legal Aid';
    SELECT id INTO support_groups_id FROM ivor_categories WHERE name = 'Support Groups';
    SELECT id INTO education_id FROM ivor_categories WHERE name = 'Education';
    SELECT id INTO employment_id FROM ivor_categories WHERE name = 'Employment';
    SELECT id INTO youth_services_id FROM ivor_categories WHERE name = 'Youth Services';
    SELECT id INTO crisis_support_id FROM ivor_categories WHERE name = 'Crisis Support';
    SELECT id INTO identity_id FROM ivor_categories WHERE name = 'Identity & Coming Out';

    -- Insert housing resources
    INSERT INTO ivor_resources (title, description, content, website_url, phone, category_id, keywords, priority) VALUES
    ('Stonewall Housing', 'Specialist LGBTQ+ housing support', 'Stonewall Housing provides specialist housing services for LGBTQ+ people. They offer supported accommodation, advice on housing rights, and assistance with finding safe, affordable housing. Services include emergency accommodation referrals, housing benefit advice, and support with landlord disputes.', 'https://www.stonewallhousing.org', '020 7359 5767', housing_id, ARRAY['housing', 'accommodation', 'lgbtq+', 'support', 'emergency'], 10),
    
    ('Albert Kennedy Trust', 'LGBTQ+ youth housing (16-25)', 'The Albert Kennedy Trust (AKT) provides safe homes and support for LGBTQ+ young people aged 16-25 who are homeless or living in hostile environments. Services include emergency accommodation, supported housing, floating support, and mentoring programs.', 'https://www.akt.org.uk', '020 7831 6562', housing_id, ARRAY['youth', 'housing', 'lgbtq+', '16-25', 'emergency', 'mentoring'], 10),
    
    -- Insert mental health resources
    ('Mind LGBTQ+ Support', 'Mental health support for LGBTQ+ community', 'Mind provides mental health support specifically tailored for LGBTQ+ individuals. Services include counselling, support groups, crisis support, and information on mental health rights. They offer both online and in-person support options.', 'https://www.mind.org.uk/information-support/tips-for-everyday-living/lgbtiq-mental-health/', '0300 123 3393', mental_health_id, ARRAY['mental health', 'lgbtq+', 'counselling', 'support groups', 'crisis'], 9),
    
    ('Samaritans', '24/7 emotional support helpline', 'Samaritans provides confidential emotional support 24/7 for anyone experiencing feelings of distress or despair. Free to call from any phone, they offer a safe space to talk about anything troubling you.', 'https://www.samaritans.org', '116 123', mental_health_id, ARRAY['crisis', '24/7', 'emotional support', 'helpline', 'free', 'confidential'], 10),
    
    -- Insert healthcare resources
    ('CliniQ', 'LGBTQ+ inclusive sexual health clinic', 'CliniQ is a sexual health and wellbeing clinic specifically for trans people, non-binary people, and others who may not feel comfortable accessing mainstream services. Located in London with plans to expand.', 'https://cliniq.org.uk', '020 3887 6900', healthcare_id, ARRAY['sexual health', 'trans', 'non-binary', 'clinic', 'london', 'inclusive'], 8),
    
    ('LGBT Foundation Health Services', 'LGBTQ+ health and wellbeing support', 'LGBT Foundation provides health services including sexual health testing, counselling, and health advocacy. They offer both clinical services and health information resources for the LGBTQ+ community.', 'https://lgbt.foundation/health', '0345 330 3030', healthcare_id, ARRAY['health', 'lgbtq+', 'sexual health', 'counselling', 'advocacy'], 8),
    
    -- Insert legal aid resources
    ('Stonewall Legal Line', 'LGBTQ+ legal advice service', 'Stonewall Legal Line provides free legal advice for LGBTQ+ individuals facing discrimination or requiring legal support. They can advise on employment discrimination, hate crimes, family law, and other legal issues.', 'https://www.stonewall.org.uk/help-advice/whats-your-area/legal-line', '0800 050 2020', legal_aid_id, ARRAY['legal advice', 'lgbtq+', 'discrimination', 'free', 'employment', 'hate crime'], 9),
    
    -- Insert crisis support resources
    ('LGBT National Hotline', '24/7 crisis support for LGBTQ+ individuals', 'The LGBT National Hotline provides confidential peer-support for LGBTQ+ people in crisis. Available 24/7, they offer emotional support, crisis intervention, and resource referrals.', 'https://www.lgbthotline.org', '1-888-843-4564', crisis_support_id, ARRAY['crisis', 'lgbtq+', '24/7', 'hotline', 'peer support', 'emergency'], 10);
    
END $$;

-- Link resources with additional tags (using resource titles to find IDs)
DO $$
DECLARE
    r_id UUID;
    t_id UUID;
BEGIN
    -- Stonewall Housing tags
    SELECT id INTO r_id FROM ivor_resources WHERE title = 'Stonewall Housing';
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'LGBTQ+';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'Housing';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'Emergency';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    
    -- Albert Kennedy Trust tags
    SELECT id INTO r_id FROM ivor_resources WHERE title = 'Albert Kennedy Trust';
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'LGBTQ+';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'Youth';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'Housing';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    
    -- Mind LGBTQ+ Support tags
    SELECT id INTO r_id FROM ivor_resources WHERE title = 'Mind LGBTQ+ Support';
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'LGBTQ+';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'Mental Health';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'Counselling';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    
    -- Samaritans tags
    SELECT id INTO r_id FROM ivor_resources WHERE title = 'Samaritans';
    SELECT id INTO t_id FROM ivor_tags WHERE name = '24/7';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'Crisis';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'Free';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    
    -- CliniQ tags
    SELECT id INTO r_id FROM ivor_resources WHERE title = 'CliniQ';
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'Trans';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'Sexual Health';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    SELECT id INTO t_id FROM ivor_tags WHERE name = 'Medical';
    INSERT INTO ivor_resource_tags (resource_id, tag_id) VALUES (r_id, t_id);
    
END $$;