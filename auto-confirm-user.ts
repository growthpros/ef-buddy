/**
 * Auto-confirm user after signup
 * This resolves the localhost redirect issue by confirming users immediately
 */

import { supabaseAdmin } from '@/utils/supabase-admin'

export async function autoConfirmUser(userId: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true
    })

    if (error) {
      console.error('Failed to auto-confirm user:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error('Auto-confirm user error:', error)
    return { success: false, error: 'Failed to confirm user' }
  }
}