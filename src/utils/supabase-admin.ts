/**
 * Supabase Admin Utilities
 * 
 * This module provides admin functions to manage authentication
 * and resolve common issues like email confirmation requirements.
 */

import { createClient } from '@supabase/supabase-js'

// Initialize admin client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Auto-confirm a user's email address
 * This resolves the "invalid login credentials" issue for unconfirmed users
 */
export async function confirmUserEmail(userId: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true
    })

    if (error) {
      console.error('Failed to confirm user email:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error('Unexpected error confirming email:', error)
    return { success: false, error: 'Unexpected error' }
  }
}

/**
 * List all users with their confirmation status
 */
export async function listUsers() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      users: data.users.map(user => ({
        id: user.id,
        email: user.email,
        confirmed: !!user.email_confirmed_at,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }))
    }
  } catch (error) {
    console.error('Error listing users:', error)
    return { success: false, error: 'Unexpected error' }
  }
}

/**
 * Auto-confirm all unconfirmed users
 * Useful for development environments
 */
export async function confirmAllUnconfirmedUsers() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      return { success: false, error: error.message }
    }

    const unconfirmedUsers = data.users.filter(user => !user.email_confirmed_at)
    const results = []

    for (const user of unconfirmedUsers) {
      const result = await confirmUserEmail(user.id)
      results.push({
        email: user.email,
        ...result
      })
    }

    return {
      success: true,
      confirmed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }
  } catch (error) {
    console.error('Error confirming users:', error)
    return { success: false, error: 'Unexpected error' }
  }
}