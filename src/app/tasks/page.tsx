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
  Inbox
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { QuickCapture } from '@/components/tasks/quick-capture'
import { TaskCard } from '@/components/tasks/task-card'
import { TaskDetailModal } from '@/components/tasks/task-detail-modal'
import { useAuth } from '@/contexts/auth-context'
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
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [dailyLoad, setDailyLoad] = useState<DailyLoad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [activeView, setActiveView] = useState<'capture' | 'today' | 'triage' | 'all'>('capture')
  const [fullscreenAllTasks, setFullscreenAllTasks] = useState(false)

  // Spoon integration from neuro-check
  const [dailySpoons, setDailySpoons] = useState(12) // This would come from neuro-check results
  const [availableSpoons, setAvailableSpoons] = useState(12)

  useEffect(() => {
    loadTasks()
    loadDailyLoad()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const [capturedResult, todayResult, thisWeekResult, completedResult, allTasksResult] = await Promise.all([
        tasksAPI.getCapturedTasks(),
        tasksAPI.getTodayTasks(),
        tasksAPI.getThisWeekTasks(),
        tasksAPI.getCompletedTasks(),
        tasksAPI.getTasks()
      ])

      if (capturedResult.error) throw new Error(capturedResult.error)
      if (todayResult.error) throw new Error(todayResult.error)
      if (thisWeekResult.error) throw new Error(thisWeekResult.error)
      if (completedResult.error) throw new Error(completedResult.error)
      if (allTasksResult.error) throw new Error(allTasksResult.error)

      setCapturedTasks(capturedResult.data || [])
      setTodayTasks(todayResult.data || [])
      setThisWeekTasks(thisWeekResult.data || [])
      setCompletedTasks(completedResult.data || [])
      setAllTasks(allTasksResult.data || [])
      
      // Combine all tasks for full list
      const allTasks = [
        ...(capturedResult.data || []),
        ...(todayResult.data || []),
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
      await loadTasks() // Refresh task lists to show the new task
    } catch (error) {
      console.error('❌ Failed to create task:', error)
      setError(error instanceof Error ? error.message : 'Failed to create task')
    }
  }

  const handleTaskComplete = async (task: Task) => {
    try {
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
      const result = await tasksAPI.moveToThisWeek(task.id)
      if (result.error) throw new Error(result.error)
      await loadTasks()
      await loadDailyLoad()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move task to this week')
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

  const handleTaskStatusChange = async (task: Task, newStatus: Task['status']) => {
    try {
      let result
      switch (newStatus) {
        case 'today':
          result = await tasksAPI.moveToToday(task.id)
          break
        case 'this_week':
          result = await tasksAPI.moveToThisWeek(task.id)
          break
        case 'completed':
          result = await tasksAPI.completeTask(task.id)
          break
        case 'capture':
          // Move back to capture (if needed)
          result = await tasksAPI.updateTask(task.id, { status: 'capture' })
          break
        default:
          throw new Error(`Unknown status: ${newStatus}`)
      }
      
      if (result.error) throw new Error(result.error)
      await loadTasks()
      await loadDailyLoad()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to change task status to ${newStatus}`)
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
              <MoreHorizontal className="h-4 w-4 inline mr-2" />
              All Tasks ({allTasks.length})
            </button>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
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
                        <Inbox className="h-4 w-4 mr-2 text-gray-500" />
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
                              <div className="flex gap-1">
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
                                  onClick={() => handleTaskPromoteToWeek(task)}
                                  className="text-purple-600 hover:text-purple-700 text-xs"
                                >
                                  → Week
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
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
                                onClick={() => handleTaskPromoteToWeek(task)}
                                className="text-purple-600 hover:text-purple-700 text-xs"
                              >
                                → Week
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTaskComplete(task)}
                                className="text-green-600 hover:text-green-700 text-xs"
                              >
                                ✓ Complete
                              </Button>
                            </div>
                          </div>
                        ))}
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
                                ✓ Complete
                              </Button>
                            </div>
                          </div>
                        ))}
                        {thisWeekTasks.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No tasks scheduled for this week</p>
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
                            <p className="text-sm">No completed tasks yet</p>
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
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>All Tasks ({allTasks.length})</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFullscreenAllTasks(!fullscreenAllTasks)}
                      className="flex items-center gap-2"
                    >
                      {fullscreenAllTasks ? (
                        <>
                          <MoreHorizontal className="h-4 w-4" />
                          Exit Fullscreen
                        </>
                      ) : (
                        <>
                          <MoreHorizontal className="h-4 w-4" />
                          Fullscreen
                        </>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid gap-4 ${fullscreenAllTasks ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                    {allTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={(task) => {
                          setSelectedTask(task)
                          setShowTaskDetails(true)
                        }}
                        onComplete={handleTaskComplete}
                        onDelete={handleTaskDelete}
                        onStatusChange={handleTaskStatusChange}
                        compact={!fullscreenAllTasks}
                        showActions
                      />
                    ))}
                    {allTasks.length === 0 && (
                      <div className="col-span-full text-center py-12 text-gray-500">
                        <MoreHorizontal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">No tasks yet</h3>
                        <p className="text-sm">Start by capturing your first task!</p>
                      </div>
                    )}
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

export default TasksPage