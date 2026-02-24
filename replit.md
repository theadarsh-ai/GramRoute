# GramRoute - AI-Powered Mandi Route Price Optimizer

## Overview

GramRoute is a full-stack web application that helps small farmers in rural India maximize their profits by recommending optimal mandi (wholesale market) routes. The app uses a multi-agent AI system (LangGraph/LangChain) with Python FastAPI backend to process route recommendations considering transport costs, crop spoilage rates, market fees, and prices across 55 Indian mandis.

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
- **PWA**: Service worker + manifest for offline capability
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- **Entry point**: `client/src/main.tsx` → `App.tsx` → pages/home.tsx (main page)

The frontend is mobile-first and designed for low-bandwidth rural use. Key components:
- `route-form.tsx` - Input form with geolocation support
- `route-results.tsx` - Displays ranked route recommendations
- `route-card.tsx` - Individual route recommendation cards
- `route-map.tsx` - Leaflet map showing routes and mandis
- `hero-section.tsx` - Landing page hero

### Backend (Python FastAPI + LangGraph Multi-Agent System)

- **Framework**: Python FastAPI running on Uvicorn (port 8000 internally)
- **Entry point**: `server_py/main.py` - FastAPI app with API endpoints
- **Proxy**: Express.js (`server/routes.ts`) proxies `/api/*` requests from port 5000 to Python backend on port 8000
- **API endpoints**:
  - `POST /api/recommend-route` - Takes route request, returns ranked route recommendations
  - `GET /api/mandis` - Returns all mandi data

#### Multi-Agent AI System (LangGraph)

The route optimization uses a 4-agent pipeline orchestrated by LangGraph (`server_py/agents/orchestrator.py`):

1. **Data Agent** (`server_py/agents/data_agent.py`): Loads mandis.json, filters by radius using Haversine distance formula
2. **Planner Agent** (`server_py/agents/planner_agent.py`): Generates single-stop and two-stop route candidates with split ratios
3. **Cost/Spoilage Agent** (`server_py/agents/cost_agent.py`): Ranks routes by net profit, deduplicates, selects top 3
4. **Explainer Agent** (`server_py/agents/explainer_agent.py`): Uses LangChain MockFarmerLLM to generate farmer-friendly explanations and tips (can be swapped with real LLM like Ollama/Groq)

#### Python Models (`server_py/models.py`)
- Pydantic models mirroring TypeScript interfaces in `shared/schema.ts`
- CropType enum, spoilage rates, Mandi, RouteRequest, RouteStop, RouteRecommendation, RouteResponse

#### Data Layer (`server_py/data/mandis.json`)
- 55 Indian mandis in JSON format with prices for 10 crop types, GPS coordinates, market fees, loading costs
- Covers: Tamil Nadu, Maharashtra, Karnataka, Telangana, Andhra Pradesh, Kerala, Gujarat, UP, Rajasthan, MP, Bihar, West Bengal, Chhattisgarh, Jharkhand, Delhi

### Express Proxy Layer

- `server/index.ts` - Express server on port 5000 with Vite HMR in dev mode
- `server/routes.ts` - Spawns Python FastAPI backend and proxies API calls to it
- **Dev mode**: Express serves Vite dev server + proxies API to Python on port 8000
- **Prod mode**: Express serves built static files + proxies API to Python

### Shared Layer

- `shared/schema.ts` - Zod schemas, TypeScript types, and constants shared between client and server
  - Crop types (10 crops: tomato, onion, potato, etc.)
  - Spoilage rates per crop
  - Mandi interface definition
  - Route request/response schemas

### Development vs Production

- **Dev**: Vite dev server with HMR through Express, Express proxies API to Python FastAPI
- **Prod**: Vite builds static files to `dist/public`; Express serves them; API proxied to Python
- **Build script**: `script/build.ts` handles client (Vite) and server (esbuild) builds

### Key Design Decisions

1. **Multi-agent AI architecture**: LangGraph orchestrates 4 specialized agents in a pipeline (Data → Planner → Cost → Explainer)
2. **Mock LLM fallback**: ExplainerAgent uses MockFarmerLLM (template-based) that can be swapped with real LLM (Ollama, Groq, OpenAI) by replacing the class
3. **Proxy architecture**: Express on port 5000 proxies to Python on port 8000, keeping Vite HMR working in dev
4. **Static mandi data**: 55 mandis in JSON file, loaded and cached by DataAgent
5. **PWA support**: Service worker for offline caching, manifest for installability
6. **Mobile-first**: CSS variables for theming, responsive Tailwind classes, geolocation API support

## External Dependencies

### Third-Party Services
- **OpenStreetMap**: Free tile server for Leaflet maps (no API key required)
- **Browser Geolocation API**: Used for detecting farmer's current location

### Key NPM Packages
- **UI**: Radix UI primitives, Tailwind CSS, class-variance-authority, lucide-react icons, framer-motion
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **Data fetching**: @tanstack/react-query
- **Maps**: leaflet
- **Server**: express (proxy layer)
- **Build**: vite, esbuild, tsx

### Python Packages
- **API**: fastapi, uvicorn, pydantic
- **AI/Agents**: langchain-core, langgraph

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required by drizzle.config.ts, not actively used)
- `NODE_ENV` - Controls dev vs production mode
- `PORT` - Server port (default 5000)
