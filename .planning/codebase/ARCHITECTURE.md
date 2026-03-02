# Architecture

**Analysis Date:** 2026-03-02

## Pattern Overview

**Overall:** Next.js App Router with layered service architecture following DDD (Domain-Driven Design) principles

**Key Characteristics:**
- Client-side data persistence using in-memory database (no backend API currently)
- Context-based state management via React Context API
- Service layer for business logic (cost calculation, data integration, CAD parsing)
- Component-based UI using shadcn/ui with Radix UI primitives
- Full TypeScript with comprehensive type definitions
- Multi-domain support: Sales, Engineering, Production, Warehousing, Procurement

## Layers

**Presentation Layer:**
- Purpose: User interface components and page layouts
- Location: `app/` (Next.js pages) and `components/` (React components)
- Contains: Page components, UI components, dashboard layouts
- Depends on: Business logic services, Context for state, lib/data for utilities
- Used by: End users via browser

**Service Layer:**
- Purpose: Business logic, data integration, calculations, external API integration
- Location: `lib/services/`
- Contains:
  - `data-integration.ts` - Aggregates data across domains (quotations, BOMs, work orders)
  - `cost-calculation.ts` - Pricing, margin, overhead calculations
  - `boq-generator.ts` - Generates Bill of Quantities from engineering data
  - `cad-parser.ts` - Parses CAD files for material extraction
  - `copper-lme-api.ts` - Fetches commodity pricing data
  - `item-economics.ts` - Unit cost and sensitivity analysis
  - `real-pricing-service.ts` - Pricing engine with supplier data
  - `real-cad-parser.ts` - Production CAD parsing
- Depends on: Type definitions, utilities
- Used by: Components, context initialization

**Data Layer:**
- Purpose: In-memory data persistence and domain state
- Location: `lib/database.ts`, `lib/hooks/useDatabase.ts`
- Contains:
  - Complete schema for 20+ domain entities
  - CRUD operations (Create, Read, Update, Delete)
  - LocalStorage persistence with `mrp_prototype_` prefix
  - Initialization and data refresh logic
- Depends on: Type definitions
- Used by: Context providers, page components

**Context/State Management:**
- Purpose: Application-wide state distribution
- Location: `components/database-provider.tsx`
- Contains:
  - `DatabaseProvider` - Root context wrapping entire app
  - `useDatabaseContext()` - Hook for component access to database state
  - Initialization of data integration service
- Depends on: useDatabase hook, data-integration service
- Used by: All page components and data-consuming components

**Type System:**
- Purpose: Centralized type definitions for all domain entities
- Location: `lib/types.ts` (1500+ lines)
- Contains: 50+ interfaces covering all business domains
  - Core entities: Customer, Supplier, Item, Location
  - Sales: Quotation, SalesOrder, Invoice, PurchaseOrder
  - Engineering: EngineeringProject, EngineeringDrawing, EngineeringChange
  - Manufacturing: BillOfMaterials, BillOfQuantities, ProductionWorkOrder, ProcessStep
  - Quality: QualityInspection, QualityTest, QualityMetric
  - Production: OEEMetrics, ProductionLine, WorkStation, Operator
  - Warehouse: WarehouseOperation, Shipment, CycleCount, DispatchPlan, Return
  - Support: CADMaterial, CADDimension, CADBlock, CADBOQData
- Used by: All layers

**Utility Layer:**
- Purpose: Shared helpers and formatting
- Location: `lib/utils.ts`, `lib/data.ts`, `lib/templates.ts`, `lib/oee-utils.ts`, `lib/reason-codes.ts`
- Contains:
  - Color mappings for status badges
  - Currency formatting
  - Sample/template data
  - OEE calculation utilities
  - Reason code lookups
- Used by: Components, services

## Data Flow

**Quotation to Production Flow (ETO Process):**

1. **Quotation Creation** - User creates quotation in `/quotations` → stored via `db.createQuotation()` → persisted to localStorage
2. **Engineering Assignment** - Quotation marked for engineering → links to EngineeringProject
3. **CAD Processing** - CAD file parsed via `cad-parser.ts` → extracts materials and dimensions
4. **BOQ Generation** - Generated from engineering specs via `boq-generator.ts` → creates BillOfQuantities
5. **BOM Creation** - Manual or auto-generated from BOQ → creates BillOfMaterials with costs
6. **Cost Calculation** - `cost-calculation.ts` computes material, labor, overhead, profit → updates quotation totals
7. **Sales Order Conversion** - Approved quotation → converted to SalesOrder
8. **Production Planning** - SalesOrder → generates ProductionWorkOrders via `data-integration.ts`
9. **Work Execution** - Operators log ProcessSteps, ProcessTimers track duration
10. **Quality Tracking** - QualityInspections and QualityTests logged against work orders
11. **Procurement** - Required materials → PurchaseOrders to suppliers

**Inventory & Warehouse Flow:**

1. **Item Master** - Items created in `/items` with category, cost, lead time
2. **Location Setup** - Warehouse locations defined in `/locations`
3. **Putaway** - Received goods staged via WarehouseOperation (Putaway)
4. **Pick & Pack** - Sales orders trigger pick operations → pack tasks
5. **Shipment** - Packed items shipped with carrier tracking
6. **Cycle Count** - Periodic inventory verification
7. **Analytics** - WarehouseAnalytics calculated for efficiency metrics

**State Management:**

- Initial load: `DatabaseProvider` → `useDatabase()` hook initializes from localStorage
- Data refresh: Components call `refreshCustomers()`, `refreshQuotations()`, etc. on demand
- Updates: CRUD operations immediately update state and persist to localStorage
- Context propagation: `useDatabaseContext()` provides all state to consuming components
- Service initialization: `data-integration.ts` initialized with database snapshot on app start

## Key Abstractions

**Database Instance (Singleton):**
- Purpose: Single source of truth for data persistence
- Examples: `lib/database.ts` exports `db` singleton
- Pattern: Lazy-initialized in-memory store with localStorage backup
- Operations: CRUD for 20+ entity types with filtering and aggregation

**DataIntegrationService (Singleton):**
- Purpose: Cross-domain data aggregation and business logic
- Examples: `lib/services/data-integration.ts`
- Pattern: Factory pattern with `getInstance()`, initialized on app load
- Operations: `getIntegratedQuotationData()` combines quotation + BOM + BOQ + cost breakdown

**Cost Calculation Pipeline:**
- Purpose: Multi-step pricing computation
- Examples: `lib/services/cost-calculation.ts`
- Pattern: Functional service with pure calculations
- Steps: Base cost → material add-on → labor → overhead → margin → tax → final price

**CAD Parser:**
- Purpose: Extract technical data from CAD files
- Examples: `lib/services/cad-parser.ts`, `real-cad-parser.ts`
- Pattern: Parser implementation extracting dimensions, materials, blocks from DWG/DXF
- Output: Structured CADBOQData fed to BOQ generator

**Process Step with Parallel Stages:**
- Purpose: Model complex multi-track manufacturing (conductor, shell, assembly)
- Examples: `ProcessStep` in `lib/types.ts` with `stageData` field
- Pattern: Flexible stage/track model supporting parallel processing
- Supports: Scrap tracking, rework, defect logging per stage

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Application bootstrap
- Responsibilities:
  - Wrap app with `DatabaseProvider`
  - Render global `Navbar`
  - Import global styles
  - Set metadata

**Root Page (Dashboard):**
- Location: `app/page.tsx`
- Triggers: Navigation to `/`
- Responsibilities:
  - Display key metrics and analytics
  - Show quick action buttons to major modules
  - Render production status, inventory alerts

**Domain Pages (Routes):**
- Locations: `app/customers/page.tsx`, `app/quotations/page.tsx`, `app/production/page.tsx`, etc.
- Pattern: List → Detail → Create/Edit
- Triggers: URL navigation
- Responsibilities:
  - Fetch relevant data via `useDatabaseContext()`
  - Render domain-specific UI
  - Handle CRUD operations
  - Implement search/filter

**Production Module Layout:**
- Location: `app/production/layout.tsx`
- Triggers: Navigation to `/production`
- Responsibilities: Specialized layout for production workflows (may include specialized context)

## Error Handling

**Strategy:** Graceful degradation with fallback defaults

**Patterns:**
- Database initialization errors: Catch in `useDatabase()`, set error state, display notification
- Missing context: `useDatabaseContext()` throws error if used outside provider, fallback returns empty arrays + no-op functions
- Validation errors: Form components validate on submit, display inline errors
- Missing data: Components check for nullability, render "No data" messages
- Service errors: Try-catch in service methods, return null or empty results

## Cross-Cutting Concerns

**Logging:**
- Console.log calls throughout components for debugging
- No centralized logging service
- Service methods log operations in comments

**Validation:**
- Input validation at form submission time
- Type checking via TypeScript
- No schema validation library detected

**Authentication:**
- Not implemented (hardcoded user "John Doe" in navbar)
- Components assume authenticated context

**Authorization:**
- Not implemented
- All features accessible to current user

---

*Architecture analysis: 2026-03-02*
