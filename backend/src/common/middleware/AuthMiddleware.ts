import type { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

import { envs, prisma, logger } from "../../config";

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}

export class AuthMiddleware {
  public async isAuthenticatedUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // 1. Verificar que existe el header Authorization
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        logger.warn("Authentication attempt without Authorization header");
        return res.status(401).json({
          success: false,
          error: "No autorizado",
          message: "Token de autenticación no proporcionado",
        });
      }

      // 2. Verificar formato Bearer token
      if (!authHeader.startsWith("Bearer ")) {
        logger.warn("Invalid Authorization header format");
        return res.status(401).json({
          success: false,
          error: "No autorizado",
          message: "Formato de token inválido. Use: Bearer <token>",
        });
      }

      // 3. Extraer token
      const token = authHeader.split(" ")[1];

      if (!token || token.trim() === "") {
        logger.warn("Empty token provided");
        return res.status(401).json({
          success: false,
          error: "No autorizado",
          message: "Token vacío",
        });
      }

      // 4. Verificar y decodificar token
      let decoded: any;
      try {
        decoded = jwt.verify(token, envs.JWT_SECRET);
      } catch (jwtError: any) {
        logger.warn(`JWT verification failed: ${jwtError.message}`);

        if (jwtError.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            error: "Token expirado",
            message:
              "Tu sesión ha expirado. Por favor, inicia sesión nuevamente",
          });
        }

        if (jwtError.name === "JsonWebTokenError") {
          return res.status(401).json({
            success: false,
            error: "Token inválido",
            message: "El token proporcionado no es válido",
          });
        }

        return res.status(401).json({
          success: false,
          error: "Error de autenticación",
          message: "Error al verificar el token",
        });
      }

      // 5. Verificar que el token contiene un ID
      if (!decoded || !decoded.id) {
        logger.warn("Token does not contain user ID");
        return res.status(401).json({
          success: false,
          error: "Token inválido",
          message: "El token no contiene información de usuario",
        });
      }

      // 6. Buscar usuario en la base de datos
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          confirmed: true,
          password: true,
          token: true, // AGREGAR
          createdAt: true,
          updatedAt: true, // AGREGAR
        },
      });

      if (!user) {
        logger.warn(`User not found for token: ${decoded.id}`);
        return res.status(404).json({
          success: false,
          error: "Usuario no encontrado",
          message: "El usuario asociado al token no existe",
        });
      }

      // 7. Verificar que la cuenta esté confirmada
      if (!user.confirmed) {
        logger.warn(`Unconfirmed account access attempt: ${user.email}`);
        return res.status(403).json({
          success: false,
          error: "Cuenta no confirmada",
          message: "Debes confirmar tu cuenta antes de continuar",
        });
      }

      // 8. Adjuntar usuario al request
      req.user = user;

      logger.debug(`User authenticated: ${user.email}`);
      next();
    } catch (error: any) {
      logger.error(`Authentication middleware error: ${error.message}`, error);

      // Evitar enviar respuesta si ya se envió
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: "Error del servidor",
          message: "Error al procesar la autenticación",
        });
      }
    }
  }
}
