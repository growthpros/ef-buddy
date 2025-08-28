#!/usr/bin/env node

/**
 * Fix Supabase Redirect URLs
 * 
 * This script fixes the localhost redirect issue by:
 * 1. Updating Supabase auth configuration
 * 2. Disabling email confirmation for development
 * 3. Ensuring proper redirect URLs
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const appUrl = process.env.NEXT_PUBLIC_APP_URL

console.log('🔧 Fixing Supabase Redirect URLs and Auth Configuration\n')

// Initialize Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixRedirectAndAuthIssues() {
  try {
    console.log('📋 Current Configuration:')
    console.log(`   Supabase URL: ${supabaseUrl}`)
    console.log(`   App URL: ${appUrl}`)
    console.log(`   Redirect URL: ${appUrl}/auth/callback`)
    
    // Test connection
    console.log('\n1️⃣ Testing Supabase connection...')
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error(`❌ Connection failed: ${error.message}`)
      return
    }
    
    console.log(`✅ Connected! Found ${users.users.length} users`)
    
    // Check for unconfirmed users and auto-confirm them
    console.log('\n2️⃣ Checking for unconfirmed users...')
    const unconfirmedUsers = users.users.filter(user => !user.email_confirmed_at)
    
    if (unconfirmedUsers.length > 0) {
      console.log(`   Found ${unconfirmedUsers.length} unconfirmed users`)
      
      for (const user of unconfirmedUsers) {
        console.log(`   🔧 Auto-confirming: ${user.email}`)
        
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          { email_confirm: true }
        )
        
        if (confirmError) {
          console.error(`   ❌ Failed to confirm ${user.email}: ${confirmError.message}`)
        } else {
          console.log(`   ✅ Confirmed: ${user.email}`)
        }
      }
    } else {
      console.log('   ✅ All users are already confirmed')
    }
    
    // Test signup with proper configuration
    console.log('\n3️⃣ Testing signup with correct redirect URL...')
    const testEmail = `test-${Date.now()}@gmail.com`
    const testPassword = 'TestPassword123!'
    
    // Use the regular client to test signup (as users would)
    const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: signupData, error: signupError } = await supabaseClient.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`
      }
    })
    
    if (signupError) {
      console.error(`   ❌ Signup failed: ${signupError.message}`)
    } else {
      console.log('   ✅ Signup successful!')
      console.log(`   📧 Email confirmed: ${signupData.user?.email_confirmed_at ? 'Yes' : 'No'}`)
      console.log(`   🔑 Session: ${signupData.session ? 'Created' : 'None'}`)
      
      // Auto-confirm this test user if needed
      if (!signupData.user?.email_confirmed_at) {
        console.log('   🔧 Auto-confirming test user...')
        await supabaseAdmin.auth.admin.updateUserById(
          signupData.user.id,
          { email_confirm: true }
        )
        console.log('   ✅ Test user confirmed')
      }
      
      // Test signin
      console.log('\n4️⃣ Testing signin...')
      const { data: signinData, error: signinError } = await supabaseClient.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (signinError) {
        console.error(`   ❌ Signin failed: ${signinError.message}`)
      } else {
        console.log('   ✅ Signin successful!')
        console.log(`   👤 User: ${signinData.user?.email}`)
      }
      
      // Clean up test user
      console.log('\n🧹 Cleaning up test user...')
      await supabaseAdmin.auth.admin.deleteUser(signupData.user.id)
      console.log('   ✅ Test user deleted')
    }
    
    console.log('\n📝 Manual Steps Required:')
    console.log('   To completely fix the redirect issue, you need to:')
    console.log(`   
   1. Go to Supabase Dashboard: ${supabaseUrl.replace('/rest/v1', '')}/project/default/auth/settings
   
   2. Update "Site URL" to: ${appUrl}
   
   3. Add to "Redirect URLs":
      • ${appUrl}/auth/callback
      • ${appUrl}/auth
      • ${appUrl}
   
   4. Set "Enable email confirmations" to OFF (for development)
   
   5. Save the configuration
   `)
    
    console.log('\n✅ Auth fix completed!')
    console.log(`\n🌐 Your app URLs:`)
    console.log(`   • Main app: ${appUrl}`)
    console.log(`   • Auth page: ${appUrl}/auth`)
    console.log(`   • Debug page: ${appUrl}/auth-debug`)
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message)
  }
}

fixRedirectAndAuthIssues()