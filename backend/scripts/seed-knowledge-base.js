#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedKnowledgeBase() {
  console.log('🌱 Seeding IVOR Knowledge Base...\n')
  
  try {
    // 1. Insert Categories
    console.log('📁 Creating categories...')
    const categories = [
      { name: 'Housing', description: 'Housing support, accommodation, and homelessness services', icon: '🏠', color: '#4CAF50' },
      { name: 'Mental Health', description: 'Mental health support, therapy, and wellbeing services', icon: '🧠', color: '#2196F3' },
      { name: 'Healthcare', description: 'General healthcare, LGBTQ+ friendly medical services', icon: '🏥', color: '#FF5722' },
      { name: 'Legal Aid', description: 'Legal support, advice, and representation services', icon: '⚖️', color: '#9C27B0' },
      { name: 'Support Groups', description: 'Community support groups and peer networks', icon: '👥', color: '#FF9800' },
      { name: 'Education', description: 'Educational resources and training opportunities', icon: '📚', color: '#795548' },
      { name: 'Employment', description: 'Job search support and workplace rights', icon: '💼', color: '#607D8B' },
      { name: 'Youth Services', description: 'Services specifically for young people', icon: '🌟', color: '#E91E63' },
      { name: 'Crisis Support', description: 'Emergency and crisis intervention services', icon: '🚨', color: '#F44336' },
      { name: 'Identity & Coming Out', description: 'Resources for exploring identity and coming out', icon: '🌈', color: '#673AB7' }
    ]
    
    for (const category of categories) {
      const { data, error } = await supabase
        .from('ivor_categories')
        .upsert(category, { onConflict: 'name' })
        .select()
        
      if (error) {
        console.error(`❌ Error creating category "${category.name}":`, error)
      } else {
        console.log(`   ✅ Created category: ${category.icon} ${category.name}`)
      }
    }
    
    // 2. Get category IDs for foreign keys
    const { data: categoryData } = await supabase.from('ivor_categories').select('id, name')
    const categoryMap = {}
    categoryData.forEach(cat => categoryMap[cat.name] = cat.id)
    
    // 3. Insert Tags
    console.log('\n🏷️  Creating tags...')
    const tags = [
      'LGBTQ+', 'Trans', 'Youth', 'Emergency', 'Free', '24/7', 'Online', 
      'Phone Support', 'In-Person', 'Counselling', 'Legal', 'Medical', 
      'Housing', 'Crisis', 'Support Group', 'Educational', 'Workplace', 
      'Coming Out', 'Identity', 'Mental Health', 'Therapy', 'Peer Support',
      'Training', 'Advocacy', 'Rights', 'Discrimination', 'Family', 
      'Relationships', 'Health', 'HIV/AIDS', 'PrEP', 'Sexual Health'
    ]
    
    for (const tagName of tags) {
      const { data, error } = await supabase
        .from('ivor_tags')
        .upsert({ name: tagName }, { onConflict: 'name' })
        .select()
        
      if (error) {
        console.error(`❌ Error creating tag "${tagName}":`, error)
      } else {
        console.log(`   ✅ Created tag: ${tagName}`)
      }
    }
    
    // Get tag IDs for linking
    const { data: tagData } = await supabase.from('ivor_tags').select('id, name')
    const tagMap = {}
    tagData.forEach(tag => tagMap[tag.name] = tag.id)
    
    // 4. Insert Resources
    console.log('\n📚 Creating resources...')
    const resources = [
      {
        title: 'Stonewall Housing',
        description: 'Specialist LGBTQ+ housing support',
        content: 'Stonewall Housing provides specialist housing services for LGBTQ+ people. They offer supported accommodation, advice on housing rights, and assistance with finding safe, affordable housing. Services include emergency accommodation referrals, housing benefit advice, and support with landlord disputes.',
        website_url: 'https://www.stonewallhousing.org',
        phone: '020 7359 5767',
        category_id: categoryMap['Housing'],
        keywords: ['housing', 'accommodation', 'lgbtq+', 'support', 'emergency'],
        priority: 10,
        tags: ['LGBTQ+', 'Housing', 'Emergency']
      },
      {
        title: 'Albert Kennedy Trust',
        description: 'LGBTQ+ youth housing (16-25)',
        content: 'The Albert Kennedy Trust (AKT) provides safe homes and support for LGBTQ+ young people aged 16-25 who are homeless or living in hostile environments. Services include emergency accommodation, supported housing, floating support, and mentoring programs.',
        website_url: 'https://www.akt.org.uk',
        phone: '020 7831 6562',
        category_id: categoryMap['Housing'],
        keywords: ['youth', 'housing', 'lgbtq+', '16-25', 'emergency', 'mentoring'],
        priority: 10,
        tags: ['LGBTQ+', 'Youth', 'Housing', 'Emergency']
      },
      {
        title: 'Mind LGBTQ+ Support',
        description: 'Mental health support for LGBTQ+ community',
        content: 'Mind provides mental health support specifically tailored for LGBTQ+ individuals. Services include counselling, support groups, crisis support, and information on mental health rights. They offer both online and in-person support options.',
        website_url: 'https://www.mind.org.uk/information-support/tips-for-everyday-living/lgbtiq-mental-health/',
        phone: '0300 123 3393',
        category_id: categoryMap['Mental Health'],
        keywords: ['mental health', 'lgbtq+', 'counselling', 'support groups', 'crisis'],
        priority: 9,
        tags: ['LGBTQ+', 'Mental Health', 'Counselling', 'Support Group']
      },
      {
        title: 'Samaritans',
        description: '24/7 emotional support helpline',
        content: 'Samaritans provides confidential emotional support 24/7 for anyone experiencing feelings of distress or despair. Free to call from any phone, they offer a safe space to talk about anything troubling you.',
        website_url: 'https://www.samaritans.org',
        phone: '116 123',
        category_id: categoryMap['Crisis Support'],
        keywords: ['crisis', '24/7', 'emotional support', 'helpline', 'free', 'confidential'],
        priority: 10,
        tags: ['24/7', 'Crisis', 'Free', 'Phone Support']
      },
      {
        title: 'CliniQ',
        description: 'LGBTQ+ inclusive sexual health clinic',
        content: 'CliniQ is a sexual health and wellbeing clinic specifically for trans people, non-binary people, and others who may not feel comfortable accessing mainstream services. Located in London with plans to expand.',
        website_url: 'https://cliniq.org.uk',
        phone: '020 3887 6900',
        category_id: categoryMap['Healthcare'],
        keywords: ['sexual health', 'trans', 'non-binary', 'clinic', 'london', 'inclusive'],
        priority: 8,
        tags: ['Trans', 'Sexual Health', 'Medical', 'In-Person']
      },
      {
        title: 'LGBT Foundation Health Services',
        description: 'LGBTQ+ health and wellbeing support',
        content: 'LGBT Foundation provides health services including sexual health testing, counselling, and health advocacy. They offer both clinical services and health information resources for the LGBTQ+ community.',
        website_url: 'https://lgbt.foundation/health',
        phone: '0345 330 3030',
        category_id: categoryMap['Healthcare'],
        keywords: ['health', 'lgbtq+', 'sexual health', 'counselling', 'advocacy'],
        priority: 8,
        tags: ['LGBTQ+', 'Health', 'Sexual Health', 'Counselling']
      },
      {
        title: 'Stonewall Legal Line',
        description: 'LGBTQ+ legal advice service',
        content: 'Stonewall Legal Line provides free legal advice for LGBTQ+ individuals facing discrimination or requiring legal support. They can advise on employment discrimination, hate crimes, family law, and other legal issues.',
        website_url: 'https://www.stonewall.org.uk/help-advice/whats-your-area/legal-line',
        phone: '0800 050 2020',
        category_id: categoryMap['Legal Aid'],
        keywords: ['legal advice', 'lgbtq+', 'discrimination', 'free', 'employment', 'hate crime'],
        priority: 9,
        tags: ['LGBTQ+', 'Legal', 'Free', 'Discrimination', 'Phone Support']
      },
      {
        title: 'Switchboard LGBT+',
        description: '24/7 LGBTQ+ support and information',
        content: 'Switchboard LGBT+ provides a listening service for LGBTQ+ people. They offer emotional support, practical information, and signposting to other services. Available 24/7 for anyone who needs support.',
        website_url: 'https://switchboard.lgbt',
        phone: '0300 330 0630',
        category_id: categoryMap['Crisis Support'],
        keywords: ['lgbtq+', '24/7', 'support', 'information', 'listening'],
        priority: 10,
        tags: ['LGBTQ+', '24/7', 'Phone Support', 'Crisis', 'Support Group']
      },
      {
        title: 'MindLine Trans+',
        description: 'Trans-specific mental health support',
        content: 'MindLine Trans+ is a confidential mental health support helpline for people who identify as transgender, agender, gender fluid, or non-binary. Run by trans volunteers with lived experience.',
        website_url: 'https://bristolmind.org.uk/help-and-counselling/mindline-transplus/',
        phone: '0300 330 5468',
        category_id: categoryMap['Mental Health'],
        keywords: ['trans', 'mental health', 'transgender', 'non-binary', 'support'],
        priority: 9,
        tags: ['Trans', 'Mental Health', 'Phone Support', 'Peer Support']
      },
      {
        title: 'Galop LGBT+ Anti-Violence Charity',
        description: 'LGBTQ+ hate crime and domestic abuse support',
        content: 'Galop is the LGBT+ anti-violence charity. They provide support for LGBT+ people who have experienced hate crime, sexual violence, or domestic abuse. Services include helplines, advocacy, and counselling.',
        website_url: 'https://galop.org.uk',
        phone: '0207 704 2040',
        category_id: categoryMap['Legal Aid'],
        keywords: ['hate crime', 'domestic abuse', 'lgbtq+', 'violence', 'support'],
        priority: 9,
        tags: ['LGBTQ+', 'Legal', 'Crisis', 'Advocacy', 'Phone Support']
      }
    ]
    
    const createdResources = []
    
    for (const resource of resources) {
      const { tags, ...resourceData } = resource
      
      const { data, error } = await supabase
        .from('ivor_resources')
        .insert([resourceData])
        .select()
        
      if (error) {
        console.error(`❌ Error creating resource "${resource.title}":`, error)
      } else {
        console.log(`   ✅ Created resource: ${resource.title}`)
        createdResources.push({ ...data[0], tags })
      }
    }
    
    // 5. Link Resources with Tags
    console.log('\n🔗 Linking resources with tags...')
    
    for (const resource of createdResources) {
      if (resource.tags && resource.tags.length > 0) {
        for (const tagName of resource.tags) {
          const tagId = tagMap[tagName]
          
          if (tagId) {
            const { error } = await supabase
              .from('ivor_resource_tags')
              .insert({
                resource_id: resource.id,
                tag_id: tagId
              })
              
            if (error && !error.message.includes('duplicate')) {
              console.error(`❌ Error linking ${resource.title} with tag ${tagName}:`, error)
            } else {
              console.log(`   🏷️  Linked "${resource.title}" with tag "${tagName}"`)
            }
          }
        }
      }
    }
    
    console.log('\n🎉 Knowledge base seeding complete!')
    
    // 6. Verification
    await verifySetup()
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

async function verifySetup() {
  console.log('\n📊 Verifying setup...')
  
  try {
    const { data: categories, count: catCount } = await supabase
      .from('ivor_categories')
      .select('*', { count: 'exact' })
    
    const { data: resources, count: resCount } = await supabase
      .from('ivor_resources')
      .select('*', { count: 'exact' })
    
    const { data: tags, count: tagCount } = await supabase
      .from('ivor_tags')
      .select('*', { count: 'exact' })
      
    const { data: resourceTags, count: rtCount } = await supabase
      .from('ivor_resource_tags')
      .select('*', { count: 'exact' })
    
    console.log('\n✅ Verification Results:')
    console.log(`   📁 Categories: ${catCount}`)
    console.log(`   📚 Resources: ${resCount}`)
    console.log(`   🏷️  Tags: ${tagCount}`)
    console.log(`   🔗 Resource-Tag Links: ${rtCount}`)
    
    if (categories && categories.length > 0) {
      console.log('\n📋 Categories created:')
      categories.forEach(cat => {
        console.log(`   ${cat.icon} ${cat.name}`)
      })
    }
    
    if (resources && resources.length > 0) {
      console.log('\n📚 Sample resources:')
      resources.slice(0, 3).forEach(res => {
        console.log(`   • ${res.title} (${res.phone || res.website_url})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error)
  }
}

// Run the seeding
seedKnowledgeBase()
  .then(() => {
    console.log('\n🚀 IVOR Knowledge Base is ready!')
    console.log('\n🎯 Test with:')
    console.log('curl -X POST http://localhost:3001/api/chat \\')
    console.log('  -H "Content-Type: application/json" \\')
    console.log('  -d \'{"message": "I need housing help", "conversation_id": "test"}\'')
    process.exit(0)
  })
  .catch(error => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })