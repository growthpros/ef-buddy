'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
        secondary: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
        success: 'bg-success-100 text-success-800 hover:bg-success-200',
        warning: 'bg-warning-100 text-warning-800 hover:bg-warning-200',
        danger: 'bg-danger-100 text-danger-800 hover:bg-danger-200',
        outline: 'border border-secondary-300 text-secondary-700 hover:bg-secondary-50',
        
        // Priority variants for tasks
        'priority-low': 'bg-green-100 text-green-800 border border-green-200',
        'priority-medium': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        'priority-high': 'bg-orange-100 text-orange-800 border border-orange-200',
        'priority-urgent': 'bg-red-100 text-red-800 border border-red-200',
        
        // Energy level variants
        'energy-1': 'bg-red-100 text-red-800 border border-red-200',
        'energy-2': 'bg-orange-100 text-orange-800 border border-orange-200',
        'energy-3': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        'energy-4': 'bg-green-100 text-green-800 border border-green-200',
        'energy-5': 'bg-blue-100 text-blue-800 border border-blue-200',
        
        // Status variants for tasks
        'status-capture': 'bg-purple-100 text-purple-800 border border-purple-200',
        'status-today': 'bg-blue-100 text-blue-800 border border-blue-200',
        'status-completed': 'bg-green-100 text-green-800 border border-green-200',
        'status-archived': 'bg-gray-100 text-gray-800 border border-gray-200',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, icon, removable, onRemove, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        <span>{children}</span>
        {removable && onRemove && (
          <button
            onClick={onRemove}
            className="ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-current"
            aria-label="Remove"
          >
            <svg className="w-2 h-2" viewBox="0 0 8 8" fill="currentColor">
              <path d="M1.41 0L0 1.41L2.59 4L0 6.59L1.41 8L4 5.41L6.59 8L8 6.59L5.41 4L8 1.41L6.59 0L4 2.59L1.41 0Z" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

// Utility functions for semantic badge creation
export const priorityBadge = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
  const icons = {
    low: '⚪',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴',
  }
  
  return {
    variant: `priority-${priority}` as const,
    icon: icons[priority],
    children: priority.charAt(0).toUpperCase() + priority.slice(1),
  }
}

export const energyBadge = (level: number) => {
  // Clamp level to valid range
  const clampedLevel = Math.max(1, Math.min(5, Math.round(level))) as 1 | 2 | 3 | 4 | 5
  
  const labels = {
    1: 'Very Low',
    2: 'Low', 
    3: 'Medium',
    4: 'High',
    5: 'Very High',
  }
  
  return {
    variant: `energy-${clampedLevel}` as const,
    children: labels[clampedLevel],
  }
}

export const statusBadge = (status: 'capture' | 'today' | 'completed' | 'archived') => {
  const labels = {
    capture: 'Captured',
    today: 'Today',
    completed: 'Done',
    archived: 'Archived',
  }
  
  const icons = {
    capture: '📥',
    today: '🎯',
    completed: '✅',
    archived: '📦',
  }
  
  return {
    variant: `status-${status}` as const,
    icon: icons[status],
    children: labels[status],
  }
}

export { Badge, badgeVariants }