/**
 * Enhanced Signup API
 * 
 * This endpoint handles user registration and automatically confirms
 * the user's email to prevent redirect issues.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Regular client for user operations
const supabase = createClient(supabaseUrl, anonKey)

// Admin client for confirmation
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Step 1: Sign up the user
    console.log(`Signing up user: ${email}`)
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (signupError) {
      console.error('Signup error:', signupError)
      return NextResponse.json({
        success: false,
        error: signupError.message
      }, { status: 400 })
    }

    if (!signupData.user) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create user account'
      }, { status: 400 })
    }

    // Step 2: Auto-confirm the user to prevent email confirmation issues
    console.log(`Auto-confirming user: ${email}`)
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
      signupData.user.id,
      { email_confirm: true }
    )

    if (confirmError) {
      console.error('Failed to auto-confirm user:', confirmError)
      // Don't fail the signup if confirmation fails - user can still be confirmed later
    } else {
      console.log(`Successfully auto-confirmed user: ${email}`)
    }

    // Step 3: Sign in the confirmed user to create a session
    console.log(`Signing in confirmed user: ${email}`)
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signinError) {
      console.error('Auto-signin error:', signinError)
      // Return success but indicate they need to sign in manually
      return NextResponse.json({
        success: true,
        user: {
          id: signupData.user.id,
          email: signupData.user.email,
          emailVerified: !confirmError,
        },
        needsSignIn: true,
        message: 'Account created successfully. Please sign in to continue.'
      })
    }

    // Success - user is registered, confirmed, and signed in
    return NextResponse.json({
      success: true,
      user: {
        id: signinData.user.id,
        email: signinData.user.email,
        emailVerified: true,
      },
      session: !!signinData.session,
      message: 'Account created and signed in successfully!'
    })

  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}