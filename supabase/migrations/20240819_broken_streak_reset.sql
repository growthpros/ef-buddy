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