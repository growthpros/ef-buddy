'use client'

import React from 'react'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import { CheckCircle } from 'lucide-react'
import { cn, formatTaskDate, formatDuration } from '@/lib/utils'
import { priorityBadge, energyBadge, statusBadge } from '@/components/ui/badge'
import type { Task } from '@/lib/types'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onComplete?: (task: Task) => void
  onDelete?: (task: Task) => void
  onStatusChange?: (task: Task, status: Task['status']) => void
  compact?: boolean
  showActions?: boolean
  className?: string
}

export function TaskCard({ 
  task, 
  onEdit,
  onComplete,
  onDelete,
  onStatusChange,
  compact = false,
  showActions = true,
  className 
}: TaskCardProps) {
  const isCompleted = task.status === 'completed'
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        isCompleted && 'opacity-75',
        isOverdue && 'border-l-4 border-l-danger-400',
        className
      )}
      padding={compact ? 'sm' : 'md'}
    >
      <CardContent className="space-y-3">
        {/* Header: Checkbox, Title and Status */}
        <div className="flex items-start gap-3">
          {/* Completion Checkbox */}
          <button
            onClick={() => onComplete?.(task)}
            className={cn(
              'flex-shrink-0 mt-0.5 w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all',
              'hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1',
              isCompleted 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300 hover:bg-green-50'
            )}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted && <CheckCircle className="h-3 w-3" />}
          </button>

          <div className="flex-1 min-w-0 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-medium text-secondary-900 leading-snug',
                compact ? 'text-sm' : 'text-base',
                isCompleted && 'line-through text-secondary-600'
              )}>
                {task.title}
              </h3>
            
            {task.description && !compact && (
              <p className="text-sm text-secondary-600 mt-1 leading-relaxed">
                {task.description}
              </p>
            )}
            
            {/* Progress Bar for tasks with subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-2">
                {(() => {
                  const completed = task.subtasks.filter(st => st.completed).length
                  const total = task.subtasks.length
                  const percentage = total > 0 ? (completed / total) * 100 : 0
                  
                  return (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs text-secondary-600">
                        <span>Progress</span>
                        <span>{completed}/{total} steps ({Math.round(percentage)}%)</span>
                      </div>
                      <Progress 
                        value={percentage} 
                        size="sm" 
                        variant={percentage === 100 ? 'success' : 'default'}
                        className="bg-secondary-200" 
                      />
                    </div>
                  )
                })()}
              </div>
            )}
            </div>

            {/* Status Badge */}
            <Badge {...statusBadge(task.status)} size="sm" />
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center justify-between">
          {/* Left: Priority and Energy */}
          <div className="flex items-center gap-2">
            <Badge {...priorityBadge(task.priority)} size="sm" />
            <Badge {...energyBadge(task.energy_required)} size="sm" />
            
            {task.estimated_duration && (
              <span className="text-xs text-secondary-500 bg-secondary-100 px-2 py-1 rounded-full">
                {formatDuration(task.estimated_duration)}
              </span>
            )}
          </div>

          {/* Right: Due Date */}
          {task.due_date && (
            <span className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              isOverdue 
                ? 'text-danger-700 bg-danger-100' 
                : 'text-secondary-600 bg-secondary-100'
            )}>
              {formatTaskDate(task.due_date)}
            </span>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {!isCompleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComplete?.(task)}
                  className="text-success-600 hover:text-success-700 hover:bg-success-50"
                  aria-label={`Mark "${task.title}" as complete`}
                >
                  ✓ Complete
                </Button>
              )}

              {task.status === 'capture' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStatusChange?.(task, 'today')}
                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                  aria-label={`Move "${task.title}" to today`}
                >
                  → Today
                </Button>
              )}
            </div>

            {/* More Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(task)}
                aria-label={`Edit "${task.title}"`}
              >
                ✏️
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(task)}
                className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                aria-label={`Delete "${task.title}"`}
              >
                🗑️
              </Button>
            </div>
          </div>
        )}

        {/* Completion timestamp */}
        {isCompleted && task.completed_at && (
          <div className="text-xs text-secondary-500 pt-2 border-t border-secondary-100">
            Completed {formatTaskDate(task.completed_at)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact variant for lists
export function CompactTaskCard(props: Omit<TaskCardProps, 'compact'>) {
  return <TaskCard {...props} compact showActions={false} />
}

// Focused variant for today view
export function FocusedTaskCard(props: TaskCardProps) {
  return (
    <TaskCard 
      {...props} 
      className={cn(
        'border-2 border-primary-200 bg-primary-50/30',
        props.className
      )} 
    />
  )
}

export default TaskCard