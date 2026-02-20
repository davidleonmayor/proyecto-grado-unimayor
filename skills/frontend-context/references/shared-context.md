# Shared Infrastructure — `shared/`

Cross-cutting utilities, components, hooks, and types used across all modules.

## References

| Resource | Description | Path |
|----------|-------------|------|
| BaseApiClient | Fetch wrapper with auth | `frontend/shared/lib/api/base-client.ts` |
| TokenManager | JWT token storage | `frontend/shared/lib/auth/token-manager.ts` |
| Menu | Sidebar navigation | `frontend/shared/components/layout/Menu.tsx` |
| Navbar | Top navigation bar | `frontend/shared/components/layout/Navbar.tsx` |
| ProtectedRoute | Auth guard HOC | `frontend/shared/components/layout/ProtectedRoute.tsx` |
| RoleProtectedRoute | Role guard HOC | `frontend/shared/components/layout/RoleProtectedRoute.tsx` |
| shadcn/ui primitives | Auto-generated UI | `frontend/components/ui/` |

## Directory Structure

```
shared/
├── index.ts                         # Barrel exports
├── components/
│   ├── layout/
│   │   ├── Menu.tsx                 # Sidebar with role-based visibility
│   │   ├── Navbar.tsx               # Top bar (user info, search, logout)
│   │   ├── ProtectedRoute.tsx       # Redirects unauthenticated to /sign-in
│   │   └── RoleProtectedRoute.tsx   # Blocks unauthorized roles
│   └── ui/
│       ├── InputField.tsx           # Form input (react-hook-form)
│       ├── Table.tsx                # Generic data table
│       ├── Pagination.tsx           # Page navigation
│       └── TableSearch.tsx          # Search input with icon
├── hooks/
│   └── useUserRole.ts              # Role determination hook
├── lib/
│   ├── api/
│   │   └── base-client.ts          # BaseApiClient class
│   └── auth/
│       └── token-manager.ts        # TokenManager class
└── types/
    └── common.ts                   # Shared TypeScript types
```

## BaseApiClient

Base class for all API service classes. Located at `shared/lib/api/base-client.ts`.

```typescript
class BaseApiClient {
  protected baseURL: string;                              // NEXT_PUBLIC_API_URL or http://localhost:4000
  protected getAuthToken(): string | null;                // TokenManager.getToken()
  protected async request<T>(endpoint, options): Promise<T>;
  protected async requestFormData<T>(endpoint, formData, options): Promise<T>;
  protected async downloadFile(endpoint, filename): Promise<void>;
}
```

**Options for `request()`:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | string | `'GET'` | HTTP method |
| `body` | object | — | JSON body (auto-stringified) |
| `requiresAuth` | boolean | `false` | Adds `Authorization: Bearer {token}` header |

**Key behaviors:**
- Auto-adds `Content-Type: application/json` for JSON requests
- `requestFormData` omits Content-Type (lets browser set multipart boundary)
- `downloadFile` extracts filename from Content-Disposition header
- Handles both JSON and text responses

## UI Components

### InputField

```typescript
interface InputFieldProps {
  label: string;
  type?: string;
  register: UseFormRegister<any>;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
}
```

Wraps `<input>` with react-hook-form `register`, label, and error display.

### Table

```typescript
interface TableProps<T> {
  columns: Column[];
  renderRow: (item: T) => React.ReactNode;
  data: T[];
  className?: string;
}

interface Column {
  header: string;
  accessor: string;
  className?: string;
}
```

Generic table with header row and custom row renderer.

### Pagination

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

Smart pagination with ellipsis for large ranges, prev/next buttons.

### TableSearch

```typescript
interface TableSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}
```

Search input with magnifying glass icon.

## Layout Components

### Menu (Sidebar)

Client component. Role-based menu items:

| Menu Item | Visible To |
|-----------|------------|
| Inicio | All roles |
| Profesores | admin, dean |
| Estudiantes | admin, teacher, dean |
| Proyectos de Grado | All roles |
| Eventos | teacher, dean, admin |
| Primer .xlsx | teacher, dean, admin |

Sections: MENÚ, PROYECCIÓN SOCIAL, CONFIGURACIÓN.

### Navbar

Client component. Displays:
- User info (name, email, avatar)
- Search bar
- Message/Announcement icons with badges
- Logout dropdown with SweetAlert2 confirmation

### ProtectedRoute

HOC wrapping dashboard layout. Checks `TokenManager.isAuthenticated()`, shows loading spinner while checking, redirects to `/sign-in` if unauthenticated.

### RoleProtectedRoute

HOC with props:
- `allowedRoles: UserRole[]` — permitted roles
- `redirectTo?: string` — redirect path (default: role-based dashboard)

Shows "Access Denied" screen if role not in allowed list.

## Shared Types

```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

interface BulkUploadRowResult {
  row: number;
  status: 'success' | 'error';
  title?: string;
  messages: string[];
}

interface BulkUploadSummary {
  totalRows: number;
  imported: number;
  failed: number;
  rows: BulkUploadRowResult[];
}
```

## shadcn/ui Components

Auto-generated primitives in `components/ui/`. **Do NOT edit manually**, use `npx shadcn@latest add <component>`.

Installed components include Radix-based: checkbox, collapsible, label, scroll-area, separator, slot, tooltip, and more.
