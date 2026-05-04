# Backend Router (Express.js)

## Overview

This skill defines the convention for declaring Express.js routers using an Object-Oriented approach.

## Trigger

When creating or updating route definitions for a backend feature.

## Do's

- **Use Classes**: Define routes inside a class (e.g., `FeatureRoutes`).
- **Encapsulate Router**: Expose a `public router: Router` property initialized in the constructor with `Router()`.
- **Instantiate Dependencies**: Initialize the respective `Controller` and any specific `Middleware` inside the constructor.
- **`initRoutes()` Method**: Bind all routes in a dedicated `initRoutes()` method called from the constructor.
- **Middleware Execution Order**: ALWAYS place `validateSchema` as the FIRST middleware in the route chain, BEFORE `isAuthenticatedUser`, `isConfirmed`, or any role checks. This ensures the payload and headers (like the authorization token) are structurally valid before running auth queries.
- **Controller Binding**: Pass the controller method reference directly (e.g., `this.controller.methodName`). Ensure the controller constructor binds its methods (`this.methodName = this.methodName.bind(this)`).

## Don'ts

- **Don't use inline `.bind()` in the router**: Never do `this.controller.create.bind(this.controller)` inside the router definition. The router should look extremely clean (see Example Structure). Method binding MUST happen inside the Controller's constructor.
- **Don't use functional routers**: Avoid top-level `const router = Router(); export default router;`. Stick to the Class structure.
- **Don't define inline route handlers**: Do not put business or response logic directly in the `.post()` or `.get()` callback. Always delegate to the Controller.
- **Don't mix schema logic in the router**: Validation schemas must be imported from the respective `*.schema.ts` file.

## Example Structure

- Always validate input data first with validateSchema() to prevent the passage of malformed or malicious data.
- If necessary, then use the authentication and/or user role middleware; the authentication middleware should come first, followed by the user role.
- Finally goes the controller to manage only the busines logic

```typescript
import { Router } from "express";
import { FeatureController } from "./feature.controller";
import { validateSchema } from "../common/middleware/validateSchema";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { CreateFeatureSchema } from "./feature.schema";

export class FeatureRoutes {
  public router: Router;
  private controller: FeatureController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.controller = new FeatureController();
    this.authMiddleware = new AuthMiddleware();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post(
      "/",
      validateSchema(CreateFeatureSchema),
      this.controller.create,
    );

    this.router.get(
      "/",
      validateSchema(CreateFeatureSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getAll,
    );
  }
}
```

## Don't do

- don't

```typescript
import { Router } from "express";
import { FeatureController } from "./feature.controller";
import { validateSchema } from "../common/middleware/validateSchema";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { CreateFeatureSchema } from "./feature.schema";

export class FeatureRoutes {
  public router: Router;
  private controller: FeatureController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.controller = new FeatureController();
    this.authMiddleware = new AuthMiddleware();
    this.initRoutes();
  }

  // don't use validateSchema before enyting, Alwais validale schema goes first
  initRoutes() {
    this.router.post(
      "/",
      this.controller.create,
      validateSchema(CreateFeatureSchema),
    );

    // don't use, Allwais goes auth middlewares after validate schema
    this.router.get(
      "/",
      validateSchema(CreateFeatureSchema),
      this.controller.getAll,
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
    );
  }
}
```
