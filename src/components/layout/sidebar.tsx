'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui'

interface SidebarProps {
  className?: string
}

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  description?: string
}

const navigationItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/dashboard',
    icon: '📊',
    description: 'Dashboard overview and quick stats'
  },
  {
    id: 'capture',
    label: 'Capture',
    href: '/dashboard/capture',
    icon: '📥',
    description: 'Quick brain dump and task capture'
  },
  {
    id: 'triage',
    label: 'Triage',
    href: '/dashboard/triage',
    icon: '🏷️',
    description: 'Organize and prioritize captured tasks'
  },
  {
    id: 'today',
    label: 'Today',
    href: '/dashboard/today',
    icon: '🎯',
    description: 'Focus on today\'s tasks'
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn('flex flex-col w-64 bg-white border-r border-secondary-200', className)}>
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 p-6 border-b border-secondary-200">
        <div className="text-2xl">🧠</div>
        <div>
          <h1 className="text-xl font-bold text-secondary-900">EF Buddy</h1>
          <p className="text-sm text-secondary-600">Phase 1: Core Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2" role="navigation" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                // Base styles
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'hover:bg-secondary-50',
                
                // Active state
                isActive && 'bg-primary-50 text-primary-700 border border-primary-200',
                
                // Inactive state
                !isActive && 'text-secondary-700 hover:text-secondary-900'
              )}
              aria-current={isActive ? 'page' : undefined}
              title={item.description}
            >
              {/* Icon */}
              <span className="text-lg flex-shrink-0" role="img" aria-hidden="true">
                {item.icon}
              </span>
              
              {/* Label */}
              <span className="flex-1">{item.label}</span>
              
              {/* Badge if present */}
              {item.badge && (
                <Badge 
                  size="sm" 
                  variant="secondary"
                  className="ml-auto"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Energy Status Preview */}
      <div className="p-4 border-t border-secondary-200 bg-secondary-50">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-secondary-700">Daily Energy</span>
            <span className="text-secondary-600">7/10</span>
          </div>
          
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: '70%' }}
              role="progressbar"
              aria-valuenow={70}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Daily energy usage"
            />
          </div>
          
          <p className="text-xs text-secondary-600">
            Good pace! You have 3 energy units remaining.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-secondary-200">
        <button
          type="button"
          className={cn(
            'w-full px-3 py-2 text-sm font-medium rounded-lg',
            'bg-primary-600 text-white hover:bg-primary-700',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'transition-colors duration-200'
          )}
          aria-label="Quick capture task"
        >
          + Quick Capture
        </button>
      </div>
    </aside>
  )
}

export default Sidebar