import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { logger } from "../config";

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

            logger.info(`Getting projects for user: ${userId}`);

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

            if (!user) {
                logger.warn(`User not found: ${userId}`);
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            logger.info(`User found: ${user.correo_electronico}, Actores count: ${user.actores.length}`);

            // Map projects from actor relationships
            const projects = user.actores.map(actor => ({
                id: actor.trabajo_grado.id_trabajo_grado,
                title: actor.trabajo_grado.titulo_trabajo,
                status: actor.trabajo_grado.estado_tg.nombre_estado,
                role: actor.tipo_rol.nombre_rol,
                modality: actor.trabajo_grado.opcion_grado.nombre_opcion_grado,
                lastUpdate: actor.trabajo_grado.fecha_registro // Should be last update
            }));

            logger.info(`Returning ${projects.length} projects`);
            logger.debug(`Projects: ${JSON.stringify(projects)}`);

            // TODO: For privileged users (Decano, Coordinador), fetch ALL projects, not just assigned ones
            // This logic can be expanded based on specific requirements

            return res.json(projects);

        } catch (error) {
            logger.error("Error getting projects:", error);
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

    // HELPER ENDPOINTS FOR FORMS

    // Get form data (modalities, statuses, programs, companies)
    async getFormData(req: Request, res: Response) {
        try {
            const [modalities, statuses, programs, companies] = await Promise.all([
                prisma.opcion_grado.findMany({
                    where: { estado: "activo" },
                    select: {
                        id_opcion_grado: true,
                        nombre_opcion_grado: true
                    }
                }),
                prisma.estado_tg.findMany({
                    select: {
                        id_estado_tg: true,
                        nombre_estado: true
                    }
                }),
                prisma.programa_academico.findMany({
                    where: { estado: "activo" },
                    select: {
                        id_programa: true,
                        nombre_programa: true,
                        facultad: {
                            select: {
                                nombre_facultad: true
                            }
                        }
                    }
                }),
                prisma.empresa.findMany({
                    where: { estado: "activo" },
                    select: {
                        id_empresa: true,
                        nombre_empresa: true
                    }
                })
            ]);

            return res.json({
                modalities: modalities.map(m => ({ id: m.id_opcion_grado, name: m.nombre_opcion_grado })),
                statuses: statuses.map(s => ({ id: s.id_estado_tg, name: s.nombre_estado })),
                programs: programs.map(p => ({
                    id: p.id_programa,
                    name: p.nombre_programa,
                    faculty: p.facultad?.nombre_facultad || "Sin facultad"
                })),
                companies: companies.map(c => ({ id: c.id_empresa, name: c.nombre_empresa }))
            });
        } catch (error) {
            logger.error("Error getting form data:", error);
            return res.status(500).json({ error: "Error al obtener datos del formulario" });
        }
    }

    // Get available students (personas without confirmed projects)
    async getAvailableStudents(req: Request, res: Response) {
        try {
            const students = await prisma.persona.findMany({
                where: {
                    confirmed: true,
                    password: { not: null }
                },
                select: {
                    id_persona: true,
                    nombres: true,
                    apellidos: true,
                    num_doc_identidad: true,
                    correo_electronico: true
                }
            });

            return res.json(students.map(s => ({
                id: s.id_persona,
                name: `${s.nombres} ${s.apellidos}`,
                document: s.num_doc_identidad,
                email: s.correo_electronico
            })));
        } catch (error) {
            logger.error("Error getting students:", error);
            return res.status(500).json({ error: "Error al obtener estudiantes" });
        }
    }

    // Get available advisors (professors/directors)
    async getAvailableAdvisors(req: Request, res: Response) {
        try {
            // Get Director role
            const directorRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: "Director" }
            });

            if (!directorRole) {
                return res.json([]);
            }

            // Get all people who have been directors at some point
            const directorActors = await prisma.actores.findMany({
                where: { id_tipo_rol: directorRole.id_rol },
                include: { persona: true },
                distinct: ['id_persona']
            });

            const advisors = directorActors.map(a => ({
                id: a.persona.id_persona,
                name: `${a.persona.nombres} ${a.persona.apellidos}`,
                email: a.persona.correo_electronico
            }));

            return res.json(advisors);
        } catch (error) {
            logger.error("Error getting advisors:", error);
            return res.status(500).json({ error: "Error al obtener asesores" });
        }
    }

    // CRUD OPERATIONS (Privileged users only)

    // Get ALL projects (for privileged users)
    async getAllProjects(req: Request, res: Response) {
        try {
            const projects = await prisma.trabajo_grado.findMany({
                include: {
                    estado_tg: true,
                    opcion_grado: true,
                    programa_academico: {
                        include: {
                            facultad: true
                        }
                    },
                    empresa: true,
                    actores: {
                        include: {
                            persona: true,
                            tipo_rol: true
                        }
                    }
                },
                orderBy: { fecha_registro: 'desc' }
            });

            const formattedProjects = projects.map(project => ({
                id: project.id_trabajo_grado,
                title: project.titulo_trabajo,
                summary: project.resumen,
                status: project.estado_tg.nombre_estado,
                modality: project.opcion_grado.nombre_opcion_grado,
                program: project.programa_academico.nombre_programa,
                faculty: project.programa_academico.facultad.nombre_facultad,
                company: project.empresa?.nombre_empresa || null,
                startDate: project.fecha_inicio,
                endDate: project.fecha_fin_estima,
                lastUpdate: project.fecha_registro,
                actors: project.actores.map(actor => ({
                    name: `${actor.persona.nombres} ${actor.persona.apellidos}`,
                    role: actor.tipo_rol.nombre_rol
                }))
            }));

            return res.json(formattedProjects);
        } catch (error) {
            logger.error("Error getting all projects:", error);
            return res.status(500).json({ error: "Error al obtener proyectos" });
        }
    }

    // Create new project (Privileged only)
    async createProject(req: Request, res: Response) {
        try {
            const {
                title,
                summary,
                modalityId,
                statusId,
                programId,
                companyId,
                startDate,
                endDate,
                students, // Array of student IDs (1-2)
                advisors  // Array of advisor IDs (max 2)
            } = req.body;

            // Validate required fields
            if (!title || !modalityId || !statusId || !programId || !startDate) {
                return res.status(400).json({
                    error: "Faltan campos requeridos: titulo, modalidad, estado, programa, fecha de inicio"
                });
            }

            // Validate students (1-2 required)
            if (!students || !Array.isArray(students) || students.length < 1 || students.length > 2) {
                return res.status(400).json({
                    error: "Debe asignar entre 1 y 2 estudiantes al proyecto"
                });
            }

            // Validate advisors (max 2)
            if (advisors && Array.isArray(advisors) && advisors.length > 2) {
                return res.status(400).json({
                    error: "Máximo 2 asesores permitidos"
                });
            }

            // Create project
            const project = await prisma.trabajo_grado.create({
                data: {
                    titulo_trabajo: title,
                    resumen: summary,
                    id_opcion_grado: modalityId,
                    id_estado_actual: statusId,
                    id_programa_academico: programId,
                    id_empresa_practica: companyId || null,
                    fecha_inicio: new Date(startDate),
                    fecha_fin_estima: endDate ? new Date(endDate) : null
                }
            });

            // Get role IDs
            const studentRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: "Estudiante" }
            });
            const directorRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: "Director" }
            });

            if (!studentRole || !directorRole) {
                // Rollback project creation
                await prisma.trabajo_grado.delete({
                    where: { id_trabajo_grado: project.id_trabajo_grado }
                });
                return res.status(500).json({
                    error: "Roles no configurados en el sistema"
                });
            }

            // Assign students
            for (const studentId of students) {
                await prisma.actores.create({
                    data: {
                        id_persona: studentId,
                        id_trabajo_grado: project.id_trabajo_grado,
                        id_tipo_rol: studentRole.id_rol,
                        fecha_asignacion: new Date(),
                        estado: "Activo"
                    }
                });
            }

            // Assign advisors
            if (advisors && advisors.length > 0) {
                for (const advisorId of advisors) {
                    await prisma.actores.create({
                        data: {
                            id_persona: advisorId,
                            id_trabajo_grado: project.id_trabajo_grado,
                            id_tipo_rol: directorRole.id_rol,
                            fecha_asignacion: new Date(),
                            estado: "Activo"
                        }
                    });
                }
            }

            logger.info(`Project created: ${project.id_trabajo_grado} with ${students.length} students and ${advisors?.length || 0} advisors`);
            return res.status(201).json({
                message: "Proyecto creado exitosamente",
                projectId: project.id_trabajo_grado
            });
        } catch (error) {
            logger.error("Error creating project:", error);
            return res.status(500).json({ error: "Error al crear proyecto" });
        }
    }

    // Update project (Privileged only)
    async updateProject(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const {
                title,
                summary,
                modalityId,
                statusId,
                programId,
                companyId,
                startDate,
                endDate
            } = req.body;

            const project = await prisma.trabajo_grado.findUnique({
                where: { id_trabajo_grado: id }
            });

            if (!project) {
                return res.status(404).json({ error: "Proyecto no encontrado" });
            }

            await prisma.trabajo_grado.update({
                where: { id_trabajo_grado: id },
                data: {
                    ...(title && { titulo_trabajo: title }),
                    ...(summary && { resumen: summary }),
                    ...(modalityId && { id_opcion_grado: modalityId }),
                    ...(statusId && { id_estado_actual: statusId }),
                    ...(programId && { id_programa_academico: programId }),
                    ...(companyId !== undefined && { id_empresa_practica: companyId || null }),
                    ...(startDate && { fecha_inicio: new Date(startDate) }),
                    ...(endDate !== undefined && { fecha_fin_estima: endDate ? new Date(endDate) : null })
                }
            });

            logger.info(`Project updated: ${id}`);
            return res.json({ message: "Proyecto actualizado exitosamente" });
        } catch (error) {
            logger.error("Error updating project:", error);
            return res.status(500).json({ error: "Error al actualizar proyecto" });
        }
    }

    // Delete project (Privileged only)
    async deleteProject(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const project = await prisma.trabajo_grado.findUnique({
                where: { id_trabajo_grado: id }
            });

            if (!project) {
                return res.status(404).json({ error: "Proyecto no encontrado" });
            }

            // Delete related records first to avoid foreign key constraint errors
            // Order: seguimiento_tg -> actores -> trabajo_grado

            // 1. Delete all tracking records (seguimiento_tg)
            await prisma.seguimiento_tg.deleteMany({
                where: { id_trabajo_grado: id }
            });

            // 2. Delete all actors (actores)
            await prisma.actores.deleteMany({
                where: { id_trabajo_grado: id }
            });

            // 3. Finally, delete the project itself
            await prisma.trabajo_grado.delete({
                where: { id_trabajo_grado: id }
            });

            logger.info(`Project deleted successfully: ${id}`);
            return res.json({ message: "Proyecto eliminado exitosamente" });
        } catch (error) {
            logger.error("Error deleting project:", error);
            return res.status(500).json({ error: "Error al eliminar proyecto" });
        }
    }
}

