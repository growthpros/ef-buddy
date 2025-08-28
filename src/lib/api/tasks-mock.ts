/**
 * Mock Tasks API for Development
 * 
 * This provides a working task management interface without requiring
 * database setup. Data is stored in localStorage for persistence.
 */

import type { Task, TaskInput, TaskStatus, Priority } from '@/lib/types'

// Initialize tasks from localStorage or use defaults
const loadTasksFromStorage = (): Task[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('ef-buddy-tasks')
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log('📋 Loaded', parsed.length, 'tasks from localStorage')
        return parsed
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error)
    }
  }
  return defaultTasks
}

// Default mock data
const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Write and submit the Q4 project proposal for the new initiative',
    status: 'capture',
    priority: 'high',
    energy_required: 6,
    estimated_duration: 120,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    user_id: 'demo-user',
    due_date: null,
    tags: ['work', 'proposal']
  },
  {
    id: '2', 
    title: 'Buy groceries',
    description: 'Get ingredients for meal prep this week',
    status: 'today',
    priority: 'medium',
    energy_required: 3,
    estimated_duration: 60,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    user_id: 'demo-user',
    due_date: new Date().toISOString(),
    tags: ['personal', 'health']
  },
  {
    id: '3',
    title: 'Morning meditation',
    description: '10 minutes of mindfulness practice',
    status: 'completed',
    priority: 'low',
    energy_required: 1,
    estimated_duration: 10,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 3600000).toISOString(),
    user_id: 'demo-user',
    due_date: null,
    tags: ['wellness', 'routine']
  }
]

// Initialize mockTasks from localStorage or defaults
let mockTasks: Task[] = loadTasksFromStorage()

// Load from localStorage if available
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('ef-buddy-tasks')
  if (stored) {
    try {
      mockTasks = JSON.parse(stored)
    } catch (error) {
      console.warn('Failed to load tasks from localStorage:', error)
    }
  }
}

// Save to localStorage
const saveTasks = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ef-buddy-tasks', JSON.stringify(mockTasks))
  }
}

// Generate ID
const generateId = () => Date.now().toString()

export interface TaskQuery {
  status?: TaskStatus[]
  priority?: Priority[]
  tags?: string[]
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'updated_at' | 'priority' | 'due_date' | 'energy_required' | 'title'
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface DailyLoad {
  total_energy: number
  total_tasks: number
  completed_energy: number
  completed_tasks: number
  remaining_energy: number
  capacity_percentage: number
}

class MockTasksAPI {
  async getTasks(query: TaskQuery = {}): Promise<{ data: Task[] | null; error: string | null }> {
    try {
      let filtered = [...mockTasks]

      // Apply filters
      if (query.status && query.status.length > 0) {
        filtered = filtered.filter(task => query.status!.includes(task.status))
      }

      if (query.priority && query.priority.length > 0) {
        filtered = filtered.filter(task => query.priority!.includes(task.priority))
      }

      if (query.tags && query.tags.length > 0) {
        filtered = filtered.filter(task => 
          task.tags && task.tags.some(tag => query.tags!.includes(tag))
        )
      }

      if (query.search) {
        const searchLower = query.search.toLowerCase()
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower))
        )
      }

      // Apply sorting
      const sortBy = query.sortBy || 'created_at'
      const sortOrder = query.sortOrder || 'desc'
      
      filtered.sort((a, b) => {
        let aValue = a[sortBy] as any
        let bValue = b[sortBy] as any

        if (sortBy === 'priority') {
          const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'urgent': 4 }
          aValue = priorityOrder[aValue as Priority]
          bValue = priorityOrder[bValue as Priority]
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
      })

      // Apply pagination
      if (query.limit || query.offset) {
        const start = query.offset || 0
        const end = start + (query.limit || 50)
        filtered = filtered.slice(start, end)
      }

      return { data: filtered, error: null }
    } catch (error) {
      return { data: null, error: 'Failed to fetch tasks' }
    }
  }

  async getTask(id: string): Promise<{ data: Task | null; error: string | null }> {
    const task = mockTasks.find(t => t.id === id)
    return { data: task || null, error: task ? null : 'Task not found' }
  }

  async createTask(taskInput: TaskInput): Promise<{ data: Task | null; error: string | null }> {
    try {
      const newTask: Task = {
        id: generateId(),
        title: taskInput.title,
        description: taskInput.description || null,
        status: taskInput.status || 'capture',
        priority: taskInput.priority || 'medium',
        energy_required: taskInput.energy_required || 3,
        estimated_duration: taskInput.estimated_duration || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: taskInput.completed_at || null,
        user_id: 'demo-user',
        due_date: taskInput.due_date || null,
        tags: taskInput.tags || null
      }

      mockTasks.push(newTask)
      saveTasks()
      
      return { data: newTask, error: null }
    } catch (error) {
      return { data: null, error: 'Failed to create task' }
    }
  }

  async updateTask(id: string, updates: Partial<TaskInput>): Promise<{ data: Task | null; error: string | null }> {
    try {
      const taskIndex = mockTasks.findIndex(t => t.id === id)
      if (taskIndex === -1) {
        return { data: null, error: 'Task not found' }
      }

      const updatedTask = {
        ...mockTasks[taskIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }

      mockTasks[taskIndex] = updatedTask
      saveTasks()

      return { data: updatedTask, error: null }
    } catch (error) {
      return { data: null, error: 'Failed to update task' }
    }
  }

  async deleteTask(id: string): Promise<{ error: string | null }> {
    try {
      const taskIndex = mockTasks.findIndex(t => t.id === id)
      if (taskIndex === -1) {
        return { error: 'Task not found' }
      }

      mockTasks.splice(taskIndex, 1)
      saveTasks()

      return { error: null }
    } catch (error) {
      return { error: 'Failed to delete task' }
    }
  }

  async moveTask(id: string, status: TaskStatus): Promise<{ data: Task | null; error: string | null }> {
    const updates: Partial<TaskInput> = { 
      status,
      ...(status === 'completed' && { completed_at: new Date().toISOString() })
    }
    return this.updateTask(id, updates)
  }

  async completeTask(id: string): Promise<{ data: Task | null; error: string | null }> {
    return this.moveTask(id, 'completed')
  }

  async archiveTask(id: string): Promise<{ data: Task | null; error: string | null }> {
    return this.moveTask(id, 'archived')
  }

  async moveToToday(id: string): Promise<{ data: Task | null; error: string | null }> {
    return this.moveTask(id, 'today')
  }

  async moveToThisWeek(id: string): Promise<{ data: Task | null; error: string | null }> {
    return this.moveTask(id, 'this_week')
  }

  async smartMoveToToday(maxEnergy?: number): Promise<{ data: { moved_count: number } | null; error: string | null }> {
    try {
      const capturedTasks = mockTasks.filter(t => t.status === 'capture')
      let totalEnergy = 0
      let movedCount = 0
      const energyLimit = maxEnergy || 20

      // Sort by priority then energy
      capturedTasks.sort((a, b) => {
        const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 }
        const aPriority = priorityOrder[a.priority]
        const bPriority = priorityOrder[b.priority]
        
        if (aPriority !== bPriority) return bPriority - aPriority
        return a.energy_required - b.energy_required
      })

      for (const task of capturedTasks) {
        if (totalEnergy + task.energy_required <= energyLimit) {
          task.status = 'today'
          task.updated_at = new Date().toISOString()
          totalEnergy += task.energy_required
          movedCount++
        }
      }

      saveTasks()
      return { data: { moved_count: movedCount }, error: null }
    } catch (error) {
      return { data: null, error: 'Failed to perform smart triage' }
    }
  }

  async getDailyLoad(date?: string): Promise<{ data: DailyLoad | null; error: string | null }> {
    try {
      const today = date || new Date().toISOString().split('T')[0]
      const todayTasks = mockTasks.filter(t => t.status === 'today' || t.status === 'completed')
      const completedTasks = mockTasks.filter(t => 
        t.status === 'completed' && 
        t.completed_at && 
        t.completed_at.startsWith(today)
      )

      const totalEnergy = todayTasks.reduce((sum, t) => sum + t.energy_required, 0)
      const completedEnergy = completedTasks.reduce((sum, t) => sum + t.energy_required, 0)
      
      const dailyLoad: DailyLoad = {
        total_energy: totalEnergy,
        total_tasks: todayTasks.length,
        completed_energy: completedEnergy,
        completed_tasks: completedTasks.length,
        remaining_energy: totalEnergy - completedEnergy,
        capacity_percentage: totalEnergy > 0 ? (completedEnergy / totalEnergy) * 100 : 0
      }

      return { data: dailyLoad, error: null }
    } catch (error) {
      return { data: null, error: 'Failed to calculate daily load' }
    }
  }

  async getCapturedTasks(): Promise<{ data: Task[] | null; error: string | null }> {
    return this.getTasks({ status: ['capture'], sortBy: 'created_at', sortOrder: 'desc' })
  }

  async getTodayTasks(): Promise<{ data: Task[] | null; error: string | null }> {
    return this.getTasks({ status: ['today'], sortBy: 'priority', sortOrder: 'desc' })
  }

  async getThisWeekTasks(): Promise<{ data: Task[] | null; error: string | null }> {
    return this.getTasks({ status: ['this_week'], sortBy: 'priority', sortOrder: 'desc' })
  }

  async getCompletedTasks(): Promise<{ data: Task[] | null; error: string | null }> {
    return this.getTasks({ status: ['completed'], sortBy: 'updated_at', sortOrder: 'desc', limit: 50 })
  }
}

// Export singleton instance
export const tasksAPI = new MockTasksAPI()
export { MockTasksAPI as TasksAPI }