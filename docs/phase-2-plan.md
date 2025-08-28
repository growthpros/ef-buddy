# Phase 2: Neuro-Check & Energy Units

## Overview
Transform EF Buddy from a demo with sample data into a fully functional neurodiversity-focused self-management system. This phase adds real database connectivity, daily mental state tracking, and spoon theory-based energy management.

## Goals
- Connect real Supabase database for persistent data storage
- Implement daily neuro-check system for mental state tracking
- Build spoon theory-based energy unit management
- Create personalized insights based on user patterns
- Add real-time data synchronization
- Establish foundation for advanced neurodivergent support features

## Core Features

### 🧠 1. Daily Neuro-Check System
A gentle, non-judgmental daily check-in system designed for ADHD/Autistic minds.

**Components:**
- **Mood Tracker**: Simple emoji-based mood selection with custom options
- **Energy Level**: Current energy using spoon theory (1-10 scale)
- **Focus Capacity**: How much concentration is available today
- **Sensory State**: Overstimulated, balanced, or understimulated
- **Stress Level**: Current stress/overwhelm level
- **Sleep Quality**: How well did you sleep? (affects everything)
- **Notes**: Optional free-form thoughts about today

**UX Principles:**
- ⚡ **Quick & Optional**: Complete in 30 seconds, skip any section
- 🎨 **Visual First**: Emojis, colors, and graphics over text
- 📊 **Pattern Recognition**: Show trends without judgment
- 🕰️ **Flexible Timing**: Check in anytime, not just morning
- 🚫 **No Guilt**: Missed days are okay, gentle reminders only

### ⚡ 2. Energy Units (Spoon Theory Integration)
Visual, tangible representation of daily energy based on spoon theory.

**Components:**
- **Daily Energy Pool**: Visual representation of available energy
- **Energy Allocation**: Assign energy costs to tasks
- **Real-time Tracking**: Watch energy decrease as tasks are completed
- **Overload Prevention**: Warnings when approaching capacity
- **Recovery Tracking**: Monitor energy restoration over time
- **Historical Patterns**: Learn your energy patterns over weeks/months

**Energy Categories:**
- 🧠 **Cognitive Energy**: Mental focus and decision-making
- 🏃 **Physical Energy**: Movement and physical tasks
- 💬 **Social Energy**: Interactions and communication
- 😌 **Emotional Energy**: Processing feelings and stress
- 🎨 **Creative Energy**: Innovation and problem-solving

**Visual Elements:**
- 🥄 **Spoon Counter**: Literal spoon icons for energy units
- 📊 **Energy Bars**: Color-coded progress bars for each category
- ⚠️ **Overload Alerts**: Gentle warnings when energy is low
- 📈 **Trend Charts**: Weekly/monthly energy patterns
- 🔄 **Recovery Timer**: Estimated time to restore energy

### 📊 3. Real Database Integration
Move from sample data to fully persistent, user-owned data.

**Database Enhancements:**
- **Neuro-Check Tables**: Store daily mental state data
- **Energy Tracking**: Historical energy allocation and usage
- **Task Integration**: Connect real tasks to energy expenditure
- **User Preferences**: Personalized settings and thresholds
- **Pattern Storage**: Cache insights and trend data

**Data Flow:**
1. **User Input** → Real-time storage in Supabase
2. **Background Processing** → Calculate patterns and insights
3. **Smart Recommendations** → Based on historical data
4. **Sync Across Devices** → Real-time updates everywhere

### 🎯 4. Personalized Insights
Data-driven recommendations without being overwhelming.

**Insight Categories:**
- **Energy Patterns**: "You tend to have more energy on Tuesdays"
- **Task Timing**: "You complete creative tasks better in the morning"
- **Overload Prevention**: "You've been at 90% capacity for 3 days"
- **Recovery Suggestions**: "Consider a break - your focus has been low"
- **Success Recognition**: "You've completed 80% of your tasks this week!"

**Presentation:**
- 🌟 **Gentle Notifications**: Suggestions, not demands
- 📱 **Dashboard Cards**: Key insights on overview page
- 📊 **Optional Deep Dive**: Detailed analytics for those who want them
- 🎨 **Visual Stories**: Charts and graphics over raw numbers

## File Map

```
/
├── docs/
│   ├── phase-2-plan.md              # This file
│   └── phase-2-smoke-test.md        # Testing procedures
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── neuro-check/         # Daily check-in page
│   │   │   │   └── page.tsx         
│   │   │   ├── energy/              # Energy management page
│   │   │   │   └── page.tsx         
│   │   │   └── insights/            # Personal insights page
│   │   │       └── page.tsx         
│   │   └── api/                     # Real API routes
│   │       ├── neuro-checks/
│   │       │   └── route.ts         
│   │       ├── energy/
│   │       │   └── route.ts         
│   │       └── insights/
│   │           └── route.ts         
│   ├── components/
│   │   ├── neuro-check/
│   │   │   ├── mood-selector.tsx    # Emoji-based mood picker
│   │   │   ├── energy-slider.tsx    # Spoon theory energy input
│   │   │   ├── focus-indicator.tsx  # Focus capacity selector
│   │   │   ├── sensory-state.tsx    # Sensory processing state
│   │   │   └── check-in-form.tsx    # Complete check-in interface
│   │   ├── energy/
│   │   │   ├── energy-pool.tsx      # Visual energy representation
│   │   │   ├── spoon-counter.tsx    # Literal spoon icons
│   │   │   ├── energy-categories.tsx # Different energy types
│   │   │   ├── overload-warning.tsx # Capacity warnings
│   │   │   └── energy-history.tsx   # Historical patterns
│   │   ├── insights/
│   │   │   ├── pattern-card.tsx     # Individual insight display
│   │   │   ├── trend-chart.tsx      # Visual data trends
│   │   │   ├── recommendation.tsx   # Gentle suggestions
│   │   │   └── success-celebration.tsx # Positive reinforcement
│   │   └── ui/
│   │       ├── slider.tsx           # Range input component
│   │       ├── emoji-picker.tsx     # Emoji selection UI
│   │       └── chart.tsx            # Data visualization
│   ├── lib/
│   │   ├── api/
│   │   │   ├── neuro-checks.ts      # Neuro-check operations
│   │   │   ├── energy.ts            # Energy tracking API
│   │   │   └── insights.ts          # Insights generation
│   │   ├── hooks/
│   │   │   ├── use-neuro-check.ts   # Daily check-in state
│   │   │   ├── use-energy.ts        # Energy management
│   │   │   └── use-insights.ts      # Insights data
│   │   ├── analytics/
│   │   │   ├── pattern-detection.ts # Find user patterns
│   │   │   ├── energy-calculator.ts # Spoon theory math
│   │   │   └── insight-generator.ts # Create recommendations
│   │   └── database/
│   │       └── phase-2-schema.sql   # Extended database schema
│   └── styles/
│       ├── neuro-check.css          # Check-in specific styles
│       └── energy.css               # Energy visualization styles
```

## Database Schema Extensions

### New Tables

```sql
-- Daily Neuro-Check Records
CREATE TABLE neuro_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  check_date DATE NOT NULL,
  
  -- Core Metrics (1-10 scales)
  mood_level INTEGER CHECK (mood_level BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  focus_capacity INTEGER CHECK (focus_capacity BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  
  -- Categorical Data
  mood_emoji TEXT, -- Selected emoji representation
  sensory_state TEXT CHECK (sensory_state IN ('understimulated', 'balanced', 'overstimulated')),
  sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
  
  -- Optional Notes
  notes TEXT,
  
  -- Metadata
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one check per day per user
  UNIQUE(user_id, check_date)
);

-- Energy Tracking
CREATE TABLE energy_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Energy Categories (spoon theory)
  cognitive_available INTEGER DEFAULT 0,
  cognitive_used INTEGER DEFAULT 0,
  physical_available INTEGER DEFAULT 0,
  physical_used INTEGER DEFAULT 0,
  social_available INTEGER DEFAULT 0,
  social_used INTEGER DEFAULT 0,
  emotional_available INTEGER DEFAULT 0,
  emotional_used INTEGER DEFAULT 0,
  creative_available INTEGER DEFAULT 0,
  creative_used INTEGER DEFAULT 0,
  
  -- Daily Totals
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

-- Task Energy Assignments
CREATE TABLE task_energy_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Energy allocation when task is planned
  cognitive_allocated INTEGER DEFAULT 0,
  physical_allocated INTEGER DEFAULT 0,
  social_allocated INTEGER DEFAULT 0,
  emotional_allocated INTEGER DEFAULT 0,
  creative_allocated INTEGER DEFAULT 0,
  
  -- Actual energy used when completed
  cognitive_actual INTEGER,
  physical_actual INTEGER,
  social_actual INTEGER,
  emotional_actual INTEGER,
  creative_actual INTEGER,
  
  -- Timestamps
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Efficiency calculation (actual vs allocated)
  efficiency_score DECIMAL GENERATED ALWAYS AS (
    CASE 
      WHEN (cognitive_actual + physical_actual + social_actual + 
            emotional_actual + creative_actual) = 0 THEN NULL
      ELSE (cognitive_allocated + physical_allocated + social_allocated + 
            emotional_allocated + creative_allocated)::DECIMAL /
           NULLIF(cognitive_actual + physical_actual + social_actual + 
                  emotional_actual + creative_actual, 0)
    END
  ) STORED
);

-- User Insights Cache
CREATE TABLE user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Insight Data
  insight_type TEXT NOT NULL, -- 'energy_pattern', 'task_timing', 'overload_warning', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  
  -- Metadata
  data_points INTEGER, -- How many data points this insight is based on
  confidence_score DECIMAL CHECK (confidence_score BETWEEN 0 AND 1),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Display Control
  shown_to_user BOOLEAN DEFAULT FALSE,
  dismissed_by_user BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ, -- Some insights expire
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes and Functions

```sql
-- Performance indexes
CREATE INDEX idx_neuro_checks_user_date ON neuro_checks (user_id, check_date DESC);
CREATE INDEX idx_energy_units_user_date ON energy_units (user_id, date DESC);
CREATE INDEX idx_task_energy_user_date ON task_energy_log (user_id, allocated_at DESC);
CREATE INDEX idx_user_insights_priority ON user_insights (user_id, priority, generated_at DESC);

-- Function to get current energy status
CREATE OR REPLACE FUNCTION get_current_energy_status(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  total_available INTEGER,
  total_used INTEGER,
  remaining INTEGER,
  percentage_used DECIMAL,
  cognitive_remaining INTEGER,
  physical_remaining INTEGER,
  social_remaining INTEGER,
  emotional_remaining INTEGER,
  creative_remaining INTEGER,
  overload_risk BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eu.total_available,
    eu.total_used,
    (eu.total_available - eu.total_used) as remaining,
    ROUND((eu.total_used::DECIMAL / NULLIF(eu.total_available, 0)) * 100, 1) as percentage_used,
    (eu.cognitive_available - eu.cognitive_used) as cognitive_remaining,
    (eu.physical_available - eu.physical_used) as physical_remaining,
    (eu.social_available - eu.social_used) as social_remaining,
    (eu.emotional_available - eu.emotional_used) as emotional_remaining,
    (eu.creative_available - eu.creative_used) as creative_remaining,
    (eu.total_used::DECIMAL / NULLIF(eu.total_available, 0)) > 0.8 as overload_risk
  FROM energy_units eu
  WHERE eu.user_id = auth.uid()
    AND eu.date = target_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate energy insights
CREATE OR REPLACE FUNCTION generate_energy_insights()
RETURNS INTEGER AS $$
DECLARE
  insight_count INTEGER := 0;
  avg_energy DECIMAL;
  overload_days INTEGER;
BEGIN
  -- Calculate average energy usage over past 7 days
  SELECT AVG(total_used::DECIMAL / NULLIF(total_available, 0))
  INTO avg_energy
  FROM energy_units
  WHERE user_id = auth.uid()
    AND date >= CURRENT_DATE - INTERVAL '7 days';

  -- Count overload days (>90% usage)
  SELECT COUNT(*)
  INTO overload_days
  FROM energy_units
  WHERE user_id = auth.uid()
    AND date >= CURRENT_DATE - INTERVAL '7 days'
    AND (total_used::DECIMAL / NULLIF(total_available, 0)) > 0.9;

  -- Generate overload warning if needed
  IF overload_days >= 3 THEN
    INSERT INTO user_insights (
      user_id, insight_type, title, description, recommendation, priority, confidence_score
    ) VALUES (
      auth.uid(),
      'overload_warning',
      'High Energy Usage Detected',
      format('You''ve been using over 90%% of your energy for %s days this week.', overload_days),
      'Consider reducing your task load or scheduling more breaks to prevent burnout.',
      'high',
      0.9
    )
    ON CONFLICT DO NOTHING;
    insight_count := insight_count + 1;
  END IF;

  RETURN insight_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Task List

### 1. Database Setup & Real Data Connection
- [ ] Deploy Phase 2 database schema to Supabase
- [ ] Set up real environment variables and connection
- [ ] Test database connectivity and RLS policies
- [ ] Migrate task management to use real database
- [ ] Implement real-time synchronization

### 2. Daily Neuro-Check System
- [ ] Create mood selector with emoji interface
- [ ] Build energy level slider (1-10 scale)
- [ ] Add focus capacity indicator
- [ ] Implement sensory state selector
- [ ] Add sleep quality tracking
- [ ] Create optional notes field
- [ ] Build complete check-in form
- [ ] Add historical check-in viewing

### 3. Energy Units Management
- [ ] Design spoon counter visual component
- [ ] Create energy category breakdown
- [ ] Build energy allocation interface
- [ ] Implement overload warnings
- [ ] Add energy recovery tracking
- [ ] Create energy history visualization
- [ ] Connect tasks to energy expenditure

### 4. Personalized Insights
- [ ] Build pattern detection algorithms
- [ ] Create insight generation system
- [ ] Design insight display cards
- [ ] Add trend visualizations
- [ ] Implement gentle recommendation system
- [ ] Build success celebration features

### 5. UI Components & Pages
- [ ] Create neuro-check page (/dashboard/neuro-check)
- [ ] Build energy management page (/dashboard/energy)
- [ ] Add insights page (/dashboard/insights)
- [ ] Update sidebar navigation
- [ ] Add real-time data updates
- [ ] Implement loading and error states

### 6. Integration & Polish
- [ ] Connect energy to task planning
- [ ] Update dashboard with real data
- [ ] Add notification system for gentle reminders
- [ ] Implement data export capabilities
- [ ] Add privacy and data controls
- [ ] Performance optimization

## Success Criteria

### Must Have ✅
- [ ] Real database storing user data persistently
- [ ] Daily neuro-check system working smoothly
- [ ] Spoon theory energy management functional
- [ ] Tasks connected to real energy expenditure
- [ ] Basic personalized insights generated
- [ ] All data synced across browser sessions
- [ ] No data loss between sessions

### Should Have ✅
- [ ] Pattern recognition showing user trends
- [ ] Overload prevention warnings working
- [ ] Historical data visualization
- [ ] Gentle reminder system
- [ ] Success celebration features
- [ ] Mobile-responsive energy interfaces

### Nice to Have
- [ ] Advanced analytics and deep insights
- [ ] Energy prediction based on patterns
- [ ] Integration with external health data
- [ ] Collaborative features (share with care team)
- [ ] Advanced customization options

## Neurodiversity Considerations

### ADHD-Specific Features
- **Quick Check-ins**: 30-second completion time
- **Visual Progress**: Clear progress indicators
- **Flexible Timing**: Check in anytime, not rigid schedules
- **Dopamine Rewards**: Celebrate completions and successes
- **Executive Function Support**: Gentle nudges and structure

### Autism-Specific Features
- **Predictable Patterns**: Consistent interface and interactions
- **Sensory Awareness**: Track sensory processing state
- **Detail Options**: Optional deep-dive analytics for those who want them
- **Social Energy**: Explicit tracking of social energy expenditure
- **Routine Integration**: Fit into existing routines, don't disrupt

### Shared Neurodivergent Needs
- **No Judgment**: All tracking is for self-awareness, not criticism
- **Energy Respect**: Acknowledge that energy is finite and valuable
- **Pattern Recognition**: Help identify personal patterns without overwhelm
- **Gentle Approach**: Suggestions, not demands or guilt
- **User Control**: Full control over data and privacy

## Privacy & Security

### Data Protection
- All neuro-check data encrypted at rest
- RLS policies prevent data leakage between users
- Optional data export for user control
- Clear privacy policy for mental health data
- No sharing with third parties without explicit consent

### User Empowerment
- Full control over data deletion
- Granular privacy settings
- Optional anonymous usage for insights
- Transparent data usage explanation
- Easy account deletion with complete data removal

## Phase 2 Timeline

### Week 1: Foundation
- Database schema deployment
- Real data connection setup
- Basic neuro-check interface

### Week 2: Energy System
- Spoon theory implementation
- Energy visualization components
- Task-energy integration

### Week 3: Insights & Polish
- Pattern detection algorithms
- Personalized insights system
- UI polish and testing

### Week 4: Integration & Testing
- Full system integration
- Comprehensive testing
- Performance optimization
- Documentation updates

## Next Phase Preview (Phase 3)

Phase 2 will set up the foundation for Phase 3 advanced features:
- **Maker-Blocks**: Deep work time management
- **Life-Care Integration**: Self-care task automation
- **Movement Tracking**: Physical activity integration
- **Overload Mode**: Emergency simplified interface
- **Advanced Analytics**: Multi-week pattern analysis

---

**Phase 2 will transform EF Buddy from a beautiful demo into a truly functional neurodiversity support system that respects and works with the unique needs of ADHD and Autistic minds.** 🧠✨