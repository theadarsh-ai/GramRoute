# GramRoute - AI-Powered Mandi Route Price Optimizer

## Overview

GramRoute is a full-stack web application that helps small farmers in rural India maximize their profits by recommending optimal mandi (wholesale market) routes. The app takes a farmer's location, crop type, quantity, and travel constraints, then calculates ranked route recommendations considering transport costs, crop spoilage rates, market fees, and real-time prices across 50+ Indian mandis.

The core algorithm uses Haversine distance calculations to filter nearby mandis, generates single-stop and multi-stop routes, and scores them by net profit after accounting for fuel costs, loading/unloading fees, market commission, and crop-specific spoilage losses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React + Vite)

- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router) with a single-page app structure
- **UI Components**: shadcn/ui component library (new-york style) built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack React Query for server state; local React state for UI state
- **Forms**: react-hook-form with Zod validation (via @hookform/resolvers)
- **Maps**: Leaflet.js with OpenStreetMap tiles (free, no API key needed)
- **Animations**: Framer Motion for route card transitions
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- **Entry point**: `client/src/main.tsx` → `App.tsx` → pages/home.tsx (main page)

The frontend is mobile-first and designed for low-bandwidth rural use. Key components:
- `route-form.tsx` - Input form with geolocation support
- `route-results.tsx` - Displays ranked route recommendations
- `route-card.tsx` - Individual route recommendation cards
- `route-map.tsx` - Leaflet map showing routes and mandis
- `hero-section.tsx` - Landing page hero

### Backend (Express + Node.js)

- **Framework**: Express.js running on Node with TypeScript (via tsx)
- **Entry point**: `server/index.ts` creates HTTP server, registers routes
- **API routes** (`server/routes.ts`):
  - `POST /api/recommend-route` - Takes route request, returns ranked route recommendations
  - `GET /api/mandis` - Returns all mandi data
- **Route optimization engine** (`server/route-optimizer.ts`): Pure TypeScript implementation using Haversine distance formula, crop-specific spoilage rates, fuel costs, market fees, and loading/unloading costs to calculate net profit for each possible route
- **Data layer** (`server/data/mandis.ts`): Static TypeScript array with 50+ Indian mandis containing prices for 10 crop types, GPS coordinates, market fee percentages, and loading costs

### Shared Layer

- `shared/schema.ts` - Zod schemas, TypeScript types, and constants shared between client and server
  - Crop types (10 crops: tomato, onion, potato, etc.)
  - Spoilage rates per crop
  - Mandi interface definition
  - Route request/response schemas
  - Route recommendation types

### Development vs Production

- **Dev**: Vite dev server with HMR proxied through Express (`server/vite.ts`)
- **Prod**: Vite builds static files to `dist/public`; Express serves them (`server/static.ts`); server bundled with esbuild to `dist/index.cjs`
- **Build script**: `script/build.ts` handles both client (Vite) and server (esbuild) builds

### Database

- **Current storage**: In-memory (`MemStorage` class in `server/storage.ts`) for user data; mandi data is a static TypeScript file
- **Drizzle + PostgreSQL configured** but not actively used for core functionality. `drizzle.config.ts` points to `shared/schema.ts` and uses `DATABASE_URL` environment variable. The schema file currently defines Zod schemas rather than Drizzle table definitions
- **To add database tables**: Define them in `shared/schema.ts` using Drizzle's `pgTable`, then run `npm run db:push`

### Key Design Decisions

1. **No external AI/LLM dependency**: The route optimization is algorithmic (Haversine + cost modeling), not LLM-based, making it fast and reliable without API keys
2. **Static mandi data**: Prices are hardcoded in a TypeScript file rather than a database, keeping the app simple and fast. Data covers Tamil Nadu, Maharashtra, Karnataka, Telangana, Andhra Pradesh, and Delhi
3. **Shared schema**: Zod schemas in `shared/` ensure type safety and validation consistency between frontend and backend
4. **Mobile-first**: CSS variables for theming, responsive Tailwind classes, geolocation API support

## External Dependencies

### Third-Party Services
- **OpenStreetMap**: Free tile server for Leaflet maps (no API key required)
- **Browser Geolocation API**: Used for detecting farmer's current location

### Key NPM Packages
- **UI**: Radix UI primitives, Tailwind CSS, class-variance-authority, lucide-react icons, framer-motion
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **Data fetching**: @tanstack/react-query
- **Maps**: leaflet
- **Server**: express, drizzle-orm, connect-pg-simple, express-session
- **Database**: drizzle-orm, drizzle-kit, pg (PostgreSQL driver)
- **Build**: vite, esbuild, tsx

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required by drizzle.config.ts, but not actively used by core app logic)
- `NODE_ENV` - Controls dev vs production mode