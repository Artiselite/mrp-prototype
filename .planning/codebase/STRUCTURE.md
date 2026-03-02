# Codebase Structure

**Analysis Date:** 2026-03-02

## Directory Layout

```
mrp-prototype/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with DatabaseProvider
│   ├── page.tsx                  # Dashboard home page
│   ├── customers/                # Customer management domain
│   │   ├── page.tsx              # Customer list
│   │   ├── create/page.tsx       # Create new customer
│   │   ├── [id]/page.tsx         # Customer detail view
│   │   ├── [id]/edit/page.tsx    # Edit customer
│   │   └── loading.tsx           # Loading skeleton
│   ├── suppliers/                # Supplier management domain
│   │   └── [same structure as customers]
│   ├── items/                    # Item master data
│   ├── locations/                # Warehouse locations
│   ├── inventory/                # Inventory tracking
│   ├── quotations/               # Sales quotations (ETO)
│   ├── sales-orders/             # Converted quotations to orders
│   ├── projects/                 # Engineering projects
│   ├── engineering/              # Drawings and approvals
│   ├── bom/                      # Bill of Materials
│   ├── boq/                      # Bill of Quantities
│   ├── production/               # Work orders and execution
│   │   ├── layout.tsx            # Production module layout
│   │   └── [sub-routes]
│   ├── invoicing/                # Customer invoicing
│   ├── procurement/              # Supplier purchasing
│   ├── test-warehouse/           # Warehouse operations demo
│   ├── demo/                     # Database demo page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components (17 components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── checkbox.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   └── [12 more UI primitives]
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── [multiple dashboard views]
│   ├── production/               # Production-specific components
│   │   ├── [process tracking, OEE, shopfloor]
│   ├── database-provider.tsx     # DatabaseContext and hooks
│   ├── database-manager.tsx      # Database UI viewer
│   ├── navbar.tsx                # Main navigation bar
│   ├── theme-provider.tsx        # Dark mode provider
│   ├── cad-to-boq-converter.tsx  # CAD file processor UI
│   ├── market-data-dashboard.tsx # Commodity price tracker
│   ├── unit-economics-calculator.tsx # Pricing sensitivity analysis
│   ├── subcontractor-integration.tsx # Vendor management
│   ├── item-selector.tsx         # Item picker component
│   ├── process-timer.tsx         # Shopfloor timer UI
│   └── qr-code-generator.tsx     # QR code creator
├── lib/                          # Business logic and utilities
│   ├── database.ts               # In-memory DB with localStorage persistence (2200+ lines)
│   ├── types.ts                  # Type definitions (1500+ lines)
│   ├── data.ts                   # Sample data and status colors
│   ├── utils.ts                  # Utility functions (cn, formatting)
│   ├── templates.ts              # Sample templates for demo
│   ├── oee-utils.ts              # OEE calculation utilities
│   ├── reason-codes.ts           # Production reason codes
│   ├── hooks/
│   │   └── useDatabase.ts        # Database state hook (500+ lines)
│   └── services/
│       ├── data-integration.ts   # Cross-domain aggregation (300+ lines)
│       ├── cost-calculation.ts   # Pricing engine
│       ├── boq-generator.ts      # BOQ creation from engineering
│       ├── cad-parser.ts         # CAD file parsing (25KB)
│       ├── real-cad-parser.ts    # Production CAD parser
│       ├── copper-lme-api.ts     # LME commodity pricing API
│       ├── item-economics.ts     # Unit cost analysis
│       └── real-pricing-service.ts # Pricing service
├── public/                       # Static assets
├── styles/                       # Style configuration
├── config/                       # Configuration files
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
└── next.config.mjs              # Next.js configuration
```

## Directory Purposes

**app/ - Pages & Routes:**
- Purpose: Next.js App Router pages following domain-driven structure
- Contains: Page components, layouts, loading states
- Key organization: `/domain/page.tsx` for list, `/domain/create`, `/domain/[id]/page.tsx` for detail
- Routing: File-system based routing, `[id]` for dynamic routes

**components/ - React Components:**
- Purpose: Reusable UI components and domain-specific features
- Key subdivisions:
  - `ui/` - UI primitives (17 shadcn/ui components)
  - `dashboard/` - Dashboard visualizations
  - `production/` - Production workflows
  - Root level - High-impact feature components (provider, navbar, tooling)

**lib/ - Business Logic:**
- Purpose: Core domain logic, data persistence, calculations
- Key subdivisions:
  - Root level - Core database, types, utilities (3500+ lines)
  - `hooks/` - React hooks for state management
  - `services/` - Business services (cost, CAD parsing, integration)

**public/ - Static Assets:**
- Purpose: Static files served directly (images, icons)

**styles/ - CSS Configuration:**
- Purpose: Global CSS, Tailwind configuration

**config/ - Configuration:**
- Purpose: Configuration files for build and runtime

## Key File Locations

**Entry Points:**
- `app/layout.tsx` - Root layout wrapping DatabaseProvider, global styles, navbar
- `app/page.tsx` - Home dashboard (single large file 36KB+)
- `components/database-provider.tsx` - Context initialization and distribution
- `lib/database.ts` - In-memory database initialization

**Configuration:**
- `tsconfig.json` - TypeScript compiler options with path aliases (`@/` → root)
- `next.config.mjs` - Next.js configuration
- `components.json` - shadcn/ui configuration
- `package.json` - Dependencies (Next 15.2, React 19, Radix UI, Zod, recharts)

**Core Logic:**
- `lib/types.ts` - Comprehensive type system (50+ interfaces, 1500 lines)
- `lib/database.ts` - Complete CRUD layer and persistence (2200 lines)
- `lib/hooks/useDatabase.ts` - State hook initializing database (500+ lines)
- `lib/services/data-integration.ts` - Cross-domain data aggregation

**Testing:**
- Not detected - No test files found
- No test configuration (jest.config.js, vitest.config.ts) detected

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `DatabaseProvider.tsx`, `Navbar.tsx`)
- Pages: lowercase (e.g., `page.tsx`, `layout.tsx`)
- Services: kebab-case (e.g., `data-integration.ts`, `cost-calculation.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useDatabase.ts`)
- Types: Filename matches or matches export (e.g., `types.ts`, `database.ts`)

**Directories:**
- Pages/Routes: lowercase kebab-case (e.g., `/customers`, `/sales-orders`, `/test-warehouse`)
- Components: lowercase (e.g., `/dashboard`, `/production`, `/ui`)
- Services: lowercase (e.g., `/services`)

**Functions & Variables:**
- Exported functions: camelCase (e.g., `createCustomer()`, `formatCurrency()`)
- Components: PascalCase (e.g., `DatabaseProvider`, `Navbar`)
- Constants: UPPER_SNAKE_CASE (e.g., `DB_VERSION`, `DB_PREFIX`, `DB_KEYS`)
- React hooks: Lowercase `use` prefix (e.g., `useDatabase()`, `useDatabaseContext()`)

## Where to Add New Code

**New Feature (e.g., new domain module like "Shipping"):**
- Route: Create `app/shipping/` directory with `page.tsx` (list), `create/page.tsx`, `[id]/page.tsx` (detail), `[id]/edit/page.tsx`
- Types: Add interfaces to `lib/types.ts` (e.g., `ShippingOrder`, `ShippingItem`)
- Data Layer: Add CRUD methods to `lib/database.ts` and state to `lib/hooks/useDatabase.ts`
- Service Layer: Create `lib/services/shipping-service.ts` if complex business logic needed
- Components: Create domain-specific components in `components/shipping/` if not generic
- Context: Expose new methods via `DatabaseProvider` in `components/database-provider.tsx`

**New Component/Module (reusable feature):**
- Generic component: Place in `components/` root if widely used (e.g., `shipping-tracker.tsx`)
- Domain component: Place in `components/[domain]/` if specific to one module (e.g., `components/production/process-timer.tsx`)
- UI component: Add to `components/ui/` if primitive (follows shadcn/ui pattern)
- Styling: Use Tailwind utility classes; global styles in `app/globals.css`

**Utilities/Helpers:**
- Simple helpers (formatting, colors): Add to `lib/utils.ts` or `lib/data.ts`
- Business calculations: Create dedicated service in `lib/services/` (e.g., `shipping-cost-calculator.ts`)
- Domain-specific constants: Add to appropriate domain file (e.g., `lib/oee-utils.ts`)

**Database Schema Changes:**
- New entity type: Add interface to `lib/types.ts`
- New table: Add DB_KEY to `DB_KEYS` in `lib/database.ts`
- CRUD methods: Implement in `db` object in `lib/database.ts` (follow existing pattern)
- State hook: Add useState and CRUD methods to `lib/hooks/useDatabase.ts`
- Context exposure: Add to `useDatabaseContext()` return type in `components/database-provider.tsx`

## Special Directories

**app/demo/ :**
- Purpose: Database viewer and demo data page
- Generated: No - Developer-created for testing/demo
- Committed: Yes - Part of codebase

**app/test-warehouse/ :**
- Purpose: Warehouse management demo and test scenarios
- Generated: No - Developer-created for WMS testing
- Committed: Yes - Part of codebase

**components/dashboard/ :**
- Purpose: Dashboard-specific components and visualizations
- Generated: No - Hand-built using recharts, Card components
- Committed: Yes - Part of codebase

**.next/ :**
- Purpose: Next.js build output cache
- Generated: Yes - Produced by `npm run build`
- Committed: No - Excluded by .gitignore

**node_modules/ :**
- Purpose: npm dependencies
- Generated: Yes - Produced by `pnpm install`
- Committed: No - Excluded by .gitignore

**public/ :**
- Purpose: Static assets served directly
- Generated: No - Developer-maintained
- Committed: Yes - Part of codebase

---

*Structure analysis: 2026-03-02*
