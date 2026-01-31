---
name: frontend-context
description: >
  Frontend architecture, patterns and conventions for the Next.js 15 app.
  Trigger: When working on frontend code, components, pages, or API integration.
license: Apache-2.0
metadata:
  author: davidleonmayor
  version: "1.0"
  scope: [frontend]
---

## Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 (App Router) | Framework |
| React | 19 | UI library |
| TypeScript | 5 | Language |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | new-york style | Component library |
| Zod | 4 | Schema validation |
| react-hook-form | 7 | Form handling |
| Recharts | 3 | Charts |
| Lucide React | - | Icons |
| SweetAlert2 | 11 | Alert dialogs |

## Directory Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Geist font)
│   ├── page.tsx                  # Landing / redirect
│   ├── globals.css               # Tailwind + custom theme vars
│   ├── sign-in/                  # Public auth pages
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── confirm-account/
│   ├── hooks/                    # ⚠ Legacy hooks (use modules/ instead)
│   ├── lib/                      # ⚠ Legacy services (use modules/ instead)
│   ├── components/               # ⚠ Legacy components (use modules/ or shared/)
│   └── (dashboard)/              # Route group — requires auth
│       ├── layout.tsx            # Sidebar + Navbar + ProtectedRoute
│       ├── admin/                # Admin dashboard
│       ├── dean/                 # Dean dashboard
│       ├── teacher/              # Teacher dashboard
│       ├── student/              # Student dashboard
│       ├── social-outreach/      # Social outreach module
│       ├── projects/             # Project CRUD + bulk upload
│       │   ├── admin/            # Admin project management
│       │   │   ├── new/
│       │   │   └── edit/[id]/
│       │   ├── bulk-upload/
│       │   └── [id]/             # Project detail
│       └── list/                 # Entity listings
│           ├── careers/
│           ├── degreeOptions/
│           ├── events/
│           ├── messages/
│           ├── students/[id]/
│           └── teachers/[id]/
├── modules/                      # ✅ Domain modules (preferred)
│   ├── auth/                     # Authentication
│   │   ├── hooks/useAuth.ts
│   │   ├── services/auth.service.ts
│   │   └── types/
│   ├── events/
│   ├── persons/
│   └── projects/
│       ├── components/
│       ├── services/projects.service.ts
│       └── types/
├── shared/                       # ✅ Cross-cutting utilities
│   ├── components/
│   │   ├── ui/                   # InputField, Table, Pagination, TableSearch
│   │   └── layout/               # Menu, Navbar, ProtectedRoute, RoleProtectedRoute
│   ├── hooks/useUserRole.ts
│   ├── lib/
│   │   ├── api/base-client.ts    # BaseApiClient (fetch wrapper)
│   │   └── auth/token-manager.ts # JWT token storage
│   ├── types/common.ts
│   └── index.ts                  # Barrel exports
├── components/ui/                # shadcn/ui primitives (auto-generated)
├── lib/utils.ts                  # cn() helper
└── public/
```

## Critical Patterns

### Module structure

Each domain module follows:

```
modules/{name}/
├── index.ts           # Barrel exports (public API)
├── hooks/             # React hooks
├── services/          # API service classes extending BaseApiClient
├── components/        # Module-specific components
└── types/             # TypeScript interfaces
```

Import from barrel: `import { useAuth, authService } from '@/modules/auth'`

### API Services

All services extend `BaseApiClient` which wraps `fetch` with auth headers:

```typescript
import { BaseApiClient } from '@/shared/lib/api/base-client';

export class MyService extends BaseApiClient {
  async getItems(): Promise<Item[]> {
    return this.request<Item[]>('/api/items', { requiresAuth: true });
  }
}

export const myService = new MyService();
```

Backend URL: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000`).

### Authentication

- JWT stored in `localStorage` via `TokenManager`
- `useAuth()` hook provides: `user`, `login`, `logout`, `register`, `isAuth`
- `ProtectedRoute` wraps dashboard layout — redirects to `/sign-in` if unauthenticated
- `RoleProtectedRoute` checks user role (student, teacher, admin, dean)
- Role determined by project membership, not a user field

### Roles

| Role | Route | Determined by |
|------|-------|---------------|
| `student` | `/student` | All projects have role "Estudiante" |
| `teacher` | `/teacher` | Has projects but not privileged |
| `admin` | `/admin` | Privileged role + can access dashboard stats |
| `dean` | `/dean` | Has role "Decano" in any project |

### Path alias

`@/*` maps to `frontend/*` root. Use: `import { X } from '@/shared'`

### Styling

- Tailwind CSS 4 with custom theme in `globals.css`
- Custom colors: `principal` (yellow #fcdf5d), `secondary` (blue #0ea5e9), `tertiary` (purple #a2a1f0)
- shadcn/ui components in `components/ui/` — do NOT edit manually, use `npx shadcn@latest add`
- Shared UI components in `shared/components/ui/` — these ARE custom

### Forms

- `react-hook-form` + `zod` for validation
- `@hookform/resolvers` for zod integration

## Commands

```bash
pnpm dev              # Dev server (port 3000)
pnpm build            # Production build (standalone output)
pnpm start            # Start production server
```

## ⚠ Legacy Code

`app/hooks/`, `app/lib/`, `app/components/` contain legacy code that duplicates `modules/` and `shared/`. When modifying existing pages that use legacy imports, prefer migrating to `modules/`/`shared/` patterns.
