import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class EventController {
    // Get all events (notifications) with pagination, filtered by user role
    getEvents = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id_persona;
            if (!userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string | undefined;
            const priority = req.query.priority as string | undefined;
            const status = req.query.status as string | undefined;
            const skip = (page - 1) * limit;

            // Get user's roles and determine their type
            const userActors = await prisma.actores.findMany({
                where: {
                    id_persona: userId,
                    estado: 'Activo'
                },
                include: {
                    tipo_rol: true,
                    trabajo_grado: {
                        include: {
                            programa_academico: {
                                include: {
                                    facultad: true
                                }
                            }
                        }
                    }
                }
            });

            // Determine user role type
            const studentRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: 'Estudiante' }
            });
            const coordinatorRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: 'Coordinador de Carrera' }
            });
            const teacherRoles = await prisma.tipo_rol.findMany({
                where: {
                    nombre_rol: { in: ['Director', 'Asesor', 'Asesor Externo'] }
                }
            });
            const teacherRoleIds = teacherRoles.map(r => r.id_rol);

            const isStudent = userActors.some(a => a.id_tipo_rol === studentRole?.id_rol);
            const isCoordinator = userActors.some(a => a.id_tipo_rol === coordinatorRole?.id_rol);
            const isTeacher = userActors.some(a => teacherRoleIds.includes(a.id_tipo_rol));

            // Build where clause based on user role
            let whereClause: any = {
                activo: true,
            };

            // Add search filter
            if (search && search.trim()) {
                whereClause.AND = [
                    {
                        OR: [
                            { titulo: { contains: search.trim() } },
                            { descripcion: { contains: search.trim() } },
                        ],
                    },
                ];
            }

            // Add priority filter
            if (priority && priority !== 'all') {
                whereClause.prioridad = priority;
            }

            // Add status/date filter
            if (status && status !== 'all') {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);

                if (status === 'active') {
                    // Events whose end date is today or in the future
                    whereClause.fecha_fin = { gte: now };
                } else if (status === 'past') {
                    // Events whose end date is in the past
                    whereClause.fecha_fin = { lt: now };
                } else if (status === 'today') {
                    // Events whose end date is today
                    whereClause.fecha_fin = { gte: now, lt: tomorrow };
                } else if (status === 'future') {
                    // Events whose end date is after today
                    whereClause.fecha_fin = { gte: tomorrow };
                }
            }

            if (isCoordinator) {
                // Coordinators see all events from projects in their faculty
                const coordinatorPersona = await prisma.persona.findUnique({
                    where: { id_persona: userId },
                    select: { id_facultad: true }
                });

                let facultyId = coordinatorPersona?.id_facultad;

                // If not found directly, get from their roles/projects
                if (!facultyId) {
                    const coordinatorProjects = userActors.filter(a => a.id_tipo_rol === coordinatorRole?.id_rol);
                    if (coordinatorProjects.length > 0 && coordinatorProjects[0].trabajo_grado?.programa_academico?.id_facultad) {
                        facultyId = coordinatorProjects[0].trabajo_grado.programa_academico.id_facultad;
                    }
                }

                if (facultyId) {
                    // Show events from faculty projects OR events without a project (global events)
                    const facultyCondition = {
                        OR: [
                            {
                                trabajo_grado: {
                                    programa_academico: {
                                        id_facultad: facultyId
                                    }
                                }
                            },
                            { id_trabajo_grado: null }
                        ]
                    };
                    whereClause.AND = [
                        ...(whereClause.AND || []),
                        facultyCondition,
                    ];
                } else {
                    // If coordinator has no faculty assigned, show no events
                    // Use a condition that will never match
                    whereClause.AND = [
                        ...(whereClause.AND || []),
                        { id_trabajo_grado: { not: null } },
                        { id_trabajo_grado: null }
                    ];
                }
            } else if (isStudent) {
                // Students see only events from their projects
                const studentProjectIds = userActors
                    .filter(a => a.id_tipo_rol === studentRole?.id_rol)
                    .map(a => a.id_trabajo_grado);

                if (studentProjectIds.length > 0) {
                    whereClause.id_trabajo_grado = {
                        in: studentProjectIds
                    };
                } else {
                    whereClause.AND = [
                        ...(whereClause.AND || []),
                        { id_trabajo_grado: { not: null } },
                        { id_trabajo_grado: null }
                    ];
                }
            } else if (isTeacher) {
                // Teachers/Directors see only events from projects they direct/advise
                const teacherProjectIds = userActors
                    .filter(a => teacherRoleIds.includes(a.id_tipo_rol))
                    .map(a => a.id_trabajo_grado);

                if (teacherProjectIds.length > 0) {
                    whereClause.id_trabajo_grado = {
                        in: teacherProjectIds
                    };
                } else {
                    // No projects, no events - use condition that never matches
                    whereClause.AND = [
                        ...(whereClause.AND || []),
                        { id_trabajo_grado: { not: null } },
                        { id_trabajo_grado: null }
                    ];
                }
            } else {
                // Unknown role, show no events
                whereClause.AND = [
                    ...(whereClause.AND || []),
                    { id_trabajo_grado: { not: null } },
                    { id_trabajo_grado: null }
                ];
            }

            // Get total count for pagination
            const total = await prisma.evento.count({
                where: whereClause,
            });

            const events = await prisma.evento.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    trabajo_grado: {
                        select: {
                            titulo_trabajo: true,
                        },
                    },
                },
            });

            // Sort manually: alta first, then by days remaining (ascending for future, descending for past)
            const now = new Date();
            events.sort((a, b) => {
                const priorityOrder: { [key: string]: number } = { 'alta': 0, 'media': 1, 'baja': 2 };
                const aPriority = priorityOrder[a.prioridad] ?? 3;
                const bPriority = priorityOrder[b.prioridad] ?? 3;

                if (aPriority !== bPriority) {
                    return aPriority - bPriority;
                }

                // If same priority, sort by date (future events first, then past)
                const aDate = new Date(a.fecha_fin);
                aDate.setHours(0, 0, 0, 0);
                const bDate = new Date(b.fecha_fin);
                bDate.setHours(0, 0, 0, 0);
                const nowForSort = new Date();
                nowForSort.setHours(0, 0, 0, 0);
                const aDaysRemaining = Math.round((aDate.getTime() - nowForSort.getTime()) / (1000 * 60 * 60 * 24));
                const bDaysRemaining = Math.round((bDate.getTime() - nowForSort.getTime()) / (1000 * 60 * 60 * 24));

                // Future events first (ascending), then past events (descending)
                if (aDaysRemaining >= 0 && bDaysRemaining >= 0) {
                    return aDaysRemaining - bDaysRemaining; // Future: ascending
                } else if (aDaysRemaining < 0 && bDaysRemaining < 0) {
                    return bDaysRemaining - aDaysRemaining; // Past: descending (most recent first)
                } else {
                    return aDaysRemaining >= 0 ? -1 : 1; // Future before past
                }
            });

            // Calculate days remaining and add color based on priority and days
            const eventsWithColors = events.map(event => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const eventDate = new Date(event.fecha_fin);
                eventDate.setHours(0, 0, 0, 0);
                const daysRemaining = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                let color = 'gray'; // default
                let borderColor = 'border-gray-300';

                if (daysRemaining < 0) {
                    // Past events
                    color = 'gray';
                    borderColor = 'border-gray-300';
                } else if (event.prioridad === 'alta') {
                    if (daysRemaining <= 1) {
                        color = 'red';
                        borderColor = 'border-red-500';
                    } else if (daysRemaining <= 3) {
                        color = 'orange';
                        borderColor = 'border-orange-500';
                    } else {
                        color = 'red';
                        borderColor = 'border-red-400';
                    }
                } else if (event.prioridad === 'media') {
                    if (daysRemaining <= 1) {
                        color = 'orange';
                        borderColor = 'border-orange-500';
                    } else if (daysRemaining <= 7) {
                        color = 'yellow';
                        borderColor = 'border-yellow-500';
                    } else {
                        color = 'blue';
                        borderColor = 'border-blue-400';
                    }
                } else {
                    // baja
                    if (daysRemaining <= 1) {
                        color = 'yellow';
                        borderColor = 'border-yellow-400';
                    } else if (daysRemaining <= 7) {
                        color = 'blue';
                        borderColor = 'border-blue-300';
                    } else {
                        color = 'green';
                        borderColor = 'border-green-400';
                    }
                }

                return {
                    id: event.id_evento,
                    title: event.titulo,
                    description: event.descripcion,
                    start: event.fecha_inicio,
                    end: event.fecha_fin,
                    horaInicio: event.hora_inicio,
                    horaFin: event.hora_fin,
                    prioridad: event.prioridad,
                    allDay: event.todo_el_dia,
                    daysRemaining,
                    color,
                    borderColor,
                    proyectoTitulo: event.trabajo_grado?.titulo_trabajo || null,
                };
            });

            res.json({
                events: eventsWithColors,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1,
                },
            });
        } catch (error: any) {
            console.error('Error getting events:', error);
            res.status(500).json({ message: 'Error al obtener eventos', error: error.message });
        }
    };

    // Create event (coordinator only)
    createEvent = async (req: Request, res: Response) => {
        try {
            const { titulo, descripcion, fecha_inicio, fecha_fin, hora_inicio, hora_fin, prioridad, todo_el_dia, id_trabajo_grado } = req.body;

            if (!titulo || !fecha_inicio || !fecha_fin || !prioridad) {
                return res.status(400).json({ message: 'Faltan campos requeridos' });
            }

            const event = await prisma.evento.create({
                data: {
                    titulo,
                    descripcion: descripcion || null,
                    fecha_inicio: new Date(fecha_inicio),
                    fecha_fin: new Date(fecha_fin),
                    hora_inicio: hora_inicio || null,
                    hora_fin: hora_fin || null,
                    prioridad: prioridad.toLowerCase(),
                    todo_el_dia: todo_el_dia || false,
                    id_trabajo_grado: id_trabajo_grado || null,
                },
            });

            res.status(201).json(event);
        } catch (error: any) {
            console.error('Error creating event:', error);
            res.status(500).json({ message: 'Error al crear evento', error: error.message });
        }
    };

    // Update event (coordinator only)
    updateEvent = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { titulo, descripcion, fecha_inicio, fecha_fin, hora_inicio, hora_fin, prioridad, todo_el_dia, id_trabajo_grado } = req.body;

            const event = await prisma.evento.update({
                where: { id_evento: id },
                data: {
                    ...(titulo && { titulo }),
                    ...(descripcion !== undefined && { descripcion }),
                    ...(fecha_inicio && { fecha_inicio: new Date(fecha_inicio) }),
                    ...(fecha_fin && { fecha_fin: new Date(fecha_fin) }),
                    ...(hora_inicio !== undefined && { hora_inicio }),
                    ...(hora_fin !== undefined && { hora_fin }),
                    ...(prioridad && { prioridad: prioridad.toLowerCase() }),
                    ...(todo_el_dia !== undefined && { todo_el_dia }),
                    ...(id_trabajo_grado !== undefined && { id_trabajo_grado: id_trabajo_grado || null }),
                },
            });

            res.json(event);
        } catch (error: any) {
            console.error('Error updating event:', error);
            res.status(500).json({ message: 'Error al actualizar evento', error: error.message });
        }
    };

    // Delete event (admin only)
    deleteEvent = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            await prisma.evento.update({
                where: { id_evento: id },
                data: { activo: false },
            });

            res.json({ message: 'Evento eliminado correctamente' });
        } catch (error: any) {
            console.error('Error deleting event:', error);
            res.status(500).json({ message: 'Error al eliminar evento', error: error.message });
        }
    };
}

