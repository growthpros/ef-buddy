'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, onAuthStateChange, enableDemoMode, type AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refetchUser = async () => {
    setIsLoading(true)
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial user load
    refetchUser()

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetchUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component to protect routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  redirectTo: string = '/auth'
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        // Enable demo mode automatically in development
        if (process.env.NODE_ENV === 'development' || 
            window.location.hostname.includes('e2b.dev') ||
            window.location.hostname === 'localhost') {
          console.log('🎯 Enabling demo mode for development/testing')
          if (typeof window !== 'undefined') {
            localStorage.setItem('demo-mode', 'true')
          }
          // Trigger a re-render by refreshing the page
          window.location.reload()
          return
        }
        window.location.href = redirectTo
      }
    }, [isAuthenticated, isLoading])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span>Loading...</span>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null // Will redirect
    }

    return <WrappedComponent {...props} />
  }
}