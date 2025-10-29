# Complete Neuro-Check System Implementation for Executive Buddy

## Overview
This is a comprehensive Dynamic Capacity System based on Spoon Theory for ADHD/neurodivergent individuals. It calculates daily energy capacity using mood, energy levels, brain fog, burnout indicators, and habit streaks.

## Core Components

### 1. Main Neuro-Check Page (`/neuro-check/page.tsx`)

```tsx
'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Lightbulb, Target, Heart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { InteractiveNeuroCheck } from '@/components/neuro-check/interactive-neuro-check'

function NeuroCheckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Executive Buddy
            </Link>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                <Brain className="h-8 w-8 text-blue-500" />
                Daily Neuro-Check
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Dynamic Capacity System - Track your mental state and let AI calculate your optimal daily capacity.
              </p>
            </div>
          </div>

          {/* Interactive Neuro-Check Widget */}
          <InteractiveNeuroCheck />

          {/* Educational Content */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                🥄 Understanding "Spoons" - Your Daily Energy Units
              </CardTitle>
              <CardDescription>
                Learn how to estimate your energy and understand what the numbers mean
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <h4 className="font-semibold text-pink-900 mb-2">What is Spoon Theory?</h4>
                <p className="text-sm text-pink-800 mb-2">
                  <strong>Spoon Theory</strong> was created by Christine Miserandus to explain chronic illness energy management. 
                  It's widely used in ADHD/neurodivergent communities to understand daily energy limits.
                </p>
                <p className="text-sm text-pink-800">
                  <strong>The concept:</strong> You wake up with limited "spoons" (energy units). Each task costs spoons. 
                  When you're out of spoons, you're done - pushing further leads to burnout.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">🌅 Morning Spoon Check</h4>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <div className="font-medium text-green-900">8-10 Spoons: Great Morning</div>
                      <div className="text-sm text-green-700">
                        Slept well, feeling energized, ready to tackle challenging tasks and make decisions
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <div className="font-medium text-blue-900">6-7 Spoons: Good Morning</div>
                      <div className="text-sm text-blue-700">
                        Normal energy, can handle regular tasks at a steady pace
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <div className="font-medium text-yellow-900">4-5 Spoons: Low Energy</div>
                      <div className="text-sm text-yellow-700">
                        Need to pace yourself, focus on essentials, take more breaks
                      </div>
                    </div>
                    
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <div className="font-medium text-red-900">1-3 Spoons: Survival Mode</div>
                      <div className="text-sm text-red-700">
                        Very low energy, gentle tasks only, consider this a rest day
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">⚡ Task Energy Costs</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="font-medium text-gray-900">1 Spoon: Simple Tasks</div>
                      <div className="text-sm text-gray-700">
                        Checking email, making coffee, basic self-care
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="font-medium text-gray-900">2 Spoons: Routine Tasks</div>
                      <div className="text-sm text-gray-700">
                        Grocery shopping, regular meetings, household chores
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="font-medium text-gray-900">3 Spoons: Focused Work</div>
                      <div className="text-sm text-gray-700">
                        Concentrated tasks, difficult conversations, problem-solving
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="font-medium text-gray-900">4+ Spoons: High Demands</div>
                      <div className="text-sm text-gray-700">
                        Presentations, major decisions, job interviews, complex projects
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity Expansion Guide */}
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-500 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                📈 How to Get More Spoons (Capacity Expansion)
              </CardTitle>
              <CardDescription>
                Practical ways to increase your daily energy capacity sustainably
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-100 p-4 rounded-lg border border-green-300">
                <h4 className="font-semibold text-green-900 mb-3">🚀 High-Impact Spoon Boosters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-green-200">
                      <div className="font-medium text-green-900">💊 ADHD Medication Optimization</div>
                      <div className="text-sm text-green-800">+2-3 spoons daily</div>
                      <div className="text-xs text-green-700 mt-1">Work with doctor to find right type/dose</div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <div className="font-medium text-blue-900">🛌 Sleep Quality Improvement</div>
                      <div className="text-sm text-blue-800">+1-2 spoons daily</div>
                      <div className="text-xs text-blue-700 mt-1">7-9 hours, consistent schedule, sleep hygiene</div>
                    </div>
                  </div>
                
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <div className="font-medium text-purple-900">🏃 Regular Exercise</div>
                      <div className="text-sm text-purple-800">+1-2 spoons daily</div>
                      <div className="text-xs text-purple-700 mt-1">Even 10-15 min walks help ADHD brains</div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-orange-200">
                      <div className="font-medium text-orange-900">🧘 Stress Management</div>
                      <div className="text-sm text-orange-800">+1-2 spoons daily</div>
                      <div className="text-xs text-orange-700 mt-1">Meditation, therapy, breathing exercises</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white/70 rounded border border-green-400">
                  <p className="text-sm font-medium text-green-900">
                    🎯 <strong>Potential Total:</strong> 5-9 additional spoons daily with consistent implementation!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default NeuroCheckPage
```

### 2. Interactive Neuro-Check Component (`/components/neuro-check/interactive-neuro-check.tsx`)

```tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Zap, 
  CheckCircle, 
  Gauge,
  Heart,
  Battery,
  Target,
  AlertTriangle
} from 'lucide-react'

interface NeuroCheckData {
  mood_level: number
  energy_units: number
  focus_capacity: number
  stress_level: number
  brain_mode: 'Normal' | 'Fog' | 'Shutdown'
  burnout_flags: string[]
  sensory_state: 'understimulated' | 'balanced' | 'overstimulated'
  sleep_quality: 'poor' | 'fair' | 'good' | 'excellent'
  notes: string
  capacity_today?: number
  spoon_expansion_efforts: string[]
}

interface NeuroCheckResponse {
  capacity: number
  adjustments: {
    original_energy: number
    brain_mode_adjustment: number
    burnout_adjustment: number
    final_capacity: number
  }
}

const burnoutOptions = [
  { id: 'sleep_disrupted', label: 'Sleep Disrupted' },
  { id: 'emotional_exhaustion', label: 'Emotional Exhaustion' },
  { id: 'cognitive_overload', label: 'Cognitive Overload' },
  { id: 'social_withdrawal', label: 'Social Withdrawal' },
  { id: 'physical_fatigue', label: 'Physical Fatigue' },
  { id: 'motivation_loss', label: 'Motivation Loss' },
  { id: 'irritability_increased', label: 'Increased Irritability' }
]

export function InteractiveNeuroCheck() {
  const [checkData, setCheckData] = useState<NeuroCheckData>({
    mood_level: 5,
    energy_units: 5,
    focus_capacity: 5,
    stress_level: 5,
    brain_mode: 'Normal',
    burnout_flags: [],
    sensory_state: 'balanced',
    sleep_quality: 'fair',
    notes: '',
    spoon_expansion_efforts: []
  })

  const [energyUnits, setEnergyUnits] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<NeuroCheckResponse | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Safe localStorage helper for SSR compatibility
  const safeLocalStorage = {
    getItem: (key: string) => {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null
      return localStorage.getItem(key)
    },
    setItem: (key: string, value: string) => {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
      localStorage.setItem(key, value)
    }
  }

  // Load saved data from localStorage
  useEffect(() => {
    setIsLoaded(true)
    
    const today = new Date().toISOString().split('T')[0]
    const savedDataKey = `neuro-check-${today}`
    const savedData = safeLocalStorage.getItem(savedDataKey)
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setCheckData(prevData => ({
          ...prevData,
          ...parsed,
          spoon_expansion_efforts: parsed.spoon_expansion_efforts || []
        }))
        
        setEnergyUnits(parsed.energy_units || 5)
        
        if (parsed.capacity_today) {
          setResult({
            capacity: parsed.capacity_today,
            adjustments: parsed.adjustments || {
              original_energy: parsed.energy_units || 5,
              brain_mode_adjustment: 0,
              burnout_adjustment: 0,
              final_capacity: parsed.capacity_today
            }
          })
        }
      } catch (error) {
        console.error('Failed to load saved neuro-check data:', error)
      }
    }
  }, [])

  // Save data to localStorage whenever relevant state changes
  useEffect(() => {
    if (!isLoaded) return
    
    const today = new Date().toISOString().split('T')[0]
    const savedDataKey = `neuro-check-${today}`
    
    const dataToSave = {
      ...checkData,
      energy_units: energyUnits,
      capacity_today: result?.capacity,
      adjustments: result?.adjustments,
      last_updated: new Date().toISOString()
    }
    
    safeLocalStorage.setItem(savedDataKey, JSON.stringify(dataToSave))
  }, [checkData, result, energyUnits, isLoaded])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Calculate capacity using the Dynamic Capacity System
      let finalCapacity = energyUnits
      
      // Brain mode adjustments
      const brainModeAdjustments = {
        'Normal': 0,
        'Fog': -2,
        'Shutdown': -4
      }
      
      const brainModeAdjustment = brainModeAdjustments[checkData.brain_mode]
      finalCapacity += brainModeAdjustment
      
      // Burnout protection (3+ flags = -3 capacity)
      const burnoutAdjustment = checkData.burnout_flags.length >= 3 ? -3 : 0
      finalCapacity += burnoutAdjustment
      
      // Ensure minimum of 0 capacity
      finalCapacity = Math.max(0, finalCapacity)
      
      const capacityResult: NeuroCheckResponse = {
        capacity: finalCapacity,
        adjustments: {
          original_energy: energyUnits,
          brain_mode_adjustment: brainModeAdjustment,
          burnout_adjustment: burnoutAdjustment,
          final_capacity: finalCapacity
        }
      }

      setResult(capacityResult)
      setShowSuccess(true)
      
      // Save to localStorage for persistence
      const today = new Date().toISOString().split('T')[0]
      const dailyData = {
        ...checkData,
        energy_units: energyUnits,
        capacity_today: capacityResult.capacity,
        adjustments: capacityResult.adjustments,
        completed_at: new Date().toISOString()
      }
      safeLocalStorage.setItem(`neuro-check-${today}`, JSON.stringify(dailyData))
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000)

    } catch (error) {
      console.error('Failed to submit neuro-check:', error)
      alert('Failed to calculate capacity. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMoodEmoji = (level: number): string => {
    const emojis = ['😢', '😟', '😕', '😐', '🙂', '😊', '😄', '😆', '😁', '🤩']
    return emojis[Math.max(0, Math.min(9, level - 1))] || '😐'
  }

  const getCapacityColor = (capacity: number) => {
    if (capacity <= 3) return 'text-red-600'
    if (capacity <= 6) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getCapacityDescription = (capacity: number) => {
    if (capacity <= 2) return 'Rest day - minimal tasks only'
    if (capacity <= 4) return 'Low energy - focus on essentials'
    if (capacity <= 6) return 'Moderate capacity - normal pace'
    if (capacity <= 8) return 'Good energy - productive day possible'
    return 'High capacity - tackle challenging tasks'
  }

  const toggleBurnoutFlag = (flagId: string) => {
    setCheckData(prev => ({
      ...prev,
      burnout_flags: prev.burnout_flags.includes(flagId)
        ? prev.burnout_flags.filter(id => id !== flagId)
        : [...prev.burnout_flags, flagId]
    }))
  }

  const updateEnergyUnits = (newValue: number) => {
    setEnergyUnits(newValue)
    setCheckData(prev => ({ ...prev, energy_units: newValue }))
  }

  if (!isLoaded) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span>Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-500" />
          Interactive Daily Neuro-Check
          {result && (
            <Badge variant="secondary" className="ml-auto">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </CardTitle>
        
        {result && (
          <Alert className="mt-4">
            <Gauge className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Today's Calculated Capacity:</span>
                <div className="text-right">
                  <span className={`text-xl font-bold ${getCapacityColor(result.capacity)}`}>
                    {result.capacity}/10 spoons
                  </span>
                  <br />
                  <span className="text-sm text-gray-600">
                    {getCapacityDescription(result.capacity)}
                  </span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {showSuccess && (
          <Alert className="border-green-500 bg-green-50 mt-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              <strong>Success!</strong> Your daily capacity has been calculated using the Dynamic Capacity System.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Mood Level */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Heart className="h-4 w-4 text-red-500" />
              Mood Level
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getMoodEmoji(checkData.mood_level)}</span>
              <span className="text-sm text-gray-600">{checkData.mood_level}/10</span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={checkData.mood_level}
            onChange={(e) => {
              const newValue = parseInt(e.target.value)
              setCheckData(prev => ({ ...prev, mood_level: newValue }))
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Energy Units */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Battery className="h-4 w-4 text-blue-500" />
              Energy Units (Spoons You Woke Up With)
            </label>
            <span className="text-sm text-gray-600">{energyUnits}/10 spoons</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={energyUnits}
            onChange={(e) => {
              const newValue = parseInt(e.target.value)
              updateEnergyUnits(newValue)
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          {/* Spoon visualization */}
          <div className="flex justify-center gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={`spoon-${i}`} className={`text-lg ${i < energyUnits ? 'opacity-100' : 'opacity-20'}`}>
                🥄
              </span>
            ))}
          </div>
        </div>

        {/* Brain Mode */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Brain className="h-4 w-4 text-purple-500" />
            Brain Mode (affects capacity calculation)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['Normal', 'Fog', 'Shutdown'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCheckData(prev => ({ ...prev, brain_mode: mode }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  checkData.brain_mode === mode
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-medium">{mode}</div>
                  <div className="text-sm text-gray-600">
                    {mode === 'Normal' && 'No adjustment'}
                    {mode === 'Fog' && '-2 capacity'}
                    {mode === 'Shutdown' && '-4 capacity'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Burnout Indicators */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Burnout Indicators
            </label>
            <Badge variant={checkData.burnout_flags.length >= 3 ? "destructive" : "secondary"}>
              {checkData.burnout_flags.length} selected
            </Badge>
          </div>
          
          {checkData.burnout_flags.length >= 3 && (
            <Alert className="border-orange-500 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-700">
                <strong>Burnout Protection Active:</strong> 3+ indicators will reduce your capacity by 3 points.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {burnoutOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleBurnoutFlag(option.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  checkData.burnout_flags.includes(option.id)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    checkData.burnout_flags.includes(option.id)
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-gray-300'
                  }`}>
                    {checkData.burnout_flags.includes(option.id) && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Spoon Boosters */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Zap className="h-4 w-4 text-green-500" />
            Quick Spoon Boosters (Immediate Energy)
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                const newEnergyUnits = Math.min(10, energyUnits + 1)
                updateEnergyUnits(newEnergyUnits)
                setResult(null)
                setShowSuccess(false)
              }}
              className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
              disabled={energyUnits >= 10}
            >
              <div className="font-medium text-green-800">☕ Coffee/Caffeine</div>
              <div className="text-sm text-green-600">+1 spoon (quick boost)</div>
            </button>

            <button
              type="button"
              onClick={() => {
                const newEnergyUnits = Math.min(10, energyUnits + 1)
                updateEnergyUnits(newEnergyUnits)
                setResult(null)
                setShowSuccess(false)
              }}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
              disabled={energyUnits >= 10}
            >
              <div className="font-medium text-blue-800">🚶 5-min Walk</div>
              <div className="text-sm text-blue-600">+1 spoon (movement boost)</div>
            </button>

            <button
              type="button"
              onClick={() => {
                const newEnergyUnits = Math.min(10, energyUnits + 2)
                updateEnergyUnits(newEnergyUnits)
                setResult(null)
                setShowSuccess(false)
              }}
              className="p-3 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors text-left"
              disabled={energyUnits >= 9}
            >
              <div className="font-medium text-pink-800">💊 ADHD Medication</div>
              <div className="text-sm text-pink-600">+2 spoons (med boost)</div>
            </button>

            <button
              type="button"
              onClick={() => {
                const newEnergyUnits = Math.min(10, energyUnits + 2)
                updateEnergyUnits(newEnergyUnits)
                setResult(null)
                setShowSuccess(false)
              }}
              className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-left"
              disabled={energyUnits >= 9}
            >
              <div className="font-medium text-yellow-800">😴 20-min Power Nap</div>
              <div className="text-sm text-yellow-600">+2 spoons (rest boost)</div>
            </button>
          </div>

          {energyUnits >= 10 && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
              <strong>Max spoons reached!</strong> You're at peak energy capacity for today.
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting && <Zap className="h-4 w-4 mr-2 animate-spin" />}
          Calculate My Daily Capacity
        </Button>

        {result && (
          <div className="space-y-2">
            <Button 
              variant="outline"
              onClick={() => {
                setResult(null)
                setShowSuccess(false)
              }}
              className="w-full"
            >
              Reset and Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### 3. API Route for Capacity Calculation (`/api/adjust-capacity/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'

interface CapacityRequest {
  energy_units: number
  brain_mode: 'Normal' | 'Fog' | 'Shutdown'
  burnout_flags: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: CapacityRequest = await request.json()
    
    // Dynamic Capacity System calculation
    let finalCapacity = body.energy_units
    
    // Brain mode adjustments
    const brainModeAdjustments = {
      'Normal': 0,
      'Fog': -2,
      'Shutdown': -4
    }
    
    const brainModeAdjustment = brainModeAdjustments[body.brain_mode]
    finalCapacity += brainModeAdjustment
    
    // Burnout protection (3+ flags = -3 capacity)
    const burnoutAdjustment = body.burnout_flags.length >= 3 ? -3 : 0
    finalCapacity += burnoutAdjustment
    
    // Ensure minimum of 0 capacity
    finalCapacity = Math.max(0, finalCapacity)
    
    const response = {
      capacity: finalCapacity,
      adjustments: {
        original_energy: body.energy_units,
        brain_mode_adjustment: brainModeAdjustment,
        burnout_adjustment: burnoutAdjustment,
        final_capacity: finalCapacity
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error calculating capacity:', error)
    return NextResponse.json(
      { error: 'Failed to calculate capacity' },
      { status: 500 }
    )
  }
}
```

### 4. Required UI Components

You'll need these basic UI components (using shadcn/ui style):

```typescript
// Card components
export const Card = ({ className, ...props }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props} />
)

export const CardHeader = ({ className, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
)

export const CardTitle = ({ className, ...props }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
)

export const CardContent = ({ className, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
)

// Button component
export const Button = ({ className, variant = 'default', size = 'default', ...props }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  }
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    lg: 'h-11 rounded-md px-8'
  }
  
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

// Badge component
export const Badge = ({ className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground'
  }
  
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`} {...props} />
  )
}

// Alert component
export const Alert = ({ className, ...props }) => (
  <div className={`relative w-full rounded-lg border p-4 ${className}`} {...props} />
)

export const AlertDescription = ({ className, ...props }) => (
  <div className={`text-sm ${className}`} {...props} />
)
```

## Integration Instructions for Claude Code

When implementing this in your executive buddy app, follow these steps:

1. **Install Required Dependencies:**
   ```bash
   npm install lucide-react
   ```

2. **Create the file structure:**
   - `/app/neuro-check/page.tsx` (main neuro-check page)
   - `/components/neuro-check/interactive-neuro-check.tsx` (interactive widget)
   - `/api/adjust-capacity/route.ts` (capacity calculation API)

3. **Set up UI components** (if using shadcn/ui):
   ```bash
   npx shadcn-ui@latest add card button badge alert
   ```

4. **Add to your main navigation:**
   ```tsx
   <Link href="/neuro-check">Daily Neuro-Check</Link>
   ```

5. **Integration with task management:**
   - The calculated capacity is stored in localStorage as `neuro-check-${date}`
   - Access it in your task management system to limit daily task scheduling
   - Use the capacity value to prevent over-scheduling beyond spoon limits

6. **Key Features Included:**
   - Visual spoon tracking (🥄 emojis)
   - Brain fog and burnout protection
   - Educational content about Spoon Theory
   - Quick energy boosters
   - Persistent daily data storage
   - ADHD-specific considerations

## Data Storage Structure

The system stores data in localStorage with this structure:
```javascript
{
  "mood_level": 7,
  "energy_units": 6,
  "brain_mode": "Normal",
  "burnout_flags": ["sleep_disrupted"],
  "capacity_today": 5,
  "completed_at": "2024-01-15T09:30:00Z",
  "adjustments": {
    "original_energy": 6,
    "brain_mode_adjustment": 0,
    "burnout_adjustment": 0,
    "final_capacity": 5
  }
}
```

This system provides a comprehensive, ADHD-friendly way to track daily energy capacity and integrate it with task planning systems.