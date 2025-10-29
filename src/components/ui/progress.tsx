'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-secondary-200',
  {
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
        xl: 'h-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const progressBarVariants = cva(
  'h-full w-full flex-1 transition-all duration-500 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-primary-500',
        success: 'bg-success-500',
        warning: 'bg-warning-500',
        danger: 'bg-danger-500',
        
        // Energy load specific variants
        'load-low': 'bg-green-500',      // 0-50%
        'load-moderate': 'bg-yellow-500', // 51-75%
        'load-high': 'bg-orange-500',    // 76-90%
        'load-overload': 'bg-red-500',   // 91-100%+
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number
  max?: number
  variant?: VariantProps<typeof progressBarVariants>['variant']
  showLabel?: boolean
  label?: string
  showPercentage?: boolean
  animated?: boolean
  striped?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    size, 
    variant, 
    value, 
    max = 100, 
    showLabel = false,
    label,
    showPercentage = false,
    animated = false,
    striped = false,
    ...props 
  }, ref) => {
    // Ensure value is within bounds
    const normalizedValue = Math.max(0, Math.min(value, max))
    const percentage = (normalizedValue / max) * 100
    
    // Auto-determine variant for energy loads if not specified
    const autoVariant = variant || (() => {
      if (percentage <= 50) return 'load-low'
      if (percentage <= 75) return 'load-moderate'  
      if (percentage <= 90) return 'load-high'
      return 'load-overload'
    })()

    return (
      <div className="w-full space-y-2">
        {(showLabel || showPercentage) && (
          <div className="flex justify-between items-center text-sm">
            {showLabel && (
              <span className="text-secondary-700 font-medium">
                {label || 'Progress'}
              </span>
            )}
            {showPercentage && (
              <span className="text-secondary-600 tabular-nums">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        <div
          ref={ref}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={normalizedValue}
          aria-label={label || 'Progress indicator'}
          className={cn(progressVariants({ size }), className)}
          {...props}
        >
          <div
            className={cn(
              progressBarVariants({ variant: autoVariant }),
              // Striped pattern
              striped && 'bg-gradient-to-r from-current to-transparent bg-[length:1rem_1rem]',
              // Animation
              animated && 'animate-pulse',
              // Smooth width transition
              'transition-all duration-700 ease-out'
            )}
            style={{ 
              width: `${percentage}%`,
              // Add background stripes if striped
              ...(striped && {
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.2) 50%, rgba(255,255,255,.2) 75%, transparent 75%, transparent)',
              })
            }}
          />
          
          {/* Overflow indicator for values > 100% */}
          {percentage > 100 && (
            <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
          )}
        </div>
        
        {/* Additional context for screen readers */}
        <div className="sr-only">
          {percentage > 100 ? 'Overloaded' : 
           percentage >= 90 ? 'Nearly full' :
           percentage >= 75 ? 'High load' :
           percentage >= 50 ? 'Moderate load' :
           'Low load'}
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

// Utility component for energy load specifically
export interface EnergyLoadBarProps extends Omit<ProgressProps, 'variant' | 'max' | 'value'> {
  current: number
  capacity: number
  showWarning?: boolean
}

export const EnergyLoadBar = React.forwardRef<HTMLDivElement, EnergyLoadBarProps>(
  ({ current, capacity, showWarning = true, className, ...props }, ref) => {
    const percentage = (current / capacity) * 100
    
    return (
      <div className={cn('space-y-2', className)}>
        <Progress
          ref={ref}
          value={current}
          max={capacity}
          showLabel
          label="Energy Load"
          showPercentage
          {...props}
        />
        
        {/* Warning messages for high load */}
        {showWarning && percentage > 90 && (
          <div className="flex items-center gap-2 text-sm text-danger-600 bg-danger-50 px-3 py-2 rounded-md">
            <span>⚠️</span>
            <span>
              {percentage > 100 ? 'Overloaded! Consider moving tasks to tomorrow.' :
               'High load! You might want to reduce today\'s tasks.'}
            </span>
          </div>
        )}
        
        {showWarning && percentage > 75 && percentage <= 90 && (
          <div className="flex items-center gap-2 text-sm text-warning-600 bg-warning-50 px-3 py-2 rounded-md">
            <span>⚡</span>
            <span>Approaching capacity. Plan breaks and be kind to yourself.</span>
          </div>
        )}
      </div>
    )
  }
)

EnergyLoadBar.displayName = 'EnergyLoadBar'

export { Progress, progressVariants }