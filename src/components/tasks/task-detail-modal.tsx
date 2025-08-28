'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Save, 
  X, 
  Clock, 
  Zap, 
  Calendar, 
  Tag,
  Target,
  CheckCircle,
  ArrowUp,
  Flag,
  Brain
} from 'lucide-react'
import { SubtaskManager } from './subtask-manager'
import { useAIClassification } from '@/lib/hooks/use-ai-classification'
import { tasksAPI } from '@/lib/api/tasks-mock'
import type { Task, Priority } from '@/lib/types'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave?: (updates: Partial<Task>) => void
  onComplete?: (task: Task) => void
  onPromote?: (task: Task) => void
  onDelete?: (task: Task) => void
}

interface Subtask {
  id: string
  title: string
  completed: boolean
  energy_required: number
  order: number
  created_at: string
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; emoji: string }[] = [
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50', emoji: '⚪' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50', emoji: '🟡' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-50', emoji: '🟠' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-50', emoji: '🔴' },
]

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onSave,
  onComplete,
  onPromote,
  onDelete
}: TaskDetailModalProps) {
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [subtasksCollapsed, setSubtasksCollapsed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false)
  
  // AI Classification for subtask generation
  const { classifyTask, classifying: aiClassifying } = useAIClassification()

  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title,
        description: task.description,
        priority: task.priority,
        energy_required: task.energy_required,
        estimated_duration: task.estimated_duration,
        due_date: task.due_date,
        tags: task.tags || []
      })
      
      // Load actual subtasks from localStorage (for demo mode)
      try {
        const savedSubtasks = localStorage.getItem(`subtasks_${task.id}`)
        if (savedSubtasks) {
          const parsed = JSON.parse(savedSubtasks)
          console.log('📋 Loaded subtasks for task', task.id, ':', parsed)
          setSubtasks(parsed)
        } else {
          console.log('📋 No subtasks found for task', task.id)
          setSubtasks([])
        }
      } catch (error) {
        console.error('Failed to load subtasks:', error)
        setSubtasks([])
      }
    }
  }, [task])

  if (!task) return null

  const handleSave = () => {
    onSave?.(editedTask)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      energy_required: task.energy_required,
      estimated_duration: task.estimated_duration,
      due_date: task.due_date,
      tags: task.tags || []
    })
    setIsEditing(false)
  }

  const getPriorityStyle = (priority: Priority) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1]
  }

  const completedSubtasks = subtasks.filter(st => st.completed).length
  const totalSubtasks = subtasks.length
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return ''
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // AI-powered subtask generation
  const generateAISubtasks = async () => {
    if (!task) return
    
    setGeneratingSubtasks(true)
    try {
      const taskText = `${task.title}${task.description ? ': ' + task.description : ''}`
      console.log('🤖 Generating AI subtasks for:', taskText)
      
      const classification = await classifyTask(taskText)
      if (classification && classification.breakdown_steps) {
        const newSubtasks: Subtask[] = classification.breakdown_steps.map((step, index) => ({
          id: `subtask_${Date.now()}_${index}`,
          title: step,
          completed: false,
          task_id: task.id,
          order: subtasks.length + index,
          energy_required: Math.ceil(classification.energy_level / classification.breakdown_steps.length),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        
        setSubtasks(prev => {
          const updated = [...prev, ...newSubtasks]
          // Save to localStorage
          localStorage.setItem(`subtasks_${task.id}`, JSON.stringify(updated))
          return updated
        })
        console.log('✨ Generated', newSubtasks.length, 'AI subtasks')
      }
    } catch (error) {
      console.error('Failed to generate AI subtasks:', error)
    } finally {
      setGeneratingSubtasks(false)
    }
  }

  // AI energy estimation for tasks
  const estimateTaskEnergy = async () => {
    if (!task || !isEditing) return
    
    try {
      const taskText = `${editedTask.title || task.title}${editedTask.description || task.description ? ': ' + (editedTask.description || task.description) : ''}`
      const classification = await classifyTask(taskText)
      
      if (classification) {
        setEditedTask(prev => ({
          ...prev,
          energy_required: classification.energy_level,
          estimated_duration: classification.time_estimate
        }))
        console.log('🤖 AI estimated energy:', classification.energy_level, 'time:', classification.time_estimate)
      }
    } catch (error) {
      console.error('Failed to estimate task energy:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Task Details
            </span>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  {task.status === 'capture' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onPromote?.(task)}
                      className="text-blue-600"
                    >
                      <ArrowUp className="h-4 w-4 mr-1" />
                      Move to Today
                    </Button>
                  )}
                  {task.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      onClick={() => onComplete?.(task)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Task Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  {isEditing ? (
                    <Input
                      value={editedTask.title || ''}
                      onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Task title"
                    />
                  ) : (
                    <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={editedTask.description || ''}
                      onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Add a description..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-600">
                      {task.description || 'No description provided'}
                    </p>
                  )}
                </div>

                {/* Task Properties Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    {isEditing ? (
                      <select
                        value={editedTask.priority || 'medium'}
                        onChange={(e) => setEditedTask(prev => ({ ...prev, priority: e.target.value as Priority }))}
                        className="w-full p-2 border rounded-md"
                      >
                        {PRIORITY_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.emoji} {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge className={getPriorityStyle(task.priority).color}>
                        <Flag className="h-3 w-3 mr-1" />
                        {getPriorityStyle(task.priority).label}
                      </Badge>
                    )}
                  </div>

                  {/* Energy Required */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Energy Required
                      </label>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={estimateTaskEnergy}
                          disabled={aiClassifying}
                          className="text-blue-600 hover:text-blue-700 h-auto p-1"
                          title="AI estimate energy and time"
                        >
                          {aiClassifying ? (
                            <Brain className="h-3 w-3 animate-pulse" />
                          ) : (
                            <Brain className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={editedTask.energy_required || 3}
                        onChange={(e) => setEditedTask(prev => ({ ...prev, energy_required: parseInt(e.target.value) }))}
                      />
                    ) : (
                      <Badge variant="outline">
                        <Zap className="h-3 w-3 mr-1" />
                        {task.energy_required}
                      </Badge>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Time
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        placeholder="Minutes"
                        value={editedTask.estimated_duration || ''}
                        onChange={(e) => setEditedTask(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || null }))}
                      />
                    ) : (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(task.estimated_duration) || 'Not set'}
                      </Badge>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedTask.due_date || ''}
                        onChange={(e) => setEditedTask(prev => ({ ...prev, due_date: e.target.value || null }))}
                      />
                    ) : (
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(task.due_date) || 'No due date'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  {isEditing ? (
                    <Input
                      placeholder="Add tags separated by commas"
                      value={editedTask.tags?.join(', ') || ''}
                      onChange={(e) => setEditedTask(prev => ({ 
                        ...prev, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      }))}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {task.tags && task.tags.length > 0 ? (
                        task.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No tags</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subtasks Section */}
          <SubtaskManager
            taskId={task.id}
            taskTitle={task.title}
            subtasks={subtasks}
            collapsed={subtasksCollapsed}
            onToggleCollapse={() => setSubtasksCollapsed(!subtasksCollapsed)}
            onAIGenerate={generateAISubtasks}
            generatingAI={generatingSubtasks}
            onSubtaskAdd={(title, energy) => {
              const newSubtask: Subtask = {
                id: Date.now().toString(),
                title,
                energy_required: energy,
                completed: false,
                order: subtasks.length,
                created_at: new Date().toISOString()
              }
              setSubtasks(prev => [...prev, newSubtask])
            }}
            onSubtaskComplete={(subtaskId) => {
              setSubtasks(prev => {
                const updated = prev.map(st => 
                  st.id === subtaskId ? { ...st, completed: !st.completed } : st
                )
                // Save to localStorage
                localStorage.setItem(`subtasks_${task.id}`, JSON.stringify(updated))
                return updated
              })
            }}
            onSubtaskPromote={async (subtaskId) => {
              const subtask = subtasks.find(st => st.id === subtaskId)
              if (subtask) {
                try {
                  // Create a new independent task from the subtask
                  const result = await tasksAPI.createTask({
                    title: subtask.title,
                    priority: 'medium',
                    energy_required: subtask.energy_required,
                    status: 'captured'
                  })
                  
                  if (!result.error) {
                    // Remove the subtask from the current task
                    setSubtasks(prev => prev.filter(st => st.id !== subtaskId))
                    console.log('✅ Promoted subtask to independent task:', subtask.title)
                  }
                } catch (error) {
                  console.error('Failed to promote subtask:', error)
                }
              }
            }}
            onSubtaskDelete={(subtaskId) => {
              setSubtasks(prev => prev.filter(st => st.id !== subtaskId))
            }}
            onSubtaskReorder={(subtaskId, newOrder) => {
              setSubtasks(prev => {
                const reordered = [...prev]
                const itemIndex = reordered.findIndex(st => st.id === subtaskId)
                const [item] = reordered.splice(itemIndex, 1)
                reordered.splice(newOrder, 0, item)
                
                // Update order values
                return reordered.map((st, index) => ({ ...st, order: index }))
              })
            }}
          />

          {/* Task Metadata */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created:</span> {formatDate(task.created_at)}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {formatDate(task.updated_at)}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <Badge variant="outline" className="ml-1">
                    {task.status}
                  </Badge>
                </div>
              </div>
              
              {task.completed_at && (
                <div className="mt-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Completed: {formatDate(task.completed_at)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Button */}
          {isEditing && (
            <div className="flex justify-end pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => onDelete?.(task)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Delete Task
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskDetailModal