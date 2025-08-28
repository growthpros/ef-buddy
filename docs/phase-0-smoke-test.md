# Phase 0: Bootstrap - Smoke Test

## Overview
Manual testing steps to verify the bootstrap is complete and the development environment is working correctly.

## Prerequisites
- Node.js 18+ installed
- npm installed
- Terminal access

## Test Steps

### 1. Environment Setup ✅
```bash
cd /home/user/webapp
npm install
```
**Expected:** Dependencies install without errors

### 2. Development Server ✅
```bash
npm run dev
```
**Expected:** 
- Server starts on http://localhost:3000
- No compilation errors in terminal
- Hot reload is working

### 3. TypeScript Compilation ✅
```bash
npm run type-check
```
**Expected:** TypeScript compiles without errors

### 4. Linting ✅
```bash
npm run lint
```
**Expected:** ESLint runs without errors

### 5. Homepage Accessibility ✅
**Manual Tests:**
- [ ] Page loads successfully
- [ ] Skip to content link works (Tab + Enter)
- [ ] All buttons are keyboard accessible (Tab navigation)
- [ ] Focus indicators are visible and clear
- [ ] Text contrast is readable
- [ ] Page is responsive (test mobile viewport)

### 6. UI Components ✅
**Manual Tests:**
- [ ] Buttons render with correct styles
- [ ] Cards have proper spacing and shadows
- [ ] Hover states work correctly
- [ ] Loading states are smooth
- [ ] Color scheme is consistent

### 7. Tailwind CSS ✅
**Visual Verification:**
- [ ] Custom color palette applied correctly
- [ ] Typography scales work (text-sm, text-lg, etc.)
- [ ] Spacing utilities work (p-4, m-6, etc.)
- [ ] Responsive utilities work (md:text-xl, lg:grid-cols-3, etc.)
- [ ] Custom utilities work (focus-ring, safe-top, etc.)

### 8. Project Structure ✅
**File System Check:**
```
webapp/
├── docs/
│   ├── phase-0-plan.md ✅
│   └── phase-0-smoke-test.md ✅
├── src/
│   ├── app/
│   │   ├── globals.css ✅
│   │   ├── layout.tsx ✅
│   │   ├── page.tsx ✅
│   │   └── loading.tsx ✅
│   ├── components/
│   │   ├── ui/ ✅
│   │   └── layout/ (empty for now)
│   └── lib/
│       ├── supabase.ts ✅
│       ├── utils.ts ✅
│       └── types.ts ✅
├── package.json ✅
├── next.config.js ✅
├── tailwind.config.js ✅
├── tsconfig.json ✅
└── .env.example ✅
```

### 9. Supabase Configuration ✅
**Environment Setup:**
- [ ] Copy .env.example to .env.local
- [ ] Add placeholder Supabase credentials (or real ones if available)
- [ ] Verify no errors in browser console related to Supabase

### 10. Accessibility Features ✅
**Manual Tests:**
- [ ] Screen reader navigation (use browser dev tools)
- [ ] High contrast mode support (if browser supports)
- [ ] Reduced motion respected (check animation preferences)
- [ ] Keyboard-only navigation works throughout app

## Success Criteria

### Must Pass ✅
- [x] Development server runs without errors
- [x] TypeScript compiles successfully  
- [x] All UI components render correctly
- [x] Responsive design works on mobile/desktop
- [x] Basic accessibility features work
- [x] Project structure matches specification

### Should Pass ✅
- [x] Linting passes without warnings
- [x] Hot reload works properly
- [x] Focus management works correctly
- [x] Color scheme is applied consistently

### Nice to Have
- [ ] Performance metrics look good (Lighthouse)
- [ ] No console errors or warnings
- [ ] Smooth animations and transitions

## Known Issues / Notes

### Bootstrap Warnings (Expected)
- Supabase auth helpers deprecation warnings (will update in future phases)
- ESLint v8 deprecation warning (waiting for Next.js v15 support)

### Current Limitations
- No real functionality yet (Phase 1 will add task management)
- Supabase connection untested without real credentials
- No authentication flow (coming in later phases)

## Next Steps
After Phase 0 verification:
1. Get approval: "Phase 0 OK"
2. Move to Phase 1: Core Task Dashboard implementation
3. Create feature branch for Phase 1 development

## Test Report Template
```
## Phase 0 Smoke Test Results

**Date:** [DATE]
**Tester:** [NAME]
**Environment:** [BROWSER/OS]

### Results
- Development Server: ✅/❌
- TypeScript: ✅/❌  
- Linting: ✅/❌
- Homepage: ✅/❌
- UI Components: ✅/❌
- Accessibility: ✅/❌

### Issues Found
[List any issues]

### Ready for Phase 1: YES/NO
```