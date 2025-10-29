-- Phase 2: Neuro-Check & Energy Units Database Schema
-- Combines Phase 2 planning with 2-B Adjust-Capacity requirements

-- Daily Neuro-Check and Capacity Management
CREATE TABLE IF NOT EXISTS daily_check (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  
  -- Core Neuro-Check Metrics (1-10 scales)
  mood_level INTEGER CHECK (mood_level BETWEEN 1 AND 10),
  energy_units INTEGER DEFAULT 5 CHECK (energy_units BETWEEN 0 AND 10),
  focus_capacity INTEGER CHECK (focus_capacity BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  
  -- Brain Mode (from 2-B Adjust-Capacity Code)
  brain_mode TEXT DEFAULT 'Normal' CHECK (brain_mode IN ('Normal', 'Fog', 'Shutdown')),
  
  -- Burnout Indicators (array of flags from 2-B code)
  burnout_flags TEXT[] DEFAULT '{}',
  
  -- Calculated Capacity (from 2-B Adjust-Capacity logic)
  capacity_today INTEGER DEFAULT 5 CHECK (capacity_today BETWEEN 0 AND 10),
  
  -- Additional Neuro-Check Data
  mood_emoji TEXT, -- Selected emoji representation
  sensory_state TEXT CHECK (sensory_state IN ('understimulated', 'balanced', 'overstimulated')),
  sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
  
  -- Optional Notes
  notes TEXT CHECK (length(notes) <= 1000),
  
  -- Adjustment History (track capacity changes)
  capacity_adjustments JSONB DEFAULT '[]',
  
  -- Metadata
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one check per day per user
  UNIQUE(user_id, date)
);

-- Energy Categories Tracking (Spoon Theory)
CREATE TABLE IF NOT EXISTS energy_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_check_id UUID REFERENCES daily_check(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  
  -- Energy Categories (spoon theory)
  cognitive_available INTEGER DEFAULT 0 CHECK (cognitive_available >= 0),
  cognitive_used INTEGER DEFAULT 0 CHECK (cognitive_used >= 0),
  physical_available INTEGER DEFAULT 0 CHECK (physical_available >= 0),
  physical_used INTEGER DEFAULT 0 CHECK (physical_used >= 0),
  social_available INTEGER DEFAULT 0 CHECK (social_available >= 0),
  social_used INTEGER DEFAULT 0 CHECK (social_used >= 0),
  emotional_available INTEGER DEFAULT 0 CHECK (emotional_available >= 0),
  emotional_used INTEGER DEFAULT 0 CHECK (emotional_used >= 0),
  creative_available INTEGER DEFAULT 0 CHECK (creative_available >= 0),
  creative_used INTEGER DEFAULT 0 CHECK (creative_used >= 0),
  
  -- Daily Totals (computed columns)
  total_available INTEGER GENERATED ALWAYS AS (
    cognitive_available + physical_available + social_available + 
    emotional_available + creative_available
  ) STORED,
  total_used INTEGER GENERATED ALWAYS AS (
    cognitive_used + physical_used + social_used + 
    emotional_used + creative_used
  ) STORED,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One record per day per user
  UNIQUE(user_id, date)
);

-- Task Energy Assignments and Completion Tracking
CREATE TABLE IF NOT EXISTS task_energy_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_check_id UUID REFERENCES daily_check(id) ON DELETE CASCADE,
  
  -- Energy Type and Cost
  energy_type TEXT CHECK (energy_type IN ('cognitive', 'physical', 'social', 'emotional', 'creative')),
  energy_cost INTEGER CHECK (energy_cost > 0),
  
  -- Task Completion Steps (for progress tracking)
  task_steps JSONB DEFAULT '[]', -- Array of step objects with completion status
  completed_steps INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  
  -- Timing
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Burnout Prevention Tracking
CREATE TABLE IF NOT EXISTS burnout_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  
  -- Common Burnout Flags (for 2-B logic)
  sleep_disrupted BOOLEAN DEFAULT FALSE,
  emotional_exhaustion BOOLEAN DEFAULT FALSE,
  cognitive_overload BOOLEAN DEFAULT FALSE,
  social_withdrawal BOOLEAN DEFAULT FALSE,
  physical_fatigue BOOLEAN DEFAULT FALSE,
  motivation_loss BOOLEAN DEFAULT FALSE,
  irritability_increased BOOLEAN DEFAULT FALSE,
  
  -- Calculated flag count (for 2-B threshold logic)
  total_flags INTEGER GENERATED ALWAYS AS (
    (sleep_disrupted::int) + (emotional_exhaustion::int) + (cognitive_overload::int) +
    (social_withdrawal::int) + (physical_fatigue::int) + (motivation_loss::int) +
    (irritability_increased::int)
  ) STORED,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- User Insights and Patterns
CREATE TABLE IF NOT EXISTS user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  insight_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0.0 AND 1.0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_daily_check_user_date ON daily_check (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_check_capacity ON daily_check (capacity_today) WHERE capacity_today IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_check_brain_mode ON daily_check (brain_mode);
CREATE INDEX IF NOT EXISTS idx_energy_categories_date ON energy_categories (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_task_energy_log_task ON task_energy_log (task_id);
CREATE INDEX IF NOT EXISTS idx_task_energy_log_user_date ON task_energy_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_burnout_indicators_user_date ON burnout_indicators (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_burnout_indicators_flags ON burnout_indicators (total_flags) WHERE total_flags >= 3;

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_daily_check_updated_at ON daily_check;
CREATE TRIGGER update_daily_check_updated_at
  BEFORE UPDATE ON daily_check
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_energy_categories_updated_at ON energy_categories;
CREATE TRIGGER update_energy_categories_updated_at
  BEFORE UPDATE ON energy_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE daily_check ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_energy_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE burnout_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage their own daily checks" ON daily_check;
CREATE POLICY "Users can manage their own daily checks" ON daily_check
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own energy categories" ON energy_categories;
CREATE POLICY "Users can manage their own energy categories" ON energy_categories
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own task energy logs" ON task_energy_log;
CREATE POLICY "Users can manage their own task energy logs" ON task_energy_log
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own burnout indicators" ON burnout_indicators;
CREATE POLICY "Users can manage their own burnout indicators" ON burnout_indicators
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own insights" ON user_insights;
CREATE POLICY "Users can view their own insights" ON user_insights
  FOR ALL USING (auth.uid() = user_id);

-- Utility function to get current capacity for 2-B integration
CREATE OR REPLACE FUNCTION get_current_capacity(target_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
DECLARE
  current_capacity INTEGER;
BEGIN
  SELECT capacity_today INTO current_capacity
  FROM daily_check
  WHERE user_id = target_user_id 
    AND date = CURRENT_DATE;
    
  -- Return default capacity if no check today
  RETURN COALESCE(current_capacity, 5);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create today's daily check if it doesn't exist
CREATE OR REPLACE FUNCTION ensure_daily_check(target_user_id UUID DEFAULT auth.uid())
RETURNS UUID AS $$
DECLARE
  check_id UUID;
BEGIN
  INSERT INTO daily_check (user_id, date)
  VALUES (target_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, date) 
  DO NOTHING
  RETURNING id INTO check_id;
  
  -- If no insert happened, get existing ID
  IF check_id IS NULL THEN
    SELECT id INTO check_id
    FROM daily_check
    WHERE user_id = target_user_id AND date = CURRENT_DATE;
  END IF;
  
  RETURN check_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE daily_check IS 'Daily neuro-check with capacity adjustment from 2-B logic';
COMMENT ON TABLE energy_categories IS 'Spoon theory-based energy tracking by category';
COMMENT ON TABLE task_energy_log IS 'Energy allocation and task completion tracking';
COMMENT ON TABLE burnout_indicators IS 'Burnout prevention flags for capacity adjustment';
COMMENT ON FUNCTION get_current_capacity IS 'Get current adjusted capacity for user (2-B integration)';

-- Notify completion
DO $$ BEGIN
  RAISE NOTICE 'Phase 2 database schema setup complete!';
  RAISE NOTICE 'Created tables: daily_check, energy_categories, task_energy_log, burnout_indicators, user_insights';
  RAISE NOTICE '2-B Adjust-Capacity integration ready with capacity_today field';
END $$;