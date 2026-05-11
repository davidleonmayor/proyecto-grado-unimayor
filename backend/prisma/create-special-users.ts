import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

async function main() {
    console.log("Iniciando creación de usuarios especiales...");

    // 1. Obtener o crear tipos básicos
    const faculty = await prisma.facultad.findFirst({
        where: { nombre_facultad: "Ingeniería" }
    }) || await prisma.facultad.create({
        data: { nombre_facultad: "Ingeniería", codigo_facultad: "ING" }
    });

    const tipoDoc = await prisma.tipo_documento.findFirst({
        where: { documento: "CC" }
    }) || await prisma.tipo_documento.create({
        data: { documento: "CC" }
    });

    const roles = {
        estudiante: await prisma.tipo_rol.findFirst({ where: { nombre_rol: "Estudiante" } }),
        docente: await prisma.tipo_rol.findFirst({ where: { nombre_rol: "Director" } }),
        coordinador: await prisma.tipo_rol.findFirst({ where: { nombre_rol: "Coordinador de Carrera" } }),
    };

    // Validar que los roles existan (si no, crearlos como en el seed)
    if (!roles.estudiante) roles.estudiante = await prisma.tipo_rol.create({ data: { nombre_rol: "Estudiante", activo: true } });
    if (!roles.docente) roles.docente = await prisma.tipo_rol.create({ data: { nombre_rol: "Director", activo: true } });
    if (!roles.coordinador) roles.coordinador = await prisma.tipo_rol.create({ data: { nombre_rol: "Coordinador de Carrera", activo: true } });

    // 2. Definir usuarios a crear
    const usersData = [
        {
            nombres: "Admin",
            apellidos: "Coordinador",
            correo: "admin@unimayor.edu.co",
            password: "admin",
            rol: roles.coordinador,
            doc: "12345678-ADM",
            facultyId: faculty.id_facultad
        },
        {
            nombres: "Estudiante",
            apellidos: "Prueba",
            correo: "estudiante@unimayor.edu.co",
            password: "estudiante",
            rol: roles.estudiante,
            doc: "12345678-EST",
            facultyId: faculty.id_facultad
        },
        {
            nombres: "Docente",
            apellidos: "Prueba",
            correo: "docente@unimayor.edu.co",
            password: "docente",
            rol: roles.docente,
            doc: "12345678-DOC",
            facultyId: faculty.id_facultad
        }
    ];

    for (const data of usersData) {
        const hashedPassword = await hashPassword(data.password);
        
        // Upsert persona
        const user = await prisma.persona.upsert({
            where: { correo_electronico: data.correo },
            update: {
                password: hashedPassword,
                confirmed: true,
                id_facultad: data.facultyId,
            },
            create: {
                nombres: data.nombres,
                apellidos: data.apellidos,
                correo_electronico: data.correo,
                num_doc_identidad: data.doc,
                id_tipo_doc_identidad: tipoDoc.id_tipo_documento,
                numero_celular: "3000000000",
                password: hashedPassword,
                confirmed: true,
                id_facultad: data.facultyId,
            }
        });

        console.log(`Usuario ${data.correo} creado/actualizado.`);

        // Asignar rol si es necesario (vía actores)
        // Buscamos si ya tiene el rol asignado a algún proyecto o creamos una entrada con proyecto dummy si no hay nada
        const existingActor = await prisma.actores.findFirst({
            where: {
                id_persona: user.id_persona,
                id_tipo_rol: data.rol!.id_rol
            }
        });

        if (!existingActor) {
            // Necesitamos un trabajo_grado para la tabla ACTORES
            let project = await prisma.trabajo_grado.findFirst();
            
            if (!project) {
                // Crear un proyecto semilla si no hay ninguno
                const estado = await prisma.estado_tg.findFirst() || await prisma.estado_tg.create({
                    data: { nombre_estado: "En curso", orden: 1 }
                });
                const opcion = await prisma.opcion_grado.findFirst() || await prisma.opcion_grado.create({
                    data: { nombre_opcion_grado: "Proyecto de Grado", estado: "activo" }
                });
                const programa = await prisma.programa_academico.findFirst() || await prisma.programa_academico.create({
                    data: { 
                        nombre_programa: "Ingeniería Informática", 
                        id_facultad: faculty.id_facultad, 
                        estado: "activo",
                        id_nivel_formacion: (await prisma.nivel_formacion.findFirst())?.id_nivel || (await prisma.nivel_formacion.create({data: {nombre_nivel: "Pregrado"}})).id_nivel
                    }
                });

                project = await prisma.trabajo_grado.create({
                    data: {
                        titulo_trabajo: "Proyecto Administrativo / Semilla",
                        fecha_inicio: new Date(),
                        id_estado_actual: estado.id_estado_tg,
                        id_opcion_grado: opcion.id_opcion_grado,
                        id_programa_academico: programa.id_programa,
                    }
                });
            }

            await prisma.actores.create({
                data: {
                    id_persona: user.id_persona,
                    id_tipo_rol: data.rol!.id_rol,
                    id_trabajo_grado: project.id_trabajo_grado,
                    estado: "activo",
                    fecha_asignacion: new Date(),
                    observaciones: "Usuario especial creado por script"
                }
            });
            console.log(`Rol ${data.rol!.nombre_rol} asignado a ${data.correo}.`);
        }
    }

    console.log("Proceso finalizado.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
