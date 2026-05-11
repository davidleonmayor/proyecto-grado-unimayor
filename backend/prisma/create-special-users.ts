import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Iniciando creación de usuarios maestros (FULL DATA)...");

    // 1. Obtener datos base
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

    const hashedPassword = await bcrypt.hash("admin1234", 10);
    const hashedEstudiante = await bcrypt.hash("estudiante1234", 10);
    const hashedDocente = await bcrypt.hash("docente1234", 10);

    const users = [
        {
            email: "admin@unimayor.edu.co",
            pass: hashedPassword,
            rol: roles.coordinador,
            nombre: "Admin",
            apellido: "Coordinador",
            doc: "ADM-999",
            codigo: "COD-ADM",
            tipo: "coordinador"
        },
        {
            email: "estudiante@unimayor.edu.co",
            pass: hashedEstudiante,
            rol: roles.estudiante,
            nombre: "Estudiante",
            apellido: "Prueba",
            doc: "EST-999",
            codigo: "COD-EST",
            tipo: "estudiante"
        },
        {
            email: "docente@unimayor.edu.co",
            pass: hashedDocente,
            rol: roles.docente,
            nombre: "Docente",
            apellido: "Prueba",
            doc: "DOC-999",
            codigo: "COD-DOC",
            tipo: "docente"
        }
    ];

    for (const u of users) {
        if (!u.rol) {
            console.error(`❌ Error: Rol para ${u.tipo} no encontrado. Revisa la base de datos.`);
            continue;
        }

        const persona = await prisma.persona.upsert({
            where: { correo_electronico: u.email },
            update: {
                password: u.pass,
                confirmed: true,
                id_facultad: faculty.id_facultad,
                id_programa_academico: programa.id_programa,
                ultimo_acceso: new Date(),
                intentos_fallidos: 0
            },
            create: {
                nombres: u.nombre,
                apellidos: u.apellido,
                correo_electronico: u.email,
                num_doc_identidad: u.doc,
                codigo_institucional: u.codigo,
                id_tipo_doc_identidad: tipoDoc.id_tipo_documento,
                numero_celular: "3100000000",
                password: u.pass,
                confirmed: true,
                id_facultad: faculty.id_facultad,
                id_programa_academico: programa.id_programa,
                fecha_registro: new Date(),
                ultimo_acceso: new Date(),
                intentos_fallidos: 0
            }
        });

        // Asegurar que tenga un registro en ACTORES (necesario para el Middleware de Roles)
        // Buscamos un proyecto para asociarlo (o creamos uno si no existe)
        let project = await prisma.trabajo_grado.findFirst();
        if (!project) {
            const estado = await prisma.estado_tg.findFirst() || await prisma.estado_tg.create({ data: { nombre_estado: "En curso", orden: 1 } });
            const opcion = await prisma.opcion_grado.findFirst() || await prisma.opcion_grado.create({ data: { nombre_opcion_grado: "Proyecto de Grado", estado: "activo" } });
            project = await prisma.trabajo_grado.create({
                data: {
                    titulo_trabajo: "Proyecto de Inicialización del Sistema",
                    fecha_inicio: new Date(),
                    id_estado_actual: estado.id_estado_tg,
                    id_opcion_grado: opcion.id_opcion_grado,
                    id_programa_academico: programa.id_programa,
                }
            });
        }

        await prisma.actores.upsert({
            where: { id_actor: `actor-${u.tipo}` }, // ID predecible para evitar duplicados
            update: {
                id_persona: persona.id_persona,
                id_tipo_rol: u.rol.id_rol,
                id_trabajo_grado: project.id_trabajo_grado,
                estado: "activo"
            },
            create: {
                id_actor: `actor-${u.tipo}`,
                id_persona: persona.id_persona,
                id_tipo_rol: u.rol.id_rol,
                id_trabajo_grado: project.id_trabajo_grado,
                estado: "activo",
                fecha_asignacion: new Date()
            }
        });

        console.log(`✅ Usuario ${u.email} listo con todos sus campos.`);
    }

    console.log("\n✨ Proceso finalizado. Si estás en AWS, recuerda reiniciar el contenedor si los cambios no se ven inmediatamente.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
