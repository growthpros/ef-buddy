# Phase 0: Bootstrap Repository

## Overview
Set up a production-ready Next.js 14 app with Tailwind CSS and Supabase integration, following ADHD/Autistic-friendly development practices.

## Goals
- Initialize Next.js 14 with App Router
- Configure Tailwind CSS with accessibility-first design system
- Set up Supabase client and environment configuration
- Establish project structure for scalability
- Configure TypeScript with strict settings
- Set up development environment

## File Map

```
/
├── README.md                          # Updated project documentation
├── docs/                             # Phase documentation
│   ├── phase-0-plan.md              # This file
│   └── phase-0-smoke-test.md        # Testing instructions
├── package.json                      # Dependencies and scripts
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Tailwind + accessibility config
├── tsconfig.json                    # TypeScript configuration
├── .env.example                     # Environment template
├── .env.local                       # Local environment (gitignored)
├── .gitignore                       # Git ignore rules
├── src/                             # Source code
│   ├── app/                         # App Router
│   │   ├── globals.css              # Global styles + Tailwind
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   └── loading.tsx              # Loading UI
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # Base UI components
│   │   │   ├── button.tsx           # Accessible button
│   │   │   ├── card.tsx             # Card component
│   │   │   └── index.ts             # UI exports
│   │   └── layout/                  # Layout components
│   │       ├── header.tsx           # App header
│   │       └── sidebar.tsx          # Navigation sidebar
│   ├── lib/                         # Utilities and configurations
│   │   ├── supabase.ts             # Supabase client
│   │   ├── utils.ts                # Utility functions
│   │   └── types.ts                # TypeScript types
│   └── styles/                      # Additional styles
│       └── components.css           # Component-specific styles
└── public/                          # Static assets
    ├── favicon.ico                  # App icon
    └── icons/                       # UI icons
```

## Task List

### 1. Project Structure Setup
- [x] Create docs directory
- [ ] Initialize Next.js 14 with TypeScript
- [ ] Configure package.json with necessary dependencies
- [ ] Set up proper directory structure

### 2. Dependencies Installation
- [ ] Install Next.js 14 with App Router
- [ ] Install and configure Tailwind CSS
- [ ] Install Supabase client libraries
- [ ] Install TypeScript and development dependencies
- [ ] Install accessibility and UI dependencies

### 3. Configuration Files
- [ ] Configure next.config.js for optimal performance
- [ ] Set up tailwind.config.js with accessibility features
- [ ] Configure tsconfig.json with strict settings
- [ ] Create .env.example template
- [ ] Update .gitignore for Next.js and Supabase

### 4. Core Infrastructure
- [ ] Set up Supabase client configuration
- [ ] Create base UI components with accessibility
- [ ] Set up global styles and CSS variables
- [ ] Create root layout with proper HTML structure
- [ ] Implement basic responsive design system

### 5. Development Environment
- [ ] Configure development scripts
- [ ] Set up TypeScript strict mode
- [ ] Verify hot reload and development server
- [ ] Test Supabase connection

## Key Features for ADHD/Autistic Users
- High contrast, clear typography
- Consistent navigation patterns
- Reduced cognitive load through clean UI
- Accessible keyboard navigation
- Clear visual hierarchy
- Predictable interactions

## Dependencies

### Core Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/auth-helpers-nextjs": "^0.8.0"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.2.0",
  "@types/node": "^20.8.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "tailwindcss": "^3.3.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "eslint": "^8.50.0",
  "eslint-config-next": "^14.0.0"
}
```

### UI and Accessibility Dependencies
```json
{
  "clsx": "^2.0.0",
  "class-variance-authority": "^0.7.0",
  "lucide-react": "^0.290.0",
  "@radix-ui/react-icons": "^1.3.0",
  "tailwind-merge": "^1.14.0"
}
```

## Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Accessibility Standards
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader optimization
- High contrast mode support
- Focus management
- Semantic HTML structure

## Success Criteria
- ✅ Next.js development server runs without errors
- ✅ Tailwind CSS compiles and applies correctly
- ✅ Supabase client connects successfully
- ✅ TypeScript compiles without errors
- ✅ Basic responsive layout works on mobile/desktop
- ✅ All accessibility features are functional