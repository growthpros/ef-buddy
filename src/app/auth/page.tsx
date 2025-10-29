'use client'

import React, { useState, useEffect } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { getCurrentUser } from '@/lib/auth'

type AuthMode = 'login' | 'register'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          // User is already authenticated, redirect to dashboard
          window.location.href = '/dashboard'
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful authentication
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="py-8 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-2">
          EF Buddy
        </h1>
        <p className="text-lg text-secondary-600">
          Executive Function Support for Neurodivergent Minds
        </p>
      </div>

      {/* Auth Forms */}
      <div className="flex items-center justify-center px-4 pb-16">
        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setMode('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </div>

      {/* Features Preview */}
      <div className="bg-white/50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-8">
            Why Join EF Buddy?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="font-semibold mb-2">Daily Neuro-Checks</h3>
              <p className="text-sm text-gray-600">
                Track your mental state and energy levels with our spoon theory-based system
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-semibold mb-2">5-Day Habit Streaks</h3>
              <p className="text-sm text-gray-600">
                Build sustainable habits and earn permanent energy bonuses
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Energy Boosters</h3>
              <p className="text-sm text-gray-600">
                Quick actions to boost your energy throughout the day
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}