'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Check, 
  X, 
  ArrowUp, 
  ArrowDown, 
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Target,
  Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Subtask {
  id: string
  title: string
  completed: boolean
  energy_required: number
  order: number
  created_at: string
}

interface SubtaskManagerProps {
  taskId: string
  taskTitle: string
  subtasks: Subtask[]
  onSubtaskAdd?: (title: string, energy: number) => void
  onSubtaskComplete?: (subtaskId: string) => void
  onSubtaskPromote?: (subtaskId: string) => void
  onSubtaskDelete?: (subtaskId: string) => void
  onSubtaskReorder?: (subtaskId: string, newOrder: number) => void
  onAIGenerate?: () => void
  generatingAI?: boolean
  className?: string
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function SubtaskManager({
  taskId,
  taskTitle,
  subtasks,
  onSubtaskAdd,
  onSubtaskComplete,
  onSubtaskPromote,
  onSubtaskDelete,
  onSubtaskReorder,
  onAIGenerate,
  generatingAI = false,
  className,
  collapsed = false,
  onToggleCollapse
}: SubtaskManagerProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [newSubtaskEnergy, setNewSubtaskEnergy] = useState(2)
  const [showAddForm, setShowAddForm] = useState(false)

  const completedCount = subtasks.filter(st => st.completed).length
  const totalCount = subtasks.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return
    
    onSubtaskAdd?.(newSubtaskTitle.trim(), newSubtaskEnergy)
    setNewSubtaskTitle('')
    setNewSubtaskEnergy(2)
    setShowAddForm(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubtask()
    } else if (e.key === 'Escape') {
      setShowAddForm(false)
      setNewSubtaskTitle('')
    }
  }

  const getEnergyColor = (energy: number) => {
    if (energy <= 2) return 'bg-green-500'
    if (energy <= 4) return 'bg-yellow-500' 
    if (energy <= 6) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const moveSubtask = (subtaskId: string, direction: 'up' | 'down') => {
    const currentSubtask = subtasks.find(st => st.id === subtaskId)
    if (!currentSubtask) return

    const currentOrder = currentSubtask.order
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1
    
    // Check bounds
    if (newOrder < 0 || newOrder >= subtasks.length) return
    
    onSubtaskReorder?.(subtaskId, newOrder)
  }

  return (
    <Card className={cn('border-l-4 border-l-purple-500', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <Target className="h-5 w-5 text-purple-500" />
            {taskTitle}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {completedCount}/{totalCount} steps
            </Badge>
            <div className="flex gap-1">
              {onAIGenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAIGenerate}
                  disabled={generatingAI}
                  className="text-blue-600 hover:text-blue-700"
                  title="Generate steps with AI"
                >
                  {generatingAI ? (
                    <Brain className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Brain className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="text-purple-600 hover:text-purple-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-3">
          {/* Add Subtask Form */}
          {showAddForm && (
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="space-y-3">
                <Input
                  placeholder="What's the next step?"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">Energy:</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map(level => (
                      <button
                        key={level}
                        onClick={() => setNewSubtaskEnergy(level)}
                        className={cn(
                          'w-6 h-6 rounded-full border-2 transition-colors',
                          newSubtaskEnergy >= level 
                            ? 'border-purple-500 bg-purple-500' 
                            : 'border-gray-300 hover:border-purple-300'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{newSubtaskEnergy} energy</span>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddSubtask} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Step
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Subtasks List */}
          {subtasks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No steps yet. Break this task down into manageable steps.</p>
              {!showAddForm && (
                <div className="flex gap-2 mt-2 justify-center">
                  {onAIGenerate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAIGenerate}
                      disabled={generatingAI}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      {generatingAI ? (
                        <Brain className="h-4 w-4 mr-1 animate-pulse" />
                      ) : (
                        <Brain className="h-4 w-4 mr-1" />
                      )}
                      {generatingAI ? 'Generating...' : 'AI Breakdown'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Step
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {subtasks
                .sort((a, b) => a.order - b.order)
                .map((subtask, index) => (
                  <div
                    key={subtask.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                      subtask.completed 
                        ? 'bg-green-50 border-green-200 opacity-75' 
                        : 'bg-white border-gray-200 hover:border-purple-300'
                    )}
                  >
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => onSubtaskComplete?.(subtask.id)}
                      className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                        subtask.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-purple-500'
                      )}
                    >
                      {subtask.completed && <Check className="h-3 w-3" />}
                    </button>

                    {/* Step Content */}
                    <div className="flex-1">
                      <span className={cn(
                        'font-medium',
                        subtask.completed && 'line-through text-gray-500'
                      )}>
                        {subtask.title}
                      </span>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${getEnergyColor(subtask.energy_required)}`} />
                        <span className="text-xs text-gray-500">
                          {subtask.energy_required} energy
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {/* Reorder buttons */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSubtask(subtask.id, 'up')}
                        disabled={index === 0}
                        className="p-1 h-6 w-6"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSubtask(subtask.id, 'down')}
                        disabled={index === subtasks.length - 1}
                        className="p-1 h-6 w-6"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>

                      {/* Promote to main task */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSubtaskPromote?.(subtask.id)}
                        className="p-1 h-6 w-6 text-blue-600 hover:text-blue-700"
                        title="Promote to main task"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSubtaskDelete?.(subtask.id)}
                        className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Task Summary */}
          {subtasks.length > 0 && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-purple-900">
                  Total Energy: {subtasks.reduce((sum, st) => sum + st.energy_required, 0)}
                </span>
                <span className="text-purple-700">
                  {completedCount} of {totalCount} steps complete
                </span>
              </div>
              
              {progressPercentage === 100 && (
                <div className="mt-2 text-green-700 font-medium text-sm">
                  🎉 All steps completed! This task is ready to be marked as done.
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default SubtaskManager