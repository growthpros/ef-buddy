import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display with ADHD-friendly relative dates
export function formatTaskDate(dateString: string | null): string {
  if (!dateString) return ''
  
  const date = parseISO(dateString)
  
  if (isToday(date)) {
    return 'Today'
  } else if (isTomorrow(date)) {
    return 'Tomorrow'
  } else if (isYesterday(date)) {
    return 'Yesterday'
  } else {
    return format(date, 'MMM d')
  }
}

// Energy level helpers
export const ENERGY_LEVELS = {
  LOW: 1,
  MEDIUM_LOW: 2,
  MEDIUM: 3,
  MEDIUM_HIGH: 4,
  HIGH: 5,
} as const

export type EnergyLevel = typeof ENERGY_LEVELS[keyof typeof ENERGY_LEVELS]

export function getEnergyLevelLabel(level: EnergyLevel): string {
  switch (level) {
    case 1:
      return 'Very Low'
    case 2:
      return 'Low'
    case 3:
      return 'Medium'
    case 4:
      return 'High'
    case 5:
      return 'Very High'
    default:
      return 'Medium'
  }
}

export function getEnergyLevelColor(level: EnergyLevel): string {
  switch (level) {
    case 1:
      return 'text-red-500 bg-red-50'
    case 2:
      return 'text-orange-500 bg-orange-50'
    case 3:
      return 'text-yellow-500 bg-yellow-50'
    case 4:
      return 'text-green-500 bg-green-50'
    case 5:
      return 'text-blue-500 bg-blue-50'
    default:
      return 'text-gray-500 bg-gray-50'
  }
}

// Priority helpers
export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'] as const
export type Priority = typeof PRIORITY_LEVELS[number]

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'urgent':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getPriorityIcon(priority: Priority): string {
  switch (priority) {
    case 'low':
      return '⚪'
    case 'medium':
      return '🟡'
    case 'high':
      return '🟠'
    case 'urgent':
      return '🔴'
    default:
      return '⚪'
  }
}

// Duration formatting for ADHD-friendly display
export function formatDuration(minutes: number | null): string {
  if (!minutes) return ''
  
  if (minutes < 60) {
    return `${minutes}min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}min`
}

// Load calculation for energy management
export function calculateDailyLoad(tasks: Array<{ energy_required: number; estimated_duration: number | null }>, capacity: number = 10): number {
  const totalEnergy = tasks.reduce((sum, task) => sum + task.energy_required, 0)
  return Math.min((totalEnergy / capacity) * 100, 100)
}

// Task status helpers
export const TASK_STATUSES = ['capture', 'today', 'completed', 'archived'] as const
export type TaskStatus = typeof TASK_STATUSES[number]

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'capture':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'today':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'completed':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'archived':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

// Accessibility helpers
export function generateId(): string {
  return `id-${Math.random().toString(36).substr(2, 9)}`
}

// Keyboard navigation helper
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  onEnter?: () => void,
  onEscape?: () => void
) {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      onEnter?.()
      break
    case 'Escape':
      event.preventDefault()
      onEscape?.()
      break
  }
}