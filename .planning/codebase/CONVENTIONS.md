# Coding Conventions

**Analysis Date:** 2026-03-02

## Naming Patterns

**Files:**
- Component files: PascalCase (e.g., `navbar.tsx`, `database-provider.tsx`)
- Pages: lowercase with hyphens (e.g., `page.tsx`, `[id]/edit/page.tsx`)
- Service files: camelCase with descriptive names (e.g., `data-integration.ts`, `cost-calculation.ts`)
- Hook files: useHookName convention (e.g., `useDatabase.ts`)
- Type files: descriptive (e.g., `types.ts`, `reason-codes.ts`)

**Functions:**
- React components: PascalCase (e.g., `CustomersContent`, `DatabaseProvider`)
- Regular functions: camelCase (e.g., `formatCurrency`, `calculatePolylineLength`)
- Custom hooks: useXxx pattern (e.g., `useDatabase`, `useDatabaseContext`)
- Event handlers: camelCase prefixed with on (e.g., `onClick`, `onValueChange`)

**Variables:**
- State variables: camelCase (e.g., `searchTerm`, `statusFilter`)
- Constants: camelCase or UPPER_SNAKE_CASE for module constants (e.g., `navigation` for const arrays)
- Type instances: camelCase (e.g., `customer`, `quotation`)

**Types:**
- Interfaces: PascalCase with I prefix optional (e.g., `Customer`, `Quotation`, `IntegratedQuotationData`)
- Type aliases: PascalCase (e.g., `CostBreakdown`)
- Enums: PascalCase (used as union types instead: `"Active" | "Inactive" | "Suspended"`)

## Code Style

**Formatting:**
- No explicit formatter configured (Prettier not in devDependencies)
- Next.js ESLint v9 used for linting: `npm run lint`
- Indentation: 2 spaces (observed in all files)
- Line endings: Unix style (LF)

**Linting:**
- ESLint 9.x with Next.js config: `eslint-config-next 15.5.0`
- Run: `npm run lint`
- No strict configuration file found; using Next.js defaults

## Import Organization

**Order:**
1. React and Next.js core imports (`import { useState, Suspense } from "react"`)
2. Third-party UI libraries (`@radix-ui/`, `lucide-react`)
3. Internal components (relative path imports from `@/components`)
4. Internal utilities and types (relative path imports from `@/lib`)
5. Next.js routing (`next/link`, `next/navigation`)

**Path Aliases:**
- `@/*` maps to root directory (configured in `tsconfig.json`)
- Used consistently throughout: `@/components/ui/card`, `@/lib/data`, `@/lib/types`
- Prefer alias imports over relative paths

Example from `customers/page.tsx`:
```typescript
import { useState, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { statusColors, formatCurrency } from "@/lib/data"
import { useSearchParams } from "next/navigation"
import { useDatabaseContext } from "@/components/database-provider"
import { Customer } from "@/lib/types"
```

## Error Handling

**Patterns:**
- Try-catch blocks used in service classes for external operations (CAD parsing, API calls)
- Console.error() for logging errors without stopping execution: `console.error('Error fetching copper price:', error)`
- Console.warn() for non-critical issues: `console.warn('LibreDWG.readDWG not available, using fallback')`
- Throw new Error() for critical failures: `throw new Error('Failed to load LibreDWG library')`
- Context hooks throw errors when misused: `throw new Error("useDatabaseContext must be used within a DatabaseProvider")`

Example from `lib/services/copper-lme-api.ts`:
```typescript
try {
  // operation
} catch (error) {
  console.error('Error fetching copper price:', error)
}
```

Example from `lib/services/real-cad-parser.ts`:
```typescript
try {
  // parse operation
} catch (error) {
  throw new Error(`Failed to parse DXF file: ${error}`)
}
```

## Logging

**Framework:** Native `console` methods

**Patterns:**
- `console.log()` for general output (rare in production code)
- `console.error()` for error conditions that don't halt execution
- `console.warn()` for deprecations and fallback situations
- Used in components for debugging (e.g., navbar.tsx: `console.log('Logout clicked')`)
- Not used systematically for business logic tracing

## Comments

**When to Comment:**
- JSDoc for service class methods explaining public API
- Inline comments for non-obvious logic or complex algorithms
- Section comments using `{/* Section Name */}` in JSX for organizational clarity

Example from `lib/services/data-integration.ts`:
```typescript
/**
 * Initialize with data from database context
 */
initialize(data: {
  quotations: Quotation[]
  boms?: BillOfMaterials[]
  workOrders?: ProductionWorkOrder[]
  processSteps?: ProcessStep[]
  engineeringProjects?: EngineeringProject[]
  engineeringDrawings?: EngineeringDrawing[]
  boqs?: BillOfQuantities[]
})
```

**JSDoc/TSDoc:**
- Minimal usage; applied to public service methods
- Provides method signature and purpose only
- Does not enforce parameter/return documentation consistently

## Function Design

**Size:** Functions average 50-200 lines

**Parameters:**
- Destructured object parameters preferred for multiple arguments: `({ children }: { children: ReactNode })`
- Type annotations always provided for parameters
- Use `type` utility type for complex parameter objects: `type CostBreakdown`

**Return Values:**
- Always typed explicitly: `IntegratedQuotationData | null`, `CostBreakdown`
- Return early on guards: throw or return null for invalid states
- Functions return typed objects or primitives, not `any` (unless unavoidable)

Example from `lib/database.ts`:
```typescript
export function refreshCustomers(updateCallback?: (data: Customer[]) => void): Customer[] {
  // implementation
  return db.customers
}
```

## Module Design

**Exports:**
- Named exports preferred: `export function useDatabaseContext()`
- Default exports used for React components: `export default function CustomersPage()`
- Mixed exports in some utility files: both named and default

**Barrel Files:**
- Not consistently used
- `lib/services/` contains individual service files, no index.ts barrel
- `components/ui/` (Radix UI) has implicit barrel pattern through index files

Example from `lib/services/data-integration.ts`:
```typescript
export class DataIntegrationService {
  private static instance: DataIntegrationService
  // ...
  static getInstance(): DataIntegrationService {
    if (!DataIntegrationService.instance) {
      DataIntegrationService.instance = new DataIntegrationService()
    }
    return DataIntegrationService.instance
  }
}

export const dataIntegrationService = DataIntegrationService.getInstance()
```

## Client vs Server

**"use client" directive:**
- Used at top of component files requiring interactivity
- Applied in: `database-provider.tsx`, `navbar.tsx`, `customers/page.tsx`
- Server components used for data fetching (none detected; all data via context)

**React Patterns:**
- useState for local component state
- useContext for shared state (DatabaseContext)
- useEffect for initialization and side effects
- useCallback for memoized event handlers (some usage)

## Tailwind CSS

**Utility Classes:**
- Inline utility classes: `className="bg-gray-50"`, `className="text-2xl font-bold text-gray-900"`
- `cn()` utility for conditional class merging: `cn("base-class", condition && "conditional-class")`
- Responsive classes: `className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"`
- No custom CSS files; all styling via utility classes

Example from `navbar.tsx`:
```typescript
className={cn(
  "inline-flex items-center px-1 pt-1 border-b-2 text-xs font-medium whitespace-nowrap flex-shrink-0",
  pathname === item.href
    ? "border-primary text-foreground"
    : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground",
)}
```

## Suspense & Async

**Suspense Boundaries:**
- Used for page-level loading states: `<Suspense fallback={<div>Loading customers...</div>}>`
- Page components wrap content components in Suspense
- Loading states: simple div elements with text (could be improved with Skeleton components)

Example from `customers/page.tsx`:
```typescript
export default function CustomersPage() {
  return (
    <Suspense fallback={<div>Loading customers...</div>}>
      <CustomersContent />
    </Suspense>
  )
}
```

## TypeScript

**Configuration:**
- Strict mode enabled: `"strict": true` in `tsconfig.json`
- skipLibCheck enabled: `"skipLibCheck": true` (faster builds)
- noEmit enabled: `"noEmit": true` (Next.js handles emission)
- Target: ES6

**Typing Practices:**
- Type all function parameters and return types
- Import types from `@/lib/types` (centralized type definitions)
- Use union types for enums: `status: "Active" | "Inactive" | "Suspended"`
- Array types: `Customer[]` notation used consistently
- Optional properties: `?` notation (e.g., `notes?: string`)

---

*Convention analysis: 2026-03-02*
