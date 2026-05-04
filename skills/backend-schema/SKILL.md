# Backend Schema (Express Validator)

## Overview
This skill defines the convention for validating incoming HTTP request data using `express-validator`'s `Schema` objects.

## Trigger
When creating or updating validation schemas for backend API routes.

## Do's
- **Validate Data Strictly**: Ensure all incoming data is strictly validated before reaching the controller. Check for data types (`isString`, `isNumeric`), formats (`isEmail`, `isUUID`, `isDate`), and lengths (`isLength`). Do not let invalid data pass to the controller.
- **Validate Authorization Header**: If the route requires authentication, ALWAYS include the `authorization` header validation in the schema using regex `/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/`.
- **Use `Schema` Object**: Always import `type { Schema } from "express-validator"` and define schemas as plain objects.
- **Export Indiviual Schemas**: Export a separate constant for each endpoint (e.g., `RegisterSchema`, `LoginSchema`).
- **Specify Location (`in`)**: Always define exactly where the field is expected using the `in` property (e.g., `in: ["body"]`, `in: ["params"]`, `in: ["query"]`, `in: ["headers"]`).
- **Explicit Error Messages**: Provide a specific `errorMessage` for every validation rule.
- **Sanitize Data**: Use built-in sanitizers like `trim: true`, `toLowerCase: true`, or `normalizeEmail: true` on relevant string inputs.
- **Custom Validators**: Use `custom: { options: (value, { req }) => ... }` for interdependent fields (like matching passwords).
- **Format Consistency**: Group validations logically: `in`, `exists`, `isString` / `isNumeric`, `isLength`, `matches`, followed by sanitizers.

## Don'ts
- **Don't use array-based chain validation**: Avoid `body('field').isString()`. Stick exclusively to the Schema object approach.
- **Don't omit the `in` property**: Omitting it forces express-validator to check all locations (body, query, params, headers), which is a security/performance risk.
- **Don't place schemas in routers or controllers**: Keep them isolated in a `*.schema.ts` file next to their respective feature.

## Example Structure
```typescript
import type { Schema } from "express-validator";

export const ExampleSchema: Schema = {
  field: {
    in: ["body"],
    exists: { errorMessage: "Field is required" },
    isString: { errorMessage: "Field must be a string" },
    isLength: {
      options: { min: 1, max: 50 },
      errorMessage: "Field must be between 1 and 50 characters",
    },
    trim: true,
  }
};
```
