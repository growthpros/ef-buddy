import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please check your .env.local file.')
}

// For client components - simplified for Phase 1
export const createSupabaseClient = () => {
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder-key'
  )
}

// Basic client (fallback)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

// Database types (to be extended as we build)
export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'capture' | 'today' | 'completed' | 'archived'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          energy_required: number
          estimated_duration: number | null
          created_at: string
          updated_at: string
          user_id: string
          due_date: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'capture' | 'today' | 'completed' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          energy_required?: number
          estimated_duration?: number | null
          created_at?: string
          updated_at?: string
          user_id: string
          due_date?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'capture' | 'today' | 'completed' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          energy_required?: number
          estimated_duration?: number | null
          created_at?: string
          updated_at?: string
          user_id?: string
          due_date?: string | null
          tags?: string[] | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          daily_energy_capacity: number
          work_hours_start: string
          work_hours_end: string
          break_intervals: number
          focus_mode_duration: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          daily_energy_capacity?: number
          work_hours_start?: string
          work_hours_end?: string
          break_intervals?: number
          focus_mode_duration?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          daily_energy_capacity?: number
          work_hours_start?: string
          work_hours_end?: string
          break_intervals?: number
          focus_mode_duration?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}