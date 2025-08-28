#!/usr/bin/env node

/**
 * Create Test User Script
 * 
 * This script creates a fully functional test user that you can use immediately
 * to test the application without email validation issues.
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createTestUser() {
  console.log('👤 Creating Test User for EF Buddy\n')
  
  // User credentials you can use
  const testUser = {
    email: 'demo@efbuddy.test',
    password: 'Demo123!',
    firstName: 'Demo',
    lastName: 'User'
  }
  
  try {
    console.log('🔍 Checking if test user already exists...')
    
    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.email === testUser.email)
    
    if (existingUser) {
      console.log('✅ Test user already exists!')
      console.log(`   📧 Email: ${existingUser.email}`)
      console.log(`   🆔 ID: ${existingUser.id}`)
      console.log(`   ✅ Confirmed: ${existingUser.email_confirmed_at ? 'Yes' : 'No'}`)
      
      // Ensure the user is confirmed
      if (!existingUser.email_confirmed_at) {
        console.log('🔧 Confirming existing user...')
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          email_confirm: true
        })
        console.log('✅ User confirmed!')
      }
      
      console.log('\n🎉 Ready to use!')
      console.log(`\n🔗 Login at: https://3000-ieug5a2tg8rtf7jx01wvx-6532622b.e2b.dev/auth`)
      console.log(`📧 Email: ${testUser.email}`)
      console.log(`🔑 Password: ${testUser.password}`)
      return
    }
    
    console.log('👤 Creating new test user...')
    
    // Create user using admin API (bypasses email validation)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true, // Auto-confirm
      user_metadata: {
        first_name: testUser.firstName,
        last_name: testUser.lastName,
        full_name: `${testUser.firstName} ${testUser.lastName}`
      }
    })
    
    if (createError) {
      console.error('❌ Failed to create user:', createError.message)
      return
    }
    
    console.log('✅ Test user created successfully!')
    console.log(`   📧 Email: ${newUser.user.email}`)
    console.log(`   🆔 ID: ${newUser.user.id}`)
    console.log(`   ✅ Confirmed: ${newUser.user.email_confirmed_at ? 'Yes' : 'No'}`)
    
    console.log('\n🎉 Ready to use!')
    console.log(`\n🔗 Login at: https://3000-ieug5a2tg8rtf7jx01wvx-6532622b.e2b.dev/auth`)
    console.log(`📧 Email: ${testUser.email}`)
    console.log(`🔑 Password: ${testUser.password}`)
    
    console.log('\n📋 What you can do now:')
    console.log('• ✅ Login immediately with the credentials above')
    console.log('• ✅ Access the full neuro-check system')
    console.log('• ✅ Track streaks and earn permanent spoon bonuses')
    console.log('• ✅ Test the Dynamic Capacity System')
    console.log('• ✅ Share the app with others for testing')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

createTestUser()