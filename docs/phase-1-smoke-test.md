# Phase 1: Core Task Dashboard - Smoke Test

## Overview
Manual testing procedures to verify Phase 1 implementation of the Core Task Dashboard functionality.

## Prerequisites
- Phase 0 bootstrap completed
- Development server running (`npm run dev`)
- Browser with developer tools access
- Keyboard for accessibility testing

## Test Environment
- **URL**: http://localhost:3000 (or provided sandbox URL)
- **Browser**: Chrome/Firefox/Safari with dev tools
- **Viewport**: Test both desktop (1200px+) and mobile (375px) views

## Core Feature Tests

### 1. Dashboard Overview (/dashboard)
**Navigation Test:**
- [ ] Navigate to `/dashboard` from home page
- [ ] Sidebar shows with correct navigation items
- [ ] Header displays "Dashboard" with subtitle
- [ ] All dashboard cards load without errors

**Quick Capture Test:**
- [ ] Quick capture input is visible and focused
- [ ] Can type task title
- [ ] Priority selector appears on focus/typing
- [ ] Can select priority levels (Low, Medium, High, Urgent)
- [ ] Enter key submits the task
- [ ] Input clears after successful submission
- [ ] Loading state shows during submission

**Energy Load Test:**
- [ ] Energy load bar displays correctly
- [ ] Shows current usage (7/10)
- [ ] Progress bar reflects percentage (70%)
- [ ] Warning message appears (if applicable)
- [ ] Color coding matches load level

**Task Overview Test:**
- [ ] Shows correct task counts for each status
- [ ] Captured: 8, Today: 5, Completed: 3
- [ ] Icons display correctly for each category
- [ ] Numbers are clearly readable

**Quick Actions Test:**
- [ ] "Organize Tasks" link works
- [ ] "Focus on Today" link works  
- [ ] "Smart Load Balance" button is clickable
- [ ] Hover states work correctly

### 2. Capture Page (/dashboard/capture)
**Page Load Test:**
- [ ] Navigate to `/dashboard/capture`
- [ ] Header shows "Capture" with appropriate subtitle
- [ ] Brain dump zone card is prominently displayed
- [ ] Instructions and tips are clearly visible

**Brain Dump Interface Test:**
- [ ] Quick capture input auto-focuses
- [ ] Placeholder text is helpful and clear
- [ ] Can type multi-line content
- [ ] Priority selector works as expected
- [ ] Submit with Enter key functions
- [ ] Clear feedback after successful capture

**Recently Captured List Test:**
- [ ] Shows list of recent captures (sample data)
- [ ] Each item displays timestamp
- [ ] Priority badges show correctly
- [ ] "→ Triage" buttons are functional
- [ ] Hover effects work smoothly

**Guidance Content Test:**
- [ ] "How to Capture Effectively" tips are clear
- [ ] "What to Capture" examples are helpful
- [ ] Encouragement section is visible
- [ ] All text is readable and well-formatted

### 3. Triage Page (/dashboard/triage)
**Page Layout Test:**
- [ ] Navigate to `/dashboard/triage`
- [ ] Header shows "Triage" with context
- [ ] Four-column layout displays correctly
- [ ] Instructions card is prominent and clear

**Task Organization Test:**
- [ ] Captured tasks show in first column
- [ ] Each task card displays title and energy level
- [ ] Priority columns are clearly labeled
- [ ] Drop zones are visually distinct
- [ ] "Drag to organize" hint is visible

**Energy Guide Test:**
- [ ] Energy level guide displays 5 levels
- [ ] Each level has appropriate color coding
- [ ] Descriptions are helpful and clear
- [ ] Visual hierarchy is effective

**Actions Test:**
- [ ] "Save Progress" button works
- [ ] "Smart Move to Today" button works
- [ ] Task counter shows correct numbers
- [ ] Encouraging text is present

### 4. Today Page (/dashboard/today)
**Page Structure Test:**
- [ ] Navigate to `/dashboard/today`
- [ ] Header shows today's date and encouraging message
- [ ] Energy status card displays prominently
- [ ] Task sections are clearly organized

**Energy Monitoring Test:**
- [ ] Current energy load shows correctly (7/10, 70%)
- [ ] Visual progress bar matches percentage
- [ ] Remaining energy is highlighted (3 units)
- [ ] Contextual advice appears

**Today's Tasks Test:**
- [ ] Active task is highlighted differently
- [ ] Task priorities display with correct badges
- [ ] Energy requirements are visible
- [ ] Duration estimates show
- [ ] Start/Pause/Complete buttons work

**Completed Tasks Test:**
- [ ] Completed section shows finished tasks
- [ ] Tasks appear with checkmarks
- [ ] Completion times are displayed
- [ ] Strike-through styling applied

**Break Reminder Test:**
- [ ] Break suggestion appears appropriately
- [ ] Break duration options are available
- [ ] "Maybe later" option works
- [ ] Visual styling is attention-getting but not intrusive

**Progress Cards Test:**
- [ ] Task completion percentage (60%)
- [ ] Energy usage percentage (70%)
- [ ] Focus time display (2h)
- [ ] All metrics are clearly readable

## Navigation & Layout Tests

### Sidebar Navigation
- [ ] All navigation links are keyboard accessible
- [ ] Active page indicator works correctly
- [ ] Icons and labels are clear
- [ ] Energy preview updates appropriately
- [ ] Quick capture button in sidebar works

### Header Components
- [ ] Each page has appropriate header
- [ ] Titles and subtitles are contextual
- [ ] Action buttons are relevant to page
- [ ] Responsive design works on mobile

### Responsive Design
- [ ] Desktop layout (1200px+) works correctly
- [ ] Tablet layout (768px-1199px) adapts properly
- [ ] Mobile layout (375px-767px) is usable
- [ ] Text remains readable at all sizes
- [ ] Touch targets are appropriately sized on mobile

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab navigation works throughout app
- [ ] Focus indicators are visible and clear
- [ ] Enter key activates buttons and links
- [ ] Escape key cancels operations where appropriate
- [ ] Skip to main content link works

### Screen Reader Compatibility
- [ ] Page titles are announced correctly
- [ ] Headings have proper hierarchy (h1, h2, h3)
- [ ] Form inputs have associated labels
- [ ] Status updates are announced
- [ ] Progress bars have proper ARIA attributes

### Visual Accessibility
- [ ] Text contrast meets WCAG AA standards
- [ ] Color coding has text alternatives
- [ ] Focus states are clearly visible
- [ ] Text can be zoomed to 200% without issues
- [ ] High contrast mode works (if browser supports)

## Performance Tests

### Loading Times
- [ ] Initial page load < 2 seconds
- [ ] Navigation between pages is smooth
- [ ] Task operations feel responsive
- [ ] No noticeable lag in interactions

### Error Handling
- [ ] Network errors are handled gracefully
- [ ] User feedback for errors is clear
- [ ] Failed operations can be retried
- [ ] App remains usable after errors

## ADHD/Autism-Friendly Features

### Cognitive Load Management
- [ ] Visual hierarchy reduces cognitive overhead
- [ ] Information is chunked appropriately
- [ ] Instructions are clear and concise
- [ ] Progress indicators reduce anxiety

### Sensory Considerations
- [ ] Color schemes are not overwhelming
- [ ] Animations are subtle and can be reduced
- [ ] Text is large enough and well-spaced
- [ ] Visual clutter is minimized

### Executive Function Support
- [ ] Tasks can be captured without friction
- [ ] Organization can happen separately from capture
- [ ] Energy management is prominent
- [ ] Focus is maintained on current context

## Browser Compatibility

### Desktop Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, if on Mac)
- [ ] Edge (latest)

### Mobile Testing
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Basic functionality works on both

## Success Criteria

### Must Pass ✅
- [ ] All four main pages load and function correctly
- [ ] Quick capture works from multiple locations
- [ ] Navigation is smooth and accessible
- [ ] Responsive design works on mobile/desktop
- [ ] Energy load monitoring is functional
- [ ] Task organization interfaces are usable
- [ ] Keyboard accessibility is complete
- [ ] Visual design is ADHD/Autism-friendly

### Should Pass ✅
- [ ] Performance is smooth across all interactions
- [ ] Error states are handled gracefully
- [ ] All text is readable and well-formatted
- [ ] Visual feedback is immediate and clear
- [ ] Break reminders and tips are helpful

### Nice to Have
- [ ] Animations and transitions are polished
- [ ] Advanced accessibility features work
- [ ] Cross-browser compatibility is perfect
- [ ] Advanced responsive behaviors work

## Known Issues / Limitations

### Expected Limitations (Phase 1)
- No real database connection (using sample data)
- No user authentication yet
- No real-time sync between tabs
- No persistent data storage
- No backend validation

### Potential Issues to Watch For
- Loading states might be too fast to see with sample data
- Drag and drop not implemented (triage uses sample data)
- Some interactive elements may not have full functionality
- Energy calculations are based on sample data

## Test Report Template

```
## Phase 1 Smoke Test Results

**Date:** [DATE]
**Tester:** [NAME]  
**Environment:** [BROWSER/OS/VIEWPORT]

### Dashboard Overview: ✅/❌
- Quick capture: ✅/❌
- Energy load: ✅/❌
- Task overview: ✅/❌
- Quick actions: ✅/❌

### Capture Page: ✅/❌
- Brain dump interface: ✅/❌
- Recently captured: ✅/❌
- Guidance content: ✅/❌

### Triage Page: ✅/❌
- Task organization: ✅/❌
- Energy guide: ✅/❌
- Column layout: ✅/❌

### Today Page: ✅/❌
- Energy monitoring: ✅/❌
- Task management: ✅/❌
- Progress tracking: ✅/❌

### Accessibility: ✅/❌
- Keyboard navigation: ✅/❌
- Screen reader: ✅/❌
- Visual accessibility: ✅/❌

### Issues Found:
[List any issues with severity level]

### Overall Assessment: PASS/FAIL
### Ready for Phase 2: YES/NO
```

## Next Steps After Testing

1. Address any critical issues found
2. Document any nice-to-have improvements for future phases
3. Get approval: "Phase 1 OK"
4. Prepare for Phase 2: Neuro-Check & Energy Units
5. Archive Phase 1 branch and merge to main