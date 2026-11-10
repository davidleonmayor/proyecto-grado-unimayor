# Degree Project Management System — UniMayor

Web application for comprehensive management of university degree projects, from initial proposal to final approval.

---

## 1. Introduction

UniMayor is a monorepo system that allows students, professors, coordinators, and deans to manage the full lifecycle of degree projects: proposal submission, advisor assignment, jury review, progress tracking, and final approval.

The system is composed of three independent packages:

| Package | Stack | Port |
|---------|-------|------|
| `backend/` | Express 5 + TypeScript + Prisma + MySQL | 4000 |
| `frontend/` | Next.js 15 (App Router) + React 19 + Tailwind 4 | 3000 |
| `landing/` | Astro 5 | 4321 |

There is **no root `package.json`**. All commands must be run from inside each package directory.

---

## 2. Module Documentation

### Backend (`backend/`)

Built with **Express 5**, **TypeScript**, and **Prisma ORM**. Currently mid-migration from a layered pattern to a per-domain repository pattern.

```
backend/src/
├── auth/                   # Repository pattern — full vertical slice
│   ├── auth.routes.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.schema.ts
│   └── __tests__/
├── project/                # Layered pattern (controller + routes)
├── person/
├── event/
├── messaging/
├── social-projection/
├── common/
│   └── middleware/         # errorHandler, asyncHandler, auth middleware
└── config/
    ├── prisma.ts           # Prisma singleton
    └── envs.ts             # Zod-validated env vars
```

**Key rules:**
- Authentication is JWT-bearer. `AuthMiddleware.isAuthenticatedUser` attaches `req.user`.
- Roles (`Estudiante`, `Director`, `Jurado`, `Coordinador`, `Decano`) are derived from the `ACTORES` join table — not stored on the user record.
- All async route handlers must be wrapped with `asyncHandler`.
- Env vars are accessed via `import { envs } from "./config"` — never `process.env` directly.

---

### Frontend (`frontend/`)

Built with **Next.js 15 App Router**, **React 19**, and **Tailwind CSS 4**. Uses a modular architecture with three locations:

```
frontend/
├── app/                    # Next.js pages and route groups only
│   └── (dashboard)/       # Protected dashboard routes per role
│       ├── dean/
│       ├── admin/
│       ├── teacher/
│       └── student/
├── modules/                # Domain slices (preferred for new code)
│   ├── auth/
│   ├── projects/
│   ├── events/
│   └── persons/
├── shared/                 # Cross-cutting utilities
│   ├── components/ui/      # Custom UI components
│   ├── components/layout/  # ProtectedRoute, RoleProtectedRoute, Navbar
│   ├── lib/api/            # BaseApiClient
│   └── lib/auth/           # TokenManager (localStorage JWT)
└── components/             # shadcn/ui generated — do not edit by hand
```

**Role routing priority:** `dean > admin > teacher > student`

| Role | Dashboard route | Condition |
|------|----------------|-----------|
| Decano | `/dean` | Has "Decano" in any project membership |
| Admin | `/admin` | Has Director / Jurado / Coordinador role |
| Teacher | `/teacher` | Any non-Estudiante role |
| Student | `/student` | All memberships are Estudiante |

---

### Database (`backend/prisma/`)

**MySQL 8** managed via **Prisma ORM**. All model names use Spanish with `@@map("UPPER_SNAKE_CASE")`.

Core entities:

```
PERSONA          — students, professors, any system user
TIPO_ROL         — role catalog (Estudiante, Director, Jurado, etc.)
ACTORES          — join: PERSONA ↔ TRABAJO_GRADO with tipo_rol
TRABAJO_GRADO    — degree project record
ESTADO_TG        — project status catalog
OPCION_GRADO     — project modality catalog
PROGRAMA_ACADEMICO / FACULTAD — academic structure
PROYECTO_PROYECCION_SOCIAL — social projection projects
MENSAJE / ANUNCIO — internal messaging
```

Schema changes → always run `pnpm db:generate` then `pnpm db:migrate`.

---

## 3. Backend Flow

```mermaid
flowchart TD
    Client([HTTP Client])
    Client --> MW1

    subgraph Middleware Chain
        MW1[requestTimeout 30s]
        MW1 --> MW2[express.json 10mb]
        MW2 --> MW3[cors]
        MW3 --> MW4[morgan logger]
    end

    MW4 --> Router

    subgraph Routers
        Router{/api/...}
        Router --> |/auth| AuthRoutes
        Router --> |/projects| ProjectRoutes
        Router --> |/persons| PersonRoutes
        Router --> |/events| EventRoutes
        Router --> |/messaging| MessagingRoutes
        Router --> |/proyeccion-social| SocialRoutes
    end

    AuthRoutes --> Controller
    ProjectRoutes --> Controller
    PersonRoutes --> Controller

    subgraph Request Handling
        Controller[Controller\nasyncHandler wrapper]
        Controller --> |Validate schema| Validator[express-validator]
        Validator --> |Auth routes| AuthService[Service Layer]
        Controller --> |Other routes| DirectDB[Direct Prisma call]
        AuthService --> Prisma
        DirectDB --> Prisma
    end

    Prisma[Prisma ORM singleton] --> MySQL[(MySQL 8)]
    MySQL --> |Result| Prisma
    Prisma --> |JSON response| Client

    MW4 --> NotFound[404 notFound handler]
    Controller --> |Thrown error| ErrorHandler[errorHandler\nP2002 / P2025 / P2003 / JWT]
    ErrorHandler --> |HTTP error response| Client
```

---

## 4. Frontend Flow

```mermaid
flowchart TD
    Browser([Browser])
    Browser --> NextJS[Next.js App Router]

    NextJS --> PublicRoutes[Public routes\n/ login /register]
    NextJS --> ProtectedRoute

    subgraph Auth Guard
        ProtectedRoute{ProtectedRoute\nJWT in localStorage?}
        ProtectedRoute --> |No token| Login[Redirect to /login]
        ProtectedRoute --> |Valid token| RoleCheck
    end

    subgraph Role Routing
        RoleCheck[Derive role from\nproject memberships]
        RoleCheck --> |Decano| DeanDash[/dean dashboard]
        RoleCheck --> |Director/Jurado/Coordinador| AdminDash[/admin dashboard]
        RoleCheck --> |Other professor| TeacherDash[/teacher dashboard]
        RoleCheck --> |Estudiante| StudentDash[/student dashboard]
    end

    DeanDash --> ModuleLayer
    AdminDash --> ModuleLayer
    TeacherDash --> ModuleLayer
    StudentDash --> ModuleLayer

    subgraph Module Layer
        ModuleLayer[Page Component]
        ModuleLayer --> Hook[Domain Hook\nmodules/domain/hooks/]
        Hook --> Service[Domain Service\nextends BaseApiClient]
    end

    Service --> |fetch + JWT header| API[Backend :4000]
    API --> |JSON| Service
    Service --> |State update| ModuleLayer
    ModuleLayer --> |Render| Browser
```

---

## 5. How to Run

### Prerequisites

- **Docker** and **Docker Compose**
- **Node.js 20+** and **pnpm**

### Step 1 — Start the database

```bash
docker compose up -d
```

This starts the MySQL container (`proyecto_grado_mysql`) on port 3306.

### Step 2 — Environment variables

```bash
# Backend
cp backend/.env.example backend/.env.local
# Edit backend/.env.local and set:
# DATABASE_URL="mysql://david:secret@localhost:3306/proyecto_grado"
# JWT_SECRET="your-secret"

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local and set:
# NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Step 3 — Install dependencies

```bash
cd backend && pnpm install
cd ../frontend && pnpm install
```

### Step 4 — Initialize the database

```bash
cd backend
pnpm db:generate     # generate Prisma client
pnpm db:migrate      # run migrations
pnpm db:seed         # load seed data
```

### Step 5 — Run both servers

Open two terminals:

```bash
# Terminal 1 — Backend (port 4000)
cd backend && pnpm dev

# Terminal 2 — Frontend (port 3000)
cd frontend && pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Verify the database (optional)

```bash
docker exec -it proyecto_grado_mysql mysql -u root -proot
use proyecto_grado;
show tables;
```

### Useful backend commands

```bash
pnpm db:studio          # open Prisma Studio (visual DB browser)
pnpm test               # run test suite against .env.test
pnpm test:coverage      # tests with coverage report
```

---

## Contributors

- David Leon — Backend & Database
- Sebastián Astudillo — Backend & Database
- Gabriela Bazques — Backend & Database
- Santiago Torres — Frontend
- Juan Chaves — Frontend
- Alejandro Pito — Frontend

---

<div align="center">⭐ If you find this project useful, please support us with a star!</div>
