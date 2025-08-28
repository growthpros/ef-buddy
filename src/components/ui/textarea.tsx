'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    resize = 'vertical',
    id,
    disabled,
    required,
    rows = 3,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${textareaId}-error`
    const helperId = `${textareaId}-helper`
    
    const describedBy = [
      ariaDescribedBy,
      error ? errorId : null,
      helperText ? helperId : null,
    ].filter(Boolean).join(' ') || undefined

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium text-secondary-700 mb-2',
              disabled && 'text-secondary-400',
              required && "after:content-['*'] after:text-danger-500 after:ml-1"
            )}
          >
            {label}
          </label>
        )}
        
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          required={required}
          rows={rows}
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
            
            // Resize options
            resize === 'none' && 'resize-none',
            resize === 'vertical' && 'resize-y',
            resize === 'horizontal' && 'resize-x',
            resize === 'both' && 'resize',
            
            className
          )}
          {...props}
        />
        
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

Textarea.displayName = 'Textarea'

export { Textarea }