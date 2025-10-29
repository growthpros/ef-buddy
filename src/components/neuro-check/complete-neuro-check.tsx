'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Zap, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Battery,
  Heart,
  Gauge,
  Moon,
  Eye,
  MessageSquare
} from 'lucide-react'

interface NeuroCheckData {
  // Core 2-B inputs
  energy_units: number
  brain_mode: 'Normal' | 'Fog' | 'Shutdown'
  burnout_flags: string[]
  
  // Extended inputs
  mood_level: number
  focus_capacity: number
  stress_level: number
  sensory_state: 'understimulated' | 'balanced' | 'overstimulated'
  sleep_quality: 'poor' | 'fair' | 'good' | 'excellent'
  notes: string
  
  // Metadata
  capacity_today?: number
  completed_at?: string
}

interface CapacityResult {
  capacity: number
  adjustments: {
    original_energy: number
    brain_mode_adjustment: number
    burnout_adjustment: number
    final_capacity: number
  }
}

// Simple slider component
function Slider({ 
  value, 
  onValueChange, 
  min = 0, 
  max = 10, 
  step = 1,
  className = ""
}: {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
        }}
      />
    </div>
  )
}

// Spoon visualization component
function SpoonVisualization({ available, used = 0, maxSpoons = 10 }: { available: number, used?: number, maxSpoons?: number }) {
  const spoons = Array.from({ length: maxSpoons }, (_, index) => {
    let state: 'available' | 'used' | 'empty' = 'empty'
    
    if (index < used) {
      state = 'used'
    } else if (index < available) {
      state = 'available'
    }
    
    return { index, state }
  })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 justify-center">
        {spoons.map(({ index, state }) => (
          <div
            key={index}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              state === 'available' 
                ? 'bg-blue-500 text-white' 
                : state === 'used'
                ? 'bg-gray-300 text-gray-600'  
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            🥄
          </div>
        ))}
      </div>
      
      <div className="flex justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Available ({available - used})</span>
        </div>
        {used > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span>Used ({used})</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
          <span>Total ({maxSpoons})</span>
        </div>
      </div>
    </div>
  )
}

export function CompleteNeuroCheck() {
  const [checkData, setCheckData] = useState<NeuroCheckData>({
    energy_units: 5,
    brain_mode: 'Normal',
    burnout_flags: [],
    mood_level: 5,
    focus_capacity: 5,
    stress_level: 5,
    sensory_state: 'balanced',
    sleep_quality: 'fair',
    notes: ''
  })

  const [result, setResult] = useState<CapacityResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCompletedToday, setHasCompletedToday] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Load today's check if it exists
  useEffect(() => {
    loadTodaysCheck()
  }, [])

  const loadTodaysCheck = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const savedCheck = localStorage.getItem(`neuro-check-${today}`)
      
      if (savedCheck) {
        const parsed = JSON.parse(savedCheck)
        setCheckData(parsed)
        if (parsed.capacity_today !== undefined) {
          setResult({
            capacity: parsed.capacity_today,
            adjustments: {
              original_energy: parsed.energy_units,
              brain_mode_adjustment: parsed.brain_mode === 'Fog' ? -2 : parsed.brain_mode === 'Shutdown' ? -4 : 0,
              burnout_adjustment: parsed.burnout_flags.length >= 3 ? -3 : 0,
              final_capacity: parsed.capacity_today
            }
          })
          setHasCompletedToday(true)
        }
      }
    } catch (error) {
      console.error('Failed to load today\'s check:', error)
    }
  }

  const burnoutOptions = [
    { id: 'sleep_disrupted', label: 'Sleep Disrupted', description: 'Trouble falling asleep, staying asleep, or poor sleep quality', icon: Moon },
    { id: 'emotional_exhaustion', label: 'Emotional Exhaustion', description: 'Feeling emotionally drained or depleted', icon: Heart },
    { id: 'cognitive_overload', label: 'Cognitive Overload', description: 'Difficulty processing information or making decisions', icon: Brain },
    { id: 'social_withdrawal', label: 'Social Withdrawal', description: 'Avoiding social interactions or feeling isolated', icon: Eye },
    { id: 'physical_fatigue', label: 'Physical Fatigue', description: 'Body feels heavy, tired, or lacking energy', icon: Zap },
    { id: 'motivation_loss', label: 'Motivation Loss', description: 'Difficulty finding motivation for usual activities', icon: Target },
    { id: 'irritability_increased', label: 'Increased Irritability', description: 'More easily frustrated or annoyed than usual', icon: AlertTriangle }
  ]

  const handleCalculate = async () => {
    setIsCalculating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/adjust-capacity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          energy_units: checkData.energy_units,
          brain_mode: checkData.brain_mode,
          burnout_flags: checkData.burnout_flags
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate capacity')
      }

      const calculatedResult = await response.json()
      setResult(calculatedResult)
      
      // Save to localStorage with completion timestamp
      const updatedData = {
        ...checkData,
        capacity_today: calculatedResult.capacity,
        completed_at: new Date().toISOString()
      }
      
      setCheckData(updatedData)
      setHasCompletedToday(true)
      setShowSuccess(true)
      
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem(`neuro-check-${today}`, JSON.stringify(updatedData))
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
    } finally {
      setIsCalculating(false)
    }
  }

  const toggleBurnoutFlag = (flagId: string) => {
    setCheckData(prev => ({
      ...prev,
      burnout_flags: prev.burnout_flags.includes(flagId)
        ? prev.burnout_flags.filter(id => id !== flagId)
        : [...prev.burnout_flags, flagId]
    }))
  }

  const getMoodEmoji = (level: number): string => {
    const emojis = ['😢', '😟', '😕', '😐', '🙂', '😊', '😄', '😆', '😁', '🤩']
    return emojis[Math.max(0, Math.min(9, level - 1))] || '😐'
  }

  const getCapacityColor = (capacity: number) => {
    if (capacity <= 3) return 'text-red-500'
    if (capacity <= 6) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getCapacityDescription = (capacity: number) => {
    if (capacity <= 2) return 'Rest day - minimal tasks only'
    if (capacity <= 4) return 'Low energy - focus on essentials'
    if (capacity <= 6) return 'Moderate capacity - normal pace'
    if (capacity <= 8) return 'Good energy - productive day possible'
    return 'High capacity - tackle challenging tasks'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Alert */}
      {showSuccess && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            Neuro-check completed! Your daily capacity has been calculated and saved.
          </AlertDescription>
        </Alert>
      )}

      {/* Today's Capacity Display */}
      {result && (
        <Card className="border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-blue-500" />
              Today's Capacity
              {hasCompletedToday && (
                <Badge variant="secondary" className="ml-auto">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className={`text-5xl font-bold ${getCapacityColor(result.capacity)}`}>
                {result.capacity}/10
              </div>
              <div className="text-lg text-gray-700 mt-2">
                {getCapacityDescription(result.capacity)}
              </div>
            </div>

            <div className="bg-white/70 p-4 rounded-lg border">
              <h4 className="font-medium mb-3">Calculation Breakdown:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Starting energy units:</span>
                  <span className="font-medium">+{result.adjustments.original_energy}</span>
                </div>
                <div className="flex justify-between">
                  <span>Brain mode adjustment ({checkData.brain_mode}):</span>
                  <span className={`font-medium ${result.adjustments.brain_mode_adjustment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {result.adjustments.brain_mode_adjustment === 0 ? '0' : result.adjustments.brain_mode_adjustment}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Burnout adjustment ({checkData.burnout_flags.length} flags):</span>
                  <span className={`font-medium ${result.adjustments.burnout_adjustment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {result.adjustments.burnout_adjustment === 0 ? '0' : result.adjustments.burnout_adjustment}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Final capacity:</span>
                  <span className={getCapacityColor(result.capacity)}>
                    {result.capacity}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Input Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Energy Units with Spoon Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="h-5 w-5 text-blue-500" />
                Energy Units (Spoons Available)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">How many spoons did you wake up with?</span>
                <Badge variant="outline">{checkData.energy_units}/10</Badge>
              </div>
              
              <Slider
                value={checkData.energy_units}
                onValueChange={(value) => setCheckData(prev => ({ ...prev, energy_units: value }))}
                min={0}
                max={10}
                className="w-full"
              />
              
              <SpoonVisualization available={checkData.energy_units} />
              
              <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded border">
                <strong>Spoon Theory:</strong> Each "spoon" represents a unit of mental/physical energy. 
                Some days you wake up with 10 spoons, other days maybe just 3. This helps track your realistic capacity.
              </div>
            </CardContent>
          </Card>

          {/* Mood Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Mood Level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">How's your overall mood today?</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{getMoodEmoji(checkData.mood_level)}</span>
                  <Badge variant="outline">{checkData.mood_level}/10</Badge>
                </div>
              </div>
              
              <Slider
                value={checkData.mood_level}
                onValueChange={(value) => setCheckData(prev => ({ ...prev, mood_level: value }))}
                min={1}
                max={10}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-gray-600">
                <span>Very Low</span>
                <span>Excellent</span>
              </div>
            </CardContent>
          </Card>

          {/* Focus & Stress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Focus & Stress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Focus Capacity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Focus Capacity</span>
                  <Badge variant="outline">{checkData.focus_capacity}/10</Badge>
                </div>
                <Slider
                  value={checkData.focus_capacity}
                  onValueChange={(value) => setCheckData(prev => ({ ...prev, focus_capacity: value }))}
                  min={1}
                  max={10}
                  className="w-full"
                />
              </div>

              {/* Stress Level */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stress Level</span>
                  <Badge variant="outline">{checkData.stress_level}/10</Badge>
                </div>
                <Slider
                  value={checkData.stress_level}
                  onValueChange={(value) => setCheckData(prev => ({ ...prev, stress_level: value }))}
                  min={1}
                  max={10}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Brain Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Brain Mode (Affects Capacity)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { mode: 'Normal', desc: 'Clear thinking, good focus', adjustment: 'No adjustment', color: 'green' },
                  { mode: 'Fog', desc: 'Cloudy, slower processing', adjustment: '-2 capacity', color: 'yellow' },
                  { mode: 'Shutdown', desc: 'Overwhelmed, need recovery', adjustment: '-4 capacity', color: 'red' }
                ].map(({ mode, desc, adjustment, color }) => (
                  <button
                    key={mode}
                    onClick={() => setCheckData(prev => ({ ...prev, brain_mode: mode as any }))}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      checkData.brain_mode === mode
                        ? `border-${color}-500 bg-${color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{mode}</div>
                        <div className="text-sm text-gray-600 mt-1">{desc}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">{adjustment}</Badge>
                        {checkData.brain_mode === mode && (
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-1" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-500" />
                Additional Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sensory State */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sensory State</label>
                <select 
                  value={checkData.sensory_state}
                  onChange={(e) => setCheckData(prev => ({ 
                    ...prev, 
                    sensory_state: e.target.value as typeof checkData.sensory_state 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="understimulated">Under-stimulated (need more input)</option>
                  <option value="balanced">Balanced (just right)</option>
                  <option value="overstimulated">Over-stimulated (too much input)</option>
                </select>
              </div>
              
              {/* Sleep Quality */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sleep Quality</label>
                <select 
                  value={checkData.sleep_quality}
                  onChange={(e) => setCheckData(prev => ({ 
                    ...prev, 
                    sleep_quality: e.target.value as typeof checkData.sleep_quality 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="poor">Poor (restless, unrefreshing)</option>
                  <option value="fair">Fair (some disruption)</option>
                  <option value="good">Good (mostly restful)</option>
                  <option value="excellent">Excellent (fully refreshed)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Burnout Indicators - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Burnout Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Which of these are you experiencing today?</span>
              <Badge variant={checkData.burnout_flags.length >= 3 ? "danger" : "secondary"}>
                {checkData.burnout_flags.length} selected
                {checkData.burnout_flags.length >= 3 && " → -3 capacity"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {burnoutOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleBurnoutFlag(option.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      checkData.burnout_flags.includes(option.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${checkData.burnout_flags.includes(option.id) ? 'text-orange-600' : 'text-gray-500'}`} />
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                      {checkData.burnout_flags.includes(option.id) && (
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600">{option.description}</div>
                  </button>
                )
              })}
            </div>
            
            {checkData.burnout_flags.length >= 3 && (
              <Alert className="border-orange-500 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-700">
                  <strong>Burnout protection activated:</strong> With {checkData.burnout_flags.length} indicators, 
                  your capacity will be reduced by 3 points to encourage rest and recovery.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-500" />
            Daily Notes (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={checkData.notes}
            onChange={(e) => setCheckData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="How are you feeling today? Any specific concerns, observations, or context that might affect your capacity? This helps track patterns over time."
            maxLength={1000}
            className="resize-none min-h-[100px]"
            rows={4}
          />
          <div className="text-xs text-gray-500 mt-2">
            {checkData.notes.length}/1000 characters
          </div>
        </CardContent>
      </Card>

      {/* Calculate Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleCalculate}
            disabled={isCalculating || hasCompletedToday}
            className="w-full"
            size="lg"
          >
            {isCalculating ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Calculating Your Daily Capacity...
              </>
            ) : hasCompletedToday ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed for Today
              </>
            ) : (
              'Calculate My Daily Capacity'
            )}
          </Button>

          {hasCompletedToday && (
            <Button 
              variant="outline"
              onClick={() => {
                setHasCompletedToday(false)
                setResult(null)
                setShowSuccess(false)
              }}
              className="w-full mt-3"
            >
              Update Today's Check
            </Button>
          )}

          {error && (
            <Alert className="mt-4 border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                Error: {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}