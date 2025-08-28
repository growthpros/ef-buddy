'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Brain, 
  Target, 
  CheckCircle,
  Clock,
  Zap,
  Filter,
  ArrowUp,
  Play,
  Pause,
  MoreHorizontal,
  TrendingUp,
  Calendar,
  Maximize,
  Minimize
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { QuickCapture } from '@/components/tasks/quick-capture'
import { TaskCard } from '@/components/tasks/task-card'
import { TaskDetailModal } from '@/components/tasks/task-detail-modal'
import { withAuth, useAuth } from '@/contexts/auth-context'
import { tasksAPI } from '@/lib/api/tasks-mock'
import type { Task, TaskStatus, Priority, DailyLoad } from '@/lib/types'
import type { AITaskClassification } from '@/lib/hooks/use-ai-classification'

function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [capturedTasks, setCapturedTasks] = useState<Task[]>([])
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [thisWeekTasks, setThisWeekTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [dailyLoad, setDailyLoad] = useState<DailyLoad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [activeView, setActiveView] = useState<'capture' | 'today' | 'triage' | 'all'>('capture')

  // Spoon integration from neuro-check
  const [dailySpoons, setDailySpoons] = useState(12) // This would come from neuro-check results
  const [availableSpoons, setAvailableSpoons] = useState(12)
  
  // Undo functionality
  const [undoStack, setUndoStack] = useState<Array<{ action: string; data: any; timestamp: number }>>([])
  const [showUndoNotification, setShowUndoNotification] = useState(false)
  
  // Fullscreen mode for All Tasks
  const [fullscreenAllTasks, setFullscreenAllTasks] = useState(false)

  useEffect(() => {
    loadTasks()
    loadDailyLoad()
    
    // Seed demo data if in demo mode and no neuro-check data exists
    if (typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true') {
      const today = new Date().toISOString().split('T')[0]
      const todayKey = `neuro-check-${today}`
      
      if (!localStorage.getItem(todayKey)) {
        console.log('🎯 Demo mode: Creating demo neuro-check data with 8 spoons')
        const demoNeuroCheckData = {
          mood_level: 4,
          energy_units: 4,
          focus_capacity: 4,
          stress_level: 3,
          brain_mode: 'Normal',
          burnout_flags: [],
          sensory_state: 'balanced',
          sleep_quality: 'good',
          notes: 'Demo data for testing',
          capacity_today: 8,
          spoon_expansion_efforts: ['meditation', 'protein'],
          completed_at: new Date().toISOString()
        }
        localStorage.setItem(todayKey, JSON.stringify(demoNeuroCheckData))
        console.log('✅ Demo neuro-check data created')
      }
    }
    
    loadSpoonCapacity()
    
    // Listen for storage changes to sync spoon capacity
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('neuro-check-')) {
        console.log('🔄 Detected neuro-check data change via storage event, reloading spoon capacity')
        setTimeout(loadSpoonCapacity, 100) // Small delay to ensure data is saved
      }
    }
    
    // Listen for custom events from neuro-check completion
    const handleNeuroCheckComplete = (e: CustomEvent) => {
      console.log('🔄 Received neuro-check completion event:', e.detail)
      setTimeout(loadSpoonCapacity, 100)
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('neuro-check-completed', handleNeuroCheckComplete as EventListener)
    
    // Also check for changes when the page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing spoon capacity')
        loadSpoonCapacity()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('neuro-check-completed', handleNeuroCheckComplete as EventListener)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Load current spoon capacity from neuro-check results
  const loadSpoonCapacity = () => {
    console.log('🔄 loadSpoonCapacity called - starting spoon capacity check')
    
    try {
      // Get all localStorage keys with neuro-check data
      const neuroCheckKeys = []
      const allKeys = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          allKeys.push(key)
          if (key.startsWith('neuro-check-')) {
            neuroCheckKeys.push(key)
          }
        }
      }
      
      console.log('🔍 All localStorage keys:', allKeys)
      console.log('🔍 Found neuro-check data keys:', neuroCheckKeys)
      
      // Also check today's date specifically
      const today = new Date().toISOString().split('T')[0]
      const todayKey = `neuro-check-${today}`
      console.log('🔍 Today\'s date:', today)
      console.log('🔍 Looking specifically for today key:', todayKey)
      console.log('🔍 Today key exists?', !!localStorage.getItem(todayKey))
      
      // Check all dates available
      neuroCheckKeys.forEach(key => {
        const dateFromKey = key.replace('neuro-check-', '')
        console.log(`📅 Available neuro-check date: ${dateFromKey} (key: ${key})`)
      })
      
      // Sort by date (most recent first) and add today's key if it exists
      const keysToCheck = [...neuroCheckKeys]
      if (!keysToCheck.includes(todayKey) && localStorage.getItem(todayKey)) {
        keysToCheck.unshift(todayKey)
      }
      
      keysToCheck.sort((a, b) => {
        const dateA = a.replace('neuro-check-', '')
        const dateB = b.replace('neuro-check-', '')
        return dateB.localeCompare(dateA)
      })
      
      console.log('🔍 Keys to check in order:', keysToCheck)
      
      // Try to find the most recent completed neuro-check
      for (const key of keysToCheck) {
        try {
          const neuroCheckData = localStorage.getItem(key)
          if (neuroCheckData) {
            const parsed = JSON.parse(neuroCheckData)
            console.log(`📋 Checking neuro-check data from ${key}:`, parsed)
            console.log(`📋 Has capacity_today: ${parsed.capacity_today !== undefined} (value: ${parsed.capacity_today})`)
            console.log(`📋 Has completed_at: ${!!parsed.completed_at} (value: ${parsed.completed_at})`)
            
            // Check if this is a completed neuro-check with capacity data
            if (parsed.capacity_today !== undefined && parsed.completed_at) {
              console.log(`✅ Found valid completed neuro-check! Using spoon capacity from ${key}: ${parsed.capacity_today}`)
              console.log(`🔄 Setting dailySpoons to ${parsed.capacity_today}`)
              console.log(`🔄 Setting availableSpoons to ${parsed.capacity_today}`)
              setDailySpoons(parsed.capacity_today)
              setAvailableSpoons(parsed.capacity_today) // Start with full capacity
              console.log(`✅ Spoon capacity updated! Daily: ${parsed.capacity_today}, Available: ${parsed.capacity_today}`)
              return // Found valid data, stop searching
            } else if (parsed.capacity_today !== undefined && key === todayKey) {
              console.log(`⚠️ Found TODAY'S capacity but no completion timestamp: ${parsed.capacity_today}`)
              console.log(`🔄 Setting spoons anyway since it's today's data`)
              setDailySpoons(parsed.capacity_today)
              setAvailableSpoons(parsed.capacity_today)
              return
            } else if (parsed.capacity_today !== undefined) {
              console.log(`⚠️ Found capacity from previous day but no completion timestamp: ${parsed.capacity_today} from ${key}`)
              // Don't use old incomplete data, continue searching
            } else {
              console.log(`❌ Key ${key} has no capacity_today field`)
            }
          } else {
            console.log(`❌ Key ${key} has no data`)
          }
        } catch (parseError) {
          console.error(`Failed to parse neuro-check data from ${key}:`, parseError)
        }
      }
      
      console.log('⚠️ No valid neuro-check data found, keeping current spoons')
      console.log(`🔍 Current state - dailySpoons: ${dailySpoons}, availableSpoons: ${availableSpoons}`)
    } catch (error) {
      console.error('Failed to load spoon capacity from neuro-check:', error)
      // Keep default values
    }
  }

  const loadTasks = async () => {
    setLoading(true)
    try {
      const [capturedResult, todayResult, thisWeekResult, completedResult] = await Promise.all([
        tasksAPI.getCapturedTasks(),
        tasksAPI.getTodayTasks(),
        tasksAPI.getThisWeekTasks(),
        tasksAPI.getCompletedTasks()
      ])

      if (capturedResult.error) throw new Error(capturedResult.error)
      if (todayResult.error) throw new Error(todayResult.error)
      if (thisWeekResult.error) throw new Error(thisWeekResult.error)
      if (completedResult.error) throw new Error(completedResult.error)

      setCapturedTasks(capturedResult.data || [])
      setTodayTasks(todayResult.data || [])
      setThisWeekTasks(thisWeekResult.data || [])
      setCompletedTasks(completedResult.data || [])
      
      // Combine all tasks for full list
      const allTasks = [
        ...(capturedResult.data || []),
        ...(todayResult.data || []),
        ...(thisWeekResult.data || []),
        ...(completedResult.data || [])
      ]
      setTasks(allTasks)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const loadDailyLoad = async () => {
    try {
      const result = await tasksAPI.getDailyLoad()
      if (result.error) throw new Error(result.error)
      setDailyLoad(result.data)
      
      // Calculate available spoons based on load
      if (result.data) {
        const usedSpoons = Math.ceil(result.data.completed_energy / 2) // 2 energy = 1 spoon roughly
        setAvailableSpoons(Math.max(0, dailySpoons - usedSpoons))
      }
    } catch (err) {
      console.error('Failed to load daily load:', err)
    }
  }

  const handleTaskCapture = async (title: string, priority: Priority, aiClassification?: AITaskClassification) => {
    console.log('📝 Task captured:', { title, priority, aiClassification })
    
    try {
      // Create the task using the tasksAPI
      const taskData = {
        title,
        priority,
        status: 'capture' as TaskStatus,
        energy_required: aiClassification?.energy_level || 3,
        estimated_duration: aiClassification?.time_estimate || null,
        description: aiClassification?.completion_criteria || null
      }
      
      const result = await tasksAPI.createTask(taskData)
      if (result.error) {
        throw new Error(result.error)
      }
      
      console.log('✅ Task created successfully:', result.data)
      
      // If AI provided breakdown steps, store them for the task
      if (aiClassification?.breakdown_steps && aiClassification.breakdown_steps.length > 0) {
        console.log('📋 Storing AI breakdown steps for task:', aiClassification.breakdown_steps)
        // Store subtasks in localStorage for demo mode
        const subtasks = aiClassification.breakdown_steps.map((step, index) => ({
          id: `subtask_${result.data?.id}_${index}`,
          title: step,
          completed: false,
          task_id: result.data?.id,
          order: index,
          energy_required: Math.ceil(aiClassification.energy_level / aiClassification.breakdown_steps.length),
          created_at: new Date().toISOString()
        }))
        
        localStorage.setItem(`subtasks_${result.data?.id}`, JSON.stringify(subtasks))
      }
      
      await loadTasks() // Refresh task lists to show the new task
    } catch (error) {
      console.error('❌ Failed to create task:', error)
      setError(error instanceof Error ? error.message : 'Failed to create task')
    }
  }

  // Undo functionality
  const addToUndoStack = (action: string, data: any) => {
    setUndoStack(prev => [...prev.slice(-4), { action, data, timestamp: Date.now() }]) // Keep last 5 actions
    setShowUndoNotification(true)
    setTimeout(() => setShowUndoNotification(false), 5000) // Hide after 5 seconds
  }

  const handleUndo = async () => {
    if (undoStack.length === 0) return
    
    const lastAction = undoStack[undoStack.length - 1]
    setUndoStack(prev => prev.slice(0, -1))
    
    try {
      switch (lastAction.action) {
        case 'complete':
          await tasksAPI.updateTask(lastAction.data.id, { status: lastAction.data.originalStatus })
          break
        case 'promote':
          await tasksAPI.updateTask(lastAction.data.id, { status: 'capture' })
          break
        case 'delete':
          // For delete, we would need to restore the task (this is more complex)
          console.log('Undo delete not yet implemented')
          break
      }
      await loadTasks()
      await loadDailyLoad()
    } catch (error) {
      console.error('Undo failed:', error)
      setError('Failed to undo action')
    }
  }

  const handleTaskComplete = async (task: Task) => {
    try {
      // Add to undo stack before making changes
      addToUndoStack('complete', { id: task.id, originalStatus: task.status })
      
      const result = await tasksAPI.completeTask(task.id)
      if (result.error) throw new Error(result.error)
      await loadTasks()
      await loadDailyLoad()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task')
    }
  }

  const handleTaskPromote = async (task: Task) => {
    try {
      // Add to undo stack before making changes
      addToUndoStack('promote', { id: task.id, originalStatus: task.status })
      
      const result = await tasksAPI.moveToToday(task.id)
      if (result.error) throw new Error(result.error)
      await loadTasks()
      await loadDailyLoad()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote task')
    }
  }

  const handleTaskPromoteToWeek = async (task: Task) => {
    try {
      // Add to undo stack before making changes
      addToUndoStack('promote_week', { id: task.id, originalStatus: task.status })
      
      const result = await tasksAPI.moveToThisWeek(task.id)
      if (result.error) throw new Error(result.error)
      await loadTasks()
      await loadDailyLoad()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote task to this week')
    }
  }

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task)
    setShowTaskDetails(true)
  }

  const handleTaskSave = async (updates: Partial<Task>) => {
    if (!selectedTask) return
    
    try {
      const result = await tasksAPI.updateTask(selectedTask.id, updates)
      if (result.error) throw new Error(result.error)
      await loadTasks()
      setShowTaskDetails(false)
      setSelectedTask(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const handleTaskDelete = async (task: Task) => {
    try {
      const result = await tasksAPI.deleteTask(task.id)
      if (result.error) throw new Error(result.error)
      await loadTasks()
      setShowTaskDetails(false)
      setSelectedTask(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const handleSmartTriage = async () => {
    try {
      const result = await tasksAPI.smartMoveToToday(availableSpoons * 2) // Convert spoons to energy
      if (result.error) throw new Error(result.error)
      await loadTasks()
      await loadDailyLoad()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run smart triage')
    }
  }

  const getEnergyColor = (energy: number) => {
    if (energy <= 2) return 'bg-green-500'
    if (energy <= 4) return 'bg-yellow-500' 
    if (energy <= 6) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getSpoonStatus = () => {
    const percentage = (availableSpoons / dailySpoons) * 100
    if (percentage > 70) return { status: 'high', color: 'text-green-600 bg-green-50', label: 'Plenty of energy' }
    if (percentage > 30) return { status: 'moderate', color: 'text-yellow-600 bg-yellow-50', label: 'Moderate energy' }
    return { status: 'low', color: 'text-red-600 bg-red-50', label: 'Low energy - be gentle' }
  }

  const spoonStatus = getSpoonStatus()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading your tasks...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
              <p className="text-gray-600 mt-1">
                Capture, organize, and complete your tasks with executive function support
              </p>
            </div>
            
            {/* Spoon Status */}
            <Card className={`${spoonStatus.color} border-0`}>
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5" />
                  <div>
                    <div className="font-medium">
                      {availableSpoons}/{dailySpoons} spoons left
                    </div>
                    <div className="text-sm opacity-80">{spoonStatus.label}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadSpoonCapacity}
                    className="ml-2 opacity-60 hover:opacity-100"
                    title="Refresh spoon capacity from neuro-check"
                  >
                    🔄
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Tabs */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveView('capture')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeView === 'capture'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Capture
            </button>
            <button
              onClick={() => setActiveView('today')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeView === 'today'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Target className="h-4 w-4 inline mr-2" />
              Today ({todayTasks.length})
            </button>
            <button
              onClick={() => setActiveView('triage')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeView === 'triage'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Brain className="h-4 w-4 inline mr-2" />
              Triage & Planning
            </button>
            <button
              onClick={() => setActiveView('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeView === 'all'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle className="h-4 w-4 inline mr-2" />
              All Tasks ({tasks.length})
            </button>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Undo Functionality */}
          {undoStack.length > 0 && (
            <Alert className={`border-blue-200 bg-blue-50 ${showUndoNotification ? 'ring-2 ring-blue-300 shadow-lg' : ''}`}>
              <AlertDescription className="flex items-center justify-between">
                <span className="text-blue-800">
                  {showUndoNotification 
                    ? `Action completed. ${undoStack[undoStack.length - 1].action} can be undone.`
                    : `${undoStack.length} action${undoStack.length > 1 ? 's' : ''} can be undone`
                  }
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    <ArrowUp className="h-3 w-3 mr-1 rotate-180" />
                    Undo {undoStack[undoStack.length - 1]?.action || 'Last Action'}
                  </Button>
                  {undoStack.length > 1 && (
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      +{undoStack.length - 1} more
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          {activeView === 'capture' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Capture */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5 text-blue-500" />
                      Quick Task Capture
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuickCapture
                      onCapture={handleTaskCapture}
                      placeholder="What's on your mind? Describe your task..."
                      autoFocus
                      enableAI={true}
                    />
                  </CardContent>
                </Card>

                {/* Captured Tasks */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Inbox ({capturedTasks.length})</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSmartTriage}
                        disabled={capturedTasks.length === 0}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Smart Triage
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {capturedTasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Your inbox is clear! Add tasks above to get started.</p>
                      </div>
                    ) : (
                      capturedTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={handleTaskEdit}
                          onComplete={handleTaskComplete}
                          onDelete={handleTaskDelete}
                          onStatusChange={(task, status) => {
                            if (status === 'today') handleTaskPromote(task)
                          }}
                        />
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                {/* Daily Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Today's Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Tasks Completed</span>
                        <span>{completedTasks.length}/{todayTasks.length + completedTasks.length}</span>
                      </div>
                      <Progress 
                        value={todayTasks.length + completedTasks.length > 0 
                          ? (completedTasks.length / (todayTasks.length + completedTasks.length)) * 100 
                          : 0
                        } 
                        className="h-2"
                      />
                    </div>
                    
                    {dailyLoad && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Energy Used</span>
                          <span>{dailyLoad.completed_energy}/{dailyLoad.total_energy}</span>
                        </div>
                        <Progress 
                          value={dailyLoad.total_energy > 0 ? (dailyLoad.completed_energy / dailyLoad.total_energy) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">In Inbox</span>
                      <Badge variant="outline">{capturedTasks.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Due Today</span>
                      <Badge variant="outline">{todayTasks.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completed</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {completedTasks.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === 'today' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Focus ({todayTasks.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {todayTasks.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No tasks scheduled for today</p>
                        <p className="text-sm">Use the Capture tab to add tasks, then promote them to Today</p>
                      </div>
                    ) : (
                      todayTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={handleTaskEdit}
                          onComplete={handleTaskComplete}
                          onDelete={handleTaskDelete}
                          className="border-l-4 border-l-blue-500"
                        />
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Energy Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className={`p-3 rounded-lg ${spoonStatus.color}`}>
                      <div className="font-medium mb-1">Available Energy</div>
                      <div className="text-2xl font-bold">{availableSpoons} spoons</div>
                      <div className="text-sm mt-1">{spoonStatus.label}</div>
                    </div>
                    
                    {dailyLoad && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Energy Allocation</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Used: {dailyLoad.completed_energy}</span>
                            <span>Planned: {dailyLoad.total_energy}</span>
                          </div>
                          <Progress 
                            value={dailyLoad.capacity_percentage} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === 'triage' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Daily Planning & Triage</span>
                    <Button onClick={handleSmartTriage} disabled={capturedTasks.length === 0}>
                      <Brain className="h-4 w-4 mr-2" />
                      Auto-Plan Day
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Inbox */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Plus className="h-4 w-4 mr-2 text-gray-500" />
                        Inbox ({capturedTasks.length})
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {capturedTasks.map(task => (
                          <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{task.title}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge 
                                    variant="outline" 
                                    className={task.priority === 'urgent' ? 'border-red-500 text-red-700' : ''}
                                  >
                                    {task.priority}
                                  </Badge>
                                  <span className={`w-2 h-2 rounded-full ${getEnergyColor(task.energy_required)}`} />
                                  <span className="text-xs text-gray-500">{task.energy_required} energy</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleTaskPromote(task)}
                                  className="text-blue-600 hover:text-blue-700 text-xs px-2 py-1"
                                  title="Move to Today"
                                >
                                  → Today
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleTaskPromoteToWeek(task)}
                                  className="text-purple-600 hover:text-purple-700 text-xs px-2 py-1"
                                  title="Move to This Week"
                                >
                                  → Week
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {capturedTasks.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No tasks in inbox</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Today */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-blue-500" />
                        Today ({todayTasks.length})
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {todayTasks.map(task => (
                          <div key={task.id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{task.priority}</Badge>
                              <span className={`w-2 h-2 rounded-full ${getEnergyColor(task.energy_required)}`} />
                              <span className="text-xs text-gray-500">{task.energy_required} energy</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTaskComplete(task)}
                                className="text-green-600 hover:text-green-700 text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTaskPromoteToWeek(task)}
                                className="text-purple-600 hover:text-purple-700 text-xs"
                              >
                                → Week
                              </Button>
                            </div>
                          </div>
                        ))}
                        {todayTasks.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No tasks for today</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* This Week */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                        This Week ({thisWeekTasks.length})
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {thisWeekTasks.map(task => (
                          <div key={task.id} className="p-3 bg-purple-50 rounded-lg border-l-4 border-l-purple-500">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{task.priority}</Badge>
                              <span className={`w-2 h-2 rounded-full ${getEnergyColor(task.energy_required)}`} />
                              <span className="text-xs text-gray-500">{task.energy_required} energy</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTaskPromote(task)}
                                className="text-blue-600 hover:text-blue-700 text-xs"
                              >
                                → Today
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTaskComplete(task)}
                                className="text-green-600 hover:text-green-700 text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                            </div>
                          </div>
                        ))}
                        {thisWeekTasks.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No tasks for this week</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Completed */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Completed ({completedTasks.length})
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {completedTasks.slice(0, 10).map(task => (
                          <div key={task.id} className="p-3 bg-green-50 rounded-lg opacity-75">
                            <h4 className="font-medium text-sm line-through">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-xs text-gray-500">
                                {task.completed_at && new Date(task.completed_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        {completedTasks.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No completed tasks</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* All Tasks View */}
          {activeView === 'all' && (
            <div className={fullscreenAllTasks ? "fixed inset-0 z-50 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-auto" : "space-y-6"}>
              {fullscreenAllTasks && (
                <div className="p-4">
                  <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-2xl font-bold text-gray-900">All Tasks ({tasks.length})</h1>
                      <Button
                        variant="outline"
                        onClick={() => setFullscreenAllTasks(false)}
                      >
                        <Minimize className="h-4 w-4 mr-2" />
                        Exit Fullscreen
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <Card className={fullscreenAllTasks ? "mx-4 max-w-7xl mx-auto" : ""}>
                {!fullscreenAllTasks && (
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>All Tasks ({tasks.length})</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFullscreenAllTasks(true)}
                      >
                        <Maximize className="h-4 w-4 mr-2" />
                        Fullscreen
                      </Button>
                    </div>
                  </CardHeader>
                )}
                
                <CardContent className="space-y-6">
                  {/* Tasks by Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Captured Tasks */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Plus className="h-4 w-4 mr-2 text-blue-500" />
                        Captured ({capturedTasks.length})
                      </h3>
                      <div className={`space-y-3 overflow-y-auto ${fullscreenAllTasks ? 'max-h-[calc(100vh-200px)]' : 'max-h-96'}`}>
                        {capturedTasks.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => {
                              setSelectedTask(task)
                              setShowTaskDetails(true)
                            }}
                            onComplete={handleTaskComplete}
                            onDelete={handleTaskDelete}
                            onStatusChange={(task, status) => {
                              if (status === 'today') handleTaskPromote(task)
                              else if (status === 'this_week') handleTaskPromoteToWeek(task)
                            }}
                            compact={!fullscreenAllTasks}
                          />
                        ))}
                        {capturedTasks.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No captured tasks</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Today's Tasks */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-orange-500" />
                        Today ({todayTasks.length})
                      </h3>
                      <div className={`space-y-3 overflow-y-auto ${fullscreenAllTasks ? 'max-h-[calc(100vh-200px)]' : 'max-h-96'}`}>
                        {todayTasks.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => {
                              setSelectedTask(task)
                              setShowTaskDetails(true)
                            }}
                            onComplete={handleTaskComplete}
                            onDelete={handleTaskDelete}
                            onStatusChange={(task, status) => {
                              if (status === 'this_week') handleTaskPromoteToWeek(task)
                            }}
                            compact={!fullscreenAllTasks}
                          />
                        ))}
                        {todayTasks.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No tasks for today</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* This Week's Tasks */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                        This Week ({thisWeekTasks.length})
                      </h3>
                      <div className={`space-y-3 overflow-y-auto ${fullscreenAllTasks ? 'max-h-[calc(100vh-200px)]' : 'max-h-96'}`}>
                        {thisWeekTasks.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => {
                              setSelectedTask(task)
                              setShowTaskDetails(true)
                            }}
                            onComplete={handleTaskComplete}
                            onDelete={handleTaskDelete}
                            onStatusChange={(task, status) => {
                              if (status === 'today') handleTaskPromote(task)
                            }}
                            compact={!fullscreenAllTasks}
                          />
                        ))}
                        {thisWeekTasks.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No tasks for this week</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Completed Tasks */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Completed ({completedTasks.length})
                      </h3>
                      <div className={`space-y-3 overflow-y-auto ${fullscreenAllTasks ? 'max-h-[calc(100vh-200px)]' : 'max-h-96'}`}>
                        {completedTasks.slice(0, fullscreenAllTasks ? completedTasks.length : 10).map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => {
                              setSelectedTask(task)
                              setShowTaskDetails(true)
                            }}
                            compact={!fullscreenAllTasks}
                            showActions={false}
                          />
                        ))}
                        {completedTasks.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No completed tasks</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={showTaskDetails}
        onClose={() => {
          setShowTaskDetails(false)
          setSelectedTask(null)
        }}
        onSave={handleTaskSave}
        onComplete={handleTaskComplete}
        onPromote={handleTaskPromote}
        onDelete={handleTaskDelete}
      />
    </div>
  )
}

export default withAuth(TasksPage)