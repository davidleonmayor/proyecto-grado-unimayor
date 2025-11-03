import type { Request, Response, NextFunction } from "express";
import { type persona as Persona } from "@prisma/client";
import jwt from "jsonwebtoken";

import { envs, prisma, logger } from "../../config";

declare global {
    namespace Express {
        export interface Request {
            user?: Persona;
        }
    }
}

export class AuthMiddleware {
    public async isAuthenticatedUser(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                logger.warn("Intento sin header Authorization");
                return res.status(401).json({
                    success: false,
                    message: "Token de autenticación no proporcionado",
                });
            }

            if (!authHeader.startsWith("Bearer ")) {
                logger.warn("Formato inválido de token");
                return res.status(401).json({
                    success: false,
                    message: "Formato inválido. Use: Bearer <token>",
                });
            }

            const token = authHeader.split(" ")[1];
            if (!token) {
                logger.warn("Token vacío");
                return res.status(401).json({
                    success: false,
                    message: "Token vacío o inválido",
                });
            }

            let decoded: any;
            try {
                decoded = jwt.verify(token, envs.JWT_SECRET);
            } catch (error: any) {
                logger.warn(`Fallo al verificar JWT: ${error.message}`);
                if (error.name === "TokenExpiredError") {
                    return res.status(401).json({
                        success: false,
                        message: "Token expirado. Inicia sesión nuevamente.",
                    });
                }
                return res.status(401).json({
                    success: false,
                    message: "Token inválido o corrupto",
                });
            }

            if (!decoded?.id) {
                logger.warn("Token sin ID de usuario");
                return res.status(401).json({
                    success: false,
                    message: "Token inválido: no contiene usuario",
                });
            }

            // Buscar persona autenticada
            const persona = await prisma.persona.findUnique({
                where: { id_persona: decoded.id },
                select: {
                    id_persona: true,
                    nombres: true,
                    apellidos: true,
                    correo_electronico: true,
                    confirmed: true,
                    token: true,
                    ultimo_acceso: true,
                },
            });

            if (!persona) {
                logger.warn(`No existe persona con ID ${decoded.id}`);
                return res.status(404).json({
                    success: false,
                    message: "Usuario no encontrado",
                });
            }

            if (!persona.confirmed) {
                logger.warn(
                    `Acceso no confirmado: ${persona.correo_electronico}`,
                );
                return res.status(403).json({
                    success: false,
                    message: "Debes confirmar tu cuenta antes de continuar",
                });
            }

            req.user = persona;
            logger.debug(`Autenticado: ${persona.correo_electronico}`);
            next();
        } catch (error: any) {
            logger.error(`Error en AuthMiddleware: ${error.message}`);
            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: "Error interno en autenticación",
                });
            }
        }
    }
}
