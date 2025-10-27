import { checkSchema, validationResult, Schema } from "express-validator";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { logger } from "../../config";

declare global {
  namespace Express {
    interface Request {
      budgetId?: number; // Fixed typo: was "butgetId"
      // expenseId?: number;
      validatedData?: any;
    }
  }
}

export const validateSchema = (schema: Schema): RequestHandler[] => [
  ...checkSchema(schema),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      logger.warn("Validation error: ", errors.array());
      return;
    }
    next();
  },
];
