import type { Request, Response, NextFunction } from "express";
import { logger } from "../../config";
import { Prisma } from "@prisma/client";

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    error: "Ruta no encontrada",
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    path: req.originalUrl,
  });
};

/**
 * Middleware global de manejo de errores
 * DEBE ir al final de todas las rutas
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Evitar múltiples respuestas
  if (res.headersSent) {
    return next(err);
  }

  // Log del error
  logger.error(`Error en ${req.method} ${req.path}:`, {
    message: err.message,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Errores de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err, res);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: "Error de validación",
      message: "Los datos proporcionados no son válidos",
    });
  }

  // Errores de validación de express-validator
  if (err.array && typeof err.array === "function") {
    return res.status(400).json({
      success: false,
      error: "Error de validación",
      errors: err.array(),
    });
  }

  // Errores de JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Token inválido",
      message: "El token de autenticación no es válido",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expirado",
      message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente",
    });
  }

  // Errores de sintaxis JSON
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      error: "JSON inválido",
      message: "El cuerpo de la petición contiene JSON mal formado",
    });
  }

  // Error genérico
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    error: err.name || "Error del servidor",
    message: err.message || "Ha ocurrido un error inesperado",
    ...(!isProduction && err.stack && { stack: err.stack }),
  });
};

/**
 * Maneja errores específicos de Prisma
 */
function handlePrismaError(
  err: Prisma.PrismaClientKnownRequestError,
  res: Response
) {
  switch (err.code) {
    case "P2002":
      // Unique constraint violation
      const field = (err.meta?.target as string[])?.[0] || "campo";
      return res.status(409).json({
        success: false,
        error: "Conflicto de duplicado",
        message: `El ${field} ya está en uso`,
      });

    case "P2025":
      // Record not found
      return res.status(404).json({
        success: false,
        error: "No encontrado",
        message: "El registro solicitado no existe",
      });

    case "P2003":
      // Foreign key constraint violation
      return res.status(400).json({
        success: false,
        error: "Error de relación",
        message: "La operación viola una restricción de integridad",
      });

    case "P2014":
      // Required relation missing
      return res.status(400).json({
        success: false,
        error: "Relación requerida",
        message: "Falta una relación requerida en los datos",
      });

    default:
      logger.error(`Unhandled Prisma error code: ${err.code}`);
      return res.status(500).json({
        success: false,
        error: "Error de base de datos",
        message: "Ha ocurrido un error al procesar la solicitud",
      });
  }
}
