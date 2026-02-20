---
name: backend-context
description: >
  Backend architecture, patterns and conventions for the Express.js 5 API.
  Trigger: When working on backend code, API routes, controllers, or database.
license: Apache-2.0
metadata:
  author: davidleonmayor
  version: "1.0"
  scope: [backend]
---

## Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 5 | HTTP framework |
| TypeScript | 5 | Language |
| Prisma | 6 | ORM |
| MySQL | - | Database |
| Zod | 4 | Env validation |
| express-validator | 7 | Request validation |
| JWT (jsonwebtoken) | 9 | Authentication |
| Winston | 3 | Logging |
| Morgan | 1 | HTTP request logging |
| Multer | 2 | File uploads |
| Brevo | 3 | Transactional emails |
| Nodemailer | 7 | Email (fallback) |
| Jest + ts-jest | - | Testing |
| Supertest | 7 | HTTP testing |

**File Naming Example:**
- ✅ `sendAuthEmail.test.ts` (all tests with .test extencion)
- ✅ `createToken.ts` (common files use camel case)
- ✅ `auth.controller.ts` | `auth.route.ts` `auth.schema.ts` `auth.service.ts` (for each repositori spesification)
- ✅ `AuthMiddleware.ts` (Uper camel case for classes)
- ❌ `create-token.ts` (WRONG - do no separate be -)
- ❌ `sign-up-validation.spec.ts` | `sing-up-validation.ts`(WRONG )

## Scope Detection (ASK IF AMBIGUOUS)

| User Says | Action |
|-----------|--------|
| "a test", "one test", "new test", "add test" | Create ONE test() in existing spec |
| "comprehensive tests", "all tests", "test suite", "generate tests" | Create full suite |
| "create route" | crear una ruta en y agregarla al router|

**Examples:**
- "Create a test for user sign-up" → ONE test only
- "Generate E2E tests for login page" → Full suite
- "Add a test to verify form validation" → ONE test to existing spec
- "create POST /login route” → ONE route 


## Directory Structure

```
backend/
├── prisma/                   # Database schema, migrations, seeds
│   ├── schema.prisma         # MySQL schema definition
│   ├── migrations/           # Prisma migration history
│   ├── seed.ts               # Database seeder
│   └── clear.ts              # Database cleanup script
├── src/
│   ├── index.ts              # Entry point — instantiates Server
│   ├── server.ts             # Server class (middlewares, routes, shutdown)
│   ├── config/               # App configuration (envs, prisma, logger, cors, email clients)
│   ├── routes/               # Route class definitions — mounted under /api/
│   ├── controllers/          # Request handlers for each domain
│   ├── auth/                 # Self-contained auth module (routes, controller, service, schema, tests)
│   ├── common/               # Shared code
│   │   ├── middleware/       # Auth, Role, validation, error handling, timeout
│   │   ├── schema/           # Global validation schemas
│   │   └── utils/            # Helpers (asyncHandler, createToken)
│   ├── email/                # Email templates (Brevo / Nodemailer)
│   ├── example/              # Reference module for new features
│   └── __test__/             # Integration / unit tests
├── logs/                     # Winston log output (gitignored)
├── docs/                     # Additional documentation
└── jest.config.js            # Jest + ts-jest config
```

## Architecture

The backend uses two architectural patterns:

**Repository pattern** — Self-contained modules under `src/` with own routes, controller, service, schema, and tests. Each repository owns its full vertical slice.

| Repository | Path | Description |
|------------|------|-------------|
| `auth` | `src/auth/` | Authentication, JWT, password flows — [details](references/auth-context.md) |

**Layered pattern** — Domains that share `src/routes/`, `src/controllers/` and `src/common/`. Currently used by the remaining modules while migrating to repository pattern.

| Domain | Routes | Controller |
|--------|--------|------------|
| projects | `src/routes/project.routes.ts` | `src/controllers/project.controller.ts` |
| events | `src/routes/event.routes.ts` | `src/controllers/event.controller.ts` |
| persons | `src/routes/person.routes.ts` | `src/controllers/person.controller.ts` |

**Request flow:**

```
Request → Middleware Chain → Route Class → Controller → Service → Prisma → MySQL
                                              ↓
                                         schema (express-validator)
```

**Layered responsibilities:**

| Layer | Responsibility | Location |
|-------|---------------|----------|
| Server | Bootstrap, middleware chain, graceful shutdown | `src/server.ts` |
| Routes | HTTP method + path + middleware stack per endpoint | `src/routes/`, `src/auth/auth.routes.ts` |
| Controller | Parse request, call service/prisma, format response | `src/controllers/`, `src/auth/auth.controller.ts` |
| Service | Business logic, reusable operations | `src/auth/auth.service.ts` |
| Schema | Request validation rules (express-validator) | `src/auth/auth.schema.ts`, `src/common/schema/` |
| Middleware | Cross-cutting: auth, roles, timeout, errors, logging | `src/common/middleware/` |
| Config | Singletons and env-validated settings | `src/config/` |

**Request lifecycle:**

1. `requestTimeout(30s)` wraps the request
2. Body parsers (`json`, `urlencoded`) with 10mb limit
3. CORS via `corsConfig`
4. Morgan HTTP logging
5. `Routes.init(app)` matches the endpoint
6. Route-level middleware chain (e.g. `authLimiter` → `validateSchema` → `authMiddleware` → controller)
7. Controller handles logic, returns response
8. Unmatched routes → `notFound` (404)
9. Errors → `errorHandler` (global catch-all)

## Critical Patterns

### Server Class

`server.ts` is a class-based Express setup. Middleware order matters:

1. `requestTimeout(30000)` — 30s global timeout
2. `express.json({ limit: '10mb' })` — body parser
3. `cors(corsConfig)` — CORS
4. `morganMiddleware` — HTTP logging
5. Routes via `Routes.init(app)`
6. `notFound` — 404 handler
7. `errorHandler` — global error handler (always last)

### Route Registration

Routes are class-based and mounted in `src/routes/index.ts`:

```typescript
export class Routes {
    public static init(app: Application) {
        app.use("/api/auth", authRoutes.router);
        app.use("/api/projects", projectRoutes.router);
        app.use("/api/events", eventRoutes.router);
        app.use("/api/persons", personRoutes.router);
    }
}
```

All API endpoints live under `/api/`.

### Route Class Pattern

```typescript
export class MyRoutes {
    public router: Router;
    private controller: MyController;
    private authMiddleware: AuthMiddleware;

    constructor() {
        this.router = Router();
        this.controller = new MyController();
        this.authMiddleware = new AuthMiddleware();
        this.initRoutes();
    }

    public initRoutes() {
        this.router.get("/",
            this.authMiddleware.isAuthenticatedUser,
            this.controller.getItems
        );
    }
}
```

### Authentication

- JWT via `Bearer` token in `Authorization` header
- `AuthMiddleware.isAuthenticatedUser` verifies token and attaches `req.user` (type `Partial<persona>`)
- Token created with `jsonwebtoken`, secret from `JWT_SECRET` env var

### Authorization (Roles)

Roles are determined by `actores` table (many-to-many between `persona` and `trabajo_grado` with `tipo_rol`):

| Middleware | Allows |
|------------|--------|
| `isPrivilegedUser` | Director, Jurado, Coordinador de Carrera, Decano |
| `isAdmin` | admin, Administrador, Admin |
| `isCoordinator` | Coordinador de Carrera, Coordinador |
| `isDirectorOrProfessor` | Director |

### Prisma (Database)

- Singleton in `config/prisma.ts` via `PrismaService.getInstance()`
- Import: `import { prisma } from "../config"`
- MySQL database, models use Spanish names with `@@map("TABLE_NAME")`
- Key models: `persona`, `trabajo_grado`, `actores`, `seguimiento_tg`, `evento`

### Environment Variables

Validated with Zod in `config/envs.ts`. Required vars:

```
NODE_ENV, PORT, DATABASE_URL, JWT_SECRET,
FRONTEND_URL, NODEMAILER_*, BREVO_*
```

Access: `import { envs } from "./config"`

### Validation

Two approaches coexist:
- `express-validator` via `validateSchema()` middleware — wraps `checkSchema()`
- `zod` — used for env validation, available for request schemas

### Error Handling

Global error handler in `common/middleware/errorHandler.ts` handles:
- Prisma errors (P2002 conflict, P2025 not found, P2003 FK violation)
- JWT errors (invalid, expired)
- JSON syntax errors
- Generic errors with statusCode

### Logging

Winston logger with levels: error, warn, info, http, debug.
- Console + file transports (`logs/error.log`, `logs/combined.log`)
- Development: debug level. Production: warn level.
- Import: `import { logger } from "../config"`

### File Uploads

Multer handles file uploads. Two configs in `project.controller.ts`:
- `upload` — general file uploads (PDF, images)
- `excelUpload` — Excel bulk upload (.xlsx, .xls)

## Commands

```bash
pnpm dev                 # Dev server with nodemon (port 4000)
pnpm db:generate         # Generate Prisma client
pnpm db:migrate          # Run migrations
pnpm db:studio           # Open Prisma Studio
pnpm db:seed             # Seed database
pnpm db:clear            # Clear database
pnpm test                # Run tests (uses .env.test)
```

## Resources

- **Repositories**: See [references/](references/) for detailed context on each repository module
  - [auth-context.md](references/auth-context.md) — Auth repository: endpoints, schemas, JWT, password flows
