# FORTEX Mining Game

## Overview

FORTEX is a token mining and gaming mini-app built for the Worldcoin ecosystem. Users verify their humanity via World ID, then can mine tokens on a cooldown timer and play various mini-games to earn additional tokens. The app features a dark futuristic UI theme with neon accents and is designed as a mobile-first experience running inside the World App.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for auth/MiniKit state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for game effects and transitions
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (tsx for development execution)
- **Session Management**: express-session with MemoryStore (development) or connect-pg-simple (production ready)
- **API Pattern**: REST endpoints defined in shared routes file with Zod validation schemas

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - single source of truth for database models and validation schemas
- **Migrations**: Drizzle Kit for schema push (`db:push` command)

### Authentication Flow
- World ID verification via @worldcoin/minikit-js SDK
- Session-based auth with userId and worldId stored in session
- Falls back to session-based mock IDs when running outside World App (browser preview mode)

### Key Design Patterns
- **Shared Types**: Database schemas, API routes, and Zod validators in `shared/` folder used by both client and server
- **Storage Abstraction**: `IStorage` interface in `server/storage.ts` allows swapping database implementations
- **Protected Routes**: Client-side route guards redirect unauthenticated users to login
- **API Structure**: Routes defined declaratively in `shared/routes.ts` with method, path, input schema, and response schemas

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components (shadcn/ui + custom)
    hooks/        # React hooks (auth, mining, mobile detection)
    pages/        # Page components (Home, Mine, Games, Profile)
    lib/          # Utilities (queryClient, cn helper)
server/           # Express backend
  index.ts        # Server entry, middleware setup
  routes.ts       # API route handlers
  storage.ts      # Database access layer
  db.ts           # Drizzle/PostgreSQL connection
shared/           # Shared between client/server
  schema.ts       # Drizzle schemas + Zod validators
  routes.ts       # API route definitions
```

## External Dependencies

### Worldcoin Integration
- **@worldcoin/minikit-js**: SDK for World ID verification and World App integration
- App runs as a mini-app inside the World App on mobile devices

### Database
- **PostgreSQL**: Primary database via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database queries with automatic schema sync

### UI Component Library
- **shadcn/ui**: Pre-built accessible React components built on Radix UI primitives
- Components are copied into `client/src/components/ui/` and customized

### Key Runtime Dependencies
- express-session for session management
- memorystore for development session storage
- drizzle-orm + drizzle-zod for database operations
- @tanstack/react-query for data fetching
- framer-motion for animations
- zod for runtime validation