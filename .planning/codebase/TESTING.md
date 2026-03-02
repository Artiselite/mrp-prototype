# Testing Patterns

**Analysis Date:** 2026-03-02

## Test Framework

**Runner:**
- Not detected - No test runner configured
- No Jest, Vitest, or other testing library in dependencies
- Testing framework status: **Not implemented**

**Assertion Library:**
- Not applicable - no testing framework present

**Run Commands:**
```bash
# No test command in package.json
npm test  # Not configured
npm run test  # Not available
```

**Current State:**
- Project does not have a testing infrastructure
- No test files in source code (tests only in node_modules from dependencies)
- No jest.config.js, vitest.config.ts, or similar files

## Test File Organization

**Location:**
- Not applicable - no tests exist
- Convention if added: Recommend co-located `__tests__` or `*.test.tsx` pattern alongside source

**Naming:**
- Not established - would recommend: `ComponentName.test.tsx`, `utils.test.ts`

**Structure:**
- Not applicable

## Test Structure

**Suite Organization:**
- No existing pattern to document
- Example to establish (if testing added): Describe blocks by feature/component

**Patterns:**
- Setup/teardown: Not implemented
- Assertion pattern: Not implemented
- Mocking pattern: Not implemented

## Mocking

**Framework:**
- Not applicable - no testing framework

**Patterns:**
- Not established
- If Jest added, recommend Jest mocks for:
  - Database context: Mock `useDatabaseContext` hook
  - External APIs: Mock `copper-lme-api.ts` service
  - File operations: Mock CAD parser services

**What to Mock:**
- External API calls (copper-lme-api, real-pricing-service)
- Database operations (useDatabase, useDatabaseContext)
- File parsing (CAD parser services)

**What NOT to Mock:**
- Component rendering logic
- UI library components (@radix-ui)
- Next.js routing (use next/router or next/navigation mocks)
- Utility functions (pure functions should be tested directly)

## Fixtures and Factories

**Test Data:**
- Not implemented
- Recommendation: Create `lib/test/fixtures/` with sample data
- Example structure:
  ```typescript
  // lib/test/fixtures/customer.ts
  export const mockCustomer: Customer = {
    id: '1',
    name: 'Test Company',
    contactPerson: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'Test Country',
    status: 'Active',
    creditLimit: 10000,
    paymentTerms: 'Net 30',
    totalOrders: 5,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
  ```

**Location:**
- Would recommend: `lib/test/fixtures/` directory
- Or: `tests/fixtures/` if dedicated tests directory created

## Coverage

**Requirements:**
- Not enforced - no testing infrastructure

**View Coverage:**
```bash
# No coverage tool configured
npm test -- --coverage  # Would need test runner first
```

## Test Types

**Unit Tests:**
- Not implemented
- If added, scope: Individual functions, hooks, and services
- Example targets:
  - `lib/utils.ts` - cn() function
  - `lib/services/cost-calculation.ts` - calculation functions
  - `lib/hooks/useDatabase.ts` - database operations

**Integration Tests:**
- Not implemented
- If added, scope: Database context with multiple components, service integration
- Example: DataIntegrationService with multiple data sources

**E2E Tests:**
- Not implemented
- Framework: Would recommend Playwright or Cypress if added
- Example scenarios:
  - Customer creation workflow (create → view → edit)
  - Quotation to BOQ flow
  - Production work order tracking

## Testing Gaps & Recommendations

**Critical Untested Areas:**

1. **Database Operations** (`lib/hooks/useDatabase.ts`)
   - Risk: State management issues undetected in production
   - Recommendation: Unit tests for CRUD operations

2. **Service Layer** (`lib/services/`)
   - Risk: Calculation errors in cost/pricing/CAD parsing
   - Recommendation: Unit tests with fixtures for all services
   - Example: `cost-calculation.test.ts` with various cost scenarios

3. **Component Integration** (`components/`, `app/`)
   - Risk: Navigation, data binding, form submission issues
   - Recommendation: Integration tests for page workflows
   - Example: Customer management flow

4. **Error Handling**
   - Risk: Unhandled errors in CAD parsing, API calls
   - Recommendation: Error scenario tests
   - Current state: try-catch exists but no tests verify error handling

5. **Edge Cases in Filtering & Search**
   - Risk: Incorrect filtering in customer/supplier lists
   - Recommendation: Unit tests for filter logic
   - Example: Search across multiple fields (name, contact, email)

## Recommended Testing Setup

**Option 1: Jest + React Testing Library (Recommended for Next.js)**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
npx jest --init
```

**Option 2: Vitest (Modern alternative)**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Package.json additions (for Jest):**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

## Priority Test Implementation Order

1. **High Priority:**
   - Utility functions (`lib/utils.ts`)
   - Pure calculation functions (`lib/services/cost-calculation.ts`)
   - Type definitions validation

2. **Medium Priority:**
   - Database context tests (`lib/hooks/useDatabase.ts`)
   - Service layer tests (data integration, CAD parsing)
   - Component unit tests (navbar, card components)

3. **Low Priority:**
   - E2E tests (after unit/integration coverage established)
   - Visual regression tests
   - Accessibility tests

---

*Testing analysis: 2026-03-02*

**NOTE:** This project currently has zero testing infrastructure. The above document describes what should exist and provides guidance for implementation. To enable testing, install a test framework (Jest or Vitest) and begin with utility functions.
