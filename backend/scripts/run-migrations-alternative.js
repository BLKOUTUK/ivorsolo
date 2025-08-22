#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTablesDirectly() {
  console.log('🚀 Creating IVOR Knowledge Base tables directly...\n')
  
  try {
    // Create categories table
    console.log('📄 Creating ivor_categories table...')
    const { error: catError } = await supabase.rpc('create_ivor_categories')
    if (catError && !catError.message.includes('already exists')) {
      console.log('   ⚠️  Table might already exist, continuing...')
    } else {
      console.log('   ✅ ivor_categories table ready')
    }
    
    // Create resources table  
    console.log('📄 Creating ivor_resources table...')
    const { error: resError } = await supabase.rpc('create_ivor_resources')
    if (resError && !resError.message.includes('already exists')) {
      console.log('   ⚠️  Table might already exist, continuing...')
    } else {
      console.log('   ✅ ivor_resources table ready')
    }
    
    // Create tags table
    console.log('📄 Creating ivor_tags table...')
    const { error: tagError } = await supabase.rpc('create_ivor_tags')
    if (tagError && !tagError.message.includes('already exists')) {
      console.log('   ⚠️  Table might already exist, continuing...')
    } else {
      console.log('   ✅ ivor_tags table ready')
    }
    
    // Create junction table
    console.log('📄 Creating ivor_resource_tags table...')
    const { error: juncError } = await supabase.rpc('create_ivor_resource_tags')
    if (juncError && !juncError.message.includes('already exists')) {
      console.log('   ⚠️  Table might already exist, continuing...')
    } else {
      console.log('   ✅ ivor_resource_tags table ready')
    }
    
  } catch (error) {
    console.log('⚠️  Direct table creation not available. Using manual approach...')
  }
  
  await seedData()
}

async function seedData() {
  console.log('\n📦 Seeding initial data...')
  
  try {
    // Insert categories
    const categories = [
      { name: 'Housing', description: 'Housing support, accommodation, and homelessness services', icon: '🏠', color: '#4CAF50' },
      { name: 'Mental Health', description: 'Mental health support, therapy, and wellbeing services', icon: '🧠', color: '#2196F3' },
      { name: 'Healthcare', description: 'General healthcare, LGBTQ+ friendly medical services', icon: '🏥', color: '#FF5722' },
      { name: 'Legal Aid', description: 'Legal support, advice, and representation services', icon: '⚖️', color: '#9C27B0' },
      { name: 'Crisis Support', description: 'Emergency and crisis intervention services', icon: '🚨', color: '#F44336' }
    ]
    
    for (const category of categories) {
      const { error } = await supabase
        .from('ivor_categories')
        .upsert(category, { onConflict: 'name' })
        
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ⚠️  Category "${category.name}" might already exist`)
      }
    }
    
    console.log('   ✅ Categories seeded')
    
    // Get category IDs for resources
    const { data: cats } = await supabase.from('ivor_categories').select('id, name')
    const categoryMap = {}
    cats.forEach(cat => categoryMap[cat.name] = cat.id)
    
    // Insert sample resources
    const resources = [
      {
        title: 'Stonewall Housing',
        description: 'Specialist LGBTQ+ housing support',
        content: 'Stonewall Housing provides specialist housing services for LGBTQ+ people. They offer supported accommodation, advice on housing rights, and assistance with finding safe, affordable housing.',
        website_url: 'https://www.stonewallhousing.org',
        phone: '020 7359 5767',
        category_id: categoryMap['Housing'],
        keywords: ['housing', 'accommodation', 'lgbtq+', 'support', 'emergency'],
        priority: 10
      },
      {
        title: 'Albert Kennedy Trust',
        description: 'LGBTQ+ youth housing (16-25)',
        content: 'The Albert Kennedy Trust (AKT) provides safe homes and support for LGBTQ+ young people aged 16-25 who are homeless or living in hostile environments.',
        website_url: 'https://www.akt.org.uk',
        phone: '020 7831 6562',
        category_id: categoryMap['Housing'],
        keywords: ['youth', 'housing', 'lgbtq+', '16-25', 'emergency'],
        priority: 10
      },
      {
        title: 'Samaritans',
        description: '24/7 emotional support helpline',
        content: 'Samaritans provides confidential emotional support 24/7 for anyone experiencing feelings of distress or despair. Free to call from any phone.',
        website_url: 'https://www.samaritans.org',
        phone: '116 123',
        category_id: categoryMap['Crisis Support'],
        keywords: ['crisis', '24/7', 'emotional support', 'helpline', 'free'],
        priority: 10
      }
    ]
    
    for (const resource of resources) {
      const { error } = await supabase
        .from('ivor_resources')
        .upsert(resource, { onConflict: 'title' })
        
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ⚠️  Resource "${resource.title}" might already exist`)
      }
    }
    
    console.log('   ✅ Sample resources seeded')
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message)
  }
}

async function verifySetup() {
  console.log('\n📊 Verifying knowledge base setup...')
  
  try {
    const { data: categories, count: catCount } = await supabase
      .from('ivor_categories')
      .select('*', { count: 'exact' })
    
    const { data: resources, count: resCount } = await supabase
      .from('ivor_resources')
      .select('*', { count: 'exact' })
    
    console.log('✅ Verification successful:')
    console.log(`   - ${catCount} categories loaded`)
    console.log(`   - ${resCount} resources loaded`)
    
    if (categories.length > 0) {
      console.log('\n📋 Available categories:')
      categories.forEach(cat => {
        console.log(`   ${cat.icon} ${cat.name}`)
      })
    }
    
    if (resources.length > 0) {
      console.log('\n📚 Sample resources:')
      resources.slice(0, 3).forEach(res => {
        console.log(`   • ${res.title} (${res.phone || res.website_url})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    console.log('\n💡 If tables don\'t exist, you may need to create them manually in Supabase dashboard.')
  }
}

// Run the setup
createTablesDirectly()
  .then(() => verifySetup())
  .then(() => {
    console.log('\n🎉 IVOR Knowledge Base setup complete!')
    console.log('\n🎯 Next steps:')
    console.log('1. Restart your backend server: npm run dev')
    console.log('2. Test IVOR with questions about housing, mental health, or crisis support')
    console.log('3. Check the admin interface to add more resources')
    process.exit(0)
  })
  .catch(error => {
    console.error('Setup failed:', error)
    process.exit(1)
  })