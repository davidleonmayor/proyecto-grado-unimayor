// Script para corregir datos existentes en la base de datos
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔧 Iniciando corrección de datos...");

    // 1. Corregir estados: "encurso" -> "En curso"
    console.log("📝 Corrigiendo estados...");
    const estadosEncurso = await prisma.estado_tg.findMany({
        where: {
            OR: [
                { nombre_estado: "encurso" },
                { nombre_estado: "Encurso" },
                { nombre_estado: "En Curso" },
            ],
        },
    });

    for (const estado of estadosEncurso) {
        const estadoCorrecto = await prisma.estado_tg.findFirst({
            where: { nombre_estado: "En curso" },
        });

        if (estadoCorrecto) {
            // Si ya existe "En curso", actualizar referencias y eliminar el duplicado
            await prisma.trabajo_grado.updateMany({
                where: { id_estado_actual: estado.id_estado_tg },
                data: { id_estado_actual: estadoCorrecto.id_estado_tg },
            });

            await prisma.seguimiento_tg.updateMany({
                where: { id_estado_anterior: estado.id_estado_tg },
                data: { id_estado_anterior: estadoCorrecto.id_estado_tg },
            });

            await prisma.seguimiento_tg.updateMany({
                where: { id_estado_nuevo: estado.id_estado_tg },
                data: { id_estado_nuevo: estadoCorrecto.id_estado_tg },
            });

            await prisma.estado_tg.delete({
                where: { id_estado_tg: estado.id_estado_tg },
            });
            console.log(`✅ Estado "${estado.nombre_estado}" corregido y referencias actualizadas`);
        } else {
            // Si no existe "En curso", renombrar este estado
            await prisma.estado_tg.update({
                where: { id_estado_tg: estado.id_estado_tg },
                data: { nombre_estado: "En curso" },
            });
            console.log(`✅ Estado "${estado.nombre_estado}" renombrado a "En curso"`);
        }
    }

    // 2. Eliminar programa "Ingeniería de Sistemas" si existe
    console.log("📚 Corrigiendo programas académicos...");
    const programaAntiguo = await prisma.programa_academico.findFirst({
        where: { nombre_programa: "Ingeniería de Sistemas" },
    });

    if (programaAntiguo) {
        // Verificar si hay proyectos asociados
        const proyectosAsociados = await prisma.trabajo_grado.count({
            where: { id_programa_academico: programaAntiguo.id_programa },
        });

        if (proyectosAsociados > 0) {
            console.log(
                `⚠️  El programa "Ingeniería de Sistemas" tiene ${proyectosAsociados} proyecto(s) asociado(s). No se puede eliminar automáticamente.`,
            );
            console.log(
                "   Por favor, actualiza manualmente estos proyectos antes de eliminar el programa.",
            );
        } else {
            await prisma.programa_academico.delete({
                where: { id_programa: programaAntiguo.id_programa },
            });
            console.log('✅ Programa "Ingeniería de Sistemas" eliminado');
        }
    } else {
        console.log('✅ No se encontró el programa "Ingeniería de Sistemas"');
    }

    console.log("✅ Corrección de datos completada");
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

