'use client'

import { useState, useEffect, useCallback } from 'react'
import { tasksAPI, type TaskQuery, type DailyLoad } from '@/lib/api/tasks'
import type { Task, TaskInput, TaskStatus } from '@/lib/types'

interface UseTasksReturn {
  // Data
  tasks: Task[]
  loading: boolean
  error: string | null
  
  // Actions
  createTask: (taskInput: TaskInput) => Promise<boolean>
  updateTask: (id: string, updates: Partial<TaskInput>) => Promise<boolean>
  deleteTask: (id: string) => Promise<boolean>
  completeTask: (id: string) => Promise<boolean>
  moveToToday: (id: string) => Promise<boolean>
  archiveTask: (id: string) => Promise<boolean>
  
  // Utilities
  refetch: () => Promise<void>
  clearError: () => void
}

/**
 * Hook for managing tasks with CRUD operations
 */
export function useTasks(query: TaskQuery = {}): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    clearError()
    
    const { data, error: fetchError } = await tasksAPI.getTasks(query)
    
    if (fetchError) {
      setError(fetchError)
      setTasks([])
    } else {
      setTasks(data || [])
    }
    
    setLoading(false)
  }, [query, clearError])

  // Initial fetch
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = useCallback(async (taskInput: TaskInput): Promise<boolean> => {
    clearError()
    const { data, error: createError } = await tasksAPI.createTask(taskInput)
    
    if (createError) {
      setError(createError)
      return false
    }
    
    if (data) {
      setTasks(prev => [data, ...prev])
    }
    
    return true
  }, [clearError])

  const updateTask = useCallback(async (id: string, updates: Partial<TaskInput>): Promise<boolean> => {
    clearError()
    const { data, error: updateError } = await tasksAPI.updateTask(id, updates)
    
    if (updateError) {
      setError(updateError)
      return false
    }
    
    if (data) {
      setTasks(prev => prev.map(task => task.id === id ? data : task))
    }
    
    return true
  }, [clearError])

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    clearError()
    const { error: deleteError } = await tasksAPI.deleteTask(id)
    
    if (deleteError) {
      setError(deleteError)
      return false
    }
    
    setTasks(prev => prev.filter(task => task.id !== id))
    return true
  }, [clearError])

  const completeTask = useCallback(async (id: string): Promise<boolean> => {
    clearError()
    const { data, error: completeError } = await tasksAPI.completeTask(id)
    
    if (completeError) {
      setError(completeError)
      return false
    }
    
    if (data) {
      setTasks(prev => prev.map(task => task.id === id ? data : task))
    }
    
    return true
  }, [clearError])

  const moveToToday = useCallback(async (id: string): Promise<boolean> => {
    clearError()
    const { data, error: moveError } = await tasksAPI.moveToToday(id)
    
    if (moveError) {
      setError(moveError)
      return false
    }
    
    if (data) {
      setTasks(prev => prev.map(task => task.id === id ? data : task))
    }
    
    return true
  }, [clearError])

  const archiveTask = useCallback(async (id: string): Promise<boolean> => {
    clearError()
    const { data, error: archiveError } = await tasksAPI.archiveTask(id)
    
    if (archiveError) {
      setError(archiveError)
      return false
    }
    
    if (data) {
      setTasks(prev => prev.map(task => task.id === id ? data : task))
    }
    
    return true
  }, [clearError])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    moveToToday,
    archiveTask,
    refetch: fetchTasks,
    clearError,
  }
}

interface UseTasksByStatusReturn extends UseTasksReturn {
  // Status-specific actions
  moveTasks: (taskIds: string[], targetStatus: TaskStatus) => Promise<boolean>
  smartMoveToToday: (maxEnergy?: number) => Promise<{ moved: number } | null>
}

/**
 * Hook for managing tasks filtered by status
 */
export function useTasksByStatus(status: TaskStatus[]): UseTasksByStatusReturn {
  const tasksHook = useTasks({ status, sortBy: status.includes('today') ? 'priority' : 'created_at' })

  const moveTasks = useCallback(async (taskIds: string[], targetStatus: TaskStatus): Promise<boolean> => {
    tasksHook.clearError()
    
    try {
      const updates = taskIds.map(id => ({ id, updates: { status: targetStatus } }))
      const { error: batchError } = await tasksAPI.batchUpdateTasks(updates)
      
      if (batchError) {
        // Set error state from the original hook - we need to do this differently
        console.error('Batch update error:', batchError)
        return false
      }
      
      // Refetch to get updated data
      await tasksHook.refetch()
      return true
    } catch (err) {
      console.error('Unexpected error moving tasks:', err)
      return false
    }
  }, [tasksHook])

  const smartMoveToToday = useCallback(async (maxEnergy?: number): Promise<{ moved: number } | null> => {
    tasksHook.clearError()
    
    const { data, error: smartMoveError } = await tasksAPI.smartMoveToToday(maxEnergy)
    
    if (smartMoveError) {
      console.error('Smart move error:', smartMoveError)
      return null
    }
    
    // Refetch to get updated data
    await tasksHook.refetch()
    
    return data ? { moved: data.moved_count } : null
  }, [tasksHook])

  return {
    ...tasksHook,
    moveTasks,
    smartMoveToToday,
  }
}

interface UseDailyLoadReturn {
  load: DailyLoad | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook for managing daily energy load data
 */
export function useDailyLoad(date?: string): UseDailyLoadReturn {
  const [load, setLoad] = useState<DailyLoad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLoad = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const { data, error: loadError } = await tasksAPI.getDailyLoad(date)
    
    if (loadError) {
      setError(loadError)
      setLoad(null)
    } else {
      setLoad(data)
    }
    
    setLoading(false)
  }, [date])

  useEffect(() => {
    fetchLoad()
  }, [fetchLoad])

  return {
    load,
    loading,
    error,
    refresh: fetchLoad,
  }
}

interface UseQuickActionsReturn {
  // Quick capture
  quickCapture: (title: string, priority?: 'low' | 'medium' | 'high' | 'urgent') => Promise<boolean>
  
  // Batch operations
  completeMultiple: (taskIds: string[]) => Promise<boolean>
  archiveMultiple: (taskIds: string[]) => Promise<boolean>
  deleteMultiple: (taskIds: string[]) => Promise<boolean>
  
  // Loading states
  capturing: boolean
  batchProcessing: boolean
}

/**
 * Hook for quick task operations
 */
export function useQuickActions(): UseQuickActionsReturn {
  const [capturing, setCapturing] = useState(false)
  const [batchProcessing, setBatchProcessing] = useState(false)

  const quickCapture = useCallback(async (title: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): Promise<boolean> => {
    setCapturing(true)
    
    const { error } = await tasksAPI.createTask({
      title: title.trim(),
      priority,
      energy_required: 3, // Default to medium energy
    })
    
    setCapturing(false)
    return !error
  }, [])

  const completeMultiple = useCallback(async (taskIds: string[]): Promise<boolean> => {
    setBatchProcessing(true)
    
    const updates = taskIds.map(id => ({ id, updates: { status: 'completed' as TaskStatus } }))
    const { error } = await tasksAPI.batchUpdateTasks(updates)
    
    setBatchProcessing(false)
    return !error
  }, [])

  const archiveMultiple = useCallback(async (taskIds: string[]): Promise<boolean> => {
    setBatchProcessing(true)
    
    const updates = taskIds.map(id => ({ id, updates: { status: 'archived' as TaskStatus } }))
    const { error } = await tasksAPI.batchUpdateTasks(updates)
    
    setBatchProcessing(false)
    return !error
  }, [])

  const deleteMultiple = useCallback(async (taskIds: string[]): Promise<boolean> => {
    setBatchProcessing(true)
    
    try {
      const results = await Promise.all(taskIds.map(id => tasksAPI.deleteTask(id)))
      const hasError = results.some(result => result.error)
      
      setBatchProcessing(false)
      return !hasError
    } catch {
      setBatchProcessing(false)
      return false
    }
  }, [])

  return {
    quickCapture,
    completeMultiple,
    archiveMultiple,
    deleteMultiple,
    capturing,
    batchProcessing,
  }
}