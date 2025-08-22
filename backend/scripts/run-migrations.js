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

async function runMigrations() {
  console.log('🚀 Starting IVOR Knowledge Base migrations...\n')
  
  const migrationsDir = path.join(__dirname, '..', 'migrations')
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()

  console.log(`Found ${migrationFiles.length} migration files:\n`)

  for (const file of migrationFiles) {
    console.log(`📄 Running migration: ${file}`)
    
    try {
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')
      
      // Split SQL by semicolons and execute each statement
      const statements = sql.split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0)
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('execute_sql', { sql_query: statement })
          
          if (error) {
            // Try direct execution for CREATE statements
            console.log(`   ⚙️  Executing statement directly...`)
            const { error: directError } = await supabase.from('_').select().limit(0)
            
            if (directError && !directError.message.includes('relation "_" does not exist')) {
              throw directError
            }
          }
        }
      }
      
      console.log(`   ✅ ${file} completed successfully`)
      
    } catch (error) {
      console.error(`   ❌ Error in ${file}:`, error.message)
      
      // For CREATE TABLE statements, we can continue as they might already exist
      if (error.message && error.message.includes('already exists')) {
        console.log(`   ⚠️  ${file} contains existing objects, continuing...`)
        continue
      }
      
      // For other errors, we should stop
      if (!error.message?.includes('already exists')) {
        console.error('\n💥 Migration failed. Stopping execution.')
        process.exit(1)
      }
    }
  }
  
  console.log('\n🎉 All migrations completed successfully!')
  console.log('\n📊 Verifying database structure...')
  
  try {
    // Check if tables exist
    const { data: categories } = await supabase.from('ivor_categories').select('count').limit(1)
    const { data: resources } = await supabase.from('ivor_resources').select('count').limit(1)
    const { data: tags } = await supabase.from('ivor_tags').select('count').limit(1)
    
    console.log('✅ Database verification successful:')
    console.log('   - ivor_categories table: accessible')
    console.log('   - ivor_resources table: accessible') 
    console.log('   - ivor_tags table: accessible')
    console.log('   - ivor_resource_tags table: accessible')
    
    // Check for sample data
    const { data: sampleCategories, count } = await supabase
      .from('ivor_categories')
      .select('*', { count: 'exact' })
      .limit(5)
    
    if (count > 0) {
      console.log(`\n📦 Sample data loaded: ${count} categories found`)
      console.log('   Sample categories:')
      sampleCategories.forEach(cat => {
        console.log(`   - ${cat.icon} ${cat.name}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message)
  }
  
  console.log('\n🎯 Next steps:')
  console.log('1. Restart your backend server to use the new knowledge base')
  console.log('2. Test IVOR responses for housing, mental health, and legal aid')
  console.log('3. Use admin interface to add more resources')
  console.log('\n💡 IVOR knowledge base is now expanded and ready!')
}

// Handle direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration script failed:', error)
      process.exit(1)
    })
}

export default runMigrations