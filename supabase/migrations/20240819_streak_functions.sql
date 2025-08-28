-- =====================================================
-- EF Buddy: Streak System RPC Functions
-- =====================================================
-- These functions provide the main API for tracking and querying streaks

-- =====================================================
-- FUNCTION: track_effort_streak
-- =====================================================
-- Main function to track when a user performs a habit effort
-- Returns current streak info and whether a 5-day bonus was just awarded

CREATE OR REPLACE FUNCTION public.track_effort_streak(
  effort_type TEXT,
  performed_at_utc TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  event_day DATE,
  current_streak INT,
  best_streak INT,
  bonus_awarded BOOLEAN,
  effort_type_out TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  tz TEXT;
  last_day DATE;
  cur INT;
  best INT;
  awarded_on DATE;
  inserted BOOLEAN := FALSE;
  next_streak INT;
  calculated_event_day DATE;
BEGIN
  -- Authentication check
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate effort_type
  IF effort_type NOT IN ('sleep', 'exercise', 'medication', 'stress') THEN
    RAISE EXCEPTION 'Invalid effort_type. Must be: sleep, exercise, medication, or stress';
  END IF;

  -- Get user timezone (fallback to default if profile doesn't exist)
  SELECT COALESCE(p.timezone, 'America/New_York') INTO tz
  FROM public.profiles p
  WHERE p.id = uid;

  IF tz IS NULL THEN
    tz := 'America/New_York';
  END IF;

  -- Compute local event_day from UTC using user's timezone
  calculated_event_day := (performed_at_utc AT TIME ZONE tz)::DATE;

  -- Idempotent daily activity insert
  -- This ensures we only count one occurrence per day, even if called multiple times
  INSERT INTO public.daily_activity(user_id, event_day, efforts)
  VALUES (uid, calculated_event_day, ARRAY[effort_type])
  ON CONFLICT (user_id, event_day) 
  DO UPDATE SET 
    efforts = CASE 
      WHEN effort_type = ANY(daily_activity.efforts) THEN daily_activity.efforts
      ELSE array_append(daily_activity.efforts, effort_type)
    END;

  -- Check if this effort was newly added today
  SELECT effort_type = ANY(efforts) INTO inserted
  FROM public.daily_activity
  WHERE user_id = uid AND event_day = calculated_event_day;

  -- Ensure user_streak row exists for this effort type
  INSERT INTO public.user_streaks(user_id, effort_type, current_streak, best_streak)
  VALUES (uid, effort_type, 0, 0)
  ON CONFLICT (user_id, effort_type) DO NOTHING;

  -- Lock and read current streak data
  SELECT last_action_day, current_streak, best_streak, streak_bonus_awarded_on
  INTO last_day, cur, best, awarded_on
  FROM public.user_streaks
  WHERE user_id = uid AND user_streaks.effort_type = track_effort_streak.effort_type
  FOR UPDATE;

  -- Calculate next streak count
  IF last_day IS NULL THEN
    -- First time tracking this effort
    next_streak := 1;
  ELSIF calculated_event_day = last_day THEN
    -- Same day (should be rare due to daily_activity upsert logic)
    next_streak := cur;
  ELSIF calculated_event_day = last_day + 1 THEN
    -- Consecutive day - increment streak
    next_streak := cur + 1;
  ELSE
    -- Gap in days - restart streak
    next_streak := 1;
  END IF;

  -- Update best streak if needed
  best := GREATEST(COALESCE(best, 0), next_streak);

  -- Check for 5-day bonus award
  bonus_awarded := FALSE;
  IF next_streak = 5 AND (awarded_on IS NULL OR awarded_on != calculated_event_day) THEN
    bonus_awarded := TRUE;
    awarded_on := calculated_event_day;
    
    -- Optional: Log bonus award event
    -- You could insert into an events/notifications table here
  END IF;

  -- Update streak counters
  UPDATE public.user_streaks
  SET last_action_day = calculated_event_day,
      current_streak = next_streak,
      best_streak = best,
      streak_bonus_awarded_on = CASE 
        WHEN bonus_awarded THEN calculated_event_day 
        ELSE streak_bonus_awarded_on 
      END,
      updated_at = NOW()
  WHERE user_id = uid AND user_streaks.effort_type = track_effort_streak.effort_type;

  -- Return results
  event_day := calculated_event_day;
  current_streak := next_streak;
  best_streak := best;
  effort_type_out := effort_type;
  RETURN NEXT;
END;
$$;

-- =====================================================
-- FUNCTION: get_all_streak_status
-- =====================================================
-- Returns current streak status for all effort types for the authenticated user

CREATE OR REPLACE FUNCTION public.get_all_streak_status()
RETURNS TABLE (
  effort_type TEXT,
  last_action_day DATE,
  current_streak INT,
  best_streak INT,
  streak_bonus_awarded_on DATE,
  is_current BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  WITH current_date_calc AS (
    SELECT 
      COALESCE(
        (NOW() AT TIME ZONE COALESCE(p.timezone, 'America/New_York'))::DATE,
        NOW()::DATE
      ) as today
    FROM public.profiles p 
    WHERE p.id = auth.uid()
    UNION ALL
    SELECT NOW()::DATE as today
    LIMIT 1
  )
  SELECT 
    us.effort_type,
    us.last_action_day,
    us.current_streak,
    us.best_streak,
    us.streak_bonus_awarded_on,
    (us.last_action_day = cdc.today) as is_current
  FROM public.user_streaks us
  CROSS JOIN current_date_calc cdc
  WHERE us.user_id = auth.uid()
  ORDER BY us.effort_type;
$$;

-- =====================================================
-- FUNCTION: get_streak_status (single effort type)
-- =====================================================
-- Returns streak status for a specific effort type

CREATE OR REPLACE FUNCTION public.get_streak_status(effort_type TEXT)
RETURNS TABLE (
  effort_type_out TEXT,
  last_action_day DATE,
  current_streak INT,
  best_streak INT,
  streak_bonus_awarded_on DATE,
  is_current BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  WITH current_date_calc AS (
    SELECT 
      COALESCE(
        (NOW() AT TIME ZONE COALESCE(p.timezone, 'America/New_York'))::DATE,
        NOW()::DATE
      ) as today
    FROM public.profiles p 
    WHERE p.id = auth.uid()
    UNION ALL
    SELECT NOW()::DATE as today
    LIMIT 1
  )
  SELECT 
    us.effort_type,
    us.last_action_day,
    us.current_streak,
    us.best_streak,
    us.streak_bonus_awarded_on,
    (us.last_action_day = cdc.today) as is_current
  FROM public.user_streaks us
  CROSS JOIN current_date_calc cdc
  WHERE us.user_id = auth.uid() 
    AND us.effort_type = get_streak_status.effort_type;
$$;

-- =====================================================
-- FUNCTION: initialize_user_profile
-- =====================================================
-- Helper function to ensure user has a profile with timezone

CREATE OR REPLACE FUNCTION public.initialize_user_profile(
  user_timezone TEXT DEFAULT 'America/New_York'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.profiles(id, timezone)
  VALUES (uid, user_timezone)
  ON CONFLICT (id) 
  DO UPDATE SET 
    timezone = EXCLUDED.timezone,
    updated_at = NOW();

  RETURN uid;
END;
$$;

-- =====================================================
-- FUNCTION: reset_streak (for testing/admin)
-- =====================================================
-- Allows resetting a specific effort streak (useful for testing)

CREATE OR REPLACE FUNCTION public.reset_streak(effort_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate effort_type
  IF effort_type NOT IN ('sleep', 'exercise', 'medication', 'stress') THEN
    RAISE EXCEPTION 'Invalid effort_type. Must be: sleep, exercise, medication, or stress';
  END IF;

  -- Reset the streak
  UPDATE public.user_streaks
  SET current_streak = 0,
      last_action_day = NULL,
      streak_bonus_awarded_on = NULL,
      updated_at = NOW()
  WHERE user_id = uid AND user_streaks.effort_type = reset_streak.effort_type;

  RETURN TRUE;
END;
$$;

-- =====================================================
-- FUNCTION: check_and_reset_broken_streaks
-- =====================================================
-- Resets bonuses for streaks that have been broken (gap > 1 day)

CREATE OR REPLACE FUNCTION public.check_and_reset_broken_streaks()
RETURNS TABLE (
  effort_type_out TEXT,
  was_broken BOOLEAN,
  bonus_removed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  tz TEXT;
  today DATE;
  streak_record RECORD;
  days_since_last INT;
BEGIN
  -- Authentication check
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user timezone
  SELECT COALESCE(p.timezone, 'America/New_York') INTO tz
  FROM public.profiles p
  WHERE p.id = uid;

  IF tz IS NULL THEN
    tz := 'America/New_York';
  END IF;

  -- Get today's date in user's timezone
  today := (NOW() AT TIME ZONE tz)::DATE;

  -- Check each streak for being broken
  FOR streak_record IN 
    SELECT us.effort_type, us.last_action_day, us.current_streak, us.streak_bonus_awarded_on
    FROM public.user_streaks us
    WHERE us.user_id = uid AND us.last_action_day IS NOT NULL
  LOOP
    -- Calculate days since last action
    days_since_last := today - streak_record.last_action_day;
    
    -- If more than 1 day gap, the streak is broken
    IF days_since_last > 1 THEN
      -- Reset the streak and remove bonus if it existed
      UPDATE public.user_streaks
      SET current_streak = 0,
          streak_bonus_awarded_on = NULL,
          updated_at = NOW()
      WHERE user_id = uid AND user_streaks.effort_type = streak_record.effort_type;
      
      -- Return info about what was reset
      effort_type_out := streak_record.effort_type;
      was_broken := TRUE;
      bonus_removed := streak_record.streak_bonus_awarded_on IS NOT NULL;
      RETURN NEXT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;