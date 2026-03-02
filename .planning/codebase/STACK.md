# Technology Stack

**Analysis Date:** 2026-03-02

## Languages

**Primary:**
- TypeScript 5.x - All source code, configuration, and application logic
- JSX/TSX - React component definitions using TypeScript

**Secondary:**
- JavaScript (Node.js) - Build configuration and tooling
- CSS - Tailwind CSS for styling

## Runtime

**Environment:**
- Node.js (via pnpm in development, Next.js server in production)

**Package Manager:**
- pnpm - Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Core:**
- Next.js 15.2.4 - Full-stack React framework with SSR and static generation
- React 19 - UI library and component framework
- React DOM 19 - React rendering layer

**UI & Components:**
- Radix UI (latest/1.x versions) - Unstyled, accessible component primitives
  - Components: accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toast, toggle, tooltip
- Tailwind CSS 4.1.9 - Utility-first CSS framework
- shadcn/ui - Component collection built on Radix UI and Tailwind

**Styling & Animation:**
- Tailwind CSS Animation - Animation utilities
- Tailwind Merge 2.5.5 - Utility class conflict resolution
- class-variance-authority 0.7.1 - CSS-in-JS component variant library
- clsx 2.1.1 - Conditional className builder
- @tailwindcss/postcss 4.1.9 - PostCSS plugin for Tailwind

**Charts & Data Visualization:**
- Recharts 2.15.4 - React charting library (bar, line, area charts)
- D3 components (embedded in recharts)
- Chart.js (via CDN) - Legacy charting, loaded in `app/layout.tsx`

**Form Handling:**
- React Hook Form 7.60.0 - Performant form state management
- @hookform/resolvers 3.10.0 - Validation resolver for zod and other schemas
- Zod 3.25.67 - TypeScript-first schema validation

**UI Components:**
- cmdk 1.0.4 - Command palette/autocomplete component
- Lucide React 0.454.0 - Icon library (SVG-based icons)
- Sonner 1.7.4 - Toast notification library
- Embla Carousel 8.5.1 - Carousel/slider component
- React Day Picker 9.8.0 - Date picker component (calendar)
- Input OTP 1.4.1 - One-time password input component
- React Resizable Panels 2.1.7 - Resizable layout panels
- Vaul 0.9.9 - Drawer/sheet component
- Geist 1.3.1 - Font and design system
- Next Themes (latest) - Theme provider and management

**Utilities:**
- Date-fns 4.1.0 - Date utility library
- Autoprefixer 10.4.20 - PostCSS plugin for CSS vendor prefixes

## Build & Dev Tools

**Build:**
- Next.js 15.2.4 - Built-in build system with webpack
- PostCSS 8.5 - CSS transformation tool

**Development:**
- TypeScript 5.x - Type checking
- ESLint 9 - Code linting
- eslint-config-next 15.5.0 - Next.js ESLint configuration
- tw-animate-css 1.3.3 - Tailwind animation utilities

**Type Definitions:**
- @types/node 22 - Node.js type definitions
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions

## Database & Persistence

**Storage:**
- Browser localStorage - Local client-side data persistence
- No backend database configured
- No ORM (Prisma, Drizzle, etc.) used

**Data Format:**
- JSON - All data serialized as JSON in localStorage
- localStorage keys prefixed with `mrp_prototype_`

## Key Dependencies

**Critical:**
- React 19 - UI rendering foundation
- Next.js 15.2.4 - Application framework and routing
- TypeScript 5.x - Type safety and developer tooling
- Radix UI (1.x) - Accessible component primitives

**Infrastructure:**
- Tailwind CSS 4.1.9 - Styling system
- React Hook Form 7.60.0 - Form state management
- Zod 3.25.67 - Runtime validation
- Recharts 2.15.4 - Data visualization

## Configuration

**Environment:**
- Environment variables: Only `LME_API_KEY` referenced (mock API)
- Located in: `lib/services/copper-lme-api.ts`
- Defaults to `'mock-key'` when not set

**Build Configuration:**
- `next.config.mjs` - Next.js configuration (ESLint and TypeScript error ignoring enabled)
- `tsconfig.json` - TypeScript compiler options (strict mode, ESNext target, path aliases)
- `postcss.config.mjs` - PostCSS configuration with Tailwind plugin
- `components.json` - shadcn/ui component configuration

**Path Aliases:**
- `@/*` → `./` (root directory) - Primary alias for all imports

## Platform Requirements

**Development:**
- Node.js (version not pinned, uses pnpm)
- pnpm package manager
- Modern browser with localStorage support

**Production:**
- Deployment target: Vercel (suggested from .vercel directory in .gitignore)
- Node.js runtime for Next.js server
- Client-side only feature set (no backend API required for current prototype)

## Build Scripts

```bash
npm run dev       # Development server (Next.js dev mode)
npm run build     # Production build
npm start         # Production server
npm run lint      # ESLint code quality checks
```

---

*Stack analysis: 2026-03-02*
