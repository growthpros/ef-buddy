'use client'

import React from 'react'
import { Sidebar } from './sidebar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}

// Layout wrapper that provides consistent spacing and scrolling
interface MainContentProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl'
}

export function MainContent({ 
  children, 
  className,
  maxWidth = '6xl'
}: MainContentProps) {
  const maxWidthClasses = {
    none: '',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
  }

  return (
    <main 
      id="main-content" 
      className={cn(
        'flex-1 overflow-auto custom-scrollbar',
        className
      )}
    >
      <div className={cn(
        'mx-auto px-6 py-8',
        maxWidthClasses[maxWidth]
      )}>
        {children}
      </div>
    </main>
  )
}

// Pre-built layout for dashboard pages
interface DashboardPageProps {
  header?: React.ReactNode
  children: React.ReactNode
  className?: string
  maxWidth?: MainContentProps['maxWidth']
  sidebar?: boolean
}

export function DashboardPage({ 
  header, 
  children, 
  className,
  maxWidth = '6xl',
  sidebar = true
}: DashboardPageProps) {
  if (!sidebar) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col">
        {header}
        <MainContent className={className} maxWidth={maxWidth}>
          {children}
        </MainContent>
      </div>
    )
  }

  return (
    <DashboardLayout>
      {header}
      <MainContent className={className} maxWidth={maxWidth}>
        {children}
      </MainContent>
    </DashboardLayout>
  )
}

export default DashboardLayout