/**
 * EF Buddy - Authentication System
 * 
 * Comprehensive user authentication using Supabase Auth
 * Supports email/password registration, login, logout, and user management
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { AuthError, User } from '@supabase/supabase-js'

const supabase = createClientComponentClient()

// =====================================================
// TYPES
// =====================================================

export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
  createdAt: string
  lastSignIn: string
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  error?: string
}

export interface SignUpData {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface SignInData {
  email: string
  password: string
}

// =====================================================
// AUTHENTICATION FUNCTIONS
// =====================================================

/**
 * Sign up a new user with email and password
 */
export async function signUp(data: SignUpData): Promise<AuthResult> {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user account' }
    }

    return {
      success: true,
      user: transformUser(authData.user)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

/**
 * Sign in existing user with email and password
 */
export async function signIn(data: SignInData): Promise<AuthResult> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Authentication failed' }
    }

    return {
      success: true,
      user: transformUser(authData.user)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign out'
    }
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return transformUser(user)
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user is currently authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Reset password via email
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reset email'
    }
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update password'
    }
  }
}

/**
 * Update user email
 */
export async function updateEmail(newEmail: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update email'
    }
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback(transformUser(session.user))
    } else {
      callback(null)
    }
  })
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Transform Supabase User to our AuthUser format
 */
function transformUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email || '',
    emailVerified: !!user.email_confirmed_at,
    createdAt: user.created_at,
    lastSignIn: user.last_sign_in_at || user.created_at
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}