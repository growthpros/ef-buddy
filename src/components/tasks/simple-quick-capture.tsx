'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Zap, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Priority } from '@/lib/types'
import { tasksAPI } from '@/lib/api/tasks-mock'

interface SimpleQuickCaptureProps {
  onCapture?: (title: string, priority: Priority) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

const PRIORITY_OPTIONS: { value: Priority; label: string; emoji: string; color: string }[] = [
  { value: 'low', label: 'Low', emoji: '⚪', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Medium', emoji: '🟡', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'High', emoji: '🟠', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', emoji: '🔴', color: 'bg-red-100 text-red-700' },
]

export function SimpleQuickCapture({ 
  onCapture,
  placeholder = "What's on your mind? (Press Enter to capture)",
  className,
  autoFocus = false
}: SimpleQuickCaptureProps) {
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [energy, setEnergy] = useState(3)
  const [duration, setDuration] = useState<number | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isCapturing) return
    
    setIsCapturing(true)
    
    try {
      const result = await tasksAPI.createTask({
        title: input.trim(),
        priority,
        energy_required: energy,
        estimated_duration: duration
      })
      
      if (result.error) {
        console.error('Failed to create task:', result.error)
      } else {
        console.log('Task created successfully:', result.data)
        onCapture?.(input.trim(), priority)
        
        // Reset form
        setInput('')
        setPriority('medium')
        setEnergy(3)
        setDuration(null)
        setShowDetails(false)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsCapturing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    } else if (e.key === 'Escape') {
      setShowDetails(false)
    }
  }

  const getPriorityStyle = (priorityValue: Priority) => {
    return PRIORITY_OPTIONS.find(p => p.value === priorityValue) || PRIORITY_OPTIONS[1]
  }

  return (
    <Card className={cn('border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors', className)}>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Input */}
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowDetails(true)}
              placeholder={placeholder}
              autoFocus={autoFocus}
              className="flex-1 text-base"
              disabled={isCapturing}
            />
            
            <Button 
              type="submit" 
              disabled={!input.trim() || isCapturing}
              className="px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCapturing ? 'Adding...' : 'Add'}
            </Button>
          </div>

          {/* Quick Details */}
          {showDetails && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex gap-1">
                  {PRIORITY_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPriority(option.value)}
                      className={cn(
                        'px-3 py-2 text-sm rounded-md border transition-colors',
                        priority === option.value
                          ? option.color + ' border-current'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {option.emoji} {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Zap className="h-4 w-4 inline mr-1" />
                  Energy Required
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="min-w-[60px]">
                    {energy} / 8
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {energy <= 2 && '🟢 Light effort'}
                  {energy > 2 && energy <= 4 && '🟡 Moderate effort'}
                  {energy > 4 && energy <= 6 && '🟠 High effort'}
                  {energy > 6 && '🔴 Maximum effort'}
                </div>
              </div>

              {/* Duration Estimate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Time Estimate
                </label>
                <select
                  value={duration || ''}
                  onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">No estimate</option>
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="240">Half day</option>
                  <option value="480">Full day</option>
                </select>
              </div>
            </div>
          )}

          {/* Quick Action Buttons */}
          {input.trim() && !showDetails && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Add details
              </button>
              <span>or press Enter to capture quickly</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export default SimpleQuickCapture