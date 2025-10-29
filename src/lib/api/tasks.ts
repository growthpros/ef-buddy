import { createSupabaseClient } from '@/lib/supabase'
import type { Task, TaskInput, TaskStatus, Priority } from '@/lib/types'

// Type for task list queries
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

// Type for daily load data
export interface DailyLoad {
  total_energy: number
  total_tasks: number
  completed_energy: number
  completed_tasks: number
  remaining_energy: number
  capacity_percentage: number
}

class TasksAPI {
  private supabase = createSupabaseClient()

  /**
   * Get all tasks for the current user with optional filtering and sorting
   */
  async getTasks(query: TaskQuery = {}): Promise<{ data: Task[] | null; error: string | null }> {
    try {
      let supabaseQuery = this.supabase
        .from('tasks')
        .select('*')
        .order(query.sortBy || 'created_at', { ascending: query.sortOrder === 'asc' })

      // Apply filters
      if (query.status && query.status.length > 0) {
        supabaseQuery = supabaseQuery.in('status', query.status)
      }

      if (query.priority && query.priority.length > 0) {
        supabaseQuery = supabaseQuery.in('priority', query.priority)
      }

      if (query.tags && query.tags.length > 0) {
        supabaseQuery = supabaseQuery.overlaps('tags', query.tags)
      }

      if (query.search) {
        supabaseQuery = supabaseQuery.textSearch('title', query.search, {
          type: 'websearch',
          config: 'english',
        })
      }

      // Apply pagination
      if (query.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit)
      }

      if (query.offset) {
        supabaseQuery = supabaseQuery.range(query.offset, query.offset + (query.limit || 50) - 1)
      }

      const { data, error } = await supabaseQuery

      if (error) {
        console.error('Error fetching tasks:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error fetching tasks:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(id: string): Promise<{ data: Task | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching task:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error fetching task:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskInput: TaskInput): Promise<{ data: Task | null; error: string | null }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const taskData = {
        ...taskInput,
        user_id: user.id,
      }

      const { data, error } = await this.supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error creating task:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, updates: Partial<TaskInput>): Promise<{ data: Task | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating task:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error updating task:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting task:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (err) {
      console.error('Unexpected error deleting task:', err)
      return { error: 'An unexpected error occurred' }
    }
  }

  /**
   * Move a task to a different status
   */
  async moveTask(id: string, status: TaskStatus): Promise<{ data: Task | null; error: string | null }> {
    return this.updateTask(id, { 
      status,
      ...(status === 'completed' && { completed_at: new Date().toISOString() })
    })
  }

  /**
   * Complete a task
   */
  async completeTask(id: string): Promise<{ data: Task | null; error: string | null }> {
    return this.moveTask(id, 'completed')
  }

  /**
   * Archive a task
   */
  async archiveTask(id: string): Promise<{ data: Task | null; error: string | null }> {
    return this.moveTask(id, 'archived')
  }

  /**
   * Move task to today
   */
  async moveToToday(id: string): Promise<{ data: Task | null; error: string | null }> {
    return this.moveTask(id, 'today')
  }

  /**
   * Move multiple tasks to today based on energy capacity
   */
  async smartMoveToToday(maxEnergy?: number): Promise<{ data: { moved_count: number } | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase.rpc('smart_move_to_today', {
        max_energy: maxEnergy || null
      })

      if (error) {
        console.error('Error in smart move to today:', error)
        return { data: null, error: error.message }
      }

      return { data: { moved_count: data || 0 }, error: null }
    } catch (err) {
      console.error('Unexpected error in smart move to today:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get daily energy load data
   */
  async getDailyLoad(date?: string): Promise<{ data: DailyLoad | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase.rpc('get_daily_task_load', {
        target_date: date || new Date().toISOString().split('T')[0]
      })

      if (error) {
        console.error('Error fetching daily load:', error)
        return { data: null, error: error.message }
      }

      // The RPC function returns an array, but we want the first (and only) result
      const loadData = Array.isArray(data) ? data[0] : data

      return { data: loadData || null, error: null }
    } catch (err) {
      console.error('Unexpected error fetching daily load:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Batch update multiple tasks
   */
  async batchUpdateTasks(updates: Array<{ id: string; updates: Partial<TaskInput> }>): Promise<{ data: Task[] | null; error: string | null }> {
    try {
      const results = await Promise.all(
        updates.map(({ id, updates: taskUpdates }) => this.updateTask(id, taskUpdates))
      )

      const errors = results.filter(result => result.error)
      if (errors.length > 0) {
        return { data: null, error: `Some updates failed: ${errors.map(e => e.error).join(', ')}` }
      }

      const data = results.map(result => result.data).filter(Boolean) as Task[]
      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error in batch update:', err)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get tasks by status for quick access
   */
  async getCapturedTasks(): Promise<{ data: Task[] | null; error: string | null }> {
    return this.getTasks({ status: ['capture'], sortBy: 'created_at', sortOrder: 'desc' })
  }

  async getTodayTasks(): Promise<{ data: Task[] | null; error: string | null }> {
    return this.getTasks({ status: ['today'], sortBy: 'priority', sortOrder: 'desc' })
  }

  async getCompletedTasks(): Promise<{ data: Task[] | null; error: string | null }> {
    return this.getTasks({ status: ['completed'], sortBy: 'updated_at', sortOrder: 'desc', limit: 50 })
  }

  /**
   * Search tasks with full text search
   */
  async searchTasks(query: string, limit = 20): Promise<{ data: Task[] | null; error: string | null }> {
    return this.getTasks({ search: query, limit })
  }
}

// Export singleton instance
export const tasksAPI = new TasksAPI()

// Export class for testing or custom instances
export { TasksAPI }