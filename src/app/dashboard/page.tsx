'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Calendar, Target, TrendingUp, CheckCircle } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { withAuth, useAuth } from '@/contexts/auth-context'

function DashboardPage() {
  const { user } = useAuth()

  const firstName = user?.email.split('@')[0] || 'there'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ready to track your executive function journey today?
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-blue-200 hover:border-blue-300 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  Daily Neuro-Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Track your mental state and calculate today's spoon capacity
                </p>
                <Link href="/neuro-check">
                  <Button className="w-full">
                    Start Daily Check
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:border-green-300 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  5-Day Streaks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Build habits and earn permanent spoon bonuses
                </p>
                <Link href="/neuro-check#streaks">
                  <Button variant="outline" className="w-full">
                    View Progress
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:border-purple-300 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Task Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Capture, organize, and complete tasks with spoon integration
                </p>
                <Link href="/tasks">
                  <Button className="w-full">
                    Manage Tasks
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Current Status */}
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                EF Buddy Development Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <span className="font-medium">Phase 2 (Partial)</span>
                    <span className="text-sm text-gray-600 ml-2">
                      - Daily Neuro-Check & 5-Day Streak System
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-60">
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                  <div>
                    <span className="font-medium">Phase 1</span>
                    <span className="text-sm text-gray-600 ml-2">
                      - Core Task Dashboard (Coming Next)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-60">
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                  <div>
                    <span className="font-medium">Phase 3</span>
                    <span className="text-sm text-gray-600 ml-2">
                      - Life Management Tools (Future)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white/70 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🎯 What's Available Now:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Spoon Theory-based energy tracking</li>
                  <li>✅ Dynamic capacity calculation based on mental state</li>
                  <li>✅ 5-day habit streak system with permanent bonuses</li>
                  <li>✅ Quick energy boosters for immediate help</li>
                  <li>✅ Secure user accounts with data persistence</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default withAuth(DashboardPage)