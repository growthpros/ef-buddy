#!/usr/bin/env node

/**
 * Fix Supabase Bounce Rate Issue
 * 
 * This script helps resolve the email bounce issue by:
 * 1. Confirming all unconfirmed users (prevents future bounces)
 * 2. Providing steps to disable email confirmations
 * 3. Setting up the auth system to work without email verification
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚨 Resolving Supabase Email Bounce Issue\n')

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function fixBounceIssue() {
  try {
    console.log('1️⃣ Analyzing current user status...')
    
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Failed to fetch users:', error.message)
      return
    }
    
    const totalUsers = users.users.length
    const confirmedUsers = users.users.filter(u => u.email_confirmed_at).length
    const unconfirmedUsers = users.users.filter(u => !u.email_confirmed_at)
    
    console.log(`   📊 Total users: ${totalUsers}`)
    console.log(`   ✅ Confirmed users: ${confirmedUsers}`)
    console.log(`   ❌ Unconfirmed users: ${unconfirmedUsers.length}`)
    
    if (unconfirmedUsers.length > 0) {
      console.log('\n2️⃣ Auto-confirming unconfirmed users to prevent bounces...')
      
      for (const user of unconfirmedUsers) {
        console.log(`   🔧 Confirming: ${user.email}`)
        
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          { email_confirm: true }
        )
        
        if (confirmError) {
          console.error(`   ❌ Failed: ${user.email} - ${confirmError.message}`)
        } else {
          console.log(`   ✅ Confirmed: ${user.email}`)
        }
      }
    } else {
      console.log('\n2️⃣ ✅ All users are already confirmed')
    }
    
    console.log('\n3️⃣ 🚨 CRITICAL: Manual Steps Required')
    console.log('   To stop future bounce emails, you MUST disable email confirmations:')
    console.log(`
   📍 Go to Supabase Dashboard:
   ${supabaseUrl.replace('/rest/v1', '')}/project/default/auth/settings
   
   ⚙️ Find "Enable email confirmations" and set to: OFF
   ⚙️ Find "Enable secure email change" and set to: OFF  
   ⚙️ Save the configuration
   
   💡 This prevents Supabase from sending confirmation emails that bounce
   `)
    
    console.log('4️⃣ ✅ Alternative Solutions Available')
    console.log('   Our authentication system already works without email confirmation:')
    console.log(`
   • Demo user ready: demo@efbuddy.test / Demo123!
   • Login page: ${process.env.NEXT_PUBLIC_APP_URL}/auth
   • Users can register and login immediately
   • No email verification required
   `)
    
    console.log('5️⃣ 📧 Contact Supabase Support')
    console.log('   If email privileges are already restricted:')
    console.log(`
   • Explain that you've disabled email confirmations
   • Mention this is a development project with test users
   • Reference your project ID: ${supabaseUrl.split('.')[0].split('//')[1]}
   • Request restoration of email privileges for production use
   `)
    
    console.log('\n✅ Bounce issue resolution completed!')
    console.log('Remember: Disable email confirmations in dashboard to prevent future issues.')
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message)
  }
}

fixBounceIssue()