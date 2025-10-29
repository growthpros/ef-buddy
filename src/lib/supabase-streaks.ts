/**
 * EF Buddy - Supabase Streak System Integration
 * 
 * This module provides TypeScript interfaces and functions for interacting
 * with the server-side streak tracking system, replacing the previous 
 * localStorage-based approach with reliable database operations.
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// =====================================================
// TYPES
// =====================================================

export interface StreakStatus {
  effort_type: string
  last_action_day: string | null
  current_streak: number
  best_streak: number
  streak_bonus_awarded_on: string | null
  is_current: boolean
}

export interface TrackStreakResult {
  event_day: string
  current_streak: number
  best_streak: number
  bonus_awarded: boolean
  effort_type_out: string
}

export type EffortType = 'sleep' | 'exercise' | 'medication' | 'stress'

// =====================================================
// SUPABASE CLIENT
// =====================================================

const supabase = createClientComponentClient()

// =====================================================
// CORE FUNCTIONS
// =====================================================

/**
 * Track a habit effort and update streak
 * @param effortType - Type of effort performed
 * @param performedAt - When the effort was performed (defaults to now)
 * @returns Streak status and bonus information
 */
export async function trackEffortStreak(
  effortType: EffortType, 
  performedAt?: Date
): Promise<TrackStreakResult> {
  const performedAtUTC = (performedAt || new Date()).toISOString()
  
  const { data, error } = await supabase.rpc('track_effort_streak', {
    effort_type: effortType,
    performed_at_utc: performedAtUTC
  })

  if (error) {
    console.error('Error tracking effort streak:', error)
    throw new Error(`Failed to track ${effortType} streak: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error('No data returned from streak tracking')
  }

  return data[0]
}

/**
 * Get streak status for all effort types
 * @returns Array of streak statuses for all efforts
 */
export async function getAllStreakStatus(): Promise<StreakStatus[]> {
  const { data, error } = await supabase.rpc('get_all_streak_status')

  if (error) {
    console.error('Error getting all streak status:', error)
    throw new Error(`Failed to get streak status: ${error.message}`)
  }

  return data || []
}

/**
 * Get streak status for a specific effort type
 * @param effortType - The effort type to query
 * @returns Streak status for the specified effort
 */
export async function getStreakStatus(effortType: EffortType): Promise<StreakStatus | null> {
  const { data, error } = await supabase.rpc('get_streak_status', {
    effort_type: effortType
  })

  if (error) {
    console.error('Error getting streak status:', error)
    throw new Error(`Failed to get ${effortType} streak status: ${error.message}`)
  }

  return data && data.length > 0 ? data[0] : null
}

/**
 * Initialize user profile with timezone
 * @param timezone - User's timezone (defaults to America/New_York)
 * @returns User ID
 */
export async function initializeUserProfile(timezone = 'America/New_York'): Promise<string> {
  const { data, error } = await supabase.rpc('initialize_user_profile', {
    user_timezone: timezone
  })

  if (error) {
    console.error('Error initializing user profile:', error)
    throw new Error(`Failed to initialize profile: ${error.message}`)
  }

  return data
}

/**
 * Reset a streak (for testing purposes)
 * @param effortType - The effort type to reset
 * @returns Success status
 */
export async function resetStreak(effortType: EffortType): Promise<boolean> {
  const { data, error } = await supabase.rpc('reset_streak', {
    effort_type: effortType
  })

  if (error) {
    console.error('Error resetting streak:', error)
    throw new Error(`Failed to reset ${effortType} streak: ${error.message}`)
  }

  return data === true
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Calculate spoon bonus from streak status
 * @param streakStatus - Current streak status
 * @returns Number of bonus spoons earned
 */
export function calculateSpoonBonus(streakStatus: StreakStatus): number {
  if (!streakStatus.streak_bonus_awarded_on) {
    return 0
  }

  // Award permanent bonuses based on effort type
  switch (streakStatus.effort_type) {
    case 'sleep':
      return 2
    case 'exercise':
      return 2
    case 'medication':
      return 3
    case 'stress':
      return 2
    default:
      return 0
  }
}

/**
 * Calculate progress bonus from current streak (not yet earned)
 * @param streakStatus - Current streak status
 * @returns Number of progress bonus spoons
 */
export function calculateProgressBonus(streakStatus: StreakStatus): number {
  // Only award progress bonus if not already earned permanent bonus
  if (streakStatus.streak_bonus_awarded_on) {
    return 0
  }

  // Only award progress bonus if currently active (checked today)
  if (!streakStatus.is_current) {
    return 0
  }

  // Award progress bonuses based on effort type
  switch (streakStatus.effort_type) {
    case 'sleep':
      return 2
    case 'exercise':
      return 2
    case 'medication':
      return 3
    case 'stress':
      return 2
    default:
      return 0
  }
}

/**
 * Get total earned spoon bonuses from all streaks
 * @param allStreaks - Array of all streak statuses
 * @returns Total permanent bonus spoons
 */
export function getTotalEarnedBonus(allStreaks: StreakStatus[]): number {
  return allStreaks.reduce((total, streak) => total + calculateSpoonBonus(streak), 0)
}

/**
 * Get total progress spoon bonuses from active streaks
 * @param allStreaks - Array of all streak statuses
 * @returns Total progress bonus spoons
 */
export function getTotalProgressBonus(allStreaks: StreakStatus[]): number {
  return allStreaks.reduce((total, streak) => total + calculateProgressBonus(streak), 0)
}

/**
 * Format streak display text
 * @param streakStatus - Current streak status
 * @returns Formatted display text (e.g., "3/5 days")
 */
export function formatStreakDisplay(streakStatus: StreakStatus): string {
  const current = streakStatus.current_streak
  
  if (streakStatus.streak_bonus_awarded_on) {
    return `✅ EARNED! (${current} days)`
  }
  
  if (current === 0) {
    return '0/5 days'
  }
  
  return `${Math.min(current, 5)}/5 days`
}

/**
 * Check if user needs authentication
 * @returns Promise indicating if user is authenticated
 */
export async function checkAuth(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

/**
 * Get current user ID
 * @returns User ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

/**
 * Check and reset any broken streaks (for authenticated users)
 * @returns Promise with list of broken streaks that were reset
 */
export async function checkAndResetBrokenStreaks(): Promise<{
  effort_type: string
  was_broken: boolean
  bonus_removed: boolean
}[]> {
  const { data, error } = await supabase
    .rpc('check_and_reset_broken_streaks')
  
  if (error) {
    console.error('❌ Failed to check broken streaks:', error)
    return []
  }
  
  return data || []
}