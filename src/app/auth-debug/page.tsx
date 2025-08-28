'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthDebugPage() {
  const [results, setResults] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClientComponentClient()

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSupabaseConnection = async () => {
    try {
      addResult('Testing Supabase connection...')
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        addResult(`❌ Connection error: ${error.message}`)
      } else {
        addResult(`✅ Connected! Session: ${data.session ? 'Active' : 'None'}`)
        if (data.session?.user) {
          addResult(`User: ${data.session.user.email} (confirmed: ${data.session.user.email_confirmed_at ? 'Yes' : 'No'})`)
        }
      }
    } catch (error) {
      addResult(`❌ Connection failed: ${error}`)
    }
  }

  const testSignUp = async () => {
    if (!email || !password) {
      addResult('❌ Please enter email and password')
      return
    }

    try {
      addResult(`🔄 Attempting signup for: ${email}`)
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (error) {
        addResult(`❌ Signup error: ${error.message}`)
      } else {
        addResult(`✅ Signup successful!`)
        addResult(`User ID: ${data.user?.id}`)
        addResult(`Email confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`)
        addResult(`Session: ${data.session ? 'Created' : 'None'}`)
        
        if (!data.user?.email_confirmed_at) {
          addResult(`⚠️ EMAIL CONFIRMATION REQUIRED - Check your email for confirmation link`)
        }
      }
    } catch (error) {
      addResult(`❌ Signup failed: ${error}`)
    }
  }

  const testSignIn = async () => {
    if (!email || !password) {
      addResult('❌ Please enter email and password')
      return
    }

    try {
      addResult(`🔄 Attempting signin for: ${email}`)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        addResult(`❌ Signin error: ${error.message}`)
        addResult(`Error code: ${error.name || 'Unknown'}`)
      } else {
        addResult(`✅ Signin successful!`)
        addResult(`User ID: ${data.user?.id}`)
        addResult(`Email confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`)
        addResult(`Session: ${data.session ? 'Active' : 'None'}`)
      }
    } catch (error) {
      addResult(`❌ Signin failed: ${error}`)
    }
  }

  const checkAuthSettings = async () => {
    try {
      addResult('🔄 Checking Supabase Auth settings...')
      
      // Check if we can access the settings (this might not work from client)
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      })
      
      if (response.ok) {
        addResult('✅ Supabase API accessible')
      } else {
        addResult(`❌ Supabase API error: ${response.status} ${response.statusText}`)
      }

      // Check current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        addResult(`Current user: ${user.email} (ID: ${user.id})`)
        addResult(`Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
      } else {
        addResult('No current user')
      }
      
    } catch (error) {
      addResult(`❌ Settings check failed: ${error}`)
    }
  }

  const fixUnconfirmedUsers = async () => {
    try {
      addResult('🔧 Fixing unconfirmed users...')
      
      const response = await fetch('/api/admin/confirm-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success) {
        addResult(`✅ ${result.message}`)
        if (result.confirmed > 0) {
          addResult(`📧 Confirmed ${result.confirmed} users`)
          addResult('🎉 Users can now log in without email confirmation!')
        }
      } else {
        addResult(`❌ Fix failed: ${result.error}`)
      }
      
    } catch (error) {
      addResult(`❌ Fix failed: ${error}`)
    }
  }

  return (
    <div className="debug-page min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Authentication Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="password123"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={testSupabaseConnection}>Test Connection</Button>
              <Button onClick={checkAuthSettings} variant="outline">Check Settings</Button>
              <Button onClick={testSignUp} variant="outline">Test Signup</Button>
              <Button onClick={testSignIn} variant="outline">Test Signin</Button>
              <Button onClick={fixUnconfirmedUsers} className="bg-green-600 hover:bg-green-700">🔧 Fix Login Issues</Button>
              <Button onClick={() => setResults([])} variant="outline">Clear</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Debug Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-gray-500">Click buttons above to run tests...</div>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="mb-1">{result}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💡 Common Auth Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">🔐 Email Confirmation Required</h4>
              <p className="text-sm text-yellow-700">
                Most likely issue: Supabase requires email confirmation by default. 
                After signup, check your email for a confirmation link before trying to sign in.
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">⚙️ Auth Settings</h4>
              <p className="text-sm text-blue-700">
                To disable email confirmation: Go to Supabase Dashboard → Authentication → Settings → 
                Turn off "Enable email confirmations"
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">🧪 Testing Steps</h4>
              <ol className="text-sm text-green-700 space-y-1">
                <li>1. Enter email/password above</li>
                <li>2. Click "Test Connection" to verify Supabase works</li>
                <li>3. Click "Test Signup" to create account</li>
                <li>4. Check email for confirmation (if required)</li>
                <li>5. Click "Test Signin" to verify login works</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}