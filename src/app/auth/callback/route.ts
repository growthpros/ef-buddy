/**
 * Supabase Auth Callback Handler
 * 
 * This route handles the OAuth callback from Supabase after email confirmation
 * or social auth. It exchanges the auth code for a session and redirects appropriately.
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    console.log('Auth callback received:', { code: !!code, error, error_description })

    if (error) {
      console.error('Auth callback error:', error, error_description)
      // Redirect to auth page with error
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
      )
    }

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      // Exchange the code for a session
      const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)

      if (authError) {
        console.error('Error exchanging code for session:', authError)
        return NextResponse.redirect(
          new URL(`/auth?error=${encodeURIComponent(authError.message)}`, requestUrl.origin)
        )
      }

      if (authData.session) {
        console.log('Auth callback successful for user:', authData.user?.email)
        
        // Successful authentication - redirect to dashboard or intended page
        const redirectTo = requestUrl.searchParams.get('redirect_to') || '/neuro-check'
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      }
    }

    // If no code or session, redirect to auth page
    console.log('No auth code found, redirecting to auth page')
    return NextResponse.redirect(new URL('/auth', requestUrl.origin))

  } catch (error) {
    console.error('Auth callback unexpected error:', error)
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent('Authentication failed')}`, request.url)
    )
  }
}