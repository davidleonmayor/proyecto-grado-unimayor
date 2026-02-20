import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clear() {
    console.log("🧹 Limpiando datos existentes...");
    await prisma.distincion_tg.deleteMany({});
    await prisma.seguimiento_tg.deleteMany({});
    await prisma.actores.deleteMany({});
    await prisma.trabajo_grado.deleteMany({});
    await prisma.persona.deleteMany({});
    await prisma.distinciones.deleteMany({});
    await prisma.accion_seg.deleteMany({});
    await prisma.estado_tg.deleteMany({});
    await prisma.empresa.deleteMany({});
    await prisma.opcion_grado_formacion.deleteMany({});
    await prisma.opcion_grado.deleteMany({});
    await prisma.programa_academico.deleteMany({});
    await prisma.nivel_formacion.deleteMany({});
    await prisma.facultad.deleteMany({});
    await prisma.tipo_rol.deleteMany({});
    await prisma.tipo_documento.deleteMany({});
    console.log("✅ Datos existentes eliminados");

}

clear()
    .catch((e) => {
        console.error("❌ Error en el seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
