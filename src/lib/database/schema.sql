-- EF Buddy Database Schema - Phase 1
-- Core Task Dashboard with ADHD/Autism-friendly features

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types for type safety
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('capture', 'today', 'completed', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tasks table - Core entity for task management
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 500),
  description TEXT CHECK (length(description) <= 2000),
  status task_status DEFAULT 'capture',
  priority priority_level DEFAULT 'medium',
  energy_required INTEGER DEFAULT 3 CHECK (energy_required BETWEEN 1 AND 5),
  estimated_duration INTEGER CHECK (estimated_duration > 0 AND estimated_duration <= 1440), -- max 24 hours in minutes
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  
  -- AI Classification fields (2-A Task Classifier)
  ai_time_estimate INTEGER CHECK (ai_time_estimate > 0 AND ai_time_estimate <= 1440),
  ai_urgency_score INTEGER CHECK (ai_urgency_score BETWEEN 1 AND 5),
  ai_impact_score INTEGER CHECK (ai_impact_score BETWEEN 1 AND 5),
  ai_completion_criteria TEXT CHECK (length(ai_completion_criteria) <= 1000),
  ai_suggested_priority priority_level,
  ai_energy_level INTEGER CHECK (ai_energy_level BETWEEN 1 AND 5),
  ai_breakdown_steps TEXT[] DEFAULT '{}',
  ai_confidence DECIMAL(3,2) CHECK (ai_confidence BETWEEN 0.0 AND 1.0),
  ai_classified_at TIMESTAMPTZ,
  
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences - Customization for neurodivergent needs
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  daily_energy_capacity INTEGER DEFAULT 10 CHECK (daily_energy_capacity BETWEEN 5 AND 20),
  work_hours_start TIME DEFAULT '09:00',
  work_hours_end TIME DEFAULT '17:00',
  break_intervals INTEGER DEFAULT 25 CHECK (break_intervals BETWEEN 5 AND 60), -- minutes
  focus_mode_duration INTEGER DEFAULT 25 CHECK (focus_mode_duration BETWEEN 5 AND 120), -- minutes
  theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'high-contrast')),
  reduce_animations BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks (user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON tasks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_updated ON tasks (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks (status, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_energy ON tasks (energy_required);
CREATE INDEX IF NOT EXISTS idx_tasks_ai_classified ON tasks (ai_classified_at) WHERE ai_classified_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_ai_confidence ON tasks (ai_confidence) WHERE ai_confidence IS NOT NULL;

-- Full-text search index for task titles and descriptions
CREATE INDEX IF NOT EXISTS idx_tasks_search ON tasks USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) for data protection
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Function to get daily task load for a user
CREATE OR REPLACE FUNCTION get_daily_task_load(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  total_energy INTEGER,
  total_tasks BIGINT,
  completed_energy INTEGER,
  completed_tasks BIGINT,
  remaining_energy INTEGER,
  capacity_percentage DECIMAL
) AS $$
DECLARE
  user_capacity INTEGER;
BEGIN
  -- Get user's daily energy capacity
  SELECT daily_energy_capacity INTO user_capacity
  FROM user_preferences
  WHERE user_id = auth.uid();

  -- Default capacity if not set
  user_capacity := COALESCE(user_capacity, 10);

  RETURN QUERY
  SELECT 
    COALESCE(SUM(t.energy_required), 0)::INTEGER as total_energy,
    COUNT(*)::BIGINT as total_tasks,
    COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.energy_required ELSE 0 END), 0)::INTEGER as completed_energy,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::BIGINT as completed_tasks,
    GREATEST(0, user_capacity - COALESCE(SUM(CASE WHEN t.status != 'completed' THEN t.energy_required ELSE 0 END), 0))::INTEGER as remaining_energy,
    ROUND(
      (COALESCE(SUM(t.energy_required), 0)::DECIMAL / user_capacity * 100),
      1
    ) as capacity_percentage
  FROM tasks t
  WHERE t.user_id = auth.uid()
    AND t.status IN ('today', 'completed')
    AND DATE(t.created_at) = target_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default user preferences
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_preferences();

-- Utility function to move tasks to 'today' based on energy capacity
CREATE OR REPLACE FUNCTION smart_move_to_today(max_energy INTEGER DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  user_capacity INTEGER;
  current_load INTEGER;
  available_energy INTEGER;
  moved_count INTEGER := 0;
  task_record RECORD;
BEGIN
  -- Get user's daily energy capacity
  SELECT daily_energy_capacity INTO user_capacity
  FROM user_preferences
  WHERE user_id = auth.uid();

  user_capacity := COALESCE(user_capacity, 10);
  max_energy := COALESCE(max_energy, user_capacity);

  -- Get current today load
  SELECT COALESCE(SUM(energy_required), 0) INTO current_load
  FROM tasks
  WHERE user_id = auth.uid() AND status = 'today';

  available_energy := max_energy - current_load;

  -- Move high-priority tasks that fit within available energy
  FOR task_record IN
    SELECT id, energy_required
    FROM tasks
    WHERE user_id = auth.uid()
      AND status = 'capture'
      AND energy_required <= available_energy
    ORDER BY 
      CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      created_at ASC
  LOOP
    UPDATE tasks
    SET status = 'today', updated_at = NOW()
    WHERE id = task_record.id;

    available_energy := available_energy - task_record.energy_required;
    moved_count := moved_count + 1;

    EXIT WHEN available_energy <= 0;
  END LOOP;

  RETURN moved_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data for development (remove in production)
-- This will only insert if no tasks exist for the user

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE tasks IS 'Core task management table with ADHD/Autism-friendly features';
COMMENT ON TABLE user_preferences IS 'User customization settings for neurodivergent needs';
COMMENT ON FUNCTION get_daily_task_load IS 'Calculate daily energy load and capacity utilization';
COMMENT ON FUNCTION smart_move_to_today IS 'Intelligently move tasks to today based on energy capacity';

-- Notify that schema setup is complete
DO $$ BEGIN
  RAISE NOTICE 'EF Buddy database schema setup complete!';
  RAISE NOTICE 'Created tables: tasks, user_preferences';
  RAISE NOTICE 'Created functions: get_daily_task_load, smart_move_to_today';
  RAISE NOTICE 'Row Level Security enabled for all tables';
END $$;