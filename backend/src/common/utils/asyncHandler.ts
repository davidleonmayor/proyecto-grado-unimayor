import type { Request, Response, NextFunction } from "express";

/**
 * Wrapper para manejar errores en funciones async
 * Evita tener que usar try-catch en cada controlador
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
