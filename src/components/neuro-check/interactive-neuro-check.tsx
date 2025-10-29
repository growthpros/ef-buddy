'use client'

import React, { useState, useEffect, useCallback } from 'react'
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

// Import the working Supabase streak system
import {
  trackEffortStreak,
  getAllStreakStatus,
  initializeUserProfile,
  getTotalEarnedBonus,
  getTotalProgressBonus,
  formatStreakDisplay,
  checkAuth,
  checkAndResetBrokenStreaks,
  type StreakStatus,
  type EffortType
} from '@/lib/supabase-streaks'

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

  // Separate state for energy to force updates
  const [energyUnits, setEnergyUnits] = useState(5)
  
  // NEW: Supabase-based streak state
  const [allStreaks, setAllStreaks] = useState<StreakStatus[]>([])
  const [streaksLoading, setStreaksLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<NeuroCheckResponse | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [updateCounter, setUpdateCounter] = useState(0)
  const [forceRender, setForceRender] = useState(0)
  
  // Demo mode for testing
  const [demoMode, setDemoMode] = useState(false)
  const [demoDate, setDemoDate] = useState(new Date().toISOString().split('T')[0])
  
  // Get current date (real or demo)
  const getCurrentDate = () => demoMode ? demoDate : new Date().toISOString().split('T')[0]
  
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

  // Initialize streaks on component mount - using demo mode for now
  useEffect(() => {
    const initializeStreaks = async () => {
      try {
        console.log('🔄 Initializing streaks in demo mode...')
        setStreaksLoading(true)
        
        // Force demo mode for now since Supabase RPC functions may not be set up
        const useSupabaseBackend = false
        
        if (useSupabaseBackend) {
          // Check if user is authenticated
          const isAuth = await checkAuth()
          setIsAuthenticated(isAuth)
          
          if (isAuth) {
            // Initialize user profile if needed
            await initializeUserProfile()
            
            // Check and reset any broken streaks first
            const brokenStreaks = await checkAndResetBrokenStreaks()
            if (brokenStreaks.length > 0) {
              console.log('💔 Found and reset broken streaks:', brokenStreaks)
              brokenStreaks.forEach(broken => {
                if (broken.bonus_removed) {
                  console.log(`💔 Lost permanent bonus for ${broken.effort_type} due to broken streak`)
                }
              })
            }
            
            // Load all streak status
            const streakData = await getAllStreakStatus()
            console.log('📊 Loaded streak data:', streakData)
            setAllStreaks(streakData)
          } else {
            console.log('👤 User not authenticated, using demo mode')
            // Load demo streaks from localStorage or initialize fresh
            loadDemoStreaks()
          }
        } else {
          console.log('🎮 Using demo mode (Supabase backend disabled)')
          setIsAuthenticated(false)
          // Load demo streaks from localStorage or initialize fresh
          loadDemoStreaks()
        }
      } catch (error) {
        console.error('❌ Error initializing streaks:', error)
        // Fallback to demo mode on error
        setIsAuthenticated(false)
        loadDemoStreaks()
      } finally {
        setStreaksLoading(false)
        setIsLoaded(true)
      }
    }

    initializeStreaks()
  }, [])

  // Refresh streaks when demo date changes
  useEffect(() => {
    if (!isAuthenticated && isLoaded) {
      console.log('📅 Demo date changed, refreshing streaks for:', getCurrentDate())
      loadDemoStreaks()
      
      // Also reset interactive elements for the new day
      console.log('🔄 Resetting interactive elements for new demo date')
      setResult(null) // Clear previous capacity results
    }
  }, [demoDate, isAuthenticated, isLoaded])

  // Load demo streaks from localStorage with proper day transition logic
  const loadDemoStreaks = () => {
    const today = getCurrentDate()
    const demoKey = `demo-streaks-${today}`
    const savedDemo = safeLocalStorage.getItem(demoKey)
    
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo)
        console.log('📊 Loaded demo streaks for', today, ':', parsed)
        setAllStreaks(parsed)
        return
      } catch (e) {
        console.log('❌ Failed to parse demo streaks')
      }
    }
    
    // Check if we have previous day data to inherit from
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = `demo-streaks-${yesterday.toISOString().split('T')[0]}`
    const yesterdayData = safeLocalStorage.getItem(yesterdayKey)
    
    let defaultStreaks: StreakStatus[] = [
      { effort_type: 'sleep', current_streak: 0, best_streak: 0, is_current: false, last_action_day: null, streak_bonus_awarded_on: null },
      { effort_type: 'exercise', current_streak: 0, best_streak: 0, is_current: false, last_action_day: null, streak_bonus_awarded_on: null },
      { effort_type: 'medication', current_streak: 0, best_streak: 0, is_current: false, last_action_day: null, streak_bonus_awarded_on: null },
      { effort_type: 'stress', current_streak: 0, best_streak: 0, is_current: false, last_action_day: null, streak_bonus_awarded_on: null }
    ]
    
    if (yesterdayData) {
      try {
        const yesterdayStreaks = JSON.parse(yesterdayData)
        console.log('📅 Inheriting from yesterday:', yesterdayStreaks)
        
        // Inherit ongoing streaks but reset is_current to false
        defaultStreaks = yesterdayStreaks.map((streak: StreakStatus) => ({
          ...streak,
          is_current: false // Important: uncheck boxes for new day
        }))
      } catch (e) {
        console.log('❌ Failed to parse yesterday data')
      }
    }
    
    console.log('🆕 Setting up demo streaks for', today, ':', defaultStreaks)
    setAllStreaks(defaultStreaks)
    safeLocalStorage.setItem(demoKey, JSON.stringify(defaultStreaks))
  }

  // Load saved basic data from localStorage
  useEffect(() => {
    if (!isLoaded) return
    
    console.log('🔄 Loading basic data for date:', getCurrentDate(), 'Demo mode:', demoMode)
    
    const today = getCurrentDate()
    const savedDataKey = `neuro-check-${today}`
    const savedData = safeLocalStorage.getItem(savedDataKey)
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        console.log('📋 Parsed saved data:', parsed)
        
        // For completed check-ins, load all data including burnout flags
        // For new days, reset interactive elements but preserve completed state
        if (parsed.completed_at) {
          // This is a completed check-in, load everything including burnout flags
          console.log('✅ Loading completed check-in data with all selections')
          setCheckData(prevData => ({
            ...prevData,
            ...parsed,
            spoon_expansion_efforts: parsed.spoon_expansion_efforts || []
          }))
        } else {
          // This is an incomplete check-in or fresh day, reset burnout flags but keep other data
          console.log('🔄 Loading partial data, resetting burnout flags for new day')
          setCheckData(prevData => ({
            ...prevData,
            ...parsed,
            burnout_flags: [], // Reset burnout flags for new day
            spoon_expansion_efforts: parsed.spoon_expansion_efforts || []
          }))
        }
        
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
        console.error('❌ Failed to load saved neuro-check data:', error)
      }
    } else {
      // No saved data for this day, ensure we start with fresh burnout flags
      console.log('🆕 No saved data for today, starting fresh')
      setCheckData(prevData => ({
        ...prevData,
        burnout_flags: [] // Ensure fresh start for burnout indicators
      }))
    }
  }, [isLoaded, demoMode, demoDate])

  // Save data to localStorage whenever relevant state changes
  useEffect(() => {
    if (!isLoaded) return
    
    const today = getCurrentDate()
    const savedDataKey = `neuro-check-${today}`
    
    const dataToSave = {
      ...checkData,
      energy_units: energyUnits,
      capacity_today: result?.capacity,
      adjustments: result?.adjustments,
      last_updated: new Date().toISOString()
    }
    
    safeLocalStorage.setItem(savedDataKey, JSON.stringify(dataToSave))
    console.log('💾 Auto-saved data for', today)
  }, [checkData, result, energyUnits, isLoaded, demoMode, demoDate])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/adjust-capacity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          energy_units: energyUnits,
          brain_mode: checkData.brain_mode,
          burnout_flags: checkData.burnout_flags
        })
      })

      if (!response.ok) {
        throw new Error('Failed to adjust capacity')
      }

      const capacityResult: NeuroCheckResponse = await response.json()
      setResult(capacityResult)
      setShowSuccess(true)
      
      // Save to localStorage for persistence
      const today = getCurrentDate()
      const dailyData = {
        ...checkData,
        energy_units: energyUnits,
        capacity_today: capacityResult.capacity,
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

  const toggleSpoonExpansionEffort = async (effortId: string) => {
    console.log('🎯 TOGGLING STREAK for:', effortId)
    
    try {
      // Always use demo mode for now since Supabase streak functions may not be set up
      // Force demo mode by setting condition to false
      const useSupabaseBackend = false // Keep disabled until RPC functions are set up
      
      if (useSupabaseBackend && isAuthenticated) {
        // Use Supabase backend (disabled for now)
        console.log('🔗 Using Supabase backend for:', effortId)
        const result = await trackEffortStreak(effortId as EffortType)
        
        if (result) {
          // Refresh streak data
          const updatedStreaks = await getAllStreakStatus()
          setAllStreaks(updatedStreaks)
          console.log('✅ Updated streaks from Supabase:', updatedStreaks)
        } else {
          console.error('❌ Failed to track streak')
          alert('Failed to update streak. Please try again.')
        }
      } else {
        // Demo mode - implement proper streak logic
        console.log('🔄 Using demo mode streak logic for:', effortId)
        const today = getCurrentDate()
        const currentStreak = allStreaks.find(s => s.effort_type === effortId)
        
        if (!currentStreak) {
          console.error('❌ Streak not found for:', effortId)
          return
        }
        
        if (currentStreak.is_current) {
          // Unchecking - this doesn't break the streak, just unchecks for today
          console.log('❌ Unchecking for today:', effortId)
          const updatedStreaks = allStreaks.map(streak => 
            streak.effort_type === effortId 
              ? { ...streak, is_current: false }
              : streak
          )
          setAllStreaks(updatedStreaks)
          saveDemoStreaks(updatedStreaks)
        } else {
          // Checking - implement proper streak continuation/reset logic
          console.log('✅ Checking for today:', effortId)
          
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]
          
          let nextStreak = 1
          let bonusLost = false
          
          if (currentStreak.last_action_day) {
            const lastActionDate = new Date(currentStreak.last_action_day)
            const daysDiff = Math.floor((new Date(today).getTime() - lastActionDate.getTime()) / (1000 * 60 * 60 * 24))
            
            console.log('📅 Last action:', currentStreak.last_action_day, 'Days diff:', daysDiff)
            
            if (daysDiff === 1) {
              // Consecutive day - continue streak
              nextStreak = currentStreak.current_streak + 1
              console.log('📈 Consecutive day - streak continues to:', nextStreak)
            } else if (daysDiff > 1) {
              // Gap in days - reset streak and lose bonus if had one
              nextStreak = 1
              bonusLost = !!currentStreak.streak_bonus_awarded_on
              console.log('💔 Gap detected - resetting streak, bonus lost:', bonusLost)
            } else if (daysDiff === 0) {
              // Same day - just maintain current streak
              nextStreak = currentStreak.current_streak
              console.log('📋 Same day - maintaining streak:', nextStreak)
            }
          } else {
            // First time tracking this effort
            nextStreak = 1
            console.log('🆕 First time tracking - starting streak at 1')
          }
          
          // Check for new 5-day bonus
          const newBonusAwarded = nextStreak === 5 && !currentStreak.streak_bonus_awarded_on
          
          const updatedStreaks = allStreaks.map(streak => {
            if (streak.effort_type === effortId) {
              return {
                ...streak,
                is_current: true,
                last_action_day: today,
                current_streak: nextStreak,
                best_streak: Math.max(streak.best_streak, nextStreak),
                streak_bonus_awarded_on: newBonusAwarded ? today : (bonusLost ? null : streak.streak_bonus_awarded_on)
              }
            }
            return streak
          })
          
          setAllStreaks(updatedStreaks)
          saveDemoStreaks(updatedStreaks)
          
          if (newBonusAwarded) {
            console.log('🎉 New 5-day bonus awarded for:', effortId)
          }
          if (bonusLost) {
            console.log('💔 Lost previous bonus due to gap for:', effortId)
          }
        }
      }
      
      // Force re-render
      setUpdateCounter(prev => prev + 1)
      setForceRender(prev => prev + 1)
    } catch (error) {
      console.error('❌ Error toggling streak:', error)
      alert('Error updating streak. Please try again.')
    }
  }

  // Save demo streaks to localStorage
  const saveDemoStreaks = (streaks: StreakStatus[]) => {
    const today = getCurrentDate()
    const demoKey = `demo-streaks-${today}`
    safeLocalStorage.setItem(demoKey, JSON.stringify(streaks))
    console.log('💾 Saved demo streaks for', today, ':', streaks)
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
    console.log('updateEnergyUnits called with:', newValue)
    setEnergyUnits(newValue)
    setCheckData(prev => ({ ...prev, energy_units: newValue }))
    setUpdateCounter(prev => prev + 1)
  }

  // Calculate earned bonuses from completed streaks
  const calculateEarnedBonus = () => {
    let bonus = 0
    allStreaks.forEach(streak => {
      // Only count bonus if it was awarded AND the streak is still active (not broken)
      if (streak.streak_bonus_awarded_on && isStreakActive(streak)) {
        switch(streak.effort_type) {
          case 'sleep':
            bonus += 2
            break
          case 'exercise':
            bonus += 2
            break
          case 'medication':
            bonus += 3
            break
          case 'stress':
            bonus += 2
            break
        }
      }
    })
    return bonus
  }

  // Check if a streak is still active (hasn't been broken)
  const isStreakActive = (streak: StreakStatus): boolean => {
    if (!streak.last_action_day) return false
    
    const today = getCurrentDate()
    const lastAction = new Date(streak.last_action_day)
    const daysDiff = Math.floor((new Date(today).getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24))
    
    // Streak is active if last action was today or yesterday (allowing for one day gap)
    return daysDiff <= 1
  }

  // Calculate progress bonuses (working towards but not yet earned)
  const calculateProgressBonus = () => {
    let bonus = 0
    allStreaks.forEach(streak => {
      if (streak.is_current && !streak.streak_bonus_awarded_on) {
        switch(streak.effort_type) {
          case 'sleep':
            bonus += 2
            break
          case 'exercise':
            bonus += 2
            break
          case 'medication':
            bonus += 3
            break
          case 'stress':
            bonus += 2
            break
        }
      }
    })
    return bonus
  }

  // Calculate current potential capacity
  const calculateCurrentPotential = () => {
    const earnedBonus = calculateEarnedBonus()
    const progressBonus = calculateProgressBonus()
    const potential = energyUnits + earnedBonus + progressBonus
    return Math.min(potential, 10) // Cap at 10 spoons
  }

  // Derived state for backwards compatibility
  const expansionEfforts = allStreaks
    .filter(streak => streak.is_current)
    .map(streak => streak.effort_type)

  if (!isLoaded) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span>Loading your streak system...</span>
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
          {!isAuthenticated && <Badge variant="secondary">Demo Mode</Badge>}
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

        {/* Demo Mode Controls */}
        {!isAuthenticated && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-purple-800">🧪 Demo Mode Testing</div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  className="w-3 h-3"
                />
                <span className="text-purple-700">Time Travel Mode</span>
              </label>
              
              {demoMode && (
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => {
                      const currentDate = new Date(demoDate)
                      currentDate.setDate(currentDate.getDate() + 1)
                      const newDate = currentDate.toISOString().split('T')[0]
                      console.log('📅 ADVANCING TO DAY:', newDate)
                      setDemoDate(newDate)
                    }}
                    className="px-2 py-1 bg-green-200 hover:bg-green-300 rounded text-xs"
                  >
                    Next Day →
                  </button>
                  <button
                    onClick={() => {
                      const currentDate = new Date(demoDate)
                      currentDate.setDate(currentDate.getDate() - 1)
                      setDemoDate(currentDate.toISOString().split('T')[0])
                    }}
                    className="px-2 py-1 bg-orange-200 hover:bg-orange-300 rounded text-xs"
                  >
                    ← Prev Day
                  </button>
                  <span className="text-xs text-purple-600">Date: {demoDate}</span>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all demo data? This will reset all streaks, check-ins, and saved data.')) {
                        // Clear all demo data from localStorage
                        const keys = Object.keys(localStorage).filter(key => 
                          key.startsWith('demo-streaks-') || 
                          key.startsWith('neuro-check-') ||
                          key.startsWith('tasks-') ||
                          key.startsWith('daily-load-')
                        )
                        keys.forEach(key => localStorage.removeItem(key))
                        
                        // Reset to fresh state
                        loadDemoStreaks()
                        setCheckData({
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
                        setEnergyUnits(5)
                        setResult(null)
                        setForceRender(prev => prev + 1)
                        
                        console.log('🧹 Cleared all demo data')
                        alert('Demo data cleared successfully!')
                      }
                    }}
                    className="px-2 py-1 bg-red-200 hover:bg-red-300 rounded text-xs"
                  >
                    🧹 Clear Data
                  </button>
                </div>
              )}
            </div>
          </div>
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
            <Badge variant={checkData.burnout_flags.length >= 3 ? "danger" : "secondary"}>
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

        {/* 5-Day Streak System */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Target className="h-4 w-4 text-blue-500" />
            5-Day Habit Streaks (Permanent Spoon Bonuses!)
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Track Your Daily Efforts:</div>
              
              {[
                { id: 'sleep', label: '😴 Quality Sleep (7+ hours)', boost: '+2 permanent spoons after 5 days!' },
                { id: 'exercise', label: '🏃 Movement (10+ min)', boost: '+2 permanent spoons after 5 days!' },
                { id: 'medication', label: '💊 Medication Consistency', boost: '+3 permanent spoons after 5 days!' },
                { id: 'stress', label: '🧘 Stress Management', boost: '+2 permanent spoons after 5 days!' }
              ].map((item) => {
                const streak = allStreaks.find(s => s.effort_type === item.id) || 
                  { effort_type: item.id, current_streak: 0, is_current: false, streak_bonus_awarded_on: null }
                const isChecked = streak.is_current
                const isEarned = !!streak.streak_bonus_awarded_on
                
                return (
                  <div key={`${item.id}-${streak.current_streak}-${forceRender}`} className={`border rounded-lg p-3 ${isEarned ? 'bg-green-50 border-green-300' : ''}`}>
                    <button
                      type="button"
                      onClick={() => toggleSpoonExpansionEffort(item.id)}
                      disabled={streaksLoading}
                      className={`w-full flex items-center gap-3 text-left p-2 rounded transition-colors ${
                        isChecked ? 'bg-blue-100 hover:bg-blue-200' : 'hover:bg-gray-50'
                      } ${streaksLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                        isChecked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}>
                        {isChecked && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1 text-sm">
                        <div className="font-medium flex items-center gap-2">
                          {item.label}
                          {isEarned && <span className="text-green-600 text-xs">🏆 EARNED!</span>}
                        </div>
                        <div className="text-xs text-gray-500">{item.boost}</div>
                        
                        {/* Progress Bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isEarned ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ 
                                width: `${Math.min(100, (streak.current_streak / 5) * 100)}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {streak.current_streak}/5
                          </span>
                        </div>
                        
                        {!isEarned && streak.current_streak > 0 && (
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            Day {streak.current_streak} → Only {5 - streak.current_streak} more days for permanent bonus!
                          </div>
                        )}
                        {isEarned && (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            🎉 Permanent +{item.id === 'medication' ? '3' : '2'} spoons earned!
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-800 mb-2">💡 Today's Spoon Plan</div>
              <div className="text-sm text-green-700 space-y-1">
                <p>• Base Energy: <strong>{energyUnits} spoons</strong></p>
                <p>• Permanent Bonuses: <strong>+{calculateEarnedBonus()} spoons</strong></p>
                <p>• Progress Bonuses: <strong>+{calculateProgressBonus()} spoons</strong></p>
                <hr className="my-2 border-green-300" />
                <p>• <strong>Total Potential: {calculateCurrentPotential()} spoons</strong></p>
                
                {calculateEarnedBonus() > 0 && (
                  <p className="text-xs text-green-600 mt-2 bg-green-100 p-2 rounded">
                    🏆 You've earned <strong>+{calculateEarnedBonus()} permanent spoons</strong> from completed 5-day streaks!
                  </p>
                )}
                {expansionEfforts.length === 0 && (
                  <p className="text-xs text-green-600 mt-2 bg-blue-50 p-2 rounded">
                    💡 Check the boxes above to start building habits for permanent capacity increases!
                  </p>
                )}
                {expansionEfforts.length > 0 && calculateProgressBonus() > 0 && (
                  <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                    🔥 Keep going! You're working towards <strong>+{calculateProgressBonus()} permanent spoons</strong>!
                  </p>
                )}
              </div>
            </div>
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
                const newEnergyUnits = Math.min(10, energyUnits + 1)
                updateEnergyUnits(newEnergyUnits)
                setResult(null)
                setShowSuccess(false)
              }}
              className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
              disabled={energyUnits >= 10}
            >
              <div className="font-medium text-purple-800">🥙 Protein Snack</div>
              <div className="text-sm text-purple-600">+1 spoon (fuel boost)</div>
            </button>

            <button
              type="button"
              onClick={() => {
                const newEnergyUnits = Math.min(10, energyUnits + 1)
                updateEnergyUnits(newEnergyUnits)
                setResult(null)
                setShowSuccess(false)
              }}
              className="p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
              disabled={energyUnits >= 10}
            >
              <div className="font-medium text-orange-800">🧘 2-min Breathing</div>
              <div className="text-sm text-orange-600">+1 spoon (calm boost)</div>
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

            <button
              type="button"
              onClick={() => {
                const newEnergyUnits = Math.min(10, energyUnits + 1)
                updateEnergyUnits(newEnergyUnits)
                setResult(null)
                setShowSuccess(false)
              }}
              className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
              disabled={energyUnits >= 10}
            >
              <div className="font-medium text-purple-800">🛏️ Weighted Blanket</div>
              <div className="text-sm text-purple-600">+1 spoon (comfort boost)</div>
            </button>

            <button
              type="button"
              onClick={() => {
                const newEnergyUnits = Math.min(10, energyUnits + 2)
                updateEnergyUnits(newEnergyUnits)
                setResult(null)
                setShowSuccess(false)
              }}
              className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
              disabled={energyUnits >= 9}
            >
              <div className="font-medium text-green-800">👥 Body Double Session</div>
              <div className="text-sm text-green-600">+2 spoons (social support)</div>
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