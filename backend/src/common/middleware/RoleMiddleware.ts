import type { Request, Response, NextFunction } from "express";
import { prisma, logger } from "../../config";

// List of privileged role names
const PRIVILEGED_ROLES = ["Director", "Jurado", "Coordinador de Carrera", "Decano"];
// Admin role names
const ADMIN_ROLES = ["admin", "Administrador", "Admin"];
// Coordinator role names
const COORDINATOR_ROLES = ["Coordinador de Carrera", "Coordinador"];

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

    /**
     * Verifies if the authenticated user has an admin role
     */
    public async isAdmin(
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

            // Check if user has any admin role
            const hasAdminRole = userRoles.some(actor =>
                ADMIN_ROLES.includes(actor.tipo_rol.nombre_rol)
            );

            if (!hasAdminRole) {
                logger.warn(`Access denied for user ${userId}: No admin role`);
                return res.status(403).json({
                    success: false,
                    message: "No tienes permisos de administrador para realizar esta acción"
                });
            }

            logger.debug(`Admin access granted for user ${userId}`);
            next();
        } catch (error: any) {
            logger.error(`Error in RoleMiddleware: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: "Error verificando permisos"
            });
        }
    }

    /**
     * Verifies if the authenticated user has a coordinator role
     */
    public async isCoordinator(
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

            // Check if user has any coordinator role
            const hasCoordinatorRole = userRoles.some(actor =>
                COORDINATOR_ROLES.includes(actor.tipo_rol.nombre_rol)
            );

            if (!hasCoordinatorRole) {
                logger.warn(`Access denied for user ${userId}: No coordinator role`);
                return res.status(403).json({
                    success: false,
                    message: "Solo los coordinadores pueden crear o modificar eventos"
                });
            }

            logger.debug(`Coordinator access granted for user ${userId}`);
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
