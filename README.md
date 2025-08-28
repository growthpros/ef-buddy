# EF Buddy - Executive Function Support

> **ADHD & Autistic-friendly self-management app for better executive function**

A thoughtfully designed productivity app built specifically for neurodivergent minds who need different approaches to task management and self-care.

## 🧠 Philosophy

EF Buddy is designed with neurodiversity in mind:
- **Works with your brain, not against it**
- **Reduces cognitive load through clear, predictable interfaces**
- **Respects energy as a finite resource (spoon theory)**
- **Prioritizes accessibility and inclusive design**
- **Built in phases to avoid overwhelming complexity**

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS with accessibility-first design system
- **Database:** Supabase (PostgreSQL, Auth, Storage)
- **Backend:** Supabase Edge Functions
- **Future Integrations:** Telegram Bot, Google/Outlook Calendar, Gmail

## 📋 Development Phases

### ✅ Phase 0: Bootstrap (COMPLETED)
- [x] Next.js 14 setup with TypeScript
- [x] Tailwind CSS with neuro-friendly color palette
- [x] Supabase client configuration
- [x] Accessible UI component library
- [x] Project structure and tooling

### 🚧 Phase 1: Core Task Dashboard (IN PROGRESS)
- [ ] Task capture system (brain dump)
- [ ] Task triage (priority-based organization)
- [ ] "Today" focused view
- [ ] Energy load bar and monitoring
- [ ] Basic task CRUD operations

### 📅 Phase 2: Neuro-Check & Energy Units
- [ ] Daily energy level check-ins
- [ ] Mood and focus tracking
- [ ] Spoon theory integration
- [ ] Personalized insights

### 📅 Phase 3: Maker-Blocks, Life-Care, Movement, Overload Mode
- [ ] Deep work time blocks
- [ ] Self-care task reminders
- [ ] Movement break integration
- [ ] Overload mode support

### 📅 Phase 4: Sunday Planner + Efficiency Scan
- [ ] Weekly planning workflow
- [ ] Task efficiency analysis
- [ ] Pattern recognition
- [ ] Optimization suggestions

### 📅 Phase 5: Polish & Deploy
- [ ] Performance optimization
- [ ] Advanced accessibility features
- [ ] Production deployment
- [ ] User onboarding

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or later
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ef-buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## ♿ Accessibility Features

EF Buddy is built with accessibility as a core requirement:

- **WCAG 2.1 AA compliance** (target)
- **Keyboard navigation** throughout the app
- **Screen reader optimization** with proper ARIA labels
- **High contrast mode support** for visual accessibility
- **Reduced motion support** respecting user preferences
- **Focus management** with clear visual indicators
- **Semantic HTML structure** for assistive technologies

## 🎨 Design System

### Color Palette
- **Primary:** Blue tones for focus and clarity
- **Secondary:** Gray tones for hierarchy and balance  
- **Success:** Green for completed actions
- **Warning:** Yellow for attention items
- **Danger:** Red for critical actions
- **High Contrast:** Full black/white/yellow for accessibility

### Typography
- **Font:** Inter for excellent readability
- **Sizes:** Generous line heights and larger base sizes
- **Hierarchy:** Clear visual distinction between content levels

### Spacing
- **Generous:** Extra padding and margins for reduced cognitive load
- **Consistent:** 8px grid system for predictable layouts
- **Responsive:** Mobile-first with tablet and desktop breakpoints

## 🔧 Environment Variables

Create a `.env.local` file with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 📖 Documentation

- [`docs/phase-0-plan.md`](docs/phase-0-plan.md) - Bootstrap phase documentation
- [`docs/phase-0-smoke-test.md`](docs/phase-0-smoke-test.md) - Testing procedures
- More phase docs added as development progresses

## 🤝 Contributing

This project follows a phase-by-phase development approach:

1. Each phase has its own plan, implementation, and smoke test
2. Features are built incrementally with user feedback
3. Accessibility and neurodiversity needs are prioritized
4. Code is tested thoroughly before moving to the next phase

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💫 Vision

EF Buddy aims to be the productivity app that finally "gets it" for neurodivergent users. By building in phases and prioritizing accessibility from day one, we're creating a tool that truly serves the ADHD and Autistic communities.

---

**Status:** Phase 0 Complete ✅ | Phase 1 In Progress 🚧

Built with ❤️ for the neurodivergent community