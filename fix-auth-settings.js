#!/usr/bin/env node

/**
 * Fix Authentication Settings Script
 * 
 * This script helps resolve the "invalid login credentials" issue by:
 * 1. Checking current auth settings
 * 2. Disabling email confirmation requirement (for development)
 * 3. Testing the auth flow
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure .env.local contains:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  console.log('🔧 EF Buddy Authentication Fix\n')
  
  try {
    // Test connection
    console.log('1️⃣ Testing Supabase connection...')
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error(`❌ Connection failed: ${error.message}`)
      console.log('\n💡 Possible solutions:')
      console.log('- Verify SUPABASE_SERVICE_ROLE_KEY in .env.local')
      console.log('- Check Supabase project status in dashboard')
      return
    }
    
    console.log(`✅ Connected! Found ${data.users.length} users in database`)
    
    // List existing users and their confirmation status
    console.log('\n2️⃣ Current users:')
    if (data.users.length === 0) {
      console.log('   No users found')
    } else {
      data.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`)
        console.log(`      - ID: ${user.id}`)
        console.log(`      - Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
        console.log(`      - Created: ${new Date(user.created_at).toLocaleString()}`)
      })
    }
    
    // Find unconfirmed users and confirm them
    console.log('\n3️⃣ Fixing unconfirmed users...')
    const unconfirmedUsers = data.users.filter(user => !user.email_confirmed_at)
    
    if (unconfirmedUsers.length === 0) {
      console.log('   ✅ All users are already confirmed')
    } else {
      for (const user of unconfirmedUsers) {
        console.log(`   🔄 Confirming user: ${user.email}`)
        
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          user.id,
          { email_confirm: true }
        )
        
        if (confirmError) {
          console.error(`   ❌ Failed to confirm ${user.email}: ${confirmError.message}`)
        } else {
          console.log(`   ✅ Confirmed ${user.email}`)
        }
      }
    }
    
    // Provide manual instructions for Supabase dashboard
    console.log('\n4️⃣ Recommended Dashboard Settings:')
    console.log('   To prevent this issue in the future, update these settings in your Supabase dashboard:')
    console.log(`   
   📍 Go to: ${supabaseUrl.replace('/rest/v1', '')}/project/default/auth/settings
   
   ⚙️  Authentication Settings:
   • Enable email confirmations: ❌ DISABLE (for development)
   • Enable secure email change: ❌ DISABLE (optional)
   • Enable email change confirmations: ❌ DISABLE (optional)
   
   💡 This allows users to sign in immediately after registration
      without needing to confirm their email address.`)
    
    console.log('\n5️⃣ Testing Authentication Flow:')
    console.log('   Now test the authentication in your app:')
    console.log(`   1. Go to: https://3000-ieug5a2tg8rtf7jx01wvx-6532622b.e2b.dev/auth-debug`)
    console.log('   2. Enter a test email and password')
    console.log('   3. Click "Test Signup" then "Test Signin"')
    console.log('   4. Both should work without requiring email confirmation')
    
    console.log('\n✅ Authentication fix completed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.log('\n💡 If issues persist:')
    console.log('1. Check your Supabase project status')
    console.log('2. Verify your service role key has admin permissions')
    console.log('3. Try manually disabling email confirmation in the dashboard')
  }
}

main()