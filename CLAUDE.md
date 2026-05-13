# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

Monorepo for **UniMayor**, a degree-project management system. There is **no root `package.json`** — each package is standalone. Run scripts from inside the relevant package directory.

| Package | Stack | Path | Dev port |
|---------|-------|------|----------|
| Backend | Express 5 + TypeScript + Prisma + MySQL | `backend/` | 4000 |
| Frontend | Next.js 15 (App Router) + React 19 + Tailwind 4 | `frontend/` | 3000 |
| Landing | Astro 5 | `landing/` | 4321 |
| Skills | Markdown agent instructions | `skills/` | — |

`AGENTS.md` mirrors the skill index in this file; keep them in sync via the `skill-sync` skill.

## Commands

All commands are run from inside the package directory (no root workspace).

### Backend (`cd backend`)

```bash
pnpm dev                  # nodemon + ts-node on src/index.ts, loads .env.local
pnpm db:generate          # prisma generate (after schema.prisma changes)
pnpm db:migrate           # prisma migrate dev --name init
pnpm db:studio            # open Prisma Studio
pnpm db:seed              # ts-node prisma/seed.ts
pnpm db:clear             # wipe tables
pnpm test                 # runs db:generate against .env.test, then jest
pnpm test:coverage        # jest --coverage
pnpm exec jest path/to/file.test.ts          # run a single test file
pnpm exec jest -t "name of the test case"    # run by test name
```

**Gotcha:** `pnpm dev` loads `.env.local` (not `.env`). The `.env.example` is copied to `.env` for tooling like Prisma CLI, but the running server reads `.env.local`. Tests use `.env.test`.

### Frontend (`cd frontend`)

```bash
pnpm dev                  # next dev (port 3000)
pnpm build                # next build (standalone output)
pnpm start                # next start
```

No test or lint script is configured in `frontend/package.json`. Detailed frontend guidance lives in `frontend/CLAUDE.md`.

### Landing (`cd landing`)

```bash
pnpm dev                  # astro dev
pnpm build                # astro build
pnpm preview              # astro preview
```

### Docker

```bash
docker compose up -d      # backend + mysql; frontend is not in compose.yaml
docker compose build
docker exec -it proyecto_grado_mysql mysql -u root -proot   # shell into DB
```

## Architecture

### Backend — two coexisting patterns

The backend is mid-migration from a **layered** layout to a per-domain **repository** layout. New work uses the repository pattern; layered domains stay until migrated.

- **Repository pattern** (preferred): `src/{domain}/` contains its full vertical slice — `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.schema.ts`, `__tests__/`. Current example: `src/auth/`.
- **Layered pattern**: domain split across `src/{domain}/{domain}.controller.ts` and `src/{domain}/{domain}.routes.ts` without a service layer. Currently: `project`, `event`, `person`, `messaging`, `social-projection`.

`src/server.ts` is a class — middleware order is load-bearing:

```
requestTimeout(30s) → express.json(10mb) → cors → morgan
  → /api/auth, /api/projects, /api/events, /api/persons, /api/messaging, /api/proyeccion-social
  → notFound (404) → errorHandler (must be last)
```

All routes are class-based (`new XRoutes()` exposes `.router`) and mounted under `/api/`.

**Authentication** is JWT-bearer; `AuthMiddleware.isAuthenticatedUser` attaches `req.user`. **Roles are not a field on the user** — they're derived from the `actores` join table (`persona` ↔ `trabajo_grado` with `tipo_rol`). Role middlewares: `isPrivilegedUser`, `isAdmin`, `isCoordinator`, `isDirectorOrProfessor`.

**Prisma** is a singleton (`config/prisma.ts`, imported via `import { prisma } from "../config"`). Models use Spanish names with `@@map("TABLE_NAME")`. Env vars are validated with Zod in `config/envs.ts` — access via `import { envs } from "./config"`.

**Errors**: `common/middleware/errorHandler.ts` translates Prisma codes (`P2002`, `P2025`, `P2003`) and JWT errors to HTTP responses. Use the `asyncHandler` utility to forward async errors.

**Validation**: `express-validator` via `validateSchema()` is the existing convention; Zod is available and used for env validation.

For deeper backend guidance, see `skills/backend-context/SKILL.md`.

### Frontend — modules + shared, with legacy in `app/`

Three coexisting locations:

- **`modules/{domain}/`** (preferred) — domain slices: `services/` (extend `BaseApiClient`), `hooks/`, `components/`, `types/`, `index.ts` barrel. Import via `@/modules/projects`.
- **`shared/`** — cross-cutting: `lib/api/base-client.ts`, `lib/auth/token-manager.ts`, `components/ui/`, `components/layout/`, `hooks/`. Import via `@/shared`.
- **`app/hooks/`, `app/lib/`, `app/components/`** — **legacy**, being migrated. When touching a page that uses these, prefer migrating its imports.

Path alias `@/*` maps to `frontend/*`. `components/ui/` is shadcn/ui generated output — don't edit by hand; use `npx shadcn@latest add`. Custom UI lives in `shared/components/ui/`.

**Auth role routing**: the frontend re-derives the role from project memberships returned by the API, then routes:

| Role | Route | Determined by |
|------|-------|---------------|
| dean | `/dean` | Has "Decano" in any project |
| admin | `/admin` | Has Director/Jurado/Coordinador role |
| teacher | `/teacher` | Has any non-Estudiante role |
| student | `/student` | All memberships are Estudiante |

Priority: dean > admin > teacher > student. JWT lives in `localStorage` via `TokenManager`. `ProtectedRoute` guards the `app/(dashboard)/` group; `RoleProtectedRoute` enforces per-page roles.

`NEXT_PUBLIC_API_URL` points the frontend at the backend (default `http://localhost:4000`).

For deeper frontend guidance, see `frontend/CLAUDE.md` and `skills/frontend-context/SKILL.md`.

## AI Skills

Skill files live in `skills/{name}/SKILL.md` with patterns, examples, and decision trees. Read the skill before starting work it covers.

| Skill | When to use |
|-------|-------------|
| `backend-context` | Backend code, API routes, controllers, Prisma |
| `frontend-context` | Frontend code, components, pages, API integration |
| `project-info` | Monorepo orientation |
| `skill-creator` | Creating a new skill |
| `skill-sync` | Syncing the skill index to `AGENTS.md` |
| `skill-commit` | Creating git commits |

**Auto-invoke**: when creating a new skill, syncing skills, or committing changes, invoke the matching skill **first**.

## Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/): `type(scope): description`. Types in use: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `rem` (for removals). Subject under 72 chars. Reference issue numbers when applicable. Use the `skill-commit` skill to draft commits.
