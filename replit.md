# LIFE.EXE

## Overview

LIFE.EXE is a brutal 8-bit survival simulation game built as a full-stack web application. Players face random life situations and must survive 10 turns while managing four core stats: health, sanity, hope, and financial stability. The game features a retro terminal aesthetic with "Press Start 2P" and "VT323" fonts, and includes a leaderboard system for tracking high scores.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with custom 8-bit terminal theme
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **Build Tool**: Vite with React plugin

The frontend follows a simple single-page architecture with the main game logic in `client/src/pages/Game.tsx`. The retro terminal aesthetic is achieved through custom CSS variables and Google Fonts integration.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Server**: Node.js HTTP server
- **API Pattern**: RESTful JSON API
- **Development**: Vite dev server middleware for HMR during development
- **Production**: Static file serving from built assets

The server is structured with:
- `server/index.ts` - Express app setup and middleware
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Database abstraction layer
- `server/db.ts` - Database connection setup

### Data Storage
- **Database**: PostgreSQL via Neon Serverless
- **ORM**: Drizzle ORM with Zod schema validation
- **Schema Location**: `shared/schema.ts` (shared between client and server)

The database stores game scores with player name, rounds survived, and final stat values.

### Build System
- **Client Build**: Vite bundles React app to `dist/public`
- **Server Build**: esbuild bundles server code to `dist/index.cjs`
- **Shared Code**: TypeScript path aliases (`@/` for client, `@shared/` for shared)

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Cloud-hosted PostgreSQL database
- **Connection**: WebSocket-based connection via `@neondatabase/serverless`
- **Environment**: Requires `DATABASE_URL` environment variable

### Frontend Libraries
- **Radix UI**: Accessible component primitives (dialogs, tooltips, forms, etc.)
- **TanStack React Query**: Server state management and caching
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management

### Development Tools
- **Drizzle Kit**: Database migrations and schema management (`db:push` command)
- **Replit Plugins**: Development banner, runtime error overlay, cartographer

### Fonts (External CDN)
- **Google Fonts**: "Press Start 2P" and "VT323" for retro terminal aesthetic