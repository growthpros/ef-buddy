# Phase 1: Core Task Dashboard

## Overview
Build the foundational task management system with four key areas: capture, triage, today, and load bar. This phase establishes the core workflow for ADHD/Autistic-friendly task management.

## Goals
- Create a brain dump capture system for quick thought recording
- Implement priority-based task triage system
- Build a focused "Today" view for current tasks
- Add energy load monitoring to prevent overcommitment
- Establish core CRUD operations for tasks
- Set up basic Supabase database schema

## File Map

```
/
├── src/
│   ├── app/
│   │   ├── dashboard/                # Main dashboard pages
│   │   │   ├── page.tsx             # Dashboard overview
│   │   │   ├── capture/             # Capture page
│   │   │   │   └── page.tsx         
│   │   │   ├── triage/              # Triage page
│   │   │   │   └── page.tsx         
│   │   │   └── today/               # Today page
│   │   │       └── page.tsx         
│   │   └── api/                     # API routes (if needed)
│   │       └── tasks/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── input.tsx            # Input component
│   │   │   ├── textarea.tsx         # Textarea component
│   │   │   ├── badge.tsx            # Badge component
│   │   │   └── progress.tsx         # Progress bar component
│   │   ├── layout/
│   │   │   ├── dashboard-layout.tsx # Dashboard wrapper
│   │   │   ├── sidebar.tsx          # Navigation sidebar
│   │   │   └── header.tsx           # Dashboard header
│   │   ├── tasks/
│   │   │   ├── task-card.tsx        # Individual task display
│   │   │   ├── task-form.tsx        # Task creation/edit form
│   │   │   ├── task-list.tsx        # List of tasks
│   │   │   ├── quick-capture.tsx    # Quick capture input
│   │   │   ├── priority-selector.tsx # Priority selection UI
│   │   │   └── energy-selector.tsx   # Energy level selection
│   │   └── dashboard/
│   │       ├── load-bar.tsx         # Energy load visualization
│   │       ├── task-stats.tsx       # Task statistics
│   │       └── quick-actions.tsx    # Quick action buttons
│   ├── lib/
│   │   ├── api/
│   │   │   └── tasks.ts             # Task API functions
│   │   ├── hooks/
│   │   │   ├── use-tasks.ts         # Task management hook
│   │   │   └── use-dashboard.ts     # Dashboard data hook
│   │   └── database/
│   │       └── schema.sql           # Database schema
│   └── styles/
│       └── dashboard.css            # Dashboard-specific styles
└── docs/
    ├── phase-1-plan.md              # This file
    └── phase-1-smoke-test.md        # Phase 1 testing
```

## Core Features

### 1. Capture System 🧠
**Purpose:** Brain dump for thoughts, ideas, and tasks without friction

**Components:**
- Quick capture input (always visible)
- Full capture form with optional details
- Voice note support (future enhancement)
- Batch import from text

**UX Principles:**
- Zero-friction input (single field)
- No required fields except title
- Auto-save on blur
- Keyboard shortcuts (Ctrl+K to capture)

### 2. Triage System 🏷️
**Purpose:** Organize captured tasks by priority and energy requirements

**Components:**
- Drag-and-drop priority sorting
- Energy level assignment (1-5 scale)
- Duration estimation
- Tag assignment
- Bulk operations

**UX Principles:**
- Visual priority indicators
- Color-coded energy levels
- Quick keyboard shortcuts
- Undo/redo support

### 3. Today View 📅
**Purpose:** Focus on current day's tasks without overwhelm

**Components:**
- Today's task list
- Completed task tracking
- Energy remaining indicator
- Focus mode toggle
- Task timer integration

**UX Principles:**
- Limit to capacity (energy-based)
- Clear visual progress
- Distraction-free interface
- Easy task completion

### 4. Load Bar ⚡
**Purpose:** Visualize cognitive and energy load to prevent overcommitment

**Components:**
- Daily energy capacity bar
- Current load visualization
- Overload warnings
- Historical patterns
- Adjustment recommendations

**UX Principles:**
- Red/yellow/green status
- Clear capacity limits
- Gentle overload warnings
- Spoon theory integration

## Database Schema

### Tables

```sql
-- Tasks table (updated from Phase 0)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'capture',
  priority priority_level DEFAULT 'medium',
  energy_required INTEGER DEFAULT 3 CHECK (energy_required BETWEEN 1 AND 5),
  estimated_duration INTEGER, -- minutes
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  tags TEXT[],
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences (from Phase 0, may need updates)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_energy_capacity INTEGER DEFAULT 10,
  work_hours_start TIME DEFAULT '09:00',
  work_hours_end TIME DEFAULT '17:00',
  break_intervals INTEGER DEFAULT 25, -- minutes
  focus_mode_duration INTEGER DEFAULT 25, -- minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom types
CREATE TYPE task_status AS ENUM ('capture', 'today', 'completed', 'archived');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');

-- Indexes for performance
CREATE INDEX idx_tasks_user_status ON tasks (user_id, status);
CREATE INDEX idx_tasks_user_created ON tasks (user_id, created_at DESC);
CREATE INDEX idx_tasks_due_date ON tasks (due_date) WHERE due_date IS NOT NULL;

-- Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);
```

## API Design

### Task Operations
```typescript
// GET /api/tasks - List tasks with filtering
interface TasksQuery {
  status?: TaskStatus[]
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'priority' | 'due_date'
  sortOrder?: 'asc' | 'desc'
}

// POST /api/tasks - Create task
interface CreateTaskRequest {
  title: string
  description?: string
  priority?: Priority
  energy_required?: number
  estimated_duration?: number
  due_date?: string
  tags?: string[]
}

// PUT /api/tasks/:id - Update task
interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  energy_required?: number
  estimated_duration?: number
  due_date?: string
  tags?: string[]
}

// DELETE /api/tasks/:id - Delete task
```

## Task List

### 1. Database Setup
- [x] Create database schema
- [ ] Set up Row Level Security policies
- [ ] Create database indexes
- [ ] Test with sample data

### 2. Core API Functions
- [ ] Task CRUD operations (lib/api/tasks.ts)
- [ ] User preferences management
- [ ] Data validation and sanitization
- [ ] Error handling and logging

### 3. UI Components
- [ ] Enhanced Button component with loading states
- [ ] Input and Textarea components
- [ ] Badge component for tags/status
- [ ] Progress bar component
- [ ] Task card component
- [ ] Quick capture input

### 4. Task Management
- [ ] Task creation form
- [ ] Task editing interface
- [ ] Priority selector
- [ ] Energy level selector
- [ ] Task list with filtering
- [ ] Drag and drop reordering

### 5. Dashboard Layout
- [ ] Sidebar navigation
- [ ] Header with quick actions
- [ ] Dashboard grid layout
- [ ] Responsive mobile design
- [ ] Loading states

### 6. Core Pages
- [ ] Dashboard overview (/dashboard)
- [ ] Capture page (/dashboard/capture)
- [ ] Triage page (/dashboard/triage)
- [ ] Today page (/dashboard/today)

### 7. Load Management
- [ ] Energy load calculator
- [ ] Load bar visualization
- [ ] Overload warnings
- [ ] Capacity recommendations

### 8. Data Hooks
- [ ] useTask hook for task operations
- [ ] useDashboard hook for stats
- [ ] Real-time updates with Supabase
- [ ] Optimistic updates for better UX

## Success Criteria

### Must Have ✅
- [ ] Users can capture tasks quickly (<3 seconds)
- [ ] Tasks can be organized by priority and energy
- [ ] Today view shows focused task list
- [ ] Load bar prevents overcommitment
- [ ] All interactions are keyboard accessible
- [ ] Mobile-responsive design
- [ ] Real-time updates across tabs

### Should Have
- [ ] Drag and drop task reordering
- [ ] Bulk task operations
- [ ] Task search and filtering
- [ ] Duration tracking
- [ ] Undo/redo functionality

### Nice to Have
- [ ] Keyboard shortcuts for common actions
- [ ] Offline support
- [ ] Export/import functionality
- [ ] Task templates

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- [x] Keyboard navigation for all interactive elements
- [x] Screen reader support with proper ARIA labels
- [x] High contrast mode support
- [x] Focus indicators on all focusable elements
- [x] Alternative text for all images/icons
- [x] Semantic HTML structure

### ADHD/Autism Specific
- [ ] Reduced motion options
- [ ] Clear visual hierarchy
- [ ] Consistent interaction patterns
- [ ] Generous whitespace
- [ ] High contrast color schemes
- [ ] Simple, predictable navigation

## Performance Targets

- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms
- [ ] Task creation response < 200ms

## Testing Strategy

### Unit Tests
- [ ] Task CRUD operations
- [ ] Load calculation logic
- [ ] Form validation
- [ ] Component rendering

### Integration Tests
- [ ] Database operations
- [ ] API endpoints
- [ ] Real-time updates
- [ ] Navigation flow

### Manual Testing
- [ ] Accessibility with screen readers
- [ ] Keyboard-only navigation
- [ ] Mobile device testing
- [ ] High contrast mode
- [ ] Reduced motion preferences

## Security Considerations

- [x] Row Level Security for all data access
- [x] Input validation and sanitization
- [x] XSS prevention
- [x] CSRF protection (Next.js built-in)
- [ ] Rate limiting for API endpoints
- [ ] User session management

## Deployment Notes

### Environment Variables
```bash
# Required for Phase 1
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_DEBUG_MODE=false
```

### Database Migration
1. Run schema.sql in Supabase SQL editor
2. Verify tables and policies created
3. Test with sample user account
4. Enable RLS on all tables

## Phase 1 Completion Criteria

Before requesting "Phase 1 OK":
- [ ] All core features implemented and tested
- [ ] Database schema deployed and working
- [ ] Smoke test document completed
- [ ] Accessibility audit passed
- [ ] Performance targets met
- [ ] Security review completed
- [ ] Documentation updated

## Next Steps (Phase 2 Preview)
- Neuro-check system for daily mental state tracking
- Energy units based on spoon theory
- Mood and focus level monitoring
- Personalized insights and recommendations