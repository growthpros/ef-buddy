# 🧠 Neuro-Check System Implementation Instructions for Claude Code

## 📋 Overview

This guide provides complete instructions for implementing the **Dynamic Capacity System** (Neuro-Check functionality) from the EF Buddy project into your executive buddy app using Claude Code.

## 🎯 What You're Implementing

A comprehensive **Spoon Theory-based energy management system** that:
- 📊 **Tracks daily mental capacity** using interactive assessments
- 🧠 **Calculates energy levels** based on mood, brain fog, and burnout indicators
- 📚 **Educates users** about ADHD-friendly energy management
- 💾 **Persists data** in localStorage for offline functionality
- ⚡ **Integrates with task management** to prevent over-scheduling

## 📦 Required Dependencies

```bash
npm install lucide-react
```

If using shadcn/ui (recommended):
```bash
npx shadcn-ui@latest add card button badge alert
```

## 📁 File Structure to Create

```
src/
├── app/
│   └── neuro-check/
│       └── page.tsx                          # Main neuro-check page
├── components/
│   └── neuro-check/
│       └── interactive-neuro-check.tsx       # Interactive widget
└── api/
    └── adjust-capacity/
        └── route.ts                          # API route for calculations
```

## 🔗 Source Code Location

**Complete implementation is available in:**
- **GitHub Repository:** https://github.com/growthpros/ef-buddy
- **Branch:** `phase-2-neuro-check-energy`
- **Implementation File:** `/neuro-check-implementation.md`

## 📝 Step-by-Step Implementation

### Step 1: Copy the Core Files

From the `neuro-check-implementation.md` file in the repository, copy these three main components:

1. **Main Page Component** (`/app/neuro-check/page.tsx`)
   - Complete neuro-check interface
   - Educational content about Spoon Theory
   - Navigation and layout

2. **Interactive Widget** (`/components/neuro-check/interactive-neuro-check.tsx`)
   - Daily capacity assessment form
   - Spoon visualization with 🥄 emojis
   - Real-time capacity calculation
   - localStorage persistence

3. **API Route** (`/api/adjust-capacity/route.ts`)
   - Dynamic capacity calculation logic
   - Brain mode adjustments
   - Burnout protection algorithms

### Step 2: Install UI Components

If you don't have shadcn/ui components, use the basic implementations provided in the guide, or install:

```bash
npx shadcn-ui@latest add card button badge alert
```

### Step 3: Add Navigation Link

Add to your main navigation:
```tsx
<Link href="/neuro-check">Daily Neuro-Check</Link>
```

### Step 4: Integrate with Task Management

The system stores capacity data in localStorage with this key pattern:
```javascript
`neuro-check-${date}` // e.g., "neuro-check-2024-01-15"
```

Access it in your task management system:
```javascript
const today = new Date().toISOString().split('T')[0]
const capacityData = localStorage.getItem(`neuro-check-${today}`)
if (capacityData) {
  const { capacity_today } = JSON.parse(capacityData)
  // Use capacity_today (0-10 spoons) to limit daily task scheduling
}
```

## 🎨 Key Features Included

### 🥄 Spoon Theory Implementation
- **Visual Spoon Tracking:** 10 🥄 emojis representing energy units
- **Dynamic Calculation:** Base energy + brain mode + burnout protection
- **Educational Content:** Complete explanation of Spoon Theory for ADHD

### 🧠 Brain Mode Assessment
- **Normal:** No capacity adjustment
- **Fog:** -2 spoons (mild cognitive impairment)
- **Shutdown:** -4 spoons (severe cognitive overload)

### ⚠️ Burnout Protection
- **7 Indicators:** Sleep disrupted, emotional exhaustion, cognitive overload, etc.
- **Protection Threshold:** 3+ indicators = -3 spoon penalty
- **Prevention Focus:** Encourages rest when overwhelmed

### ⚡ Quick Energy Boosters
- **Coffee/Caffeine:** +1 spoon immediate boost
- **5-min Walk:** +1 spoon movement benefit  
- **ADHD Medication:** +2 spoons (if applicable)
- **20-min Power Nap:** +2 spoons rest benefit

## 📊 Data Structure

The system uses this localStorage data structure:

```javascript
{
  "mood_level": 7,                    // 1-10 scale
  "energy_units": 6,                  // 0-10 base spoons
  "brain_mode": "Normal",             // Normal|Fog|Shutdown
  "burnout_flags": ["sleep_disrupted"], // Array of indicators
  "capacity_today": 5,                // Final calculated capacity
  "completed_at": "2024-01-15T09:30:00Z",
  "adjustments": {
    "original_energy": 6,
    "brain_mode_adjustment": 0,
    "burnout_adjustment": 0,
    "final_capacity": 5
  }
}
```

## 🎯 Implementation Tips for Claude Code

### 1. Tell Claude Code Exactly This:

> "I need you to implement a complete Neuro-Check system for ADHD energy management using Spoon Theory. Use the implementation guide from https://github.com/growthpros/ef-buddy/blob/phase-2-neuro-check-energy/neuro-check-implementation.md
> 
> Create three files: `/app/neuro-check/page.tsx`, `/components/neuro-check/interactive-neuro-check.tsx`, and `/api/adjust-capacity/route.ts`. 
>
> The system should have visual spoon tracking (🥄 emojis), mood assessment, brain fog detection, burnout protection, and localStorage persistence. Include educational content about Spoon Theory for ADHD users."

### 2. Specify Integration Requirements:

> "Make the calculated daily capacity available to other parts of the app via localStorage key pattern `neuro-check-${date}`. The capacity should be used to limit task scheduling and prevent over-commitment."

### 3. Request ADHD-Friendly Features:

> "Ensure the interface is ADHD-friendly with clear visual feedback, immediate responses, gentle language, and educational explanations. Use warm colors and encouraging messaging."

## 🔍 Testing Instructions

After implementation, test these key features:

1. **Daily Assessment:** Complete a full neuro-check and verify capacity calculation
2. **Spoon Visualization:** Confirm 🥄 emojis update with energy slider
3. **Persistence:** Refresh page and verify data is saved/loaded
4. **Integration:** Check that task management respects capacity limits
5. **Education:** Review that Spoon Theory content is helpful and accurate

## 🚀 Expected Outcome

You'll have a complete neuro-check system that:
- ✅ Provides daily energy assessment
- ✅ Calculates realistic capacity using proven algorithms
- ✅ Educates users about sustainable energy management
- ✅ Integrates seamlessly with task management
- ✅ Supports ADHD-specific needs and challenges

## 📞 Support & Repository Access

- **Live Demo:** https://3001-ieug5a2tg8rtf7jx01wvx-6532622b.e2b.dev
- **GitHub Repository:** https://github.com/growthpros/ef-buddy
- **Implementation Branch:** `phase-2-neuro-check-energy`
- **Complete Guide:** `/neuro-check-implementation.md`

The EF Buddy repository contains the complete, tested implementation that you can reference for any implementation questions or troubleshooting.