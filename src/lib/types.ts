// Core types for the EF Buddy app
export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  energy_required: number
  estimated_duration: number | null
  created_at: string
  updated_at: string
  completed_at: string | null
  user_id: string
  due_date: string | null
  tags: string[] | null
}

export interface TaskInput {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: Priority
  energy_required?: number
  estimated_duration?: number | null
  completed_at?: string | null
  due_date?: string | null
  tags?: string[] | null
}

export type TaskStatus = 'capture' | 'today' | 'completed' | 'archived'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface UserPreferences {
  id: string
  user_id: string
  daily_energy_capacity: number
  work_hours_start: string
  work_hours_end: string
  break_intervals: number
  focus_mode_duration: number
  created_at: string
  updated_at: string
}

// UI Component Props Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

// Dashboard specific types
export interface DashboardStats {
  totalTasks: number
  todayTasks: number
  completedToday: number
  energyUsed: number
  energyCapacity: number
}

export interface LoadBarData {
  current: number
  capacity: number
  percentage: number
  status: 'low' | 'moderate' | 'high' | 'overload'
}

// Form types
export interface TaskFormData {
  title: string
  description: string
  priority: Priority
  energy_required: number
  estimated_duration: number | null
  due_date: string | null
  tags: string[]
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface TasksResponse {
  tasks: Task[]
  total: number
  page: number
  limit: number
}

// Daily Load tracking
export interface DailyLoad {
  total_energy: number
  total_tasks: number
  completed_energy: number
  completed_tasks: number
  remaining_energy: number
  capacity_percentage: number
}

// Neuro-diversity specific types (for future phases)
export interface NeuroCheck {
  id: string
  user_id: string
  timestamp: string
  energy_level: number
  focus_level: number
  stress_level: number
  mood: string
  notes: string | null
}

export interface EnergyUnit {
  id: string
  user_id: string
  date: string
  morning: number
  afternoon: number
  evening: number
  total_available: number
  total_used: number
}

// Accessibility types
export interface AccessibilityProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'role'?: string
  'tabIndex'?: number
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'
export type ContrastMode = 'normal' | 'high'

export interface ThemeConfig {
  mode: ThemeMode
  contrast: ContrastMode
  fontSize: 'small' | 'medium' | 'large'
  reducedMotion: boolean
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// Navigation types
export interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  disabled?: boolean
}

// Filter and search types
export interface TaskFilters {
  status?: TaskStatus[]
  priority?: Priority[]
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  energyRange?: {
    min: number
    max: number
  }
}

export interface SearchParams {
  query?: string
  filters?: TaskFilters
  sortBy?: 'created_at' | 'updated_at' | 'priority' | 'due_date' | 'energy_required'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}