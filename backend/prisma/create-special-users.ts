import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🛠️ Construyendo escenario completo de pruebas QA...");

    // 1. Datos Base
    const faculty = await prisma.facultad.findFirst({ where: { nombre_facultad: "Ingeniería" } }) 
        || await prisma.facultad.create({ data: { nombre_facultad: "Ingeniería", codigo_facultad: "ING" } });

    const nivel = await prisma.nivel_formacion.findFirst() 
        || await prisma.nivel_formacion.create({ data: { nombre_nivel: "Pregrado", descripcion: "Nivel Profesional" } });

    const programa = await prisma.programa_academico.findFirst({ where: { id_facultad: faculty.id_facultad } })
        || await prisma.programa_academico.create({ 
            data: { 
                nombre_programa: "Ingeniería Informática", 
                id_facultad: faculty.id_facultad, 
                id_nivel_formacion: nivel.id_nivel,
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

    const passHash = await bcrypt.hash("admin1234", 10);
    const estHash = await bcrypt.hash("estudiante1234", 10);
    const docHash = await bcrypt.hash("docente1234", 10);

    // 2. Crear Usuarios (Incluyendo al compañero)
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
            update: { password: u.pass, confirmed: true, id_facultad: faculty.id_facultad, id_programa_academico: programa.id_programa },
            create: {
                nombres: u.nombre, apellidos: u.apellido, correo_electronico: u.email, num_doc_identidad: u.doc,
                id_tipo_doc_identidad: tipoDoc.id_tipo_documento, numero_celular: "3100000000", password: u.pass,
                confirmed: true, id_facultad: faculty.id_facultad, id_programa_academico: programa.id_programa
            }
        });
    }

    // 3. Crear Proyecto de Prueba
    const estadoEnCurso = await prisma.estado_tg.findFirst({ where: { nombre_estado: "En curso" } }) 
        || await prisma.estado_tg.create({ data: { nombre_estado: "En curso", orden: 1 } });
    
    const opcionGrado = await prisma.opcion_grado.findFirst() 
        || await prisma.opcion_grado.create({ data: { nombre_opcion_grado: "Proyecto de Grado", estado: "activo" } });

    const proyecto = await prisma.trabajo_grado.create({
        data: {
            titulo_trabajo: "Sistema de Gestión de Pruebas QA UNIMAYOR",
            resumen: "Proyecto diseñado para validar las funcionalidades de comunicación y seguimiento del sistema.",
            fecha_inicio: new Date(),
            id_estado_actual: estadoEnCurso.id_estado_tg,
            id_opcion_grado: opcionGrado.id_opcion_grado,
            id_programa_academico: programa.id_programa
        }
    });

    // 4. Vincular Actores (Docente Director + 2 Estudiantes)
    await prisma.actores.createMany({
        data: [
            { id_persona: users.docente.id_persona, id_tipo_rol: roles.docente!.id_rol, id_trabajo_grado: proyecto.id_trabajo_grado, estado: "activo", observaciones: "Director de Proyecto" },
            { id_persona: users.estudiante1.id_persona, id_tipo_rol: roles.estudiante!.id_rol, id_trabajo_grado: proyecto.id_trabajo_grado, estado: "activo", observaciones: "Estudiante Principal" },
            { id_persona: users.estudiante2.id_persona, id_tipo_rol: roles.estudiante!.id_rol, id_trabajo_grado: proyecto.id_trabajo_grado, estado: "activo", observaciones: "Compañero de Proyecto" }
        ]
    });

    // 5. Crear Historial (Seguimientos)
    const accion = await prisma.accion_seg.findFirst() || await prisma.accion_seg.create({ data: { tipo_accion: "Registro", descripcion: "Registro de proyecto" } });
    const actorDocente = await prisma.actores.findFirst({ where: { id_persona: users.docente.id_persona, id_trabajo_grado: proyecto.id_trabajo_grado } });

    await prisma.seguimiento_tg.create({
        data: {
            id_trabajo_grado: proyecto.id_trabajo_grado,
            id_actor: actorDocente!.id_actor,
            id_accion: accion.id_accion,
            resumen: "Revisión inicial de propuesta. Se recomienda ajustar los objetivos específicos.",
            fecha_registro: new Date(),
            id_estado_nuevo: estadoEnCurso.id_estado_tg
        }
    });

    // 6. Crear un Anuncio
    await (prisma as any).anuncio.create({
        data: {
            titulo: "Recordatorio: Entrega de Avances",
            contenido: "Estimados estudiantes, recuerden subir sus avances antes del viernes.",
            id_autor: users.admin.id_persona
        }
    });

    console.log("✅ Escenario QA completado.");
    console.log(`- Proyecto: ${proyecto.titulo_trabajo}`);
    console.log(`- Estudiante: ${users.estudiante1.correo_electronico} (Contraseña: estudiante1234)`);
    console.log(`- Compañero: ${users.estudiante2.correo_electronico}`);
    console.log(`- Docente: ${users.docente.correo_electronico} (Contraseña: docente1234)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
