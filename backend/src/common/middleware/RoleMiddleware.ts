import type { Request, Response, NextFunction } from "express";
import { prisma, logger } from "../../config";

// List of privileged role names
const PRIVILEGED_ROLES = ["Director", "Jurado", "Coordinador de Carrera", "Decano"];

export class RoleMiddleware {
    /**
     * Verifies if the authenticated user has a privileged role
     */
    public async isPrivilegedUser(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userId = req.user?.id_persona;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            // Get user's roles from actores table
            const userRoles = await prisma.actores.findMany({
                where: { id_persona: userId },
                include: { tipo_rol: true }
            });

            // Check if user has any privileged role
            const hasPrivilegedRole = userRoles.some(actor =>
                PRIVILEGED_ROLES.includes(actor.tipo_rol.nombre_rol)
            );

            if (!hasPrivilegedRole) {
                logger.warn(`Access denied for user ${userId}: No privileged role`);
                return res.status(403).json({
                    success: false,
                    message: "No tienes permisos para realizar esta acción"
                });
            }

            logger.debug(`Privileged access granted for user ${userId}`);
            next();
        } catch (error: any) {
            logger.error(`Error in RoleMiddleware: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: "Error verificando permisos"
            });
        }
    }
}
