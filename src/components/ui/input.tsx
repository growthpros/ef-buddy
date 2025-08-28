'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon,
    id,
    disabled,
    required,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    
    const describedBy = [
      ariaDescribedBy,
      error ? errorId : null,
      helperText ? helperId : null,
    ].filter(Boolean).join(' ') || undefined

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-secondary-700 mb-2',
              disabled && 'text-secondary-400',
              required && "after:content-['*'] after:text-danger-500 after:ml-1"
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-secondary-400 text-sm">{leftIcon}</span>
            </div>
          )}
          
          <input
            type={type}
            id={inputId}
            ref={ref}
            disabled={disabled}
            required={required}
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : 'false'}
            className={cn(
              // Base styles
              'block w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200',
              'placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
              
              // Default state
              'border-secondary-300 bg-white text-secondary-900',
              'focus:border-primary-500 focus:ring-primary-200',
              'hover:border-secondary-400',
              
              // Error state
              error && 'border-danger-300 focus:border-danger-500 focus:ring-danger-200',
              
              // Disabled state  
              disabled && 'bg-secondary-50 text-secondary-400 cursor-not-allowed border-secondary-200',
              
              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-secondary-400 text-sm">{rightIcon}</span>
            </div>
          )}
        </div>
        
        {error && (
          <p id={errorId} className="mt-1 text-sm text-danger-600" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-secondary-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }