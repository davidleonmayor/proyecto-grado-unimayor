import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PersonController {
    // Get all teachers/directors with pagination
    getTeachers = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;
            const search = (req.query.search as string) || '';
            const filterRole = (req.query.role as string) || 'all';
            const filterFaculty = (req.query.faculty as string) || 'all';
            const userId = req.user?.id_persona;

            // Get teacher/director roles
            const teacherRoles = await prisma.tipo_rol.findMany({
                where: {
                    nombre_rol: { in: ['Director', 'Asesor', 'Asesor Externo'] }
                }
            });
            const teacherRoleIds = teacherRoles.map(r => r.id_rol);

            // Get coordinator role
            const coordinatorRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: 'Coordinador de Carrera' }
            });

            // Check if user is coordinator and get their faculty
            let userFacultyId: string | null = null;
            if (userId && coordinatorRole) {
                const userPersona = await prisma.persona.findUnique({
                    where: { id_persona: userId },
                    select: { id_facultad: true }
                });
                if (userPersona?.id_facultad) {
                    userFacultyId = userPersona.id_facultad;
                } else {
                    // Check if user is coordinator through actores
                    const coordinatorActor = await prisma.actores.findFirst({
                        where: {
                            id_persona: userId,
                            id_tipo_rol: coordinatorRole.id_rol,
                            estado: 'Activo'
                        }
                    });
                    if (coordinatorActor) {
                        // Get faculty from coordinator's persona
                        const coordinatorPersona = await prisma.persona.findUnique({
                            where: { id_persona: userId },
                            select: { id_facultad: true }
                        });
                        if (coordinatorPersona?.id_facultad) {
                            userFacultyId = coordinatorPersona.id_facultad;
                        }
                    }
                }
            }

            // Build where clause
            // Un profesor/director no tiene id_programa_academico (los estudiantes sí lo tienen)
            let where: any = {
                id_programa_academico: null
            };

            // If user is coordinator, filter by their faculty
            if (userFacultyId && filterFaculty === 'all') {
                where.id_facultad = userFacultyId;
            } else if (filterFaculty !== 'all') {
                where.id_facultad = filterFaculty;
            }

            // Search filter
            if (search) {
                where.OR = [
                    { nombres: { contains: search } },
                    { apellidos: { contains: search } },
                    { correo_electronico: { contains: search } },
                    { num_doc_identidad: { contains: search } }
                ];
            }

            // Get total count
            const total = await prisma.persona.count({ where });

            // If filtering by role, add role filter to the query
            if (filterRole !== 'all') {
                const specificRole = await prisma.tipo_rol.findFirst({
                    where: { nombre_rol: filterRole }
                });
                if (specificRole) {
                    where.actores = {
                        some: {
                            id_tipo_rol: specificRole.id_rol,
                            estado: 'Activo'
                        }
                    };
                }
            }

            // Recalculate total with role filter if applied
            const filteredTotal = filterRole !== 'all' ? await prisma.persona.count({ where }) : total;

            const teachers = await prisma.persona.findMany({
                where,
                skip,
                take: limit,
                include: {
                    facultad: true,
                    actores: {
                        where: {
                            id_tipo_rol: { in: teacherRoleIds },
                            estado: 'Activo'
                        },
                        include: {
                            tipo_rol: true,
                            trabajo_grado: {
                                select: {
                                    id_trabajo_grado: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    nombres: 'asc'
                }
            });

            // Get role IDs for checking
            const directorRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: 'Director' }
            });
            const asesorRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: 'Asesor' }
            });
            const asesorExternoRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: 'Asesor Externo' }
            });

            // Format response - determine role based on projects
            const formattedTeachers = teachers.map(teacher => {
                // Get all active roles for this teacher
                const allRoles = teacher.actores
                    .filter(a => a.estado === 'Activo')
                    .map(a => a.tipo_rol?.nombre_rol)
                    .filter(Boolean);

                // Check if teacher has any projects assigned (Director, Asesor, or Asesor Externo)
                const hasProjects = teacher.actores.some(
                    a => a.estado === 'Activo' &&
                        a.trabajo_grado !== null &&
                        (
                            (directorRole && a.id_tipo_rol === directorRole.id_rol) ||
                            (asesorRole && a.id_tipo_rol === asesorRole.id_rol) ||
                            (asesorExternoRole && a.id_tipo_rol === asesorExternoRole.id_rol)
                        )
                );

                // Determine primary role:
                // - If has projects (as Director, Asesor, or Asesor Externo), show as "Director"
                // - Otherwise, show as "Profesor" (no projects assigned yet)
                let primaryRole: string;
                if (hasProjects) {
                    primaryRole = 'Director';
                } else {
                    // No projects assigned, they are "Profesor"
                    primaryRole = 'Profesor';
                }

                return {
                    id: teacher.id_persona,
                    nombre: `${teacher.nombres} ${teacher.apellidos}`.toUpperCase(),
                    email: teacher.correo_electronico,
                    telefono: teacher.numero_celular,
                    rol: primaryRole,
                    allRoles: allRoles, // Include all roles for filtering
                    carrera: teacher.facultad?.nombre_facultad || 'N/A',
                    facultad: teacher.facultad?.nombre_facultad || null,
                    facultadId: teacher.id_facultad,
                    documento: teacher.num_doc_identidad,
                };
            });

            const totalPages = Math.ceil(filteredTotal / limit);

            res.json({
                teachers: formattedTeachers,
                pagination: {
                    page,
                    limit,
                    total: filteredTotal,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            });
        } catch (error: any) {
            console.error('Error getting teachers:', error);
            res.status(500).json({ message: 'Error al obtener profesores', error: error.message });
        }
    };

    // Get all students with pagination
    getStudents = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;
            const search = (req.query.search as string) || '';
            const filterProgram = (req.query.program as string) || 'all';
            const filterFaculty = (req.query.faculty as string) || 'all';
            const userId = req.user?.id_persona;

            // Get student role
            const studentRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: 'Estudiante' }
            });

            if (!studentRole) {
                return res.status(404).json({ message: 'Rol de estudiante no encontrado' });
            }

            // Get coordinator role
            const coordinatorRole = await prisma.tipo_rol.findFirst({
                where: { nombre_rol: 'Coordinador de Carrera' }
            });

            // Check if user is coordinator and get their faculty
            let userFacultyId: string | null = null;
            if (userId && coordinatorRole) {
                const userPersona = await prisma.persona.findUnique({
                    where: { id_persona: userId },
                    select: { id_facultad: true }
                });
                if (userPersona?.id_facultad) {
                    userFacultyId = userPersona.id_facultad;
                } else {
                    // Check if user is coordinator through actores
                    const coordinatorActor = await prisma.actores.findFirst({
                        where: {
                            id_persona: userId,
                            id_tipo_rol: coordinatorRole.id_rol,
                            estado: 'Activo'
                        }
                    });
                    if (coordinatorActor) {
                        // Get faculty from coordinator's persona
                        const coordinatorPersona = await prisma.persona.findUnique({
                            where: { id_persona: userId },
                            select: { id_facultad: true }
                        });
                        if (coordinatorPersona?.id_facultad) {
                            userFacultyId = coordinatorPersona.id_facultad;
                        }
                    }
                }
            }

            // Build where clause
            // Los estudiantes siempre tienen un id_programa_academico asignado
            let where: any = {
                id_programa_academico: { not: null }
            };

            // Search filter
            if (search) {
                where.AND = [
                    {
                        OR: [
                            { nombres: { contains: search } },
                            { apellidos: { contains: search } },
                            { correo_electronico: { contains: search } },
                            { num_doc_identidad: { contains: search } }
                        ]
                    }
                ];
            }

            // Program filter
            if (filterProgram !== 'all') {
                where.id_programa_academico = filterProgram;
            }

            // Faculty filter (through program)
            // If user is coordinator, filter by their faculty
            if (userFacultyId && filterFaculty === 'all') {
                where.programa_academico = {
                    id_facultad: userFacultyId
                };
            } else if (filterFaculty !== 'all') {
                where.programa_academico = {
                    id_facultad: filterFaculty
                };
            }

            // Get total count
            const total = await prisma.persona.count({ where });

            // Get students with their program and faculty
            const students = await prisma.persona.findMany({
                where,
                skip,
                take: limit,
                include: {
                    programa_academico: {
                        include: {
                            facultad: true
                        }
                    },
                    actores: {
                        where: {
                            id_tipo_rol: studentRole.id_rol,
                            estado: 'Activo'
                        },
                        include: {
                            trabajo_grado: {
                                include: {
                                    opcion_grado: true,
                                    estado_tg: true
                                }
                            }
                        },
                        take: 1
                    }
                },
                orderBy: {
                    nombres: 'asc'
                }
            });

            // Format response
            const formattedStudents = students.map(student => {
                const activeProject = student.actores[0]?.trabajo_grado;
                return {
                    id: student.id_persona,
                    nombre: `${student.nombres} ${student.apellidos}`.toUpperCase(),
                    email: student.correo_electronico,
                    carrera: student.programa_academico?.nombre_programa || 'N/A',
                    opcionGrado: activeProject?.opcion_grado?.nombre_opcion_grado || 'N/A',
                    estado: activeProject?.estado_tg?.nombre_estado || 'Sin proyecto',
                    documento: student.num_doc_identidad,
                    programaId: student.id_programa_academico,
                    facultad: student.programa_academico?.facultad?.nombre_facultad || null,
                };
            });

            res.json({
                students: formattedStudents,
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
            console.error('Error getting students:', error);
            res.status(500).json({ message: 'Error al obtener estudiantes', error: error.message });
        }
    };

    // Get person by ID (for profile view)
    getPersonById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;

            const person = await prisma.persona.findUnique({
                where: { id_persona: id },
                include: {
                    facultad: true,
                    programa_academico: {
                        include: {
                            facultad: true
                        }
                    },
                    actores: {
                        include: {
                            tipo_rol: true,
                            trabajo_grado: {
                                include: {
                                    opcion_grado: true,
                                    estado_tg: true,
                                    programa_academico: {
                                        include: {
                                            facultad: true
                                        }
                                    },
                                    actores: {
                                        include: {
                                            persona: {
                                                select: {
                                                    id_persona: true,
                                                    nombres: true,
                                                    apellidos: true,
                                                    correo_electronico: true
                                                }
                                            },
                                            tipo_rol: true
                                        }
                                    },
                                    empresa: true
                                }
                            }
                        }
                    }
                }
            });

            if (!person) {
                return res.status(404).json({ message: 'Persona no encontrada' });
            }

            // Get all active events (events are general, not project-specific)
            const events = await prisma.evento.findMany({
                where: {
                    activo: true
                },
                orderBy: {
                    fecha_inicio: 'asc'
                },
                take: 10 // Limit to 10 most recent events
            });

            // Format response
            const isStudent = person.actores.some(a => a.tipo_rol.nombre_rol === 'Estudiante');
            const isTeacher = person.actores.some(a =>
                ['Director', 'Asesor', 'Asesor Externo'].includes(a.tipo_rol.nombre_rol)
            );

            // Get projects for students (where they are actors)
            const studentProjects = isStudent ? person.actores
                .filter(a => a.tipo_rol.nombre_rol === 'Estudiante' && a.trabajo_grado)
                .map(a => a.trabajo_grado) : [];

            // Get projects for teachers (where they are directors/advisors)
            const teacherProjects = isTeacher ? person.actores
                .filter(a =>
                    ['Director', 'Asesor', 'Asesor Externo'].includes(a.tipo_rol.nombre_rol) &&
                    a.trabajo_grado
                )
                .map(a => a.trabajo_grado) : [];

            res.json({
                ...person,
                studentProjects: studentProjects || [],
                teacherProjects: teacherProjects || [],
                events: events || []
            });
        } catch (error: any) {
            console.error('Error getting person:', error);
            res.status(500).json({ message: 'Error al obtener persona', error: error.message });
        }
    };

    // Create teacher (admin only - will be protected by middleware)
    createTeacher = async (req: Request, res: Response) => {
        try {
            const { firstName, lastName, document, email, phone, role, password } = req.body;
            const userId = req.user?.id_persona;

            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);

            // Check for duplicates before creating
            if (document) {
                const existingByDoc = await prisma.persona.findFirst({
                    where: { num_doc_identidad: document }
                });
                if (existingByDoc) {
                    return res.status(400).json({ message: 'Ya existe una persona con ese número de documento' });
                }
            }

            if (email) {
                const existingByEmail = await prisma.persona.findFirst({
                    where: { correo_electronico: email }
                });
                if (existingByEmail) {
                    return res.status(400).json({ message: 'Ya existe una persona con ese correo electrónico' });
                }
            }

            let tipoDoc = await prisma.tipo_documento.findFirst({ where: { documento: 'CC' } });
            if (!tipoDoc) {
                tipoDoc = await prisma.tipo_documento.create({ data: { documento: 'CC' } });
            }

            // Get the creating user's faculty so the new teacher belongs to the same faculty
            let facultyId: string | null = null;
            if (userId) {
                const creatingUser = await prisma.persona.findUnique({
                    where: { id_persona: userId },
                    select: { id_facultad: true }
                });
                facultyId = creatingUser?.id_facultad || null;
            }

            const newPersona = await prisma.persona.create({
                data: {
                    nombres: firstName.toUpperCase().trim(),
                    apellidos: lastName.toUpperCase().trim(),
                    num_doc_identidad: document || `DOC-${Date.now()}`,
                    id_tipo_doc_identidad: tipoDoc.id_tipo_documento,
                    correo_electronico: email,
                    numero_celular: phone,
                    password: hashedPassword,
                    confirmed: true,
                    ultimo_acceso: new Date(),
                    id_facultad: facultyId,
                }
            });

            res.status(201).json({ message: 'Profesor creado exitosamente', persona: newPersona });
        } catch (error: any) {
            console.error('Error creating teacher:', error);
            res.status(500).json({ message: 'Error al crear profesor', error: error.message });
        }
    };

    // Create student (admin only - will be protected by middleware)
    createStudent = async (req: Request, res: Response) => {
        try {
            const { firstName, lastName, document, email, phone, password, programId } = req.body;
            const userId = req.user?.id_persona;

            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);

            // Check for duplicates before creating
            if (document) {
                const existingByDoc = await prisma.persona.findFirst({
                    where: { num_doc_identidad: document }
                });
                if (existingByDoc) {
                    return res.status(400).json({ message: 'Ya existe una persona con ese número de documento' });
                }
            }

            if (email) {
                const existingByEmail = await prisma.persona.findFirst({
                    where: { correo_electronico: email }
                });
                if (existingByEmail) {
                    return res.status(400).json({ message: 'Ya existe una persona con ese correo electrónico' });
                }
            }

            // Validate programId
            if (!programId) {
                return res.status(400).json({ message: 'Debe seleccionar un programa académico' });
            }

            // Get the program to find its faculty
            const program = await prisma.programa_academico.findUnique({
                where: { id_programa: programId },
                select: { id_facultad: true }
            });

            let tipoDoc = await prisma.tipo_documento.findFirst({ where: { documento: 'CC' } });
            if (!tipoDoc) {
                tipoDoc = await prisma.tipo_documento.create({ data: { documento: 'CC' } });
            }

            const newPersona = await prisma.persona.create({
                data: {
                    nombres: firstName.toUpperCase().trim(),
                    apellidos: lastName.toUpperCase().trim(),
                    num_doc_identidad: document || `DOC-${Date.now()}`,
                    id_tipo_doc_identidad: tipoDoc.id_tipo_documento,
                    correo_electronico: email,
                    numero_celular: phone,
                    password: hashedPassword,
                    confirmed: true,
                    ultimo_acceso: new Date(),
                    id_programa_academico: programId,
                    id_facultad: program?.id_facultad || null,
                }
            });

            res.status(201).json({ message: 'Estudiante creado exitosamente', persona: newPersona });
        } catch (error: any) {
            console.error('Error creating student:', error);
            res.status(500).json({ message: 'Error al crear estudiante', error: error.message });
        }
    };
}

