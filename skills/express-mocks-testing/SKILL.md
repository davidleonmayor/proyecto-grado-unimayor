---
name: express-mocks-testing
description: >
  Unit testing pattern for Express 5 controllers using node-mocks-http and @prisma/client mocks.
  Trigger: When writing unit tests for backend controllers, testing Express routes, or avoiding Supertest/Server instantiation.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- When unit testing Express 5 controllers in isolation without starting the server.
- When you want to completely decouple from a real database.
- When testing specific logic, role filters, or validation branches inside a controller.
- **Do NOT use this for** End-to-End (E2E) integration tests that genuinely require testing the full middleware chain (CORS, body-parser, global error handlers). For E2E, use Supertest.

## Critical Patterns

- **NEVER instantiate the full Server:** Do not import or instantiate `new Server()` or `app` from `server.ts`. It causes slow tests and port conflicts.
- **Global Prisma Mock:** Always use `jest.mock("@prisma/client", () => { ... })` to intercept Prisma Client instantiations before the controller executes.
- **Isolate Request/Response:** Use `createRequest` and `createResponse` from `node-mocks-http` to simulate Express objects.
- **Call Controller Directly:** Invoke the controller method directly (e.g., `await controller.sendMessage(req, res)`).
- **Clear Mocks:** Always run `jest.clearAllMocks()` in the `beforeEach` hook.
- **Assertions:** Use `res._getJSONData()` to verify JSON responses and `res.statusCode` to check HTTP statuses.

## Code Examples

### Basic Controller Test Setup

```typescript
import { createRequest, createResponse } from "node-mocks-http";
import { MyController } from "../my.controller";
import { PrismaClient } from "@prisma/client";

// 1. MOCK PRISMA GLOBALLY
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prismaMock = new PrismaClient() as jest.Mocked<any>;

describe("MyController", () => {
  let controller: MyController;

  beforeAll(() => {
    controller = new MyController();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUser", () => {
    it("should return 200 and the user data", async () => {
      // Arrange
      const req = createRequest({
        method: "GET",
        url: "/api/users/1",
        params: { id: "1" },
        user: { id_persona: "admin-123" } // If testing protected routes
      });
      const res = createResponse();

      prismaMock.user.findUnique.mockResolvedValue({ id: "1", name: "John" });

      // Act
      await controller.getUser(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().name).toBe("John");
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: "1" }
      });
    });
  });
});
```

## Commands

```bash
# Run backend tests
pnpm test

# Run specific test file
pnpm jest path/to/your/controller.test.ts
```
