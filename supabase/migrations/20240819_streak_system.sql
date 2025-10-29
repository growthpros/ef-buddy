-- =====================================================
-- EF Buddy: 5-Day Habit Streak System 
-- =====================================================
-- This migration creates a robust, timezone-aware streak tracking system
-- that replaces the previous localStorage-based approach.

-- 1) TABLES
-- =====================================================

-- Profiles table for user timezone settings
-- (extends existing auth.users with timezone info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,                       -- should match auth.users.id
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ground truth: one row per (user, local day) when they performed an effort
-- This prevents double-counting and provides reliable historical data
CREATE TABLE IF NOT EXISTS public.daily_activity (
  user_id UUID NOT NULL,
  event_day DATE NOT NULL,
  efforts TEXT[] NOT NULL DEFAULT '{}',      -- array of effort types: ['sleep', 'exercise', 'medication', 'stress']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, event_day)
);

-- Per-user streak counters (optimized for fast reads)
-- Maintains current state without needing to recalculate from daily_activity every time
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id UUID PRIMARY KEY,
  effort_type TEXT NOT NULL,                 -- 'sleep', 'exercise', 'medication', 'stress'
  last_action_day DATE,
  current_streak INT NOT NULL DEFAULT 0,
  best_streak INT NOT NULL DEFAULT 0,
  streak_bonus_awarded_on DATE,              -- tracks when 5-day bonus was awarded (prevents double-award)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, effort_type)
);

-- 2) ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Profiles: user can see/update own row only
CREATE POLICY "profiles_self_access" ON public.profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Daily activity: user can see/insert own rows only
CREATE POLICY "daily_activity_self_read" ON public.daily_activity 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "daily_activity_self_write" ON public.daily_activity 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "daily_activity_self_update" ON public.daily_activity 
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- User streaks: user can see/modify own streaks only  
CREATE POLICY "user_streaks_self_read" ON public.user_streaks 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_streaks_self_insert" ON public.user_streaks 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_streaks_self_update" ON public.user_streaks 
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3) INDEXES
-- =====================================================

-- Optimize common queries
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date 
  ON public.daily_activity(user_id, event_day DESC);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_effort 
  ON public.user_streaks(user_id, effort_type);

-- 4) TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at 
  BEFORE UPDATE ON public.user_streaks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();