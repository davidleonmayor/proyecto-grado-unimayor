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

            // Normalize newStatusId: convert empty string to null, validate if provided
            let normalizedStatusId: string | null = null;
            if (newStatusId && typeof newStatusId === 'string' && newStatusId.trim() !== '') {
                // Validate that the status exists
                const statusExists = await prisma.estado_tg.findUnique({
                    where: { id_estado_tg: newStatusId }
                });

                if (!statusExists) {
                    return res.status(400).json({ error: "El estado especificado no existe" });
                }

                normalizedStatusId = newStatusId.trim();
            }

            // Determine action type
            let actionName = "Revisión de Avance";
            if (normalizedStatusId) {
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
                    resumen: description || null,
                    id_estado_anterior: project.id_estado_actual || null,
                    id_estado_nuevo: normalizedStatusId
                }
            });

            // Update project status if requested
            if (normalizedStatusId) {
                await prisma.trabajo_grado.update({
                    where: { id_trabajo_grado: id },
                    data: { id_estado_actual: normalizedStatusId }
                });
            }

            return res.status(201).json({ message: "Revisión registrada exitosamente" });

        } catch (error) {
            console.error("Error reviewing iteration:", error);
            
            // Handle Prisma foreign key constraint errors
            if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
                return res.status(400).json({ error: "Error de validación: el estado especificado no es válido" });
            }

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

    // Get available statuses (for review form - any authenticated user)
    async getStatuses(req: Request, res: Response) {
        try {
            const statuses = await prisma.estado_tg.findMany({
                select: {
                    id_estado_tg: true,
                    nombre_estado: true
                },
                orderBy: {
                    nombre_estado: 'asc'
                }
            });

            return res.status(200).json(statuses);
        } catch (error) {
            console.error("Error fetching statuses:", error);
            return res.status(500).json({ error: "Error al obtener estados" });
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

    // Get available students (personas without active graduation projects)
    // Optional query parameter: programId - filters students by academic program
    async getAvailableStudents(req: Request, res: Response) {
        try {
            const programId = req.query.programId as string | undefined;

            // Get student role
            const studentRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: "Estudiante" }
            });

            if (!studentRole) {
                return res.json([]);
            }

            // Get all students with active projects
            const studentsWithActiveProjects = await prisma.actores.findMany({
                where: {
                    id_tipo_rol: studentRole.id_rol,
                    estado: "Activo"
                },
                select: {
                    id_persona: true
                },
                distinct: ['id_persona']
            });

            const studentIdsWithActiveProjects = new Set(
                studentsWithActiveProjects.map(a => a.id_persona)
            );

            // If programId is provided, get students who have projects in that program
            let studentsInProgram: Set<string> = new Set();
            if (programId) {
                const studentsWithProgramProjects = await prisma.actores.findMany({
                    where: {
                        id_tipo_rol: studentRole.id_rol,
                        trabajo_grado: {
                            id_programa_academico: programId
                        }
                    },
                    select: {
                        id_persona: true
                    },
                    distinct: ['id_persona']
                });

                studentsInProgram = new Set(
                    studentsWithProgramProjects.map(a => a.id_persona)
                );
            }

            // Get all confirmed students
            const allStudents = await prisma.persona.findMany({
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

            // Filter out students who already have active projects
            let availableStudents = allStudents.filter(
                s => !studentIdsWithActiveProjects.has(s.id_persona)
            );

            // If programId is provided, filter to only show students in that program
            if (programId && studentsInProgram.size > 0) {
                availableStudents = availableStudents.filter(
                    s => studentsInProgram.has(s.id_persona)
                );
            }

            return res.json(availableStudents.map(s => ({
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
                email: a.persona.correo_electronico,
                document: a.persona.num_doc_identidad
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
                        where: { estado: "Activo" },
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

    // Get project detail (Privileged)
    async getProjectById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const project = await prisma.trabajo_grado.findUnique({
                where: { id_trabajo_grado: id },
                include: {
                    opcion_grado: true,
                    estado_tg: true,
                    empresa: true,
                    programa_academico: {
                        include: {
                            facultad: true
                        }
                    },
                    actores: {
                        where: { estado: "Activo" },
                        include: {
                            persona: true,
                            tipo_rol: true
                        }
                    }
                }
            });

            if (!project) {
                return res.status(404).json({ error: "Proyecto no encontrado" });
            }

            const students = project.actores
                .filter(actor => actor.tipo_rol.nombre_rol === "Estudiante")
                .map(actor => ({
                    id: actor.persona.id_persona,
                    name: `${actor.persona.nombres} ${actor.persona.apellidos}`,
                    email: actor.persona.correo_electronico,
                    document: actor.persona.num_doc_identidad
                }));

            const advisors = project.actores
                .filter(actor => actor.tipo_rol.nombre_rol === "Director")
                .map(actor => ({
                    id: actor.persona.id_persona,
                    name: `${actor.persona.nombres} ${actor.persona.apellidos}`,
                    email: actor.persona.correo_electronico
                }));

            return res.json({
                id: project.id_trabajo_grado,
                title: project.titulo_trabajo,
                summary: project.resumen,
                modalityId: project.id_opcion_grado,
                statusId: project.id_estado_actual,
                programId: project.id_programa_academico,
                companyId: project.id_empresa_practica,
                startDate: project.fecha_inicio.toISOString(),
                endDate: project.fecha_fin_estima ? project.fecha_fin_estima.toISOString() : null,
                students,
                advisors,
                metadata: {
                    modality: project.opcion_grado.nombre_opcion_grado,
                    status: project.estado_tg.nombre_estado,
                    program: project.programa_academico.nombre_programa,
                    faculty: project.programa_academico.facultad.nombre_facultad,
                    company: project.empresa?.nombre_empresa || null
                }
            });
        } catch (error) {
            logger.error("Error getting project detail:", error);
            return res.status(500).json({ error: "Error al obtener proyecto" });
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

            // Check if any student already has an active project
            const studentRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: "Estudiante" }
            });

            if (!studentRole) {
                return res.status(500).json({
                    error: "Rol Estudiante no configurado"
                });
            }

            for (const studentId of students) {
                const existingProject = await prisma.actores.findFirst({
                    where: {
                        id_persona: studentId,
                        id_tipo_rol: studentRole.id_rol,
                        estado: "Activo"
                    },
                    include: {
                        trabajo_grado: {
                            include: {
                                opcion_grado: true
                            }
                        }
                    }
                });

                if (existingProject) {
                    return res.status(400).json({
                        error: `El estudiante ya tiene un proyecto activo (${existingProject.trabajo_grado.opcion_grado.nombre_opcion_grado}). Un estudiante no puede estar en más de un proyecto de grado o práctica profesional al mismo tiempo.`
                    });
                }
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

            // Get director role (studentRole already fetched above)
            const directorRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: "Director" }
            });

            if (!directorRole) {
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
                endDate,
                students,
                advisors
            } = req.body;

            const project = await prisma.trabajo_grado.findUnique({
                where: { id_trabajo_grado: id }
            });

            if (!project) {
                return res.status(404).json({ error: "Proyecto no encontrado" });
            }

            if (students !== undefined) {
                if (!Array.isArray(students) || students.length < 1 || students.length > 2) {
                    return res.status(400).json({
                        error: "Debe asignar entre 1 y 2 estudiantes al proyecto"
                    });
                }

                // Check if any new student already has an active project (excluding current project)
                const studentRole = await prisma.tipo_rol.findFirst({
                    where: { nombre_rol: "Estudiante" }
                });

                if (!studentRole) {
                    return res.status(500).json({
                        error: "Rol Estudiante no configurado"
                    });
                }

                // Get current students on this project
                const currentStudentActors = await prisma.actores.findMany({
                    where: {
                        id_trabajo_grado: id,
                        id_tipo_rol: studentRole.id_rol
                    },
                    select: {
                        id_persona: true
                    }
                });

                const currentStudentIds = new Set(currentStudentActors.map(a => a.id_persona));

                // Check new students (not currently on this project)
                for (const studentId of students) {
                    if (!currentStudentIds.has(studentId)) {
                        const existingProject = await prisma.actores.findFirst({
                            where: {
                                id_persona: studentId,
                                id_tipo_rol: studentRole.id_rol,
                                estado: "Activo",
                                id_trabajo_grado: { not: id } // Exclude current project
                            },
                            include: {
                                trabajo_grado: {
                                    include: {
                                        opcion_grado: true
                                    }
                                }
                            }
                        });

                        if (existingProject) {
                            return res.status(400).json({
                                error: `El estudiante ya tiene un proyecto activo (${existingProject.trabajo_grado.opcion_grado.nombre_opcion_grado}). Un estudiante no puede estar en más de un proyecto de grado o práctica profesional al mismo tiempo.`
                            });
                        }
                    }
                }
            }

            if (advisors !== undefined) {
                if (!Array.isArray(advisors) || advisors.length > 2) {
                    return res.status(400).json({
                        error: "Máximo 2 asesores permitidos"
                    });
                }
            }

            const normalizedCompanyId = companyId === "" ? null : companyId;

            await prisma.$transaction(async (tx) => {
                await tx.trabajo_grado.update({
                    where: { id_trabajo_grado: id },
                    data: {
                        ...(title !== undefined && { titulo_trabajo: title }),
                        ...(summary !== undefined && { resumen: summary }),
                        ...(modalityId !== undefined && { id_opcion_grado: modalityId }),
                        ...(statusId !== undefined && { id_estado_actual: statusId }),
                        ...(programId !== undefined && { id_programa_academico: programId }),
                        ...(normalizedCompanyId !== undefined && { id_empresa_practica: normalizedCompanyId }),
                        ...(startDate !== undefined && { fecha_inicio: new Date(startDate) }),
                        ...(endDate !== undefined && { fecha_fin_estima: endDate ? new Date(endDate) : null })
                    }
                });

                // Update students if provided
                if (students !== undefined) {
                    const studentRole = await tx.tipo_rol.findFirst({
                        where: { nombre_rol: "Estudiante" }
                    });

                    if (!studentRole) {
                        throw new Error("Rol Estudiante no configurado");
                    }

                    const currentStudentActors = await tx.actores.findMany({
                        where: {
                            id_trabajo_grado: id,
                            id_tipo_rol: studentRole.id_rol
                        }
                    });

                    const newStudentIds = new Set<string>(students);
                    const existingStudentIds = new Set(currentStudentActors.map(actor => actor.id_persona));

                    for (const actor of currentStudentActors) {
                        if (!newStudentIds.has(actor.id_persona)) {
                            await tx.actores.update({
                                where: { id_actor: actor.id_actor },
                                data: {
                                    estado: "Inactivo",
                                    fecha_retiro: new Date()
                                }
                            });
                        } else if (actor.estado !== "Activo") {
                            await tx.actores.update({
                                where: { id_actor: actor.id_actor },
                                data: {
                                    estado: "Activo",
                                    fecha_retiro: null
                                }
                            });
                        }
                    }

                    for (const studentId of newStudentIds) {
                        if (!existingStudentIds.has(studentId)) {
                            await tx.actores.create({
                                data: {
                                    id_persona: studentId,
                                    id_trabajo_grado: id,
                                    id_tipo_rol: studentRole.id_rol,
                                    fecha_asignacion: new Date(),
                                    estado: "Activo"
                                }
                            });
                        }
                    }
                }

                // Update advisors if provided
                if (advisors !== undefined) {
                    const directorRole = await tx.tipo_rol.findFirst({
                        where: { nombre_rol: "Director" }
                    });

                    if (!directorRole) {
                        throw new Error("Rol Director no configurado");
                    }

                    const currentAdvisorActors = await tx.actores.findMany({
                        where: {
                            id_trabajo_grado: id,
                            id_tipo_rol: directorRole.id_rol
                        }
                    });

                    const newAdvisorIds = new Set<string>(advisors);
                    const existingAdvisorIds = new Set(currentAdvisorActors.map(actor => actor.id_persona));

                    for (const actor of currentAdvisorActors) {
                        if (!newAdvisorIds.has(actor.id_persona)) {
                            await tx.actores.update({
                                where: { id_actor: actor.id_actor },
                                data: {
                                    estado: "Inactivo",
                                    fecha_retiro: new Date()
                                }
                            });
                        } else if (actor.estado !== "Activo") {
                            await tx.actores.update({
                                where: { id_actor: actor.id_actor },
                                data: {
                                    estado: "Activo",
                                    fecha_retiro: null
                                }
                            });
                        }
                    }

                    for (const advisorId of newAdvisorIds) {
                        if (!existingAdvisorIds.has(advisorId)) {
                            await tx.actores.create({
                                data: {
                                    id_persona: advisorId,
                                    id_trabajo_grado: id,
                                    id_tipo_rol: directorRole.id_rol,
                                    fecha_asignacion: new Date(),
                                    estado: "Activo"
                                }
                            });
                        }
                    }
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

    // Get dashboard statistics (Privileged only)
    async getDashboardStats(req: Request, res: Response) {
        try {
            // Get total projects
            const totalProjects = await prisma.trabajo_grado.count();

            // Get active projects (not finished/rejected)
            // MySQL doesn't support case-insensitive mode, so we check both cases
            const estadosTerminados = await prisma.estado_tg.findMany({
                where: {
                    OR: [
                        { nombre_estado: { contains: 'Finalizado' } },
                        { nombre_estado: { contains: 'finalizado' } },
                        { nombre_estado: { contains: 'Aprobado' } },
                        { nombre_estado: { contains: 'aprobado' } },
                        { nombre_estado: { contains: 'Rechazado' } },
                        { nombre_estado: { contains: 'rechazado' } }
                    ]
                }
            });
            const estadosTerminadosIds = estadosTerminados.map(e => e.id_estado_tg);

            const proyectosEnCurso = await prisma.trabajo_grado.count({
                where: {
                    NOT: {
                        id_estado_actual: { in: estadosTerminadosIds }
                    }
                }
            });

            // Get finished projects
            const proyectosFinalizados = await prisma.trabajo_grado.count({
                where: {
                    OR: [
                        { id_estado_actual: { in: estadosTerminadosIds } }
                    ]
                }
            });

            // Get active directors/advisors
            const directorRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: "Director" }
            });

            // Get unique active directors using findMany with distinct
            const profesoresActivos = directorRole ? (await prisma.actores.findMany({
                where: {
                    id_tipo_rol: directorRole.id_rol,
                    estado: "Activo"
                },
                select: {
                    id_persona: true
                },
                distinct: ['id_persona']
            })).length : 0;

            // Get student statistics (entregado vs sin entregar)
            const studentRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: "Estudiante" }
            });

            // Get unique active students
            const totalEstudiantes = studentRole ? (await prisma.actores.findMany({
                where: {
                    id_tipo_rol: studentRole.id_rol,
                    estado: "Activo"
                },
                select: {
                    id_persona: true
                },
                distinct: ['id_persona']
            })).length : 0;

            // Get students with deliveries (entregado)
            const entregaAccion = await prisma.accion_seg.findFirst({
                where: {
                    OR: [
                        { tipo_accion: { contains: 'Entrega' } },
                        { tipo_accion: { contains: 'entrega' } }
                    ]
                }
            });

            const estudiantesConEntrega = entregaAccion && studentRole ? (await prisma.actores.findMany({
                where: {
                    id_tipo_rol: studentRole.id_rol,
                    estado: "Activo",
                    seguimiento_tg: {
                        some: {
                            id_accion: entregaAccion.id_accion
                        }
                    }
                },
                select: {
                    id_persona: true
                },
                distinct: ['id_persona']
            })).length : 0;

            const estudiantesSinEntrega = totalEstudiantes - estudiantesConEntrega;

            // Get projects by status for weekly chart (last 4 weeks)
            const cuatroSemanasAtras = new Date();
            cuatroSemanasAtras.setDate(cuatroSemanasAtras.getDate() - 28);

            const estadosAprobado = await prisma.estado_tg.findMany({
                where: {
                    OR: [
                        { nombre_estado: { contains: 'Aprobado' } },
                        { nombre_estado: { contains: 'aprobado' } }
                    ]
                }
            });
            const estadosRechazado = await prisma.estado_tg.findMany({
                where: {
                    OR: [
                        { nombre_estado: { contains: 'Rechazado' } },
                        { nombre_estado: { contains: 'rechazado' } }
                    ]
                }
            });

            const aprobadosIds = estadosAprobado.map(e => e.id_estado_tg);
            const rechazadosIds = estadosRechazado.map(e => e.id_estado_tg);

            // Get weekly data
            const proyectosPorSemana = await prisma.trabajo_grado.findMany({
                where: {
                    fecha_registro: {
                        gte: cuatroSemanasAtras
                    }
                },
                select: {
                    fecha_registro: true,
                    id_estado_actual: true
                }
            });

            // Group by week (last 4 weeks from today)
            const semanas: { [key: string]: { aprobado: number; rechazado: number } } = {};
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            // Initialize all 4 weeks
            for (let i = 1; i <= 4; i++) {
                semanas[`Semana ${i}`] = { aprobado: 0, rechazado: 0 };
            }

            proyectosPorSemana.forEach(proyecto => {
                const fecha = new Date(proyecto.fecha_registro);
                fecha.setHours(0, 0, 0, 0);
                
                // Calculate days difference
                const diffTime = hoy.getTime() - fecha.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                // Determine which week (1-4)
                let semanaNum = Math.ceil(diffDays / 7);
                
                // Only count if within last 4 weeks
                if (semanaNum >= 1 && semanaNum <= 4) {
                    const nombreSemana = `Semana ${semanaNum}`;

                    if (aprobadosIds.includes(proyecto.id_estado_actual)) {
                        semanas[nombreSemana].aprobado++;
                    } else if (rechazadosIds.includes(proyecto.id_estado_actual)) {
                        semanas[nombreSemana].rechazado++;
                    }
                }
            });

            const weeklyData = Object.keys(semanas).sort((a, b) => {
                const numA = parseInt(a.replace('Semana ', ''));
                const numB = parseInt(b.replace('Semana ', ''));
                return numA - numB;
            }).map(name => ({
                name,
                aprobado: semanas[name].aprobado,
                rechazado: semanas[name].rechazado
            }));

            // Get monthly data (last 12 months)
            const doceMesesAtras = new Date();
            doceMesesAtras.setMonth(doceMesesAtras.getMonth() - 12);

            const proyectosPorMes = await prisma.trabajo_grado.findMany({
                where: {
                    fecha_registro: {
                        gte: doceMesesAtras
                    }
                },
                select: {
                    fecha_registro: true,
                    id_estado_actual: true
                }
            });

            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const monthlyData: { [key: string]: { aprobados: number; rechazados: number } } = {};

            proyectosPorMes.forEach(proyecto => {
                const fecha = new Date(proyecto.fecha_registro);
                const mes = meses[fecha.getMonth()];

                if (!monthlyData[mes]) {
                    monthlyData[mes] = { aprobados: 0, rechazados: 0 };
                }

                if (aprobadosIds.includes(proyecto.id_estado_actual)) {
                    monthlyData[mes].aprobados++;
                } else if (rechazadosIds.includes(proyecto.id_estado_actual)) {
                    monthlyData[mes].rechazados++;
                }
            });

            const monthlyChartData = meses.map(mes => ({
                name: mes,
                aprobados: monthlyData[mes]?.aprobados || 0,
                rechazados: monthlyData[mes]?.rechazados || 0
            }));

            return res.json({
                stats: {
                    totalProjects,
                    proyectosEnCurso,
                    proyectosFinalizados,
                    profesoresActivos
                },
                students: {
                    total: totalEstudiantes,
                    entregado: estudiantesConEntrega,
                    sinEntregar: estudiantesSinEntrega,
                    porcentajeEntregado: totalEstudiantes > 0 ? Math.round((estudiantesConEntrega / totalEstudiantes) * 100) : 0,
                    porcentajeSinEntregar: totalEstudiantes > 0 ? Math.round((estudiantesSinEntrega / totalEstudiantes) * 100) : 0
                },
                weeklyChart: weeklyData.length > 0 ? weeklyData : [
                    { name: 'Semana 1', aprobado: 0, rechazado: 0 },
                    { name: 'Semana 2', aprobado: 0, rechazado: 0 },
                    { name: 'Semana 3', aprobado: 0, rechazado: 0 },
                    { name: 'Semana 4', aprobado: 0, rechazado: 0 }
                ],
                monthlyChart: monthlyChartData
            });
        } catch (error) {
            logger.error("Error getting dashboard stats:", error);
            return res.status(500).json({ error: "Error al obtener estadísticas" });
        }
    }

    // Get dashboard statistics for teachers/directors (non-admin)
    async getTeacherDashboardStats(req: Request, res: Response) {
        try {
            const userId = req.user?.id_persona;
            if (!userId) return res.status(401).json({ error: "No autorizado" });

            // Get student role first
            const studentRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: "Estudiante" }
            });

            // Get user's roles and projects
            const user = await prisma.persona.findUnique({
                where: { id_persona: userId },
                include: {
                    actores: {
                        where: { estado: "Activo" },
                        include: {
                            tipo_rol: true,
                            trabajo_grado: {
                                include: {
                                    estado_tg: true,
                                    opcion_grado: true,
                                    actores: {
                                        where: {
                                            estado: "Activo",
                                            ...(studentRole && { id_tipo_rol: studentRole.id_rol })
                                        },
                                        include: {
                                            persona: true,
                                            tipo_rol: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            // Filter only non-student roles (Director, Jurado, etc.)
            const teacherActors = user.actores.filter(actor => 
                actor.tipo_rol.nombre_rol !== "Estudiante"
            );

            // Get projects where user is director/advisor/jury
            const proyectosAsignados = teacherActors.map(actor => actor.trabajo_grado).filter(p => p);
            const proyectosUnicos = Array.from(
                new Map(proyectosAsignados.map(p => [p.id_trabajo_grado, p])).values()
            );

            // Count projects by status
            const totalProyectos = proyectosUnicos.length;
            
            const estadosTerminados = await prisma.estado_tg.findMany({
                where: {
                    OR: [
                        { nombre_estado: { contains: 'Finalizado' } },
                        { nombre_estado: { contains: 'finalizado' } },
                        { nombre_estado: { contains: 'Aprobado' } },
                        { nombre_estado: { contains: 'aprobado' } },
                        { nombre_estado: { contains: 'Rechazado' } },
                        { nombre_estado: { contains: 'rechazado' } }
                    ]
                }
            });
            const estadosTerminadosIds = estadosTerminados.map(e => e.id_estado_tg);

            const proyectosEnCurso = proyectosUnicos.filter(p => 
                !estadosTerminadosIds.includes(p.id_estado_actual)
            ).length;

            const proyectosFinalizados = proyectosUnicos.filter(p => 
                estadosTerminadosIds.includes(p.id_estado_actual)
            ).length;

            // Get total students under supervision
            const estudiantesAsignados = new Set<string>();
            if (studentRole) {
                proyectosUnicos.forEach(proyecto => {
                    proyecto.actores.forEach(actor => {
                        if (actor.tipo_rol.id_rol === studentRole.id_rol) {
                            estudiantesAsignados.add(actor.persona.id_persona);
                        }
                    });
                });
            }
            const totalEstudiantes = estudiantesAsignados.size;

            // Get students with deliveries
            const entregaAccion = await prisma.accion_seg.findFirst({
                where: {
                    OR: [
                        { tipo_accion: { contains: 'Entrega' } },
                        { tipo_accion: { contains: 'entrega' } }
                    ]
                }
            });

            let estudiantesConEntrega = 0;
            if (entregaAccion) {
                const estudiantesIds = Array.from(estudiantesAsignados);
                for (const estudianteId of estudiantesIds) {
                    const tieneEntrega = await prisma.actores.findFirst({
                        where: {
                            id_persona: estudianteId,
                            estado: "Activo",
                            seguimiento_tg: {
                                some: {
                                    id_accion: entregaAccion.id_accion
                                }
                            }
                        }
                    });
                    if (tieneEntrega) estudiantesConEntrega++;
                }
            }

            const estudiantesSinEntrega = totalEstudiantes - estudiantesConEntrega;

            // Get weekly stats for assigned projects only (last 4 weeks)
            const cuatroSemanasAtras = new Date();
            cuatroSemanasAtras.setDate(cuatroSemanasAtras.getDate() - 28);

            const proyectosIds = proyectosUnicos.map(p => p.id_trabajo_grado);
            const estadosAprobado = await prisma.estado_tg.findMany({
                where: {
                    OR: [
                        { nombre_estado: { contains: 'Aprobado' } },
                        { nombre_estado: { contains: 'aprobado' } }
                    ]
                }
            });
            const estadosRechazado = await prisma.estado_tg.findMany({
                where: {
                    OR: [
                        { nombre_estado: { contains: 'Rechazado' } },
                        { nombre_estado: { contains: 'rechazado' } }
                    ]
                }
            });

            const aprobadosIds = estadosAprobado.map(e => e.id_estado_tg);
            const rechazadosIds = estadosRechazado.map(e => e.id_estado_tg);

            const proyectosPorSemana = proyectosUnicos.filter(p => {
                const fecha = new Date(p.fecha_registro);
                return fecha >= cuatroSemanasAtras;
            });

            // Group by week
            const semanas: { [key: string]: { aprobado: number; rechazado: number } } = {};
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            for (let i = 1; i <= 4; i++) {
                semanas[`Semana ${i}`] = { aprobado: 0, rechazado: 0 };
            }

            proyectosPorSemana.forEach(proyecto => {
                const fecha = new Date(proyecto.fecha_registro);
                fecha.setHours(0, 0, 0, 0);
                
                const diffTime = hoy.getTime() - fecha.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                let semanaNum = Math.ceil(diffDays / 7);
                
                if (semanaNum >= 1 && semanaNum <= 4) {
                    const nombreSemana = `Semana ${semanaNum}`;

                    if (aprobadosIds.includes(proyecto.id_estado_actual)) {
                        semanas[nombreSemana].aprobado++;
                    } else if (rechazadosIds.includes(proyecto.id_estado_actual)) {
                        semanas[nombreSemana].rechazado++;
                    }
                }
            });

            const weeklyData = Object.keys(semanas).sort((a, b) => {
                const numA = parseInt(a.replace('Semana ', ''));
                const numB = parseInt(b.replace('Semana ', ''));
                return numA - numB;
            }).map(name => ({
                name,
                aprobado: semanas[name].aprobado,
                rechazado: semanas[name].rechazado
            }));

            // Get monthly stats for assigned projects (last 12 months)
            const doceMesesAtras = new Date();
            doceMesesAtras.setMonth(doceMesesAtras.getMonth() - 12);

            const proyectosPorMes = proyectosUnicos.filter(p => {
                const fecha = new Date(p.fecha_registro);
                return fecha >= doceMesesAtras;
            });

            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const monthlyData: { [key: string]: { aprobados: number; rechazados: number } } = {};

            proyectosPorMes.forEach(proyecto => {
                const fecha = new Date(proyecto.fecha_registro);
                const mes = meses[fecha.getMonth()];

                if (!monthlyData[mes]) {
                    monthlyData[mes] = { aprobados: 0, rechazados: 0 };
                }

                if (aprobadosIds.includes(proyecto.id_estado_actual)) {
                    monthlyData[mes].aprobados++;
                } else if (rechazadosIds.includes(proyecto.id_estado_actual)) {
                    monthlyData[mes].rechazados++;
                }
            });

            const monthlyChartData = meses.map(mes => ({
                name: mes,
                aprobados: monthlyData[mes]?.aprobados || 0,
                rechazados: monthlyData[mes]?.rechazados || 0
            }));

            return res.json({
                stats: {
                    totalProjects: totalProyectos,
                    proyectosEnCurso,
                    proyectosFinalizados,
                    estudiantesAsignados: totalEstudiantes
                },
                students: {
                    total: totalEstudiantes,
                    entregado: estudiantesConEntrega,
                    sinEntregar: estudiantesSinEntrega,
                    porcentajeEntregado: totalEstudiantes > 0 ? Math.round((estudiantesConEntrega / totalEstudiantes) * 100) : 0,
                    porcentajeSinEntregar: totalEstudiantes > 0 ? Math.round((estudiantesSinEntrega / totalEstudiantes) * 100) : 0
                },
                weeklyChart: weeklyData.length > 0 ? weeklyData : [
                    { name: 'Semana 1', aprobado: 0, rechazado: 0 },
                    { name: 'Semana 2', aprobado: 0, rechazado: 0 },
                    { name: 'Semana 3', aprobado: 0, rechazado: 0 },
                    { name: 'Semana 4', aprobado: 0, rechazado: 0 }
                ],
                monthlyChart: monthlyChartData
            });
        } catch (error) {
            logger.error("Error getting teacher dashboard stats:", error);
            return res.status(500).json({ error: "Error al obtener estadísticas" });
        }
    }
}

