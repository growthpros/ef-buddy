'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { signIn, isValidEmail, type SignInData } from '@/lib/auth'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
  redirectTo?: string
}

export function LoginForm({ onSuccess, onSwitchToRegister, redirectTo = '/dashboard' }: LoginFormProps) {
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn(formData)
      
      if (result.success) {
        // Success! Redirect or call success callback
        if (onSuccess) {
          onSuccess()
        } else {
          window.location.href = redirectTo
        }
      } else {
        setError(result.error || 'Failed to sign in')
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first')
      return
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { resetPassword } = await import('@/lib/auth')
      const result = await resetPassword(formData.email)
      
      if (result.success) {
        setShowForgotPassword(true)
        setError(null)
      } else {
        setError(result.error || 'Failed to send reset email')
      }
    } catch (error) {
      setError('Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (showForgotPassword) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-500 bg-green-50">
            <Mail className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              <strong>Check your email!</strong> We've sent a password reset link to {formData.email}.
              Click the link in the email to reset your password.
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowForgotPassword(false)}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Brain className="h-6 w-6 text-blue-500" />
          Welcome Back
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Sign in to your EF Buddy account
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-500"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {onSwitchToRegister && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-500 font-medium"
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}