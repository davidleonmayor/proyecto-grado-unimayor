// Script to create a test user for k6 load testing
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const email = "k6test@loadtest.com";
    const password = "Password123!";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existing = await prisma.persona.findFirst({
        where: { correo_electronico: email }
    });

    if (existing) {
        console.log(`User already exists: ${email}`);
        console.log(`ID: ${existing.id_persona}`);
    } else {
        // Get or create document type
        let tipoDoc = await prisma.tipo_documento.findFirst({ where: { documento: 'CC' } });
        if (!tipoDoc) {
            tipoDoc = await prisma.tipo_documento.create({ data: { documento: 'CC' } });
        }

        const user = await prisma.persona.create({
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
            }
        });
        console.log(`User created: ${email}`);
        console.log(`ID: ${user.id_persona}`);
    }

    console.log(`\nCredentials for k6:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    await prisma.$disconnect();
}

main().catch(console.error);
