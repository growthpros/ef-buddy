'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { signOut } from '@/lib/auth'

export function Header() {
  const { user, isAuthenticated } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-gray-900">EF Buddy</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/neuro-check" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Daily Check
                </Link>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <Link 
                href="/auth" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </Link>
            )}
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}