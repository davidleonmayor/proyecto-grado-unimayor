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
            // Si ya existe "En curso", actualizar TODAS las referencias y eliminar el duplicado
            console.log(`🔄 Migrando referencias del estado "${estado.nombre_estado}" (${estado.id_estado_tg}) a "En curso" (${estadoCorrecto.id_estado_tg})...`);

            // Actualizar trabajos de grado que usan este estado como estado actual
            const updatedTG = await prisma.trabajo_grado.updateMany({
                where: { id_estado_actual: estado.id_estado_tg },
                data: { id_estado_actual: estadoCorrecto.id_estado_tg },
            });
            console.log(`   ↳ trabajo_grado.id_estado_actual: ${updatedTG.count} registros actualizados`);

            await prisma.seguimiento_tg.updateMany({
                where: { id_estado_anterior: estado.id_estado_tg },
                data: { id_estado_anterior: estadoCorrecto.id_estado_tg },
            });

            await prisma.seguimiento_tg.updateMany({
                where: { id_estado_nuevo: estado.id_estado_tg },
                data: { id_estado_nuevo: estadoCorrecto.id_estado_tg },
            });

            // Verificar que no queden referencias antes de borrar
            const remaining = await prisma.trabajo_grado.count({
                where: { id_estado_actual: estado.id_estado_tg },
            });

            if (remaining > 0) {
                console.log(`⚠️  Aún quedan ${remaining} proyectos apuntando al estado "${estado.nombre_estado}". Saltando eliminación.`);
            } else {
                await prisma.estado_tg.delete({
                    where: { id_estado_tg: estado.id_estado_tg },
                });
                console.log(`✅ Estado "${estado.nombre_estado}" eliminado correctamente`);
            }
        } else {
            // Si no existe "En curso", renombrar este estado
            await prisma.estado_tg.update({
                where: { id_estado_tg: estado.id_estado_tg },
                data: { nombre_estado: "En curso" },
            });
            console.log(`✅ Estado "${estado.nombre_estado}" renombrado a "En curso"`);
        }
    }

    // 2. Eliminar programas académicos duplicados o mal formateados (en minúsculas)
    console.log("📚 Corrigiendo programas académicos...");
    
    const correctProgramsMap: { [key: string]: string } = {
        'ingenieriadesistemas': 'Ingeniería Informática', // Redirigir a Ingeniería Informática si no hay de Sistemas
        'tecnologiaeninformatica': 'Ingeniería Informática',
        'ingenieriadesoftware': 'Tecnología en Desarrollo de Software'
    };

    const lowercasePrograms = Object.keys(correctProgramsMap);

    for (const name of lowercasePrograms) {
        const program = await prisma.programa_academico.findFirst({
            where: { nombre_programa: name }
        });

        if (program) {
            const correctName = correctProgramsMap[name];
            const correctProgram = await prisma.programa_academico.findFirst({
                where: { nombre_programa: correctName }
            });

            if (correctProgram) {
                console.log(`🔄 Migrando referencias de "${name}" a "${correctName}"...`);
                
                // Actualizar proyectos
                await prisma.trabajo_grado.updateMany({
                    where: { id_programa_academico: program.id_programa },
                    data: { id_programa_academico: correctProgram.id_programa }
                });

                // Actualizar personas
                await prisma.persona.updateMany({
                    where: { id_programa_academico: program.id_programa },
                    data: { id_programa_academico: correctProgram.id_programa }
                });

                // Eliminar el programa mal formateado
                await prisma.programa_academico.delete({
                    where: { id_programa: program.id_programa }
                });
                
                console.log(`✅ Programa "${name}" eliminado y referencias migradas a "${correctName}"`);
            } else {
                console.log(`⚠️ No se encontró el programa correcto "${correctName}" para migrar "${name}".`);
            }
        }
    }

    // Caso especial: "Ingeniería de Sistemas" con camel case o espacios
    const programaAntiguo = await prisma.programa_academico.findFirst({
        where: { nombre_programa: "Ingeniería de Sistemas" },
    });

    if (programaAntiguo) {
        const correctProgram = await prisma.programa_academico.findFirst({
            where: { nombre_programa: "Ingeniería Informática" }
        });

        if (correctProgram) {
            await prisma.trabajo_grado.updateMany({
                where: { id_programa_academico: programaAntiguo.id_programa },
                data: { id_programa_academico: correctProgram.id_programa }
            });
            
            await prisma.persona.updateMany({
                where: { id_programa_academico: programaAntiguo.id_programa },
                data: { id_programa_academico: correctProgram.id_programa }
            });

            await prisma.programa_academico.delete({
                where: { id_programa: programaAntiguo.id_programa },
            });
            console.log('✅ Programa "Ingeniería de Sistemas" eliminado y migrado a "Ingeniería Informática"');
        }
    }

    // 3. Corregir opción de grado: "Proyecto Integrador" -> "Proyecto de Investigación"
    console.log("🎓 Corrigiendo opción de grado de Proyecto Integrador a Proyecto de Investigación...");
    const opcionIntegrador = await prisma.opcion_grado.findFirst({
        where: { nombre_opcion_grado: "Proyecto Integrador" },
    });

    if (opcionIntegrador) {
        await prisma.opcion_grado.update({
            where: { id_opcion_grado: opcionIntegrador.id_opcion_grado },
            data: {
                nombre_opcion_grado: "Proyecto de Investigación",
                descripcion: "Proyecto de investigación aplicada",
                tipo_modalidad: "Investigación",
            },
        });
        console.log('✅ Opción de grado "Proyecto Integrador" corregida a "Proyecto de Investigación"');
    } else {
        console.log('✅ No se encontró la opción de grado "Proyecto Integrador"');
    }

    // 4. Asegurar que exista la opción de grado: "Proyecto de Grado"
    console.log("🎓 Asegurando opción de grado 'Proyecto de Grado'...");
    const opcionProyectoGrado = await prisma.opcion_grado.findFirst({
        where: { nombre_opcion_grado: "Proyecto de Grado" },
    });

    if (!opcionProyectoGrado) {
        await prisma.opcion_grado.create({
            data: {
                nombre_opcion_grado: "Proyecto de Grado",
                descripcion: "Proyecto de desarrollo tecnológico o de grado",
                estado: "activo",
                tipo_modalidad: "Proyecto",
            },
        });
        console.log('✅ Opción de grado "Proyecto de Grado" creada exitosamente');
    } else {
        console.log('✅ Opción de grado "Proyecto de Grado" ya existía');
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

