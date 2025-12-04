import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer, { FileFilterCallback } from "multer";
import { logger } from "../config";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

const allowedExcelMimeTypes = new Set([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
]);

const normalizeValue = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase()
        .trim();

const normalizeKey = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_");

const toStringValue = (value: unknown) =>
    value === undefined || value === null ? "" : String(value).trim();

const splitList = (value: unknown) =>
    toStringValue(value)
        .split(/[,;|]/)
        .map((item) => item.trim())
        .filter(Boolean);

const parseExcelDate = (value: unknown): Date | null => {
    if (!value && value !== 0) {
        return null;
    }

    if (value instanceof Date && !isNaN(value.getTime())) {
        return value;
    }

    if (typeof value === "number") {
        const excelDate = XLSX.SSF.parse_date_code(value);
        if (excelDate) {
            return new Date(Date.UTC(excelDate.y, excelDate.m - 1, excelDate.d));
        }
    }

    const text = toStringValue(value);
    if (!text) {
        return null;
    }

    const normalized = text.replace(/\./g, "-").replace(/\//g, "-");
    const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
        const [, year, month, day] = isoMatch.map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        return isNaN(date.getTime()) ? null : date;
    }

    const latinMatch = normalized.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (latinMatch) {
        const [, day, month, year] = latinMatch.map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        return isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(text);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }

    return null;
};

// Configure multer for memory storage (files as buffer)
const storage = multer.memoryStorage();
export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const excelStorage = multer.memoryStorage();
const excelFileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
) => {
    const isExcel =
        allowedExcelMimeTypes.has(file.mimetype) ||
        file.originalname.toLowerCase().endsWith(".xlsx") ||
        file.originalname.toLowerCase().endsWith(".xls");

    if (!isExcel) {
        return cb(
            new Error(
                "Formato no válido. Sube un archivo Excel (.xlsx o .xls).",
            ),
        );
    }
    cb(null, true);
};

export const excelUpload = multer({
    storage: excelStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: excelFileFilter,
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
                objectives: actor.trabajo_grado.objetivos,
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
                numero_resolucion: item.numero_resolucion,
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
            const { description, numero_resolucion } = req.body;

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
                    tipo_documento: file.mimetype,
                    numero_resolucion: numero_resolucion || null
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
            const { description, newStatusId, numero_resolucion } = req.body;

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
                    id_estado_nuevo: normalizedStatusId,
                    numero_resolucion: numero_resolucion || null
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
            const userId = req.user?.id_persona;

            // Get privileged roles (Director, Jurado, etc.)
            const privilegedRoles = await prisma.tipo_rol.findMany({
                where: {
                    nombre_rol: { in: ["Director", "Jurado", "Coordinador de Carrera", "Decano"] }
                }
            });

            const privilegedRoleIds = privilegedRoles.map(r => r.id_rol);

            // Determine user's faculty if they are a professor/director/coordinator
            let userFacultyIds: Set<string> = new Set();
            if (userId) {
                // Get user's persona with faculty
                const userPersona = await prisma.persona.findUnique({
                    where: { id_persona: userId },
                    select: { id_facultad: true }
                });

                // If user has a faculty assigned directly, use it
                if (userPersona?.id_facultad) {
                    userFacultyIds.add(userPersona.id_facultad);
                } else {
                    // Fallback: Check if user has privileged roles and get faculty from their projects
                    const userActors = await prisma.actores.findMany({
                        where: {
                            id_persona: userId,
                            id_tipo_rol: { in: privilegedRoleIds }
                        },
                        include: {
                            trabajo_grado: {
                                include: {
                                    programa_academico: {
                                        select: {
                                            id_facultad: true
                                        }
                                    }
                                }
                            }
                        }
                    });

                    // Get unique faculty IDs from projects where user is director/professor
                    userActors.forEach(actor => {
                        if (actor.trabajo_grado?.programa_academico?.id_facultad) {
                            userFacultyIds.add(actor.trabajo_grado.programa_academico.id_facultad);
                        }
                    });
                }
            }

            // Build programs query - filter by faculty if user has restriction
            const programsWhere: any = { estado: "activo" };
            if (userFacultyIds.size > 0) {
                programsWhere.id_facultad = { in: Array.from(userFacultyIds) };
            }

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
                    where: programsWhere,
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
    // Automatically filters by faculty if user is a professor/director
    async getAvailableStudents(req: Request, res: Response) {
        try {
            const programId = req.query.programId as string | undefined;
            const userId = req.user?.id_persona;

            // Get student role
            const studentRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: "Estudiante" }
            });

            if (!studentRole) {
                return res.json([]);
            }

            // Get privileged roles (Director, Jurado, etc.)
            const privilegedRoles = await prisma.tipo_rol.findMany({
                where: {
                    nombre_rol: { in: ["Director", "Jurado", "Coordinador de Carrera", "Decano"] }
                }
            });

            const privilegedRoleIds = privilegedRoles.map(r => r.id_rol);

            // Determine user's faculty if they are a professor/director/coordinator
            let userFacultyIds: Set<string> = new Set();
            if (userId) {
                // Get user's persona with faculty
                const userPersona = await prisma.persona.findUnique({
                    where: { id_persona: userId },
                    select: { id_facultad: true }
                });

                // If user has a faculty assigned directly, use it
                if (userPersona?.id_facultad) {
                    userFacultyIds.add(userPersona.id_facultad);
                } else {
                    // Fallback: Check if user has privileged roles and get faculty from their projects
                    const userActors = await prisma.actores.findMany({
                        where: {
                            id_persona: userId,
                            id_tipo_rol: { in: privilegedRoleIds }
                        },
                        include: {
                            trabajo_grado: {
                                include: {
                                    programa_academico: {
                                        select: {
                                            id_facultad: true
                                        }
                                    }
                                }
                            }
                        }
                    });

                    // Get unique faculty IDs from projects where user is director/professor
                    userActors.forEach(actor => {
                        if (actor.trabajo_grado?.programa_academico?.id_facultad) {
                            userFacultyIds.add(actor.trabajo_grado.programa_academico.id_facultad);
                        }
                    });
                }
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

            // Build query for students
            let studentsWhere: any = {
                confirmed: true,
                password: { not: null }
            };

            // If programId is provided, filter by program
            if (programId) {
                // Get program info to check faculty
                const program = await prisma.programa_academico.findUnique({
                    where: { id_programa: programId },
                    select: { id_facultad: true }
                });

                if (program) {
                    // If user has faculty restriction, verify program belongs to their faculty
                    if (userFacultyIds.size > 0 && !userFacultyIds.has(program.id_facultad)) {
                        return res.status(403).json({ 
                            error: "No tienes permiso para acceder a estudiantes de este programa" 
                        });
                    }

                    // Filter students by program (using direct association)
                    studentsWhere.id_programa_academico = programId;
                }
            } else if (userFacultyIds.size > 0) {
                // If no program selected but user has faculty restriction, filter by programs in their faculties
                const programsInFaculties = await prisma.programa_academico.findMany({
                    where: {
                        id_facultad: { in: Array.from(userFacultyIds) },
                        estado: "activo"
                    },
                    select: {
                        id_programa: true
                    }
                });

                const programIdsInFaculties = programsInFaculties.map(p => p.id_programa);
                
                if (programIdsInFaculties.length > 0) {
                    studentsWhere.id_programa_academico = { in: programIdsInFaculties };
                } else {
                    // No programs in user's faculties, return empty
                    return res.json([]);
                }
            }

            // Get all confirmed students matching the criteria
            const allStudents = await prisma.persona.findMany({
                where: studentsWhere,
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
                objectives: project.objetivos,
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
                objectives: project.objetivos,
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
                objectives,
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
                    objetivos: objectives || null,
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
                objectives,
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
                        ...(objectives !== undefined && { objetivos: objectives }),
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

    // Bulk upload projects via Excel file
    async bulkUploadProjects(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res
                    .status(400)
                    .json({ error: "Adjunta un archivo Excel (.xlsx o .xls)." });
            }

            let workbook: XLSX.WorkBook;
            try {
                workbook = XLSX.read(req.file.buffer, {
                    type: "buffer",
                    cellDates: true,
                });
            } catch (error) {
                logger.error("Invalid Excel file:", error);
                return res.status(400).json({
                    error: "No se pudo leer el archivo. Verifica que sea un Excel válido.",
                });
            }

            if (!workbook.SheetNames.length) {
                return res
                    .status(400)
                    .json({ error: "El archivo no contiene hojas." });
            }

            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
                sheet,
                {
                    defval: "",
                    raw: false,
                    dateNF: "yyyy-mm-dd",
                },
            );

            if (!rawRows.length) {
                return res
                    .status(400)
                    .json({ error: "El archivo no contiene registros." });
            }

            const normalizedRows = rawRows.map((row) => {
                const normalized: Record<string, unknown> = {};
                Object.entries(row).forEach(([key, value]) => {
                    const normalizedKey = normalizeKey(key);
                    normalized[normalizedKey] = value;
                });
                return normalized;
            });

            const requiredColumns = [
                "titulo",
                "modalidad",
                "estado",
                "programa",
                "fecha_inicio",
                "estudiantes",
            ];
            const availableColumns = new Set<string>();
            normalizedRows.forEach((row) => {
                Object.keys(row).forEach((key) => availableColumns.add(key));
            });

            const missingColumns = requiredColumns.filter(
                (column) => !availableColumns.has(column),
            );

            if (missingColumns.length) {
                return res.status(400).json({
                    error: `Faltan columnas requeridas en el encabezado: ${missingColumns.join(
                        ", ",
                    )}`,
                });
            }

            const [
                modalities,
                statuses,
                programs,
                companies,
                studentRole,
                directorRole,
                defaultTipoDoc,
                defaultFacultad,
                defaultNivel,
            ] = await Promise.all([
                prisma.opcion_grado.findMany(),
                prisma.estado_tg.findMany(),
                prisma.programa_academico.findMany(),
                prisma.empresa.findMany(),
                prisma.tipo_rol.findFirst({
                    where: { nombre_rol: "Estudiante" },
                }),
                prisma.tipo_rol.findFirst({
                    where: { nombre_rol: "Director" },
                }),
                prisma.tipo_documento.findFirst({
                    where: { documento: "CC" },
                }),
                prisma.facultad.findFirst(),
                prisma.nivel_formacion.findFirst({
                    where: { nombre_nivel: "Pregrado" },
                }),
            ]);

            if (!studentRole || !directorRole) {
                return res.status(500).json({
                    error: "Roles base (Estudiante o Director) no están configurados en el sistema.",
                });
            }

            if (!defaultTipoDoc) {
                return res.status(500).json({
                    error: "Tipo de documento 'CC' no está configurado en el sistema.",
                });
            }

            if (!defaultFacultad || !defaultNivel) {
                return res.status(500).json({
                    error: "No hay facultad o nivel de formación disponible para crear programas académicos.",
                });
            }

            const modalityMap = new Map(
                modalities.map((item) => [
                    normalizeValue(item.nombre_opcion_grado),
                    item,
                ]),
            );
            const statusMap = new Map(
                statuses.map((item) => [
                    normalizeValue(item.nombre_estado),
                    item,
                ]),
            );
            const programMap = new Map(
                programs.map((item) => [
                    normalizeValue(item.nombre_programa),
                    item,
                ]),
            );
            const companyMap = new Map(
                companies.map((item) => [
                    normalizeValue(item.nombre_empresa),
                    item,
                ]),
            );

            const summary = {
                totalRows: normalizedRows.length,
                imported: 0,
                failed: 0,
                rows: [] as Array<{
                    row: number;
                    status: "success" | "error";
                    title?: string;
                    messages: string[];
                }>,
            };

            const personaCache = new Map<
                string,
                Awaited<
                    ReturnType<(typeof prisma)["persona"]["findUnique"]>
                > | null
            >();
            const studentAssignmentCache = new Map<string, boolean>();
            const createdStatusesCache = new Map<string, Awaited<ReturnType<(typeof prisma)["estado_tg"]["create"]>>>();
            const createdProgramsCache = new Map<string, Awaited<ReturnType<(typeof prisma)["programa_academico"]["create"]>>>();
            const createdCompaniesCache = new Map<string, Awaited<ReturnType<(typeof prisma)["empresa"]["create"]>>>();
            const createdPersonasCache = new Map<string, Awaited<ReturnType<(typeof prisma)["persona"]["create"]>>>();

            const findPersonaByDocument = async (document: string) => {
                if (personaCache.has(document)) {
                    return personaCache.get(document) || null;
                }
                const persona = await prisma.persona.findUnique({
                    where: { num_doc_identidad: document },
                });
                personaCache.set(document, persona ?? null);
                return persona ?? null;
            };

            // Helper function to create or get status
            const getOrCreateStatus = async (statusName: string): Promise<Awaited<ReturnType<(typeof prisma)["estado_tg"]["create"]>>> => {
                // Normalize the status name for comparison
                const normalizedName = normalizeValue(statusName);
                
                // Check if already exists in the map
                if (statusMap.has(normalizedName)) {
                    return statusMap.get(normalizedName)!;
                }
                if (createdStatusesCache.has(normalizedName)) {
                    return createdStatusesCache.get(normalizedName)!;
                }
                
                // Normalize common status names to standard format
                let finalStatusName = statusName;
                if (normalizedName === "encurso") {
                    finalStatusName = "En curso";
                } else if (normalizedName === "enprogreso") {
                    finalStatusName = "En Progreso";
                } else if (normalizedName === "enrevision") {
                    finalStatusName = "En Revisión";
                } else if (normalizedName === "pendientedeaprobacion") {
                    finalStatusName = "Pendiente de Aprobación";
                }
                
                // Get max orden to add new status at the end
                const maxOrden = await prisma.estado_tg.aggregate({
                    _max: { orden: true }
                });
                const newOrden = (maxOrden._max.orden ?? 0) + 1;

                const newStatus = await prisma.estado_tg.create({
                    data: {
                        nombre_estado: finalStatusName,
                        descripcion: `Estado creado automáticamente desde importación Excel`,
                        orden: newOrden,
                    },
                });
                statusMap.set(normalizedName, newStatus);
                createdStatusesCache.set(normalizedName, newStatus);
                return newStatus;
            };

            // Helper function to create or get program
            const getOrCreateProgram = async (programName: string): Promise<Awaited<ReturnType<(typeof prisma)["programa_academico"]["create"]>>> => {
                const normalizedName = normalizeValue(programName);
                if (programMap.has(normalizedName)) {
                    return programMap.get(normalizedName)!;
                }
                if (createdProgramsCache.has(normalizedName)) {
                    return createdProgramsCache.get(normalizedName)!;
                }

                const newProgram = await prisma.programa_academico.create({
                    data: {
                        nombre_programa: programName,
                        id_facultad: defaultFacultad.id_facultad,
                        id_nivel_formacion: defaultNivel.id_nivel,
                        estado: "Activo",
                    },
                });
                programMap.set(normalizedName, newProgram);
                createdProgramsCache.set(normalizedName, newProgram);
                return newProgram;
            };

            // Helper function to create or get company
            const getOrCreateCompany = async (companyName: string): Promise<Awaited<ReturnType<(typeof prisma)["empresa"]["create"]>>> => {
                const normalizedName = normalizeValue(companyName);
                if (companyMap.has(normalizedName)) {
                    return companyMap.get(normalizedName)!;
                }
                if (createdCompaniesCache.has(normalizedName)) {
                    return createdCompaniesCache.get(normalizedName)!;
                }

                // Generate a NIT from company name (simple hash-like approach)
                const nit = `NIT-${companyName.replace(/\s+/g, '').substring(0, 9).toUpperCase()}-${Math.floor(Math.random() * 10)}`;

                const newCompany = await prisma.empresa.create({
                    data: {
                        nombre_empresa: companyName,
                        nit_empresa: nit,
                        estado: "Activo",
                        direccion: null,
                        email: null,
                        telefono: null,
                    },
                });
                companyMap.set(normalizedName, newCompany);
                createdCompaniesCache.set(normalizedName, newCompany);
                return newCompany;
            };

            // Helper function to create or get persona (student/advisor)
            const getOrCreatePersona = async (document: string, isStudent: boolean): Promise<Awaited<ReturnType<(typeof prisma)["persona"]["create"]>>> => {
                if (personaCache.has(document)) {
                    const cached = personaCache.get(document);
                    if (cached) return cached;
                }
                if (createdPersonasCache.has(document)) {
                    return createdPersonasCache.get(document)!;
                }

                // Generate email from document (ensure uniqueness)
                const docNumbers = document.replace(/[^0-9]/g, '');
                let email = `${docNumbers}@unimayor.edu.co`;
                let emailCounter = 1;
                
                // Check if email already exists and make it unique
                while (await prisma.persona.findUnique({ where: { correo_electronico: email } })) {
                    email = `${docNumbers}${emailCounter}@unimayor.edu.co`;
                    emailCounter++;
                }
                
                // Generate names (placeholder - in real scenario, Excel should have these)
                const nombres = `Usuario`;
                const apellidos = `Documento ${document}`;

                // Prisma will auto-generate id_persona with cuid()
                const newPersona = await prisma.persona.create({
                    data: {
                        nombres: nombres,
                        apellidos: apellidos,
                        num_doc_identidad: document,
                        id_tipo_doc_identidad: defaultTipoDoc.id_tipo_documento,
                        correo_electronico: email,
                        numero_celular: "0000000000",
                        confirmed: false,
                    },
                });
                personaCache.set(document, newPersona);
                createdPersonasCache.set(document, newPersona);
                return newPersona;
            };

            const hasActiveProject = async (personaId: string) => {
                if (studentAssignmentCache.has(personaId)) {
                    return studentAssignmentCache.get(personaId) ?? false;
                }
                const existing = await prisma.actores.findFirst({
                    where: {
                        id_persona: personaId,
                        id_tipo_rol: studentRole.id_rol,
                        estado: "Activo",
                    },
                    select: { id_actor: true },
                });
                const value = Boolean(existing);
                studentAssignmentCache.set(personaId, value);
                return value;
            };

            for (let index = 0; index < normalizedRows.length; index++) {
                const rowNumber = index + 2; // Consider header row
                const row = normalizedRows[index];
                const errors: string[] = [];

                const title = toStringValue(row["titulo"]);
                const summaryText = toStringValue(row["resumen"]);
                const objectivesText = toStringValue(row["objetivos"]);
                const modalityValue = normalizeValue(
                    toStringValue(row["modalidad"]),
                );
                const statusValue = normalizeValue(
                    toStringValue(row["estado"]),
                );
                const programValue = normalizeValue(
                    toStringValue(row["programa"]),
                );
                const companyValue = normalizeValue(
                    toStringValue(row["empresa"]),
                );

                if (!title) {
                    errors.push("La columna 'titulo' es obligatoria.");
                }

                const modality = modalityMap.get(modalityValue);
                if (!modality) {
                    errors.push("La modalidad indicada no existe en el sistema.");
                }

                // Auto-create status if it doesn't exist
                let status = statusMap.get(normalizeValue(statusValue));
                if (!status && statusValue) {
                    try {
                        status = await getOrCreateStatus(statusValue);
                    } catch (error) {
                        logger.error(`Error creating status ${statusValue}:`, error);
                        errors.push(`Error al crear el estado '${statusValue}'.`);
                    }
                }

                // Auto-create program if it doesn't exist
                let program = programMap.get(normalizeValue(programValue));
                if (!program && programValue) {
                    try {
                        program = await getOrCreateProgram(programValue);
                    } catch (error) {
                        logger.error(`Error creating program ${programValue}:`, error);
                        errors.push(`Error al crear el programa académico '${programValue}'.`);
                    }
                }

                // Auto-create company if it doesn't exist
                let company =
                    companyValue && companyMap.has(normalizeValue(companyValue))
                        ? companyMap.get(normalizeValue(companyValue)) ?? null
                        : null;
                if (!company && companyValue) {
                    try {
                        company = await getOrCreateCompany(companyValue);
                    } catch (error) {
                        logger.error(`Error creating company ${companyValue}:`, error);
                        errors.push(`Error al crear la empresa '${companyValue}'.`);
                    }
                }

                const startDate = parseExcelDate(row["fecha_inicio"]);
                if (!startDate) {
                    errors.push(
                        "La fecha de inicio es obligatoria y debe tener un formato válido (YYYY-MM-DD).",
                    );
                }

                const endDateRaw = row["fecha_fin"];
                const endDate = endDateRaw
                    ? parseExcelDate(endDateRaw)
                    : null;
                if (endDateRaw && !endDate) {
                    errors.push(
                        "La fecha de fin no tiene un formato válido (usa YYYY-MM-DD).",
                    );
                }

                if (startDate && endDate && endDate < startDate) {
                    errors.push(
                        "La fecha de fin no puede ser anterior a la fecha de inicio.",
                    );
                }

                const studentDocuments = splitList(row["estudiantes"]);
                if (!studentDocuments.length) {
                    errors.push(
                        "Debe incluir al menos un documento en la columna 'estudiantes'.",
                    );
                }
                if (studentDocuments.length > 2) {
                    errors.push(
                        "Solo se permiten máximo 2 estudiantes por proyecto.",
                    );
                }
                if (
                    new Set(studentDocuments).size !== studentDocuments.length
                ) {
                    errors.push(
                        "Hay documentos de estudiantes duplicados en la misma fila.",
                    );
                }

                const advisorDocuments = splitList(row["asesores"]);
                if (advisorDocuments.length > 2) {
                    errors.push(
                        "Solo se permiten máximo 2 asesores/directores por proyecto.",
                    );
                }
                if (
                    advisorDocuments.length &&
                    new Set(advisorDocuments).size !==
                        advisorDocuments.length
                ) {
                    errors.push(
                        "Hay documentos de asesores duplicados en la misma fila.",
                    );
                }

                const studentPersonas = [];
                for (const document of studentDocuments) {
                    let persona = await findPersonaByDocument(document);
                    if (!persona) {
                        // Auto-create student if it doesn't exist
                        try {
                            persona = await getOrCreatePersona(document, true);
                        } catch (error) {
                            logger.error(`Error creating student with document ${document}:`, error);
                            errors.push(
                                `Error al crear el estudiante con documento ${document}.`,
                            );
                            continue;
                        }
                    }
                    studentPersonas.push(persona);
                }

                const advisorPersonas = [];
                for (const document of advisorDocuments) {
                    let persona = await findPersonaByDocument(document);
                    if (!persona) {
                        // Auto-create advisor if it doesn't exist
                        try {
                            persona = await getOrCreatePersona(document, false);
                        } catch (error) {
                            logger.error(`Error creating advisor with document ${document}:`, error);
                            errors.push(
                                `Error al crear el asesor/director con documento ${document}.`,
                            );
                            continue;
                        }
                    }
                    advisorPersonas.push(persona);
                }

                if (!errors.length) {
                    for (const persona of studentPersonas) {
                        const alreadyAssigned = await hasActiveProject(
                            persona.id_persona,
                        );
                        if (alreadyAssigned) {
                            errors.push(
                                `El estudiante ${persona.nombres} ${persona.apellidos} ya tiene un proyecto activo.`,
                            );
                        }
                    }
                }

                // Company is now auto-created if needed, so we don't need this error check

                if (errors.length) {
                    summary.failed += 1;
                    summary.rows.push({
                        row: rowNumber,
                        status: "error",
                        title,
                        messages: errors,
                    });
                    continue;
                }

                try {
                    await prisma.$transaction(async (tx) => {
                        const project = await tx.trabajo_grado.create({
                            data: {
                                titulo_trabajo: title,
                                resumen: summaryText || null,
                                id_opcion_grado: modality!.id_opcion_grado,
                                id_estado_actual: status!.id_estado_tg,
                                id_programa_academico:
                                    program!.id_programa,
                                id_empresa_practica: company
                                    ? company.id_empresa
                                    : null,
                                objetivos: objectivesText || null,
                                fecha_inicio: startDate!,
                                fecha_fin_estima: endDate,
                            },
                        });

                        for (const persona of studentPersonas) {
                            await tx.actores.create({
                                data: {
                                    id_persona: persona.id_persona,
                                    id_trabajo_grado:
                                        project.id_trabajo_grado,
                                    id_tipo_rol: studentRole.id_rol,
                                    fecha_asignacion: new Date(),
                                    estado: "Activo",
                                },
                            });
                        }

                        for (const persona of advisorPersonas) {
                            await tx.actores.create({
                                data: {
                                    id_persona: persona.id_persona,
                                    id_trabajo_grado:
                                        project.id_trabajo_grado,
                                    id_tipo_rol: directorRole.id_rol,
                                    fecha_asignacion: new Date(),
                                    estado: "Activo",
                                },
                            });
                        }
                    });

                    studentPersonas.forEach((persona) => {
                        studentAssignmentCache.set(persona.id_persona, true);
                    });

                    summary.imported += 1;
                    summary.rows.push({
                        row: rowNumber,
                        status: "success",
                        title,
                        messages: ["Proyecto creado correctamente."],
                    });
                } catch (error) {
                    logger.error(
                        "Error creating project from bulk upload:",
                        error,
                    );
                    summary.failed += 1;
                    summary.rows.push({
                        row: rowNumber,
                        status: "error",
                        title,
                        messages: [
                            "No se pudo crear el proyecto por un error interno.",
                        ],
                    });
                }
            }

            const statusCode =
                summary.imported && summary.failed ? 207 : summary.failed ? 400 : 201;

            logger.info(
                `Bulk upload processed. Success: ${summary.imported}, Failed: ${summary.failed}`,
            );

            return res.status(statusCode).json(summary);
        } catch (error) {
            logger.error("Error bulk uploading projects:", error);
            return res
                .status(500)
                .json({ error: "Error al procesar el archivo." });
        }
    }

    // Generate sample Excel template for bulk uploads
    async downloadBulkTemplate(req: Request, res: Response) {
        try {
            const headers = [
                "Titulo",
                "Resumen",
                "Objetivos",
                "Modalidad",
                "Estado",
                "Programa",
                "Empresa",
                "Fecha_inicio",
                "Fecha_fin",
                "Estudiantes",
                "Asesores",
            ];

            const [modalities, statuses, programs, companies, studentRole, directorRole] =
                await Promise.all([
                    prisma.opcion_grado.findMany({
                        where: { estado: "activo" },
                        select: { nombre_opcion_grado: true },
                        orderBy: { nombre_opcion_grado: "asc" },
                    }),
                    prisma.estado_tg.findMany({
                        select: { nombre_estado: true, orden: true },
                        orderBy: { orden: "asc" },
                    }),
                    prisma.programa_academico.findMany({
                        where: { estado: "activo" },
                        select: { nombre_programa: true },
                        orderBy: { nombre_programa: "asc" },
                    }),
                    prisma.empresa.findMany({
                        where: { estado: "activo" },
                        select: { nombre_empresa: true },
                        orderBy: { nombre_empresa: "asc" },
                    }),
                    prisma.tipo_rol.findFirst({
                        where: { nombre_rol: "Estudiante" },
                        select: { id_rol: true },
                    }),
                    prisma.tipo_rol.findFirst({
                        where: { nombre_rol: "Director" },
                        select: { id_rol: true },
                    }),
                ]);

            const availableStudents = await prisma.persona.findMany({
                where: {
                    confirmed: true,
                    password: { not: null },
                    ...(studentRole
                        ? {
                              actores: {
                                  none: {
                                      id_tipo_rol: studentRole.id_rol,
                                      estado: "Activo",
                                  },
                              },
                          }
                        : {}),
                },
                select: {
                    nombres: true,
                    apellidos: true,
                    num_doc_identidad: true,
                },
                take: 2,
            });

            const studentDocs =
                availableStudents.length > 0
                    ? availableStudents.map((student) => student.num_doc_identidad)
                    : ["DOCUMENTO_ESTUDIANTE_1", "DOCUMENTO_ESTUDIANTE_2"];

            const advisorCandidates = await prisma.persona.findMany({
                where: directorRole
                    ? {
                          actores: {
                              some: {
                                  id_tipo_rol: directorRole.id_rol,
                              },
                          },
                      }
                    : {},
                select: {
                    nombres: true,
                    apellidos: true,
                    num_doc_identidad: true,
                },
                take: 2,
            });

            const advisorDocs =
                advisorCandidates.length > 0
                    ? advisorCandidates.map((advisor) => advisor.num_doc_identidad)
                    : ["DOCUMENTO_ASESOR_1"];

            const firstModality =
                modalities[0]?.nombre_opcion_grado || "Modalidad existente";
            const firstStatus = statuses[0]?.nombre_estado || "En Progreso";
            const firstProgram =
                programs[0]?.nombre_programa || "Programa académico existente";
            const firstCompany = companies[0]?.nombre_empresa || "";

            const rows = [
                {
                    Titulo: "Sistema de monitoreo de laboratorios",
                    Resumen:
                        "Plataforma para registrar y supervisar el estado de los laboratorios del campus.",
                    Objetivos:
                        "Automatizar monitoreo y generar alertas tempranas.",
                    Modalidad: firstModality,
                    Estado: firstStatus,
                    Programa: firstProgram,
                    Empresa: firstCompany,
                    Fecha_inicio: "2025-02-17",
                    Fecha_fin: "2025-08-30",
                    Estudiantes: studentDocs.join(";"),
                    Asesores: advisorDocs.join(";"),
                },
                {
                    Titulo: "Reemplaza este título por tu proyecto",
                    Resumen:
                        "Incluye un resumen corto del objetivo principal del trabajo.",
                    Objetivos:
                        "Describe las metas principales del trabajo.",
                    Modalidad: "Debe coincidir con una modalidad activa",
                    Estado: "Debe existir en la tabla de estados",
                    Programa: "Nombre exacto del programa académico",
                    Empresa: "Opcional. Déjalo vacío si no aplica.",
                    Fecha_inicio: "AAAA-MM-DD",
                    Fecha_fin:
                        "AAAA-MM-DD (Opcional, debe ser >= Fecha_inicio)",
                    Estudiantes:
                        "DocumentoEstudiante1;DocumentoEstudiante2 (máx. 2)",
                    Asesores:
                        "DocumentoDirector1;DocumentoDirector2 (máx. 2, opcional)",
                },
            ];

            const worksheet = XLSX.utils.json_to_sheet(rows, {
                header: headers,
                skipHeader: false,
            });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Proyectos");

            const buffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "buffer",
            });

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            );
            res.setHeader(
                "Content-Disposition",
                'attachment; filename="bulk-projects-sample.xlsx"',
            );

            return res.send(buffer);
        } catch (error) {
            logger.error("Error generating bulk template:", error);
            return res
                .status(500)
                .json({ error: "No se pudo generar la plantilla." });
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

