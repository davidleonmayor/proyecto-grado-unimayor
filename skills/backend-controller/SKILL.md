# Backend Controller

## Overview
This skill defines the convention for backend controller classes. Controllers should be **thin** - their only job is to parse the request, call the appropriate service, and format the response. All validation and auth logic belongs elsewhere.

## Trigger
When creating or updating controller classes for backend features (e.g., `auth.controller.ts`, `messaging.controller.ts`, `project.controller.ts`).

## Do's

- **Thin Controller**: Controllers should only handle HTTP concerns (parse request, call service, format response). All business logic goes in the Service layer.
- **Use Services**: Inject and use Service classes to perform business operations. Do NOT call `prisma` directly from controllers (except for simple read-only queries that are tightly coupled to the HTTP response).
- **Extract Body Data**: Destructure `req.body` to get input parameters.
- **Access Auth User**: Use `req.user` directly (after middleware has validated auth). Do NOT check if `req.user` exists - that's the middleware's job.
- **Return Proper HTTP Status Codes**: Use correct status codes (201 for created, 200 for ok, 401 for unauthorized, 404 for not found, 409 for conflict, 500 for errors).
- **Handle Errors**: Wrap controller logic in try-catch. Return user-friendly error messages. Use `next(error)` for unexpected errors to let the global error handler deal with them.
- **Type Safety**: Use proper TypeScript types for `Request`, `Response`, and custom interface types. Avoid `(req as any)`.
- **Use Custom Request Interface**: Define a custom interface that extends Express's Request to include custom properties like `user`.

## Don'ts

- **Don't Validate Data Types/Lengths/Formats**: That's the Schema's job (using `express-validator`). If a field is missing or invalid, the schema validation middleware will reject it before the controller runs.
- **Don't Check Authentication**: Do NOT check `if (!req.user)` or `if (!req.headers.authorization)`. That's the AuthMiddleware's job. If the request reached the controller, the user is authenticated.
- **Don't Check Authorization Roles**: Do NOT check `if (req.user.role === 'admin')`. That's the RoleMiddleware's job.
- **Don't Use `console.log/error`**: Use the `logger` from `config/` or simply omit logging in controllers (services should handle logging).
- **Don't Call Prisma Directly**: Except for simple queries tightly coupled to the response. Use Services for business logic.
- **Don't Re-validate Business Rules That Are Already Validated**: Don't check `if (!email)` or `if (password.length < 8)` - the schema already did this.
- **Don't Mix Responsibilities**: A controller method should do ONE thing: extract data → call ONE service method → return response.

## Example Structure

### ✅ GOOD - Thin Controller

```typescript
import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
    this.register = this.register.bind(this);
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extract data from body (already validated by schema)
      const { names, lastNames, email, password } = req.body;

      // 2. Check business rule (NOT data validation)
      const existingPersona = await this.authService.findUserByEmail(email);
      if (existingPersona) {
        return res.status(409).json({
          error: "El usuario ya existe",
        });
      }

      // 3. Call service
      const persona = await this.authService.createUser(
        names,
        lastNames,
        email,
        password,
      );

      // 4. Return response
      return res.status(201).json({
        message: "Usuario creado correctamente",
        user: persona,
      });
    } catch (error: any) {
      console.error("Error en register:", error);
      return res.status(500).json({
        error: error.message || "Ocurrió un error interno al registrar el usuario.",
      });
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      // req.user is guaranteed to exist - middleware handled auth
      const { password: _, ...safeUser } = req.user;
      return res.json(safeUser);
    } catch (error) {
      next(error);
    }
  }
}
```

### ❌ BAD - Fat Controller (What NOT to Do)

```typescript
// ❌ BAD: Re-validating data that schema already validated
async register(req: Request, res: Response, next: NextFunction) {
  const { names, email, password } = req.body;

  // This is WRONG - schema already validated this!
  if (!names || names.length < 1) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password too short" });
  }
  // ...
}

// ❌ BAD: Checking auth that middleware already handled
async getUser(req: Request, res: Response, next: NextFunction) {
  // This is WRONG - middleware already checked this!
  if (!req.user) {
    return res.status(401).json({ error: "No autorizado" });
  }
  // ...
}

// ❌ BAD: Calling prisma directly instead of using service
async updateProfile(req: Request, res: Response) {
  const { id_persona } = req.user;
  const { name, email } = req.body;

  // This is WRONG - should use service
  await prisma.persona.update({
    where: { id_persona },
    data: { nombres: name, correo_electronico: email },
  });
}
```

## Request Flow (Correct Order)

```
Request → [validateSchema] → [authMiddleware] → [roleMiddleware] → Controller → Service → Prisma
              ↑                         ↑                    ↑
         backend-schema          backend-router       backend-router
         (validates data)        (validates auth)      (validates roles)
```

## Controller Responsibilities by Layer

| What | Where |
|------|-------|
| Data type/length validation | `backend-schema` (express-validator) |
| Authentication check | `AuthMiddleware` (backend-router) |
| Authorization/Role check | RoleMiddleware (backend-router) |
| Business logic | `backend-service` |
| HTTP Response | Controller (this skill) |

## Custom Request Interface Example

```typescript
// src/auth/interfaces/authRequest.interface.ts
import type { Request } from "express";
import type { persona } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: Partial<persona>;
}

// Usage in controller
async register(req: AuthRequest, res: Response) {
  // req.user is properly typed now
}
```

## Error Handling in Controllers

```typescript
async someEndpoint(req: Request, res: Response, next: NextFunction) {
  try {
    // Business logic
    const result = await this.service.doSomething();
    
    return res.status(200).json(result);
  } catch (error: any) {
    // For known business errors (from service)
    if (error.message.includes("Business error")) {
      return res.status(400).json({ error: error.message });
    }
    
    // For unexpected errors - let global handler deal with it
    next(error);
  }
}
```

## Summary: What Belongs in Controller

✅ **DO:**
- Extract `req.body` data
- Use `req.user` (trust the middleware)
- Call service methods
- Return HTTP responses with proper status codes
- Handle errors and return user-friendly messages

❌ **DON'T:**
- Validate data types, lengths, formats (use schema)
- Check if user is authenticated (use middleware)
- Check user roles (use middleware)
- Call prisma directly for business logic (use service)
- Log with console.log (services handle logging)
