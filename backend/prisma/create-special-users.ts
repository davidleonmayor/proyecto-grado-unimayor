import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🔄 Refinando escenario QA (Manejando dependencias de base de datos)...");

    // 1. Datos base
    const faculty = await prisma.facultad.findFirst({ where: { nombre_facultad: "Ingeniería" } }) 
        || await prisma.facultad.create({ data: { nombre_facultad: "Ingeniería", codigo_facultad: "ING" } });

    const programa = await prisma.programa_academico.findFirst({ where: { id_facultad: faculty.id_facultad } })
        || await prisma.programa_academico.create({ 
            data: { 
                nombre_programa: "Ingeniería Informática", 
                id_facultad: faculty.id_facultad, 
                id_nivel_formacion: (await prisma.nivel_formacion.findFirst())!.id_nivel,
                estado: "activo" 
            } 
        });

    const tipoDoc = await prisma.tipo_documento.findFirst({ where: { documento: "CC" } }) 
        || await prisma.tipo_documento.create({ data: { documento: "CC" } });

    const roles = {
        estudiante: await prisma.tipo_rol.findFirst({ where: { nombre_rol: "Estudiante" } }),
        docente: await prisma.tipo_rol.findFirst({ where: { nombre_rol: "Director" } }),
        coordinador: await prisma.tipo_rol.findFirst({ where: { nombre_rol: "Coordinador de Carrera" } }),
    };

    // Usaremos contraseñas de 8 caracteres para evitar el error 400 de validación
    const passHash = await bcrypt.hash("admin1234", 10);
    const estHash = await bcrypt.hash("estudiante1234", 10);
    const docHash = await bcrypt.hash("docente1234", 10);

    // 2. Usuarios QA
    const userData = [
        { email: "admin@unimayor.edu.co", pass: passHash, rol: roles.coordinador, nombre: "Admin", apellido: "Coordinador", doc: "QA-ADM", tipo: "admin" },
        { email: "docente@unimayor.edu.co", pass: docHash, rol: roles.docente, nombre: "Docente", apellido: "Prueba", doc: "QA-DOC", tipo: "docente" },
        { email: "estudiante@unimayor.edu.co", pass: estHash, rol: roles.estudiante, nombre: "Estudiante", apellido: "Principal", doc: "QA-EST1", tipo: "estudiante1" },
        { email: "companero@unimayor.edu.co", pass: estHash, rol: roles.estudiante, nombre: "Compañero", apellido: "Proyecto", doc: "QA-EST2", tipo: "estudiante2" }
    ];

    const users: any = {};
    for (const u of userData) {
        users[u.tipo] = await prisma.persona.upsert({
            where: { correo_electronico: u.email },
            update: { confirmed: true, id_facultad: faculty.id_facultad },
            create: {
                nombres: u.nombre, apellidos: u.apellido, correo_electronico: u.email, num_doc_identidad: u.doc,
                id_tipo_doc_identidad: tipoDoc.id_tipo_documento, numero_celular: "3100000000", password: u.pass,
                confirmed: true, id_facultad: faculty.id_facultad, id_programa_academico: programa.id_programa
            }
        });

        // --- LIMPIEZA SEGURA DE DEPENDENCIAS ---
        // 1. Encontrar los IDs de los actores actuales de esta persona
        const actorIds = (await prisma.actores.findMany({
            where: { id_persona: users[u.tipo].id_persona },
            select: { id_actor: true }
        })).map(a => a.id_actor);

        if (actorIds.length > 0) {
            // 2. Eliminar primero los seguimientos que dependen de esos actores
            await prisma.seguimiento_tg.deleteMany({
                where: { id_actor: { in: actorIds } }
            });
            // 3. Ahora sí podemos eliminar los actores
            await prisma.actores.deleteMany({
                where: { id_actor: { in: actorIds } }
            });
        }
    }

    // 3. Proyecto "Proyecto de Grado" (Único)
    const opcionGrado = await prisma.opcion_grado.findFirst({ where: { nombre_opcion_grado: "Proyecto de Grado" } })
        || await prisma.opcion_grado.create({ data: { nombre_opcion_grado: "Proyecto de Grado", estado: "activo", tipo_modalidad: "Proyecto" } });

    const estados = await prisma.estado_tg.findMany({ orderBy: { orden: "asc" } });
    
    const proyecto = await prisma.trabajo_grado.create({
        data: {
            titulo_trabajo: "Sistema de Optimización QA - Ingeniería Unimayor",
            resumen: "Investigación y desarrollo de una plataforma centralizada para la gestión académica.",
            fecha_inicio: new Date(new Date().setDate(new Date().getDate() - 30)),
            id_estado_actual: estados[1].id_estado_tg, // En progreso
            id_opcion_grado: opcionGrado.id_opcion_grado,
            id_programa_academico: programa.id_programa
        }
    });

    // 4. Asignaciones
    const actorDocente = await prisma.actores.create({
        data: { id_persona: users.docente.id_persona, id_tipo_rol: roles.docente!.id_rol, id_trabajo_grado: proyecto.id_trabajo_grado, estado: "activo" }
    });
    await prisma.actores.create({
        data: { id_persona: users.estudiante1.id_persona, id_tipo_rol: roles.estudiante!.id_rol, id_trabajo_grado: proyecto.id_trabajo_grado, estado: "activo" }
    });
    await prisma.actores.create({
        data: { id_persona: users.estudiante2.id_persona, id_tipo_rol: roles.estudiante!.id_rol, id_trabajo_grado: proyecto.id_trabajo_grado, estado: "activo" }
    });

    // 5. Historial de Iteraciones (4 Seguimientos)
    const accion = await prisma.accion_seg.findFirst() || await prisma.accion_seg.create({ data: { tipo_accion: "Revisión", descripcion: "Revisión técnica" } });
    
    const seguimientos = [
        { resumen: "Registro inicial del proyecto y aprobación de tema.", estado: estados[0].id_estado_tg, diasAtras: 25 },
        { resumen: "Entrega de primer borrador de objetivos y planteamiento.", estado: estados[1].id_estado_tg, diasAtras: 15 },
        { resumen: "Corrección de metodología según observaciones del director.", estado: estados[1].id_estado_tg, diasAtras: 10 },
        { resumen: "Aprobación de marco teórico y avance del 40%.", estado: estados[1].id_estado_tg, diasAtras: 5 }
    ];

    for (const s of seguimientos) {
        await prisma.seguimiento_tg.create({
            data: {
                id_trabajo_grado: proyecto.id_trabajo_grado,
                id_actor: actorDocente.id_actor,
                id_accion: accion.id_accion,
                resumen: s.resumen,
                fecha_registro: new Date(new Date().setDate(new Date().getDate() - s.diasAtras)),
                id_estado_nuevo: s.estado
            }
        });
    }

    console.log("✅ Escenario QA Refinado y Limpio: 1 Proyecto de Grado con historial.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
