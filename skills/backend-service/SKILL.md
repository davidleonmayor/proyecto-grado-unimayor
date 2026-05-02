# Backend Service

## Overview
This skill defines the convention for backend service classes that interact with external resources (Database, Email, Redis, Webhooks, External APIs, etc.). Services encapsulate business logic and data access, keeping controllers thin and focused on HTTP concerns.

## Trigger
When creating or updating service classes for backend features (e.g., `auth.service.ts`, `webhook.service.ts`, `email.service.ts`).

## Do's

- **Use Classes**: Define services as classes (e.g., `AuthService`, `WebhookService`). Export a single class per file.
- **Singleton or Instance**: For database services, import `prisma` singleton from `../config/prisma`. For external services, initialize in constructor or import configured clients.
- **Try-Catch Every Public Method**: Wrap ALL external calls (DB, API, Email) in `try-catch` blocks. Log the raw error with context and throw a user-friendly error message.
- **Use Logger**: Import `logger` from `../config` and log errors properly: `logger.error("Error doing X:", error)`. Never use `console.log` or `console.error` in production code.
- **Specific Error Messages**: Throw errors with clear, user-facing messages in Spanish. For known error codes (like Prisma's `P2002`), check `error.code` and provide specific messages.
- **Async/Await**: Use `async/await` for all methods that perform I/O operations. Mark method signatures with `async` and return `Promise<T>`.
- **Single Responsibility**: A service method should do ONE thing (e.g., `findUserByEmail`, `createUser`). Don't mix concerns.
- **Type Safety**: Define proper return types. If using Prisma, use `Prisma.modelGetPayload<{}>`, `Prisma.modelWhereUniqueInput`, or the resulting model type. Avoid `any`.
- **Dependency Injection**: Receive dependencies (like `prisma`, email clients, redis) via constructor parameters or import them as singletons from `config/`.

## Don'ts

- **Don't handle HTTP/Response logic**: Services must NEVER call `res.status()`, `res.json()`, or send HTTP responses. That's the Controller's job.
- **Don't import Express types**: Services should not import `Request` or `Response` from `express`.
- **Don't have empty catch blocks**: Always log the error and re-throw (or throw a new meaningful error).
- **Don't return `any` type**: Define proper return types. Use TypeScript strict mode.
- **Don't put validation logic**: Data validation (types, lengths, formats) belongs in `*.schema.ts` (using `express-validator`), not in the service.
- **Don't use `console.log/error`**: Always use the `logger` from `config/`.
- **Don't mix service types**: A service should focus on ONE type of external resource (DB, Email, Redis). Don't mix DB calls with email sending in the same method unless it's orchestration.

## Example Structure

### Database Service (e.g., AuthService)

```typescript
import { prisma } from "../config/prisma";
import { logger } from "../config";
import type { Prisma } from "@prisma/client";

export class AuthService {
  /**
   * Creates a new user in the database.
   * @param email - User's email address
   * @param password - Plain text password (will be hashed)
   * @returns The created user object
   */
  async createUser(email: string, password: string): Promise<Prisma.personaGetPayload<{}>> {
    try {
      const hashedPassword = await hashPassword(password);
      
      const user = await prisma.persona.create({
        data: {
          correo_electronico: email.toLowerCase().trim(),
          password: hashedPassword,
          // ... other fields
        },
      });
      
      return user;
    } catch (error: any) {
      logger.error("Error al crear usuario:", error);
      
      // Handle specific Prisma errors
      if (error.code === "P2002") {
        throw new Error("El correo electrónico ya está registrado.");
      }
      
      throw new Error("Error al crear el usuario en la base de datos.");
    }
  }

  /**
   * Finds a user by their email address.
   * @param email - Email to search for
   * @returns User object or null if not found
   */
  async findUserByEmail(email: string): Promise<Prisma.personaGetPayload<{}> | null> {
    try {
      return await prisma.persona.findUnique({
        where: { correo_electronico: email },
      });
    } catch (error) {
      logger.error("Error al buscar usuario por email:", error);
      throw new Error("Error al consultar el usuario en la base de datos.");
    }
  }
}
```

### External Service (e.g., WebhookService, EmailService)

```typescript
import { logger } from "../config";
import { prisma } from "../config/prisma";
import type { WebhookSubscription } from "@prisma/client";

export class WebhookService {
  private readonly timeout: number = 5000;

  /**
   * Dispatches an event to all active webhook subscriptions.
   * @param topic - The event topic (e.g., "MESSAGE_CREATED")
   * @param payload - The event payload to send
   */
  async dispatch(topic: string, payload: Record<string, unknown>): Promise<void> {
    try {
      const subscriptions = await prisma.webhook_subscription.findMany({
        where: { topic, is_active: true },
      });

      if (subscriptions.length === 0) {
        logger.info(`[WebhookService] No active subscriptions for topic: ${topic}`);
        return;
      }

      logger.info(`[WebhookService] Dispatching ${topic} to ${subscriptions.length} subscribers`);

      // Fire and forget with error handling
      for (const sub of subscriptions) {
        this.sendPayload(sub.url, payload, sub.secret).catch((err) => {
          logger.error(`[WebhookService] Failed to dispatch to ${sub.url}:`, err);
        });
      }
    } catch (error) {
      logger.error("[WebhookService] Error fetching subscriptions:", error);
    }
  }

  private async sendPayload(
    url: string,
    payload: Record<string, unknown>,
    secret: string | null,
  ): Promise<void> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "GestionProyectos-Webhook-Dispatcher/1.0",
    };

    if (secret) {
      headers["X-Webhook-Secret"] = secret;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        // Consider adding timeout via AbortController in production
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      logger.info(`[WebhookService] Successfully delivered to ${url}`);
    } catch (error) {
      logger.error(`[WebhookService] Failed to send to ${url}:`, error);
      throw error; // Re-throw for the caller's catch
    }
  }
}
```

## Method Naming Conventions

| Operation | Naming Pattern | Example |
|-----------|----------------|---------|
| Create | `create<Resource>` | `createUser`, `createMessage`, `sendEmail` |
| Read (one) | `find<Resource>By<Field>` | `findUserByEmail`, `findUserById` |
| Read (many) | `list<Resources>` or `get<Resources>` | `listActiveUsers`, `getInboxMessages` |
| Update | `update<Resource>` | `updatePerson`, `updatePassword` |
| Delete | `delete<Resource>` or `softDelete<Resource>` | `softDeleteMessage` |
| Check/Verify | `is<Condition>` or `check<Thing>` | `isEmailTaken`, `checkPassword` |
| Dispatch/Send | `dispatch<Event>` or `send<Thing>` | `dispatchWebhook`, `sendEmail` |

## Error Handling Pattern

```typescript
try {
  // External call (DB, API, etc.)
  return await externalCall();
} catch (error: any) {
  logger.error("Context-specific error message:", error);
  
  // Optional: Handle specific error codes
  if (error.code === "P2002") {
    throw new Error("User-friendly message for this specific case.");
  }
  
  // Generic fallback
  throw new Error("Error al realizar la operación en la base de datos.");
}
```

## Database Services vs External Services

### Database Services (e.g., AuthService, MessagingService)
- Import `prisma` from `config/prisma` (singleton)
- Use Prisma Client methods (`create`, `findUnique`, `update`, `delete`, `findMany`)
- Handle Prisma error codes (`P2002`, `P2025`, `P2003`)
- Return Prisma model types or typed results
- Always use `async/await` for DB calls

### External Services (e.g., WebhookService, EmailService)
- Import external clients from `config/` or initialize them in constructor
- Handle API errors, timeouts, network errors
- Log with context about the external service
- Return simple success/failure or parsed response data
- Consider retry logic or queue systems for resiliency
- Use `AbortController` for fetch timeouts in production

## Logging Best Practices

```typescript
// ✅ GOOD - With context
logger.error(`Error updating user ${userId}:`, error);
logger.info(`[WebhookService] Dispatched event to ${url}`);

// ❌ BAD - No context
console.log(error);
console.error("Error occurred");
```

