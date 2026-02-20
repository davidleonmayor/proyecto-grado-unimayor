# Auth Module — `modules/auth/`

Authentication module: hooks, services, types, and page flows.

## References

| Resource | Description | Path |
|----------|-------------|------|
| Token Manager | JWT storage & decode | `frontend/shared/lib/auth/token-manager.ts` |
| Protected Route | Auth HOC for dashboard | `frontend/shared/components/layout/ProtectedRoute.tsx` |
| Role Protected Route | Role-based HOC | `frontend/shared/components/layout/RoleProtectedRoute.tsx` |
| useUserRole | Role determination hook | `frontend/shared/hooks/useUserRole.ts` |
| Sign In page | Login form | `frontend/app/sign-in/page.tsx` |
| Register page | Registration form | `frontend/app/register/page.tsx` |
| Confirm Account page | Token confirmation | `frontend/app/confirm-account/page.tsx` |
| Forgot Password page | Email input | `frontend/app/forgot-password/page.tsx` |
| Reset Password page | New password form | `frontend/app/reset-password/[token]/page.tsx` |

## Directory Structure

```
modules/auth/
├── index.ts                    # Barrel exports
├── hooks/
│   └── useAuth.ts              # Auth state & actions hook
├── services/
│   └── auth.service.ts         # API calls extending BaseApiClient
└── types/
    └── index.ts                # User, RegisterData, LoginCredentials
```

## Service — `AuthService`

Extends `BaseApiClient`. Singleton exported as `authService`.

### Public Endpoints (no auth required)

| Method | API Call | Description |
|--------|----------|-------------|
| `register(data)` | POST `/api/auth/register` | Create account, returns confirmation token |
| `confirmAccount(token)` | POST `/api/auth/confirm-account` | Confirm with 6-digit token |
| `login(credentials)` | POST `/api/auth/login` | Returns JWT as plain string |
| `forgotPassword(email)` | POST `/api/auth/forgot-password` | Sends reset email |
| `validateToken(token)` | POST `/api/auth/validate-token` | Check if reset token is valid |
| `resetPassword(token, password)` | POST `/api/auth/{token}/reset-password` | Set new password |

### Private Endpoints (require auth)

| Method | API Call | Description |
|--------|----------|-------------|
| `getCurrentUser()` | GET `/api/auth/user` | Get current user (excludes password) |
| `updatePassword(current, new)` | PUT `/api/auth/update-password` | Change password |

## Hook — `useAuth()`

Client-side hook providing auth state and actions.

**State:**

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current authenticated user |
| `loading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `isAuth` | `boolean` | Whether user is authenticated |

**Actions:**

| Method | Description |
|--------|-------------|
| `login(email, password)` | Authenticate and redirect to role-based dashboard |
| `register(data)` | Register new user, returns token string |
| `confirmAccount(token)` | Confirm account, redirects to sign-in |
| `logout()` | Clear token, redirect to sign-in |

**Role-based routing (login/root page):**

```
Login success
  ↓
Fetch user projects
  ↓
Has privileged role? (Director, Jurado, Coordinador de Carrera, Decano)
├─ Yes, is Dean → /dean
├─ Yes, can access admin stats → /admin
├─ Yes, other → /teacher
└─ No (all projects as Estudiante) → /student
    └─ Default fallback → /teacher
```

## Types

```typescript
interface User {
  id_persona: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  numero_celular: string;
  num_doc_identidad: string;
}

interface RegisterData {
  names: string;
  lastNames: string;
  typeOfDentityDocument: string;
  idDocumentNumber: string;
  phoneNumber: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}
```

## Token Manager

Singleton class in `shared/lib/auth/token-manager.ts`:

```typescript
class TokenManager {
  static setToken(token: string): void       // localStorage
  static getToken(): string | null
  static removeToken(): void
  static isAuthenticated(): boolean
  static decodeToken(token: string): JWTPayload | null
  static getUserFromToken(): JWTPayload | null
  static getUserId(): string | null
  static getUserEmail(): string | null
}

interface JWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}
```

## Auth Pages

### Sign In (`/sign-in`)
- Form: email, password
- Uses `useAuth().login()`
- SweetAlert2 for notifications
- Links to register and forgot-password

### Register (`/register`)
- Form: names, lastNames, documentType (select), documentNumber, phone, email, password, confirmPassword
- Password strength meter (weak → medium → good → excellent)
- Strength checks: length ≥ 8, lowercase, uppercase, numbers, special chars
- On success → redirects to `/confirm-account?token={token}`

### Confirm Account (`/confirm-account`)
- 6-character token input (uppercase, alphanumeric)
- Pre-fills from URL params
- On success → redirects to `/sign-in`

### Forgot Password (`/forgot-password`)
- Single email input
- Extracts 6-char token from response
- On success → redirects to `/reset-password/{token}`

### Reset Password (`/reset-password/[token]`)
- Dynamic route with token parameter
- Password + confirm password with strength meter
- On success → redirects to `/sign-in`

## Roles & Access Control

### useUserRole Hook

```typescript
type UserRole = 'student' | 'teacher' | 'admin' | 'dean' | null;
```

Determines role by fetching user's projects and checking role strings:

| Priority | Role | Condition |
|----------|------|-----------|
| 1 | `dean` | Has role "Decano" in any project |
| 2 | `admin` | Has privileged role (Director, Jurado, Coordinador de Carrera) |
| 3 | `teacher` | Has projects but no privileged role |
| 4 | `student` | All projects have role "Estudiante" |

### ProtectedRoute

HOC that wraps dashboard layout. Checks `TokenManager.isAuthenticated()`, redirects to `/sign-in` if unauthenticated.

### RoleProtectedRoute

HOC with props: `allowedRoles: UserRole[]`, `redirectTo?: string`. Shows "Access Denied" if role not in allowed list.

## Authentication Flow

```
User fills login form
  ↓
useAuth().login(email, password)
  ↓
authService.login({email, password})
  ↓
BaseApiClient.request(POST /api/auth/login)
  ↓
Token saved to localStorage via TokenManager.setToken()
  ↓
authService.getCurrentUser() fetches user data
  ↓
useAuth sets user state
  ↓
Router pushes to role-based dashboard route
```
