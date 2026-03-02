# Codebase Concerns

**Analysis Date:** 2026-03-02

## Tech Debt

**Monolithic Page Components:**
- Issue: Large page files (2472 lines for dashboard, 1563 for quotation creation, 1587 for quotation detail) with mixed concerns - state management, business logic, and UI rendering all in single files
- Files: `app/page.tsx`, `app/quotations/create/page.tsx`, `app/quotations/[id]/page.tsx`, `app/quotations/[id]/edit/page.tsx`, `app/production/quality/page.tsx`
- Impact: Difficult to test, maintain, and extend. Changes to one feature risk breaking unrelated functionality. Reusability is impossible.
- Fix approach: Extract business logic into custom hooks (e.g., `useQuotationForm`, `useWorkflowState`), extract form sections into separate components, move calculations into utility functions

**localStorage as Production Database:**
- Issue: Entire application data persists exclusively to browser localStorage with no backend persistence. Data loss on browser clear, profile delete, or device loss is permanent.
- Files: `lib/database.ts` (localStorage-based DB implementation), `app/demo/page.tsx` (explicit localStorage usage), all pages depending on DatabaseProvider
- Impact: No data recovery, scaling impossible beyond ~5MB localStorage limit, no audit trail, not suitable for production use, concurrent user conflicts impossible
- Fix approach: Migrate to real backend database (PostgreSQL/MongoDB) with API layer, implement backup/restore, add user authentication, establish audit logging

**Lack of Error Handling & Validation:**
- Issue: 625+ instances of error/catch/throw statements in app code show minimal structured error handling. Most errors logged to console without user feedback mechanism.
- Files: Scattered across all page files - `app/customers/[id]/edit/page.tsx`, `app/customers/create/page.tsx`, `app/bom/create/page.tsx`, `app/boq/[id]/edit/page.tsx`
- Impact: Silent failures, poor user experience, difficult debugging, no recovery guidance
- Fix approach: Implement global error boundary component, create structured error handling middleware, add user-facing toast/modal notifications, implement retry logic for recoverable errors

**Console.log Left in Production Code:**
- Issue: 20+ console statements throughout app for debugging without log level control
- Files: `app/customers/[id]/page.tsx` (7 console.log calls), `app/boq/create/page.tsx`, `app/bom/create/page.tsx`, `app/customers/[id]/edit/page.tsx`
- Impact: Potential information disclosure, performance impact (especially on mobile), confusion in production debugging
- Fix approach: Replace with structured logging service (winston/pino), use log levels (debug/info/warn/error), remove debug logs before deployment

**Hardcoded Values & Placeholder Data:**
- Issue: Hardcoded calculations (e.g., "~RM480 per kg copper"), placeholder prices, and TODO comments scattered throughout
- Files: `app/quotations/create/page.tsx` (lines 1432-1433, 1436), `app/quotations/[id]/page.tsx` (line 965), `app/quotations/[id]/edit/page.tsx` (line 909)
- Impact: Wrong business logic in production, estimates treated as facts, hardcoded margins/rates not configurable
- Fix approach: Move configuration to environment variables or config database, implement LME price feed API integration, parameterize all business calculations

**Type Safety Violations (245+ instances of any/unknown):**
- Issue: Excessive use of `any` type (82+ instances), `unknown`, and loose type assertions prevent TypeScript from catching errors at compile time
- Files: Throughout `app/` directory - `app/quotations/create/page.tsx` has `selectedProduct: null as any`, multiple files with type assertions
- Impact: Runtime errors that could be caught at development time, reduced IDE autocomplete effectiveness, harder refactoring
- Fix approach: Run `tsc --noImplicitAny` to identify all violations, progressively replace `any` with proper types, create stricter tsconfig.json rules

## Known Bugs

**Missing Customer Authentication Context:**
- Symptoms: Sales person field defaults to 'Current User', no actual user context passed through application
- Files: `app/quotations/create/page.tsx` (line 399), `app/quotations/[id]/edit/page.tsx` (line 339)
- Trigger: Creating any quotation or generating change request
- Workaround: Manually enter user name; actual user context completely missing

**LME Price API Not Integrated:**
- Symptoms: Unit economics calculator uses hardcoded copper LME prices (40000 for MYR, 8500 for USD) that never update
- Files: `app/quotations/create/page.tsx` (line 1433), `app/quotations/[id]/page.tsx` (line 965), `app/quotations/[id]/edit/page.tsx` (line 909)
- Trigger: Every quotation with material cost calculations uses stale prices
- Workaround: None - prices are baked in

**Database Initialization Not Synchronized:**
- Symptoms: Multiple database initialization calls in `useDatabase` hook and provider can race, `isInitialized` flag doesn't guarantee data loaded
- Files: `lib/hooks/useDatabase.ts` (useEffect with multiple dependencies triggering re-init), `components/database-provider.tsx`
- Trigger: Rapid component mounting/remounting, page navigation
- Workaround: Add null checks throughout app for arrays that may be empty during initialization

## Security Considerations

**No Authentication/Authorization System:**
- Risk: Application has zero user authentication. Anyone with browser access sees all customers, suppliers, quotations, orders, and sensitive pricing data.
- Files: No auth implementation anywhere in codebase, `app/layout.tsx` has no auth guards
- Current mitigation: None
- Recommendations: Implement authentication (OAuth/JWT), add role-based access control (RBAC) for customer/supplier/pricing visibility, encrypt sensitive fields at rest

**localStorage Stores Sensitive Data Unencrypted:**
- Risk: All business data (quotations with pricing, customer credit limits, supplier payment terms) stored plaintext in browser storage
- Files: `lib/database.ts` stores via `localStorage.setItem()` without encryption
- Current mitigation: None
- Recommendations: Implement end-to-end encryption for sensitive fields, move to secure backend, add data classification levels, implement access logging

**No Input Validation at Boundaries:**
- Risk: User inputs from forms (customer names, email addresses, quantities, prices) not validated before storage
- Files: All create/edit pages - `app/customers/create/page.tsx`, `app/quotations/create/page.tsx`, `app/boq/create/page.tsx`
- Current mitigation: Some React form validation with `react-hook-form` but not systematic
- Recommendations: Add schema validation with Zod at all API boundaries, sanitize strings to prevent injection, validate numerical ranges, implement CSRF protection

**Exposed Business Logic in Frontend:**
- Risk: Pricing calculations, margin computations, cost breakdowns all in client-side code - easily reverse-engineered
- Files: `app/quotations/create/page.tsx` (calculateSubtotal, calculateTax, calculateTotal functions), UnitEconomicsCalculator component
- Current mitigation: None
- Recommendations: Move calculations to backend API, return only final results to frontend, audit trail for all pricing decisions

## Performance Bottlenecks

**Inefficient Database Reads on Every Page Load:**
- Problem: `useDatabase` hook initializes entire dataset on every component mount, loading all customers/suppliers/quotations/orders into memory
- Files: `lib/hooks/useDatabase.ts` loads 40+ arrays with unknown total size
- Cause: No data pagination, lazy loading, or caching strategy; all data loaded synchronously from localStorage into React state
- Improvement path: Implement pagination, add in-memory caching with TTL, lazy load data on demand, implement virtual scrolling for large lists

**2472-Line Dashboard Component:**
- Problem: Main dashboard (`app/page.tsx`) renders all metrics, charts, and widgets regardless of viewport, likely rendering off-screen content
- Files: `app/page.tsx`
- Cause: No code splitting, no lazy loading of tabs/sections, all state in single component
- Improvement path: Split into separate lazy-loaded route segments, implement route-based code splitting with Next.js, move heavy charts to separate suspense boundaries

**Synchronous localStorage Calls Block Rendering:**
- Problem: `localStorage.getItem()` and `localStorage.setItem()` calls in synchronous code paths block event loop
- Files: `lib/database.ts` (seedDatabase, all CRUD operations), initialization in useEffect
- Cause: Using localStorage as production database means reads/writes must be synchronous
- Improvement path: Migrate to async backend API, use service workers for offline caching if offline-first is required

**No Query Memoization or Request Deduplication:**
- Problem: Multiple components requesting same data result in multiple full scans through localStorage arrays
- Files: Every page using `useDatabaseContext()` and calling multiple get* functions
- Cause: No caching layer, no memoization on hooks
- Improvement path: Implement React Query or SWR for data fetching with automatic deduplication, add useMemo/useCallback throughout

## Fragile Areas

**Quotation Workflow State Machine:**
- Files: `app/quotations/create/page.tsx` (workflowStatus state), `app/quotations/[id]/page.tsx`, `app/quotations/[id]/edit/page.tsx`
- Why fragile: Complex multi-step workflow (quotation → engineering → BOQ → send → customer feedback → PO → SO) tracked as separate boolean flags in component state. No validation that state transitions are valid (e.g., can send before BOQ generated). Changes to workflow steps require updates in multiple files.
- Safe modification: Create explicit state machine using xstate library, define valid transitions, add precondition checks before allowing state changes, consolidate workflow logic into single hook
- Test coverage: No tests for workflow state transitions; edge cases like "what if user refreshes mid-workflow?" untested

**Unit Economics Calculator Integration:**
- Files: `components/unit-economics-calculator.tsx` (component), `app/quotations/create/page.tsx` (line 1426-1453), `app/quotations/[id]/page.tsx` (similar usage)
- Why fragile: Calculator component accepts data, computes internally, calls onSave callback that updates parent component state. No way to keep calculator state in sync with form state. Easy to edit calculator values then lose changes if form re-renders.
- Safe modification: Move calculator state into parent form component, use controlled components, implement two-way data binding
- Test coverage: Calculator never tested; margins/costs can be silently wrong without detection

**Page Component Forms with Inline State:**
- Files: `app/customers/create/page.tsx`, `app/boq/create/page.tsx`, `app/bom/create/page.tsx`, all similar
- Why fragile: Each form implements custom state management with `useState` for form fields, errors, and submission state. No reusable pattern. Easy to forget error handling. Form reset logic duplicated everywhere.
- Safe modification: Create custom `useForm` hook (or use react-hook-form more consistently), extract form submission logic to utility function, standardize validation/error display
- Test coverage: No tests for form submission logic, validation errors, or success/failure states

**Drawing Approval Workflow:**
- Files: `app/engineering/drawings/[id]/page.tsx` (referenced in codebase but largely unimplemented)
- Why fragile: Engineering drawing approval/comment system exists in types but minimal UI implementation. Could be partially implemented elsewhere. Hard to trace complete workflow.
- Safe modification: Audit all engineering-related files, consolidate drawing management into single module, implement complete approval workflow before adding features
- Test coverage: Drawing approval scenarios untested

## Scaling Limits

**localStorage 5-10MB Capacity:**
- Current capacity: Unknown total size, but adding more customers/orders will quickly hit limit
- Limit: When total data exceeds 5MB (varies by browser), localStorage API fails silently in some cases, throws QuotaExceededError in others
- Scaling path: Migrate to backend database (PostgreSQL/MongoDB/Firebase), implement data archival strategy for old records, add pagination throughout

**Single-User Environment (No Concurrency):**
- Current capacity: Application supports only single browser session reading/writing data
- Limit: If two browser tabs open to same application, writes from one tab overwrite other without conflict resolution
- Scaling path: Implement optimistic locking, add conflict resolution (last-write-wins, operational transformation, or CRDT), use backend as source of truth

**No Transaction Support:**
- Current capacity: Creates and updates are fire-and-forget operations
- Limit: If creation of related records fails partway through (e.g., create quotation, fail creating BOQ), application state becomes corrupted
- Scaling path: Implement transaction-like behavior with rollback, use backend transactions if migrating to SQL database

**Type System Limits:**
- Current capacity: 40+ top-level types, each with 10-20+ properties
- Limit: Type checking becomes slow, unclear which types relate to which features, adding new entity types cascades changes everywhere
- Scaling path: Reorganize types by domain/module, implement discriminated unions for variant types, use code generation from schema

## Dependency & Integration Risks

**No Real Backend Integration Path:**
- Risk: Application designed with localStorage as permanent backend; migrating to real API requires rewriting all data access patterns
- Impact: Cannot add real-time features, cannot implement proper authentication, cannot scale
- Migration plan: Define REST/GraphQL API contract first, create data access layer (repository pattern), swap localStorage implementation with API calls, add error handling for network failures

**Chart.js Loaded via CDN in HTML Head:**
- Risk: External dependency, no version pinning, CDN failure breaks dashboard rendering
- Files: `app/layout.tsx` (line 24)
- Impact: Potential XSS if CDN compromised, builds fail if CDN unreachable during build
- Recommendation: Import Chart.js via npm, configure build bundling, implement chart library abstraction to enable swapping implementations

**Radix UI & Shadcn Versions Inconsistent:**
- Risk: package.json specifies mix of pinned and "latest" versions for Radix components
- Files: `package.json` (lines 20, 30, etc. use "latest" while others pinned)
- Impact: Different developer environments may have different component behavior, type definitions may not align
- Recommendation: Pin all Radix UI versions to same version, establish dependency update policy, use renovate bot

**No Dev Dependency Testing Framework:**
- Risk: 97 test files exist but no test runner configured in package.json
- Files: `package.json` (devDependencies), test files in various __tests__ directories
- Impact: Tests cannot run in CI/CD, no automated test reporting
- Recommendation: Add jest/vitest with configuration, add test coverage reporting, add test scripts to package.json

## Missing Critical Features

**No Audit Trail:**
- Problem: No record of who changed what quotation/order and when; no ability to see change history
- Blocks: Cannot explain discrepancies to customers, cannot track unauthorized changes, cannot comply with data protection regulations
- Implementation: Add createdBy/updatedBy to all records, implement versioning/event sourcing, add audit logging service

**No Multi-Currency Support:**
- Problem: Hard-coded currency conversions (USD vs RM), no exchange rate management
- Blocks: Cannot quote projects in different currencies, pricing may be wrong if currency changed
- Implementation: Add currency field to all pricing records, implement exchange rate service (OpenExchangeRates API), convert prices on display

**No Document Generation:**
- Problem: No PDF/Word export for quotations, BOQs, or orders despite buttons suggesting this feature
- Blocks: Customers cannot print quotations for external review, cannot archive documents
- Implementation: Add pdf-lib/puppeteer, implement document templates, add signed PDF generation

**No Email Notifications:**
- Problem: Quotation "Send to Customer" button has no email integration
- Blocks: Customers never actually receive quotations, workflow cannot progress
- Implementation: Add email service (Sendgrid/AWS SES), implement email templates, add email logging for audit trail

**No Real-Time Collaboration:**
- Problem: Multiple users (sales, engineering, production) cannot collaborate on same quotation/order
- Blocks: Cannot implement modern MRP workflows, all changes sequential instead of parallel
- Implementation: Add real-time sync layer (Socket.io/Pusher), implement operational transformation for concurrent edits, add presence awareness

## Test Coverage Gaps

**No Unit Tests for Business Logic:**
- What's not tested: Pricing calculations (calculateSubtotal, calculateTotal, margin calculations), unit economics, BOQ generation logic, workflow state transitions
- Files: Calculation functions scattered in pages with no separate test files
- Risk: Price quotes could be wrong by orders of magnitude without test failing
- Priority: **HIGH** - pricing logic is business-critical

**No Integration Tests for Workflows:**
- What's not tested: Complete flows from quotation creation through sales order conversion; data consistency across related records
- Files: Multi-step workflows span multiple pages without test coverage
- Risk: Silent data corruption when steps interact, impossible to refactor workflow with confidence
- Priority: **HIGH** - core business processes

**No Component Tests:**
- What's not tested: Form validation, error states, loading states, edge cases like "what if list is empty?"
- Files: All form components in `app/customers/`, `app/quotations/`, `app/boq/`, etc.
- Risk: UI bugs in production, poor accessibility, confusing error messages
- Priority: **MEDIUM** - impacts user experience

**No E2E Tests:**
- What's not tested: Complete user journeys (create customer → create quotation → send to customer → receive PO → convert to SO)
- Files: No E2E test framework configured
- Risk: Cannot catch cross-feature regressions, manual testing required for every change
- Priority: **MEDIUM** - slows down development

**No Database Tests:**
- What's not tested: localStorage reads/writes, data persistence across app restart, version migration logic
- Files: `lib/database.ts` has no tests
- Risk: Data loss bugs only discovered in production
- Priority: **HIGH** - data integrity critical

---

*Concerns audit: 2026-03-02*
