# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
pnpm dev          # Start Next.js dev server (localhost:3000)
pnpm build        # Build production bundle
pnpm start        # Start production server
```

**Note**: No test or lint commands are currently configured.

## Environment Setup

Copy `.env.example` to `.env` and set:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Architecture Overview

This is a **Next.js 15** application with **React 19** using the App Router pattern and a modular architecture.

### Directory Structure

```
frontend/
├── app/                    # Next.js App Router (pages and routes only)
├── modules/                # Domain modules (business logic)
│   ├── auth/              # Authentication
│   ├── projects/          # Project management
│   ├── events/            # Event management
│   └── persons/           # Student/teacher management
├── shared/                 # Shared code across modules
│   ├── components/ui/     # Reusable UI components
│   ├── components/layout/ # Layout components (Navbar, Menu, ProtectedRoute)
│   ├── hooks/             # Shared hooks
│   ├── lib/               # Base utilities (BaseApiClient, TokenManager)
│   └── types/             # Shared TypeScript types
├── lib/                    # Root utilities (cn() helper for Tailwind)
└── components/             # shadcn/ui generated components
```

### Module Structure

Each module in `modules/` follows this pattern:
```
modules/[module-name]/
├── components/          # Module-specific components
├── hooks/              # Module-specific hooks
├── services/           # API services (extend BaseApiClient)
├── types/              # TypeScript types
└── index.ts            # Public exports (barrel file)
```

### Key Patterns

**Services extend BaseApiClient** (`shared/lib/api/base-client.ts`):
- `request<T>()` - JSON requests with optional auth
- `requestFormData<T>()` - File uploads
- `downloadFile()` - File downloads

**Import conventions**:
```typescript
// From modules
import { projectsService, ProjectHistory } from '@/modules/projects';
import type { Project } from '@/modules/projects';

// From shared
import { InputField, Table, Navbar } from '@/shared';
import { TokenManager, BaseApiClient } from '@/shared';
import { useUserRole } from '@/shared';
```

### Technology Stack

- **UI**: Tailwind CSS 4, shadcn/ui (new-york style), Radix UI primitives, Lucide icons
- **Forms**: react-hook-form + zod validation
- **Data viz**: recharts, react-big-calendar
- **File handling**: jspdf, pdfjs-dist, xlsx

### File Naming Conventions

- **Components**: PascalCase (`ProjectHistory.tsx`)
- **Services**: camelCase with `.service.ts` suffix (`projects.service.ts`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)

### User Roles

The app supports multiple roles: Estudiante, Director, Jurado, Coordinador de Carrera, Decano. Each has role-specific dashboards under `app/(dashboard)/`.
