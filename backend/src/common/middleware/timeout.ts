import type { Request, Response, NextFunction } from "express";
import { logger } from "../../config";

/**
 * Middleware para establecer un timeout en las peticiones
 * Evita que las peticiones se queden colgadas indefinidamente
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Establecer timeout en la request
    req.setTimeout(timeoutMs);

    // Establecer timeout en la response
    res.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        logger.error(
          `Request timeout after ${timeoutMs}ms: ${req.method} ${req.path}`
        );
        res.status(408).json({
          success: false,
          error: "Request timeout",
          message: "La solicitud tardó demasiado tiempo en procesarse",
        });
      }
    });

    next();
  };
};
