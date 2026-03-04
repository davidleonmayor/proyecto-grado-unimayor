// Script to create a FULL-ACCESS test user for k6 load testing
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const email = "k6test@loadtest.com";
    const password = "Password123!";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get a faculty (first one available)
    const faculty = await prisma.facultad.findFirst();
    if (!faculty) {
        console.error("ERROR: No hay facultades en la BD. Ejecuta el seed primero.");
        process.exit(1);
    }
    console.log(`Facultad encontrada: ${faculty.nombre_facultad} (${faculty.id_facultad})`);

    // Get the "Coordinador de Carrera" role for full permissions
    const coordinatorRole = await prisma.tipo_rol.findFirst({
        where: { nombre_rol: "Coordinador de Carrera" }
    });
    if (!coordinatorRole) {
        console.error("ERROR: No se encontro el rol 'Coordinador de Carrera'.");
        process.exit(1);
    }

    let user;

    // Check if user already exists
    const existing = await prisma.persona.findFirst({
        where: { correo_electronico: email }
    });

    if (existing) {
        // Update the existing user with faculty
        user = await prisma.persona.update({
            where: { id_persona: existing.id_persona },
            data: {
                id_facultad: faculty.id_facultad,
                confirmed: true,
                password: hashedPassword,
            }
        });
        console.log(`User actualizado con facultad: ${email}`);
    } else {
        // Get document type
        let tipoDoc = await prisma.tipo_documento.findFirst({ where: { documento: 'CC' } });
        if (!tipoDoc) {
            tipoDoc = await prisma.tipo_documento.create({ data: { documento: 'CC' } });
        }

        user = await prisma.persona.create({
            data: {
                nombres: "K6 TEST",
                apellidos: "LOAD TESTING",
                num_doc_identidad: "K6-LOADTEST-001",
                id_tipo_doc_identidad: tipoDoc.id_tipo_documento,
                correo_electronico: email,
                numero_celular: "3001234567",
                password: hashedPassword,
                confirmed: true,
                ultimo_acceso: new Date(),
                id_facultad: faculty.id_facultad,
            }
        });
        console.log(`User creado: ${email}`);
    }

    // Now give the user the Coordinator role in the `actores` table
    const existingActor = await prisma.actores.findFirst({
        where: {
            id_persona: user.id_persona,
            id_tipo_rol: coordinatorRole.id_rol
        }
    });

    if (!existingActor) {
        // We need to associate them with ANY trabajo_grado to create the actor record
        const anyProject = await prisma.trabajo_grado.findFirst();

        await prisma.actores.create({
            data: {
                id_persona: user.id_persona,
                id_tipo_rol: coordinatorRole.id_rol,
                estado: "Activo",
                fecha_asignacion: new Date(),
                id_trabajo_grado: anyProject ? anyProject.id_trabajo_grado : undefined,
                observaciones: "Creado para Load Testing"
            }
        });
        console.log(`Asignado rol de Coordinador a K6 Test User.`);
    }

    console.log(`\nCredentials for k6:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Faculty: ${faculty.nombre_facultad}`);
    console.log(`Role: Coordinador de Carrera (Privileged User)`);

    await prisma.$disconnect();
}

main().catch(console.error);
