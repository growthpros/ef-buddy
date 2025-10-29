// Core types for EF Buddy application

// Database enums
export type TaskStatus = 'capture' | 'today' | 'completed' | 'archived'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

// Task entity with AI classification support
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  energy_required: number
  estimated_duration?: number
  completed_at?: string
  due_date?: string
  tags: string[]
  
  // AI Classification fields (2-A Task Classifier)
  ai_time_estimate?: number
  ai_urgency_score?: number
  ai_impact_score?: number
  ai_completion_criteria?: string
  ai_suggested_priority?: Priority
  ai_energy_level?: number
  ai_breakdown_steps?: string[]
  ai_confidence?: number
  ai_classified_at?: string
  
  user_id: string
  created_at: string
  updated_at: string
}

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

// User preferences
export interface UserPreferences {
  id: string
  user_id: string
  daily_energy_capacity: number
  work_hours_start: string
  work_hours_end: string
  break_intervals: number
  focus_mode_duration: number
  theme_preference: 'light' | 'dark' | 'high-contrast'
  reduce_animations: boolean
  created_at: string
  updated_at: string
}

// API request/response types
export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: Priority
  energy_required?: number
  estimated_duration?: number
  due_date?: string
  tags?: string[]
  ai_classification?: AITaskClassification
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  energy_required?: number
  estimated_duration?: number
  due_date?: string
  tags?: string[]
}

export interface TasksQuery {
  status?: TaskStatus[]
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'priority' | 'due_date' | 'ai_confidence'
  sortOrder?: 'asc' | 'desc'
}

// Daily task load information
export interface DailyTaskLoad {
  total_energy: number
  total_tasks: number
  completed_energy: number
  completed_tasks: number
  remaining_energy: number
  capacity_percentage: number
}

// Component prop types
export interface QuickCaptureProps {
  onCapture?: (title: string, priority: Priority, aiClassification?: AITaskClassification) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  enableAI?: boolean
}

export interface TaskCardProps {
  task: Task
  onUpdate?: (id: string, updates: UpdateTaskRequest) => void
  onDelete?: (id: string) => void
  showAIInsights?: boolean
}

// AI service integration types
export interface AIService {
  classifyTask: (text: string) => Promise<AITaskClassification>
  isAvailable: boolean
}

// Error handling
export interface APIError {
  message: string
  code?: string
  details?: Record<string, unknown>
}

export interface APIResponse<T> {
  data?: T
  error?: APIError
  success: boolean
}

// Hook return types
export interface UseTasksReturn {
  tasks: Task[]
  loading: boolean
  error: APIError | null
  createTask: (task: CreateTaskRequest) => Promise<boolean>
  updateTask: (id: string, updates: UpdateTaskRequest) => Promise<boolean>
  deleteTask: (id: string) => Promise<boolean>
  refetch: () => Promise<void>
}

export interface UseQuickActionsReturn {
  quickCapture: (title: string, priority?: Priority, enableAI?: boolean) => Promise<boolean>
  capturing: boolean
  classifyTask: (text: string) => Promise<AITaskClassification | null>
  classifying: boolean
}

// Dashboard statistics
export interface DashboardStats {
  todayTasks: number
  captureTasks: number
  completedTasks: number
  energyUsed: number
  energyCapacity: number
  loadPercentage: number
}

// Form validation types
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// Theme and accessibility types
export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
  }
  reducedMotion: boolean
  highContrast: boolean
}

export interface AccessibilityOptions {
  screenReader: boolean
  keyboardNavigation: boolean
  focusVisible: boolean
  announceChanges: boolean
}