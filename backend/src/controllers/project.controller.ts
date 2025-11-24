import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";

const prisma = new PrismaClient();

// Configure multer for memory storage (files as buffer)
const storage = multer.memoryStorage();
export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export class ProjectController {

    // Get projects based on user role
    async getProjects(req: Request, res: Response) {
        try {
            const userId = req.user?.id_persona;
            if (!userId) return res.status(401).json({ error: "No autorizado" });

            // Get user roles
            const user = await prisma.persona.findUnique({
                where: { id_persona: userId },
                include: {
                    actores: {
                        include: {
                            tipo_rol: true,
                            trabajo_grado: {
                                include: {
                                    estado_tg: true,
                                    opcion_grado: true
                                }
                            }
                        }
                    }
                }
            });

            if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

            // Map projects from actor relationships
            const projects = user.actores.map(actor => ({
                id: actor.trabajo_grado.id_trabajo_grado,
                title: actor.trabajo_grado.titulo_trabajo,
                status: actor.trabajo_grado.estado_tg.nombre_estado,
                role: actor.tipo_rol.nombre_rol,
                modality: actor.trabajo_grado.opcion_grado.nombre_opcion_grado,
                lastUpdate: actor.trabajo_grado.fecha_registro // Should be last update
            }));

            // TODO: For privileged users (Decano, Coordinador), fetch ALL projects, not just assigned ones
            // This logic can be expanded based on specific requirements

            return res.json(projects);

        } catch (error) {
            console.error("Error getting projects:", error);
            return res.status(500).json({ error: "Error al obtener proyectos" });
        }
    }

    // Get project history (iterations)
    async getProjectHistory(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const history = await prisma.seguimiento_tg.findMany({
                where: { id_trabajo_grado: id },
                include: {
                    actores: {
                        include: {
                            persona: true,
                            tipo_rol: true
                        }
                    },
                    accion_seg: true,
                    estado_anterior: true,
                    estado_nuevo: true
                },
                orderBy: { fecha_registro: 'desc' }
            });

            const formattedHistory = history.map(item => ({
                id: item.id_seguimiento,
                date: item.fecha_registro,
                action: item.accion_seg.tipo_accion,
                description: item.resumen,
                user: `${item.actores.persona.nombres} ${item.actores.persona.apellidos}`,
                role: item.actores.tipo_rol.nombre_rol,
                file: item.archivo ? true : false, // Just flag if file exists
                fileName: item.nombre_documento,
                statusChange: item.estado_anterior && item.estado_nuevo ? {
                    from: item.estado_anterior.nombre_estado,
                    to: item.estado_nuevo.nombre_estado
                } : null
            }));

            return res.json(formattedHistory);

        } catch (error) {
            console.error("Error getting history:", error);
            return res.status(500).json({ error: "Error al obtener historial" });
        }
    }

    // Create iteration (Student uploads file)
    async createIteration(req: Request, res: Response) {
        try {
            const { id } = req.params; // Project ID
            const userId = req.user?.id_persona;
            const file = req.file;
            const { description } = req.body;

            if (!userId) return res.status(401).json({ error: "No autorizado" });
            if (!file) return res.status(400).json({ error: "Se requiere un archivo" });

            // Find the actor record for this user and project
            const actor = await prisma.actores.findFirst({
                where: {
                    id_persona: userId,
                    id_trabajo_grado: id
                }
            });

            if (!actor) return res.status(403).json({ error: "No tienes permiso en este proyecto" });

            // Find "Entrega" action type (You might need to seed this or find by name)
            // For now, let's assume we find it by name or create it
            let action = await prisma.accion_seg.findFirst({ where: { tipo_accion: "Entrega de Avance" } });
            if (!action) {
                action = await prisma.accion_seg.create({ data: { tipo_accion: "Entrega de Avance" } });
            }

            // Create tracking record
            // TODO: Upload to Cloudinary instead of saving buffer to DB
            await prisma.seguimiento_tg.create({
                data: {
                    id_trabajo_grado: id,
                    id_actor: actor.id_actor,
                    id_accion: action.id_accion,
                    resumen: description || "Entrega de avance",
                    archivo: Buffer.from(file.buffer) as any, // Convert to Bytes
                    nombre_documento: file.originalname,
                    tipo_documento: file.mimetype
                }
            });

            return res.status(201).json({ message: "Entrega creada exitosamente" });

        } catch (error) {
            console.error("Error creating iteration:", error);
            return res.status(500).json({ error: "Error al crear entrega" });
        }
    }

    // Review iteration (Privileged user comments/changes status)
    async reviewIteration(req: Request, res: Response) {
        try {
            const { id } = req.params; // Project ID
            const userId = req.user?.id_persona;
            const { description, newStatusId } = req.body;

            if (!userId) return res.status(401).json({ error: "No autorizado" });

            const actor = await prisma.actores.findFirst({
                where: {
                    id_persona: userId,
                    id_trabajo_grado: id
                }
            });

            if (!actor) return res.status(403).json({ error: "No tienes permiso en este proyecto" });

            // Get current project status
            const project = await prisma.trabajo_grado.findUnique({
                where: { id_trabajo_grado: id }
            });

            if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });

            // Determine action type
            let actionName = "Revisión de Avance";
            if (newStatusId) {
                // Logic to determine if it's Approval or Rejection could be here
                actionName = "Cambio de Estado";
            }

            let action = await prisma.accion_seg.findFirst({ where: { tipo_accion: actionName } });
            if (!action) {
                action = await prisma.accion_seg.create({ data: { tipo_accion: actionName } });
            }

            // Create tracking record
            await prisma.seguimiento_tg.create({
                data: {
                    id_trabajo_grado: id,
                    id_actor: actor.id_actor,
                    id_accion: action.id_accion,
                    resumen: description,
                    id_estado_anterior: project.id_estado_actual,
                    id_estado_nuevo: newStatusId || undefined
                }
            });

            // Update project status if requested
            if (newStatusId) {
                await prisma.trabajo_grado.update({
                    where: { id_trabajo_grado: id },
                    data: { id_estado_actual: newStatusId }
                });
            }

            return res.status(201).json({ message: "Revisión registrada exitosamente" });

        } catch (error) {
            console.error("Error reviewing iteration:", error);
            return res.status(500).json({ error: "Error al registrar revisión" });
        }
    }

    // Download file
    async downloadFile(req: Request, res: Response) {
        try {
            const { historyId } = req.params;

            const record = await prisma.seguimiento_tg.findUnique({
                where: { id_seguimiento: historyId }
            });

            if (!record || !record.archivo) {
                return res.status(404).json({ error: "Archivo no encontrado" });
            }

            res.setHeader('Content-Type', record.tipo_documento || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${record.nombre_documento}"`);
            res.send(record.archivo);

        } catch (error) {
            console.error("Error downloading file:", error);
            return res.status(500).json({ error: "Error al descargar archivo" });
        }
    }
}
