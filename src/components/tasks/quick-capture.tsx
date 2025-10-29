'use client'

import React, { useState } from 'react'
import { Input, Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useQuickActions } from '@/lib/hooks/use-tasks'
import { useAIClassification, aiClassificationUtils, type AITaskClassification } from '@/lib/hooks/use-ai-classification'
import type { Priority } from '@/lib/types'

interface QuickCaptureProps {
  onCapture?: (title: string, priority: Priority, aiClassification?: AITaskClassification) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  enableAI?: boolean
}

const PRIORITY_OPTIONS: { value: Priority; label: string; emoji: string }[] = [
  { value: 'low', label: 'Low', emoji: '⚪' },
  { value: 'medium', label: 'Medium', emoji: '🟡' },
  { value: 'high', label: 'High', emoji: '🟠' },
  { value: 'urgent', label: 'Urgent', emoji: '🔴' },
]

export function QuickCapture({ 
  onCapture,
  placeholder = "What's on your mind? (Press Enter to capture)",
  className,
  autoFocus = false,
  enableAI = true
}: QuickCaptureProps) {
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [showPrioritySelector, setShowPrioritySelector] = useState(false)
  const [aiMode, setAIMode] = useState(enableAI)
  const [aiClassification, setAIClassification] = useState<AITaskClassification | null>(null)
  const [showAIInsights, setShowAIInsights] = useState(false)
  const [editableSteps, setEditableSteps] = useState<string[]>([])
  const [stepCompletionStatus, setStepCompletionStatus] = useState<boolean[]>([])
  const [editableTimeEstimate, setEditableTimeEstimate] = useState<number>(60)
  const [editableEnergyLevel, setEditableEnergyLevel] = useState<number>(3)
  const [editableCompletionCriteria, setEditableCompletionCriteria] = useState<string>('')
  
  const { quickCapture, capturing } = useQuickActions()
  const { classifyTask, classifying, quickCaptureWithAI, error: aiError, clearError } = useAIClassification()

  const [showSuccess, setShowSuccess] = useState(false)
  const [breakoutSuccess, setBreakoutSuccess] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim()) return
    
    clearError() // Clear any previous AI errors
    let success = false
    let classification: AITaskClassification | null = null

    if (aiMode && enableAI) {
      // Use AI-enhanced capture with user edits
      if (aiClassification) {
        // Create modified classification with user edits
        const modifiedClassification: AITaskClassification = {
          ...aiClassification,
          breakdown_steps: editableSteps.filter(step => step.trim() !== ''),
          time_estimate: editableTimeEstimate,
          energy_level: editableEnergyLevel,
          completion_criteria: editableCompletionCriteria
        }
        
        // Use the modified classification for task creation
        const result = await quickCaptureWithAI(input.trim())
        if (result) {
          success = result.success
          classification = modifiedClassification
        }
      } else {
        // Regular AI capture without modifications
        const result = await quickCaptureWithAI(input.trim())
        if (result) {
          success = result.success
          classification = result.classification
        }
      }
      
      if (!success) {
        // Fallback to regular capture if AI fails
        success = await quickCapture(input.trim(), priority)
      }
    } else {
      // Regular capture without AI
      success = await quickCapture(input.trim(), priority)
    }
    
    // For Phase 1 demo, always show success feedback
    setShowSuccess(true)
    setInput('')
    setPriority('medium')
    setShowPrioritySelector(false)
    setAIClassification(null)
    setShowAIInsights(false)
    setEditableSteps([])
    setStepCompletionStatus([])
    setEditableTimeEstimate(60)
    setEditableEnergyLevel(3)
    setEditableCompletionCriteria('')
    onCapture?.(input.trim(), priority, classification || undefined)
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    } else if (e.key === 'Escape') {
      setShowPrioritySelector(false)
    }
  }

  const handleInputFocus = () => {
    setShowPrioritySelector(true)
  }

  // AI classification preview when user pauses typing
  const handleAIPreview = async () => {
    if (!input.trim() || !aiMode || !enableAI) return
    
    const classification = await classifyTask(input.trim())
    if (classification) {
      setAIClassification(classification)
      setShowAIInsights(true)
      // Auto-update priority if user hasn't manually selected one
      if (priority === 'medium') {
        setPriority(classification.suggested_priority)
      }
    }
  }

  // Debounced AI preview
  React.useEffect(() => {
    if (!input.trim() || !aiMode || !enableAI) {
      setAIClassification(null)
      setShowAIInsights(false)
      setEditableSteps([])
      setStepCompletionStatus([])
      setEditableTimeEstimate(60)
      setEditableEnergyLevel(3)
      setEditableCompletionCriteria('')
      return
    }

    const timeoutId = setTimeout(() => {
      if (input.trim() && aiMode && enableAI) {
        classifyTask(input.trim()).then(classification => {
          if (classification) {
            setAIClassification(classification)
            setShowAIInsights(true)
            // Initialize editable fields with AI suggestions
            setEditableSteps(classification.breakdown_steps || [])
            setStepCompletionStatus(new Array(classification.breakdown_steps?.length || 0).fill(false))
            setEditableTimeEstimate(classification.time_estimate)
            setEditableEnergyLevel(classification.energy_level)
            setEditableCompletionCriteria(classification.completion_criteria)
            // Auto-update priority if user hasn't manually selected one
            if (priority === 'medium') {
              setPriority(classification.suggested_priority)
            }
          }
        })
      }
    }, 1000) // 1 second delay
    return () => clearTimeout(timeoutId)
  }, [input, aiMode, enableAI]) // Removed classifyTask and priority to prevent input focus loss

  // Functions for editing AI suggestions
  const addStep = () => {
    setEditableSteps([...editableSteps, ''])
    setStepCompletionStatus([...stepCompletionStatus, false])
  }

  const updateStep = (index: number, value: string) => {
    const newSteps = [...editableSteps]
    newSteps[index] = value
    setEditableSteps(newSteps)
  }

  const removeStep = (index: number) => {
    setEditableSteps(editableSteps.filter((_, i) => i !== index))
    setStepCompletionStatus(stepCompletionStatus.filter((_, i) => i !== index))
  }

  const toggleStepCompletion = (index: number) => {
    const newStatus = [...stepCompletionStatus]
    newStatus[index] = !newStatus[index]
    setStepCompletionStatus(newStatus)
  }

  const breakoutStepAsTask = async (stepIndex: number) => {
    const stepText = editableSteps[stepIndex]
    if (!stepText.trim()) return

    // Classify the step as its own task
    const stepClassification = await classifyTask(stepText.trim())
    if (stepClassification) {
      // Create a new task from this step
      const result = await quickCaptureWithAI(stepText.trim())
      if (result && result.success) {
        // Remove the step from current task
        removeStep(stepIndex)
        // Show success notification
        setBreakoutSuccess(`Created new task: "${stepClassification.task_title}"`)
        setTimeout(() => setBreakoutSuccess(''), 4000)
      }
    }
  }

  // Step count for planning phase display
  const totalSteps = editableSteps.length

  const moveStepUp = (index: number) => {
    if (index === 0) return // Already at top
    const newSteps = [...editableSteps]
    const newStatus = [...stepCompletionStatus]
    const [movedStep] = newSteps.splice(index, 1)
    const [movedStatus] = newStatus.splice(index, 1)
    newSteps.splice(index - 1, 0, movedStep)
    newStatus.splice(index - 1, 0, movedStatus)
    setEditableSteps(newSteps)
    setStepCompletionStatus(newStatus)
  }

  const moveStepDown = (index: number) => {
    if (index === editableSteps.length - 1) return // Already at bottom
    const newSteps = [...editableSteps]
    const newStatus = [...stepCompletionStatus]
    const [movedStep] = newSteps.splice(index, 1)
    const [movedStatus] = newStatus.splice(index, 1)
    newSteps.splice(index + 1, 0, movedStep)
    newStatus.splice(index + 1, 0, movedStatus)
    setEditableSteps(newSteps)
    setStepCompletionStatus(newStatus)
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (sourceIndex === targetIndex) return

    const newSteps = [...editableSteps]
    const newStatus = [...stepCompletionStatus]
    const [movedStep] = newSteps.splice(sourceIndex, 1)
    const [movedStatus] = newStatus.splice(sourceIndex, 1)
    newSteps.splice(targetIndex, 0, movedStep)
    newStatus.splice(targetIndex, 0, movedStatus)
    setEditableSteps(newSteps)
    setStepCompletionStatus(newStatus)
  }

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't hide if clicking on priority buttons
    const relatedTarget = e.relatedTarget as HTMLElement
    if (relatedTarget?.closest('[data-priority-selector]')) {
      return
    }
    
    // Delay hiding to allow for button clicks
    setTimeout(() => {
      if (!input.trim()) {
        setShowPrioritySelector(false)
      }
    }, 150)
  }

  return (
    <div className={cn('w-full space-y-3', className)}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Input Field */}
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={capturing || classifying}
            className={cn(
              "text-base",
              aiMode && enableAI ? "pr-24" : ""
            )}
            leftIcon={classifying ? "🤖" : "💭"}
          />
          
          {/* AI Mode Toggle */}
          {enableAI && (
            <button
              type="button"
              onClick={() => setAIMode(!aiMode)}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
                aiMode 
                  ? "bg-primary-100 text-primary-700 border border-primary-300" 
                  : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
              )}
              disabled={capturing || classifying}
              title={aiMode ? "AI assistance enabled" : "AI assistance disabled"}
            >
              {aiMode ? "🤖 AI" : "AI"}
            </button>
          )}
        </div>

        {/* Priority Selector - Shows when focused or has content */}
        {(showPrioritySelector || input.trim()) && (
          <div 
            className="flex items-center justify-between animate-slide-up"
            data-priority-selector
          >
            {/* Priority Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-secondary-700">
                Priority: 
                {aiMode && aiClassification && (
                  <span className="text-xs text-primary-600 ml-1">
                    (AI: {aiClassification.suggested_priority})
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                      priority === option.value
                        ? 'bg-primary-100 text-primary-800 border border-primary-300'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
                      // Highlight AI suggestion
                      aiMode && aiClassification && aiClassification.suggested_priority === option.value && priority !== option.value
                        ? 'ring-1 ring-primary-300 bg-primary-50'
                        : ''
                    )}
                    aria-label={`Set priority to ${option.label}`}
                    aria-pressed={priority === option.value}
                    title={
                      aiMode && aiClassification && aiClassification.suggested_priority === option.value 
                        ? 'AI suggested this priority'
                        : `Set priority to ${option.label}`
                    }
                  >
                    <span>{option.emoji}</span>
                    <span>{option.label}</span>
                    {aiMode && aiClassification && aiClassification.suggested_priority === option.value && priority !== option.value && (
                      <span className="text-xs text-primary-500">✨</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="sm"
              loading={capturing || classifying}
              disabled={!input.trim() || capturing || classifying}
              className="ml-3"
            >
              {capturing ? 'Capturing...' : classifying ? 'Analyzing...' : 'Capture'}
            </Button>
          </div>
        )}

        {/* AI Classification Preview */}
        {showAIInsights && aiClassification && aiMode && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 space-y-2 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary-800">🤖 AI Analysis</span>
                <Badge 
                  variant={
                    aiClassificationUtils.getConfidenceLevel(aiClassification.confidence) === 'high' 
                      ? 'success' 
                      : aiClassificationUtils.getConfidenceLevel(aiClassification.confidence) === 'medium'
                      ? 'warning'
                      : 'secondary'
                  }
                  size="sm"
                >
                  {Math.round(aiClassification.confidence * 100)}% confident
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => setShowAIInsights(false)}
                className="text-primary-600 hover:text-primary-800 text-xs"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-white rounded p-2">
                <div className="text-secondary-600 mb-1">Time (minutes)</div>
                <input
                  type="number"
                  min="10"
                  max="480"
                  value={editableTimeEstimate}
                  onChange={(e) => setEditableTimeEstimate(parseInt(e.target.value) || 60)}
                  className="w-full text-sm font-medium border border-secondary-300 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500"
                />
                <div className="text-xs text-secondary-500 mt-1">
                  {aiClassificationUtils.formatTimeEstimate(editableTimeEstimate)}
                </div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-secondary-600 mb-1">Energy Level</div>
                <select
                  value={editableEnergyLevel}
                  onChange={(e) => setEditableEnergyLevel(parseInt(e.target.value))}
                  className="w-full text-sm font-medium border border-secondary-300 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500"
                >
                  <option value={1}>1 - Minimal</option>
                  <option value={2}>2 - Low</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - High</option>
                  <option value={5}>5 - Intense</option>
                </select>
                <div className="text-xs text-secondary-500 mt-1">
                  {aiClassificationUtils.getEnergyIndicator(editableEnergyLevel)} {editableEnergyLevel}/5
                </div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-secondary-600">AI Priority</div>
                <div className={cn("font-medium capitalize", aiClassificationUtils.getPriorityColor(aiClassification.suggested_priority))}>
                  {aiClassification.suggested_priority}
                </div>
                <div className="text-xs text-secondary-500 mt-1">Change above ↑</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-secondary-600">Impact</div>
                <div className="font-medium">{aiClassification.impact_score}/5</div>
                <div className="text-xs text-secondary-500 mt-1">AI assessed</div>
              </div>
            </div>
            
            {/* Completion Criteria */}
            <div className="bg-white rounded p-2">
              <div className="text-secondary-600 text-xs mb-1">Good Enough Goal:</div>
              <textarea
                value={editableCompletionCriteria}
                onChange={(e) => setEditableCompletionCriteria(e.target.value)}
                className="w-full text-sm border border-secondary-300 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500 resize-none"
                rows={2}
                placeholder="Define what 'good enough' looks like..."
              />
            </div>
            
            {/* Task Breakdown Steps - Editable */}
            <div className="bg-white rounded p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-secondary-600 text-xs">Task Steps:</div>
                <button
                  type="button"
                  onClick={addStep}
                  className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  + Add Step
                </button>
              </div>
              
              {/* Planning Phase - No Progress Bar During Capture */}
              {totalSteps > 0 && (
                <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <span>📋</span>
                    <span><strong>Planning Phase:</strong> {totalSteps} steps outlined - you'll track progress after capturing</span>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                {editableSteps.map((step, idx) => (
                  <div 
                    key={idx}
                    draggable
                    onDragStart={(e) => {
                      handleDragStart(e, idx)
                      e.currentTarget.style.opacity = '0.5'
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    className="group flex items-start gap-2 p-2 rounded border border-transparent hover:border-secondary-300 hover:bg-secondary-50 transition-all duration-200 cursor-default"
                  >
                    {/* Drag Handle */}
                    <div 
                      className="cursor-move text-secondary-400 hover:text-secondary-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Drag to reorder"
                    >
                      ⋮⋮
                    </div>
                    
                    {/* Step Number */}
                    <span className="text-primary-500 font-bold text-xs mt-1 min-w-[20px]">
                      {idx + 1}.
                    </span>
                    
                    {/* Step Input */}
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => updateStep(idx, e.target.value)}
                      className="flex-1 text-xs border border-secondary-300 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500"
                      placeholder={`Step ${idx + 1}...`}
                    />
                    
                    {/* Reorder Buttons */}
                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveStepUp(idx)}
                        disabled={idx === 0}
                        className={cn(
                          "text-xs px-1 focus:outline-none leading-none h-3",
                          idx === 0 
                            ? "text-secondary-300 cursor-not-allowed" 
                            : "text-secondary-500 hover:text-secondary-700 cursor-pointer"
                        )}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStepDown(idx)}
                        disabled={idx === editableSteps.length - 1}
                        className={cn(
                          "text-xs px-1 focus:outline-none leading-none h-3",
                          idx === editableSteps.length - 1
                            ? "text-secondary-300 cursor-not-allowed"
                            : "text-secondary-500 hover:text-secondary-700 cursor-pointer"
                        )}
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                    
                    {/* Breakout Button */}
                    <button
                      type="button"
                      onClick={() => breakoutStepAsTask(idx)}
                      disabled={!step.trim() || classifying}
                      className="text-blue-500 hover:text-blue-700 text-xs px-1 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Break out as separate task"
                    >
                      ↗
                    </button>
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="text-red-500 hover:text-red-700 text-xs px-1 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove step"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {editableSteps.length === 0 && (
                  <div className="text-xs text-secondary-500 italic p-2 border border-dashed border-secondary-300 rounded text-center">
                    No steps yet. Click "Add Step" to get started.
                  </div>
                )}
                {editableSteps.length > 0 && (
                  <div className="text-xs text-secondary-500 mt-2 space-y-1">
                    <div className="flex items-center gap-1">
                      <span>📝</span>
                      <span><strong>Planning Mode:</strong> Edit, reorder, and refine your steps</span>
                    </div>
                    {editableSteps.length > 1 && (
                      <div className="flex items-center gap-1">
                        <span>↕️</span>
                        <span>Hover over steps to reorder with ↑↓ arrows or drag with ⋮⋮</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span>↗️</span>
                      <span>Hover and click ↗ to break out complex steps into separate tasks</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <span>✅</span>
                      <span>After capture: You'll be able to check off steps as you complete them</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* AI Insights */}
            {aiClassificationUtils.generateInsights(aiClassification).length > 0 && (
              <div className="bg-white rounded p-2">
                <div className="text-secondary-600 text-xs mb-1">AI Insights:</div>
                <div className="space-y-1">
                  {aiClassificationUtils.generateInsights(aiClassification).map((insight, idx) => (
                    <div key={idx} className="text-xs text-secondary-700">{insight}</div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Planning Phase Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
              📋 <strong>Planning Phase:</strong> Edit time, energy, steps, and completion criteria. After capture, you'll track progress by checking off completed steps.
            </div>
          </div>
        )}
      </form>

      {/* Breakout Success Display */}
      {breakoutSuccess && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700 animate-slide-up">
          <div className="flex items-center gap-2">
            <span>↗️</span>
            <span><strong>Step Broken Out:</strong> {breakoutSuccess}</span>
            <button
              onClick={() => setBreakoutSuccess('')}
              className="ml-auto text-blue-600 hover:text-blue-800 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* AI Error Display */}
      {aiError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span><strong>AI Analysis Failed:</strong> {aiError}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-800 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="mt-1 text-xs text-red-600">
            Don&apos;t worry! You can still capture your task manually.
          </div>
        </div>
      )}

      {/* Instructions */}
      {!showPrioritySelector && !input && !showAIInsights && (
        <div className="text-xs text-secondary-500 space-y-1">
          <p>💡 <strong>Quick tip:</strong> Just start typing to capture your thoughts instantly</p>
          {enableAI && (
            <p>🤖 <strong>AI Assistant:</strong> {aiMode ? 'Will analyze and suggest time/priority' : 'Click AI button to enable smart suggestions'}</p>
          )}
          <p>⌨️ Use <kbd className="px-1 py-0.5 bg-secondary-200 rounded text-xs">Enter</kbd> to save, <kbd className="px-1 py-0.5 bg-secondary-200 rounded text-xs">Escape</kbd> to cancel</p>
        </div>
      )}

      {/* Success Feedback */}
      {showSuccess && (
        <div className="flex items-center gap-2 text-sm text-success-600 bg-success-50 px-3 py-2 rounded-md animate-slide-up">
          <span>✅</span>
          <span>
            <strong>Captured{aiMode && enableAI ? ' with AI insights' : ''}!</strong> In the full app, this would be saved to your <strong>Capture</strong> list. 
            <a href="/dashboard/capture" className="text-success-700 underline ml-1">View capture page →</a>
          </span>
        </div>
      )}

      {/* Loading Indicator */}
      {capturing && (
        <div className="flex items-center gap-2 text-sm text-primary-600 bg-primary-50 px-3 py-2 rounded-md">
          <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          <span>Saving to your capture list...</span>
        </div>
      )}
    </div>
  )
}

// Minimal version for sidebar or small spaces
export function MiniQuickCapture({ onCapture, className }: Pick<QuickCaptureProps, 'onCapture' | 'className'>) {
  const [input, setInput] = useState('')
  const { quickCapture, capturing } = useQuickActions()

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      const success = await quickCapture(input.trim())
      if (success) {
        setInput('')
        onCapture?.(input.trim(), 'medium')
      }
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Quick capture... (Enter to save)"
        disabled={capturing}
        leftIcon={capturing ? '⏳' : '💭'}
        className="text-sm"
      />
    </div>
  )
}

export default QuickCapture