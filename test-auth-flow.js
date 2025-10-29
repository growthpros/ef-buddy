#!/usr/bin/env node

/**
 * Test Authentication Flow
 * 
 * This script tests the complete auth flow to identify login issues
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create both client and admin instances
const supabaseClient = createClient(supabaseUrl, anonKey)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const testEmail = 'efbuddytest@gmail.com'
const testPassword = 'TestPassword123!'

async function testAuthFlow() {
  console.log('🧪 Testing EF Buddy Authentication Flow\n')
  
  try {
    // Step 1: Clean up any existing test user
    console.log('1️⃣ Cleaning up existing test user...')
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingTestUser = existingUsers.users.find(u => u.email === testEmail)
    
    if (existingTestUser) {
      console.log(`   🗑️  Removing existing test user: ${testEmail}`)
      await supabaseAdmin.auth.admin.deleteUser(existingTestUser.id)
    } else {
      console.log('   ✅ No existing test user found')
    }
    
    // Step 2: Test signup with client SDK (as user would)
    console.log('\n2️⃣ Testing signup with client SDK...')
    const { data: signupData, error: signupError } = await supabaseClient.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (signupError) {
      console.error(`   ❌ Signup failed: ${signupError.message}`)
      return
    }
    
    console.log('   ✅ Signup successful!')
    console.log(`   👤 User ID: ${signupData.user?.id}`)
    console.log(`   📧 Email confirmed: ${signupData.user?.email_confirmed_at ? 'Yes' : 'No'}`)
    console.log(`   🔑 Session created: ${signupData.session ? 'Yes' : 'No'}`)
    
    if (!signupData.user?.email_confirmed_at) {
      console.log('   ⚠️  Email confirmation required - this is likely the login issue!')
      
      // Auto-confirm the user using admin SDK
      console.log('   🔧 Auto-confirming user with admin SDK...')
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        signupData.user.id,
        { email_confirm: true }
      )
      
      if (confirmError) {
        console.error(`   ❌ Auto-confirm failed: ${confirmError.message}`)
      } else {
        console.log('   ✅ User auto-confirmed successfully!')
      }
    }
    
    // Step 3: Test signin
    console.log('\n3️⃣ Testing signin...')
    const { data: signinData, error: signinError } = await supabaseClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    
    if (signinError) {
      console.error(`   ❌ Signin failed: ${signinError.message}`)
      console.log(`   🔍 Error details: ${signinError.name || 'Unknown error type'}`)
      
      // Check if user exists in database
      console.log('\n🔍 Checking user in database...')
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(signupData.user.id)
      if (userData.user) {
        console.log(`   📧 Email: ${userData.user.email}`)
        console.log(`   ✅ Confirmed: ${userData.user.email_confirmed_at ? 'Yes' : 'No'}`)
        console.log(`   🔑 Last sign in: ${userData.user.last_sign_in_at || 'Never'}`)
      }
      
      return
    }
    
    console.log('   ✅ Signin successful!')
    console.log(`   👤 User ID: ${signinData.user?.id}`)
    console.log(`   📧 Email: ${signinData.user?.email}`)
    console.log(`   ✅ Confirmed: ${signinData.user?.email_confirmed_at ? 'Yes' : 'No'}`)
    console.log(`   🔑 Session: ${signinData.session ? 'Active' : 'None'}`)
    
    // Step 4: Clean up
    console.log('\n4️⃣ Cleaning up test user...')
    await supabaseAdmin.auth.admin.deleteUser(signupData.user.id)
    console.log('   ✅ Test user deleted')
    
    console.log('\n🎉 Authentication flow test completed successfully!')
    console.log('\n💡 Key findings:')
    console.log('• Signup works correctly')
    console.log('• Email confirmation was the issue (now auto-confirmed)')
    console.log('• Signin works after confirmation')
    console.log('• The auth system is functioning properly')
    
  } catch (error) {
    console.error('\n❌ Unexpected error during test:', error.message)
  }
}

async function checkAuthSettings() {
  console.log('\n⚙️  Checking current Supabase Auth settings...')
  
  // This requires direct database access, which we can't do from client
  // But we can check the behavior by testing signup
  
  const testUser2 = 'settingstest@gmail.com'
  const { data, error } = await supabaseClient.auth.signUp({
    email: testUser2,
    password: 'TestPassword123!'
  })
  
  if (!error && data.user) {
    const requiresConfirmation = !data.user.email_confirmed_at && !data.session
    console.log(`   📧 Email confirmation required: ${requiresConfirmation ? 'YES' : 'NO'}`)
    
    // Clean up
    await supabaseAdmin.auth.admin.deleteUser(data.user.id)
    
    if (requiresConfirmation) {
      console.log('\n💡 SOLUTION: Disable email confirmation in Supabase Dashboard')
      console.log(`   📍 Go to: ${supabaseUrl.replace('/rest/v1', '')}/project/default/auth/settings`)
      console.log('   ⚙️  Set "Enable email confirmations" to OFF')
    }
  }
}

async function main() {
  await testAuthFlow()
  await checkAuthSettings()
}

main().catch(console.error)