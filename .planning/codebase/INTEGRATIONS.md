# External Integrations

**Analysis Date:** 2026-03-02

## APIs & External Services

**Commodity Pricing:**
- LME (London Metal Exchange) - Copper price data
  - SDK/Client: Custom implementation `lib/services/copper-lme-api.ts`
  - Auth: Environment variable `LME_API_KEY`
  - Status: Mock implementation (production ready structure but using simulated data)
  - Endpoint: `https://api.lme.com` (mock URL, not live)

**Market Data:**
- Real Pricing Service - Material commodity pricing (steel, copper, etc.)
  - Implementation: `lib/services/real-pricing-service.ts`
  - Status: Placeholder for real APIs (MetalMiner, SteelBenchmarker, LME, COMEX, ArcelorMittal, Nucor)
  - Currently returns fallback/mock data

**CAD/Document Parsing:**
- DXF Parser - CAD file parsing capability
  - Reference: `lib/services/real-cad-parser.ts` (commented out import)
  - Status: Not currently integrated
  - Planned for: Converting CAD drawings to Bill of Quantities

## Data Storage

**Databases:**
- None configured - Prototype uses client-side only storage

**File Storage:**
- Local filesystem only - No cloud storage integration
- Export/Import via JSON files through browser download

**Caching:**
- Browser localStorage - All application data cached client-side
- Manual cache duration: 24 hours (in `RealPricingService`)
- No server-side caching configured

## Authentication & Identity

**Auth Provider:**
- None configured - No user authentication implemented
- Application is fully public/unauthenticated
- No session management required

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Console-based logging only
- `console.error()` used in service error handling
- No centralized logging platform

## CI/CD & Deployment

**Hosting:**
- Vercel (implied from `.vercel` in .gitignore)
- Fully static/client-side rendering capable
- No server-side API endpoints currently in use

**CI Pipeline:**
- Not detected
- No GitHub Actions, GitLab CI, or similar configured

## Environment Configuration

**Required env vars:**
- `LME_API_KEY` - Copper LME API key (optional, defaults to 'mock-key')

**Secrets location:**
- `.env` files (listed in .gitignore, not committed)
- No secrets currently in use in production code

## Webhooks & Callbacks

**Incoming:**
- None - Application is frontend-only

**Outgoing:**
- None configured

## Third-Party Services

**UI/Design:**
- Google Fonts (Inter) - Font delivery via `next/font/google`
- Chart.js CDN - JavaScript charting library (via JSDelivr CDN)
  - Script loaded in `app/layout.tsx`: `https://cdn.jsdelivr.net/npm/chart.js`

**Component Libraries:**
- shadcn/ui - Component collection (local imports, not external API)
- Radix UI - Component primitives (npm installed)

## Data Integration Points

**Import/Export:**
- JSON file upload/download via browser `Blob` and download API
- Full database export: `app/demo/page.tsx` implements data export to JSON
- Database restore: JSON file import with localStorage storage
- No webhook or API-based sync

## Feature-Specific Integrations

**BOQ Generation:**
- Service: `lib/services/boq-generator.ts`
- Integration: CAD file parsing to Bill of Quantities
- Status: Not yet fully integrated

**Cost Calculation:**
- Service: `lib/services/cost-calculation.ts`
- Integration: Real pricing service for material costs
- Status: Uses mock pricing data

**Item Economics:**
- Service: `lib/services/item-economics.ts`
- Integration: Pricing and cost data
- Status: Client-side calculations using localStorage data

## Planned Integrations (Not Yet Implemented)

Based on code structure:
- Real LME API connection (currently mocked)
- Real steel pricing APIs (MetalMiner, SteelBenchmarker)
- Commodity exchange APIs (COMEX)
- DXF/CAD file parser integration
- Supplier API integration (for real-time pricing)
- Email/messaging service (referenced in invoicing UI but not implemented)
- PDF generation for documents (referenced in download buttons but not implemented)

---

*Integration audit: 2026-03-02*
