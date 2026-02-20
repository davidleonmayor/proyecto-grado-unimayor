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
| react-big-calendar | 1 | Calendar views |
| Lucide React | - | Icons |
| SweetAlert2 | 11 | Alert dialogs |
| jspdf / pdfjs-dist | - | PDF handling |
| xlsx | 0.18 | Spreadsheet handling |

**File Naming:**
- ✅ `useAuth.ts` (hooks use camelCase with `use` prefix)
- ✅ `auth.service.ts` (services use dot notation)
- ✅ `ProjectHistory.tsx` (components use PascalCase)
- ✅ `base-client.ts` (lib utilities use kebab-case)
- ✅ `common.ts` (types use camelCase)
- ❌ `Auth_Service.ts` (WRONG — no underscores)

## Scope Detection (ASK IF AMBIGUOUS)

| User Says | Action |
|-----------|--------|
| "add component" | Create in `modules/{domain}/components/` or `shared/components/` |
| "add page", "new page" | Create in `app/(dashboard)/` with proper layout |
| "add service", "connect API" | Create in `modules/{domain}/services/` extending BaseApiClient |
| "add hook" | Create in `modules/{domain}/hooks/` or `shared/hooks/` |
| "add form" | Use react-hook-form + zod, InputField component |
| "fix styling" | Check Tailwind classes, `globals.css` theme vars |

**Examples:**
- "Add a student profile page" → ONE page in `app/(dashboard)/list/students/[id]/`
- "Connect events to the API" → ONE service in `modules/events/services/`
- "Add a search component" → Reuse `shared/components/ui/TableSearch.tsx` or create new

## Directory Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Geist font, metadata)
│   ├── page.tsx                  # Auth check → redirect to role dashboard
│   ├── globals.css               # Tailwind + custom theme vars
│   ├── sign-in/                  # Public auth pages
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/[token]/
│   ├── confirm-account/
│   ├── hooks/                    # ⚠ Legacy hooks (use modules/ instead)
│   ├── lib/                      # ⚠ Legacy services (use modules/ instead)
│   ├── components/               # ⚠ Legacy components (use modules/ or shared/)
│   └── (dashboard)/              # Route group — requires auth
│       ├── layout.tsx            # Sidebar + Navbar + ProtectedRoute
│       ├── admin/                # Admin dashboard (stats, charts)
│       ├── dean/                 # Dean dashboard
│       ├── teacher/              # Teacher dashboard (calendar)
│       ├── student/              # Student dashboard (calendar)
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
│   ├── auth/                     # Authentication — [details](references/auth-context.md)
│   │   ├── hooks/useAuth.ts
│   │   ├── services/auth.service.ts
│   │   └── types/
│   ├── events/                   # Event management
│   │   ├── services/events.service.ts
│   │   └── types/
│   ├── persons/                  # Teachers & students
│   │   ├── services/persons.service.ts
│   │   └── types/
│   └── projects/                 # Project management — [details](references/projects-context.md)
│       ├── components/
│       ├── services/projects.service.ts
│       └── types/
├── shared/                       # ✅ Cross-cutting utilities — [details](references/shared-context.md)
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

## Architecture

The frontend uses a **modular architecture** with two layers:

**Module pattern** — Self-contained domain modules under `modules/` with own services, hooks, components, and types. Each module owns its full vertical slice.

| Module | Path | Description |
|--------|------|-------------|
| `auth` | `modules/auth/` | Authentication, JWT, password flows — [details](references/auth-context.md) |
| `projects` | `modules/projects/` | Project CRUD, iterations, reviews, bulk upload — [details](references/projects-context.md) |
| `events` | `modules/events/` | Event CRUD |
| `persons` | `modules/persons/` | Teachers & students listing |

**Shared layer** — Cross-cutting utilities in `shared/` used by all modules — [details](references/shared-context.md).

**Data flow:**

```
Page (app/) → Hook (modules/*/hooks/) → Service (modules/*/services/) → BaseApiClient → Backend API
                                                                              ↓
                                                                     TokenManager (auth)
```

**Layered responsibilities:**

| Layer | Responsibility | Location |
|-------|---------------|----------|
| Pages | Route definition, layout, data fetching | `app/` |
| Hooks | State management, side effects, business logic | `modules/*/hooks/`, `shared/hooks/` |
| Services | API calls, request formatting | `modules/*/services/` |
| Components | UI rendering, event handling | `modules/*/components/`, `shared/components/` |
| Types | TypeScript interfaces | `modules/*/types/`, `shared/types/` |
| Lib | Infrastructure (API client, token, utils) | `shared/lib/` |

## Critical Patterns

### Module Structure

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

  async createItem(data: ItemData): Promise<Item> {
    return this.request<Item>('/api/items', {
      method: 'POST',
      body: data,
      requiresAuth: true
    });
  }

  async uploadFile(id: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.requestFormData(`/api/items/${id}/upload`, formData, {
      requiresAuth: true
    });
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
- See [auth-context.md](references/auth-context.md) for full details

### Roles

| Role | Route | Determined by |
|------|-------|---------------|
| `student` | `/student` | All projects have role "Estudiante" |
| `teacher` | `/teacher` | Has projects but not privileged |
| `admin` | `/admin` | Privileged role (Director, Jurado, Coordinador de Carrera) |
| `dean` | `/dean` | Has role "Decano" in any project |

Priority: dean > admin > teacher > student

### Route Protection

```typescript
// Auth-only page (any authenticated user)
// Wrap in dashboard layout which uses ProtectedRoute

// Role-specific page
import { RoleProtectedRoute } from '@/shared/components/layout/RoleProtectedRoute';

export default function AdminPage() {
  return (
    <RoleProtectedRoute allowedRoles={['admin']}>
      {/* page content */}
    </RoleProtectedRoute>
  );
}
```

### Path Alias

`@/*` maps to `frontend/*` root. Use: `import { X } from '@/shared'`

### Styling

- Tailwind CSS 4 with custom theme in `globals.css`
- Custom colors: `principal` (yellow #fcdf5d), `secondary` (blue #0ea5e9), `tertiary` (purple #a2a1f0)
- shadcn/ui components in `components/ui/` — do NOT edit manually, use `npx shadcn@latest add`
- Shared UI components in `shared/components/ui/` — these ARE custom and editable
- See [pages-context.md](references/pages-context.md) for full theme variables

### Forms

- `react-hook-form` + `zod` for validation
- `@hookform/resolvers` for zod integration
- Custom `InputField` component wraps inputs with react-hook-form register

```typescript
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputField } from '@/shared/components/ui/InputField';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export default function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputField label="Name" name="name" register={register} error={errors.name} />
      <InputField label="Email" name="email" register={register} error={errors.email} />
    </form>
  );
}
```

### Alerts & Notifications

SweetAlert2 for user feedback:

```typescript
import Swal from 'sweetalert2';

Swal.fire({ icon: 'success', title: 'Done', text: 'Operation completed' });
Swal.fire({ icon: 'error', title: 'Error', text: error.message });
```

### Dashboard Layout

Two-column layout (sidebar 14-16% + content 84-86%):
- Left: Logo + Menu (role-based items)
- Right: Navbar (user info, search, logout) + page content
- Background: `#F7F8FA`
- See [pages-context.md](references/pages-context.md) for full routing details

## Commands

```bash
pnpm dev              # Dev server (port 3000)
pnpm build            # Production build (standalone output)
pnpm start            # Start production server
npx shadcn@latest add <component>  # Add shadcn/ui component
```

## ⚠ Legacy Code

`app/hooks/`, `app/lib/`, `app/components/` contain legacy code that duplicates `modules/` and `shared/`. When modifying existing pages that use legacy imports, prefer migrating to `modules/`/`shared/` patterns.

| Legacy Location | Modern Equivalent |
|-----------------|-------------------|
| `app/hooks/useAuth.ts` | `modules/auth/hooks/useAuth.ts` |
| `app/hooks/useUserRole.ts` | `shared/hooks/useUserRole.ts` |
| `app/lib/api.ts` | `modules/*/services/*.service.ts` |
| `app/lib/auth.ts` | `shared/lib/auth/token-manager.ts` |
| `app/components/` | `shared/components/` or `modules/*/components/` |

## Resources

- **Modules**: See [references/](references/) for detailed context on each module
  - [auth-context.md](references/auth-context.md) — Auth module: hooks, services, pages, token flow
  - [projects-context.md](references/projects-context.md) — Projects module: CRUD, iterations, bulk upload
  - [shared-context.md](references/shared-context.md) — Shared infrastructure: BaseApiClient, components, types
  - [pages-context.md](references/pages-context.md) — Pages & routing: route map, layouts, theme, dashboards
