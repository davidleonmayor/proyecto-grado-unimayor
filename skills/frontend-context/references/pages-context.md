# Pages & Routing — `app/`

Next.js App Router pages, layouts, and routing structure.

## References

| Resource | Description | Path |
|----------|-------------|------|
| Root layout | Fonts, metadata | `frontend/app/layout.tsx` |
| Root page | Auth redirect logic | `frontend/app/page.tsx` |
| Dashboard layout | Sidebar + Navbar | `frontend/app/(dashboard)/layout.tsx` |
| Theme variables | CSS custom properties | `frontend/app/globals.css` |
| next.config.ts | Next.js configuration | `frontend/next.config.ts` |

## Route Map

### Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Auth check → redirect to role dashboard |
| `/sign-in` | `app/sign-in/page.tsx` | Login form |
| `/register` | `app/register/page.tsx` | Registration form |
| `/confirm-account` | `app/confirm-account/page.tsx` | Token confirmation |
| `/forgot-password` | `app/forgot-password/page.tsx` | Email input for reset |
| `/reset-password/[token]` | `app/reset-password/[token]/page.tsx` | New password form |

### Dashboard Routes (require auth)

All wrapped in `(dashboard)` route group with `ProtectedRoute` HOC.

| Route | Page | Roles |
|-------|------|-------|
| `/admin` | `app/(dashboard)/admin/page.tsx` | admin |
| `/dean` | `app/(dashboard)/dean/page.tsx` | dean |
| `/teacher` | `app/(dashboard)/teacher/page.tsx` | teacher |
| `/student` | `app/(dashboard)/student/page.tsx` | student |

### Project Routes

| Route | Page | Description |
|-------|------|-------------|
| `/projects` | `projects/page.tsx` | User's project list |
| `/projects/[id]` | `projects/[id]/page.tsx` | Project detail |
| `/projects/admin/new` | `projects/admin/new/page.tsx` | Create project (admin) |
| `/projects/admin/edit/[id]` | `projects/admin/edit/[id]/page.tsx` | Edit project (admin) |
| `/projects/bulk-upload` | `projects/bulk-upload/page.tsx` | Excel import |

### List Routes

| Route | Page | Roles |
|-------|------|-------|
| `/list/students` | `list/students/page.tsx` | admin, teacher, dean |
| `/list/students/[id]` | `list/students/[id]/page.tsx` | admin, teacher, dean |
| `/list/teachers` | `list/teachers/page.tsx` | admin, dean |
| `/list/teachers/[id]` | `list/teachers/[id]/page.tsx` | admin, dean |
| `/list/events` | `list/events/page.tsx` | teacher, dean, admin |
| `/list/careers` | `list/careers/page.tsx` | admin |
| `/list/degreeOptions` | `list/degreeOptions/page.tsx` | admin |
| `/list/messages` | `list/messages/page.tsx` | — |

### Other Routes

| Route | Page | Description |
|-------|------|-------------|
| `/social-outreach` | `social-outreach/page.tsx` | Proyección Social module |

## Root Layout

```typescript
// app/layout.tsx
export const metadata = {
  title: "Gestion Expedientes",
  description: "Gestión Expedientes Colegio Mayor del Cauca"
};

// Fonts: Geist Sans & Geist Mono
// suppressHydrationWarning: true
```

## Dashboard Layout

```
app/(dashboard)/layout.tsx
┌─────────────────────────────────────────┐
│ ┌──────────┐ ┌────────────────────────┐ │
│ │  Sidebar  │ │  Navbar               │ │
│ │  (14-16%) │ │  ──────────────────── │ │
│ │           │ │                        │ │
│ │  Logo     │ │  Page Content          │ │
│ │  Menu     │ │  (children)            │ │
│ │           │ │                        │ │
│ │           │ │  bg: #F7F8FA           │ │
│ └──────────┘ └────────────────────────┘ │
│              (84-86% width)             │
└─────────────────────────────────────────┘
```

Wrapped in `<ProtectedRoute>`. Responsive breakpoints: md, lg, xl.

## Dashboard Pages

### Admin Dashboard (`/admin`)
- **Role**: admin only (RoleProtectedRoute)
- **Stats**: 4 UserCards (total projects, in progress, finished, active teachers)
- **Charts**: CountCharts, ProjectStatusChart (weekly), FinanceChart (monthly)
- **Right panel**: EventCalendar
- **Data**: `projectsService.getDashboardStats()`

### Student Dashboard (`/student`)
- **Role**: student only
- **Layout**: 2/3 BigCalendar + 1/3 EventCalendar

### Teacher Dashboard (`/teacher`)
- **Role**: teacher
- Similar calendar layout

### Dean Dashboard (`/dean`)
- **Role**: dean
- Administrative view

## Theme & Styling

### Custom Colors (CSS variables in `globals.css`)

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-principal` | `#fcdf5d` | Primary yellow |
| `--color-principal-dark` | `#e6c84e` | Hover state |
| `--color-secondary` | `#0ea5e9` | Blue accent |
| `--color-tertiary` | `#a2a1f0` | Purple accent |

### Status Colors

| Status | Color |
|--------|-------|
| Approved | `#0ea5e9` (blue) |
| Rejected | `#f44336` (red) |
| Pending | `#fcdf5d` (yellow) |

### Calendar Pastel Colors

8 pastel colors defined for calendar event distinction.

## Configuration

### next.config.ts
- Remote image pattern: `images.pexels.com`
- Output: `standalone`
- React strict mode: `true`

### tsconfig.json
- Target: ES2017
- Module resolution: bundler
- Path alias: `@/*` → `frontend/*`
- Strict mode: enabled

## Legacy Code

`app/hooks/`, `app/lib/`, `app/components/` contain legacy code duplicating `modules/` and `shared/`. When modifying pages using legacy imports, prefer migrating to the modular patterns.

| Legacy Location | Modern Equivalent |
|-----------------|-------------------|
| `app/hooks/useAuth.ts` | `modules/auth/hooks/useAuth.ts` |
| `app/hooks/useUserRole.ts` | `shared/hooks/useUserRole.ts` |
| `app/lib/api.ts` | `modules/*/services/*.service.ts` |
| `app/lib/auth.ts` | `shared/lib/auth/token-manager.ts` |
| `app/components/` | `shared/components/` or `modules/*/components/` |
