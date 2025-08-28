'use client'

import { useState, useCallback } from 'react'
import type { Priority } from '@/lib/types'

// AI Classification response from 2-A Task Classifier
export interface AITaskClassification {
  task_title: string
  time_estimate: number
  urgency_score: number
  impact_score: number
  completion_criteria: string
  suggested_priority: Priority
  energy_level: number
  breakdown_steps: string[]
  confidence: number
}

interface UseAIClassificationReturn {
  // Core AI functionality
  classifyTask: (text: string) => Promise<AITaskClassification | null>
  classifying: boolean
  error: string | null
  
  // Quick actions with AI
  quickCaptureWithAI: (text: string) => Promise<{ classification: AITaskClassification; success: boolean } | null>
  
  // AI service status
  isAvailable: boolean
  
  // Utilities
  clearError: () => void
}

/**
 * Hook for AI task classification using 2-A Task Classifier
 */
export function useAIClassification(): UseAIClassificationReturn {
  const [classifying, setClassifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAvailable] = useState(true) // For now, always available

  const clearError = useCallback(() => setError(null), [])

  const classifyTask = useCallback(async (text: string): Promise<AITaskClassification | null> => {
    if (!text.trim()) {
      setError('Task text is required')
      return null
    }

    setClassifying(true)
    clearError()

    try {
      const response = await fetch('/api/tasks/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Classification failed: ${response.status}`)
      }

      const classification: AITaskClassification = await response.json()
      
      // Validate the classification response
      if (!classification || typeof classification !== 'object') {
        throw new Error('Invalid classification response')
      }

      // Ensure required fields are present
      const requiredFields: (keyof AITaskClassification)[] = [
        'task_title',
        'time_estimate',
        'urgency_score',
        'impact_score',
        'completion_criteria',
        'suggested_priority',
        'energy_level',
        'breakdown_steps',
        'confidence'
      ]

      for (const field of requiredFields) {
        if (classification[field] === undefined || classification[field] === null) {
          throw new Error(`Missing required field: ${field}`)
        }
      }

      setClassifying(false)
      return classification

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Classification failed'
      setError(errorMessage)
      setClassifying(false)
      return null
    }
  }, [clearError])

  const quickCaptureWithAI = useCallback(async (text: string): Promise<{ classification: AITaskClassification; success: boolean } | null> => {
    // First classify the task
    const classification = await classifyTask(text)
    if (!classification) {
      return null
    }

    // Create the task with AI classification data
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: classification.task_title,
          priority: classification.suggested_priority,
          energy_required: classification.energy_level,
          estimated_duration: classification.time_estimate,
          description: classification.completion_criteria,
          
          // Store AI classification data
          ai_time_estimate: classification.time_estimate,
          ai_urgency_score: classification.urgency_score,
          ai_impact_score: classification.impact_score,
          ai_completion_criteria: classification.completion_criteria,
          ai_suggested_priority: classification.suggested_priority,
          ai_energy_level: classification.energy_level,
          ai_breakdown_steps: classification.breakdown_steps,
          ai_confidence: classification.confidence,
          ai_classified_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Task creation failed: ${response.status}`)
      }

      return {
        classification,
        success: true,
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Task creation failed'
      setError(errorMessage)
      return {
        classification,
        success: false,
      }
    }
  }, [classifyTask])

  return {
    classifyTask,
    classifying,
    error,
    quickCaptureWithAI,
    isAvailable,
    clearError,
  }
}

/**
 * Utility functions for AI classification
 */
export const aiClassificationUtils = {
  /**
   * Get a human-readable confidence level
   */
  getConfidenceLevel: (confidence: number): 'low' | 'medium' | 'high' => {
    if (confidence < 0.6) return 'low'
    if (confidence < 0.8) return 'medium'
    return 'high'
  },

  /**
   * Get priority color based on AI suggestion
   */
  getPriorityColor: (priority: Priority): string => {
    const colors = {
      low: 'text-secondary-600 bg-secondary-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100',
    }
    return colors[priority]
  },

  /**
   * Get energy level indicator
   */
  getEnergyIndicator: (level: number): string => {
    const indicators = ['🟢', '🟢', '🟡', '🟠', '🔴']
    return indicators[Math.min(level - 1, 4)] || '🟡'
  },

  /**
   * Format time estimate for display
   */
  formatTimeEstimate: (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  },

  /**
   * Get ADHD-friendly completion criteria
   */
  getCompletionSummary: (criteria: string): string => {
    // Extract the key point from completion criteria
    const sentences = criteria.split(/[.!?]+/).filter(s => s.trim())
    return sentences[0]?.trim() + '.' || criteria
  },

  /**
   * Generate task insights from AI classification
   */
  generateInsights: (classification: AITaskClassification): string[] => {
    const insights: string[] = []
    
    // Time insight
    if (classification.time_estimate <= 30) {
      insights.push('⚡ Quick task - perfect for low energy moments')
    } else if (classification.time_estimate >= 120) {
      insights.push('📅 Consider breaking into smaller chunks')
    }
    
    // Energy insight
    if (classification.energy_level >= 4) {
      insights.push('🧠 High focus needed - schedule during peak hours')
    } else if (classification.energy_level <= 2) {
      insights.push('😌 Low energy task - good for tired moments')
    }
    
    // Urgency insight
    if (classification.urgency_score >= 4 && classification.impact_score >= 4) {
      insights.push('🚨 High impact & urgent - prioritize today')
    } else if (classification.urgency_score <= 2 && classification.impact_score >= 4) {
      insights.push('💡 Important but not urgent - plan ahead')
    }
    
    // Confidence insight
    if (classification.confidence < 0.7) {
      insights.push('🤔 AI needs more context - consider adding details')
    }
    
    return insights
  }
}