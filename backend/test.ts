import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const changes = await prisma.seguimiento_tg.findMany({
        where: { id_estado_nuevo: { not: null } },
        select: { id_estado_nuevo: true, fecha_registro: true },
        orderBy: { fecha_registro: 'desc' },
        take: 5
    });
    console.log("Recent status changes:", changes);

    const states = await prisma.estado_tg.findMany();
    console.log("All states:", states.map(s => s.nombre_estado));

    const estadosAprobado = await prisma.estado_tg.findMany({
        where: { nombre_estado: { contains: 'Aprobado' } }
    });
    const estadosRechazado = await prisma.estado_tg.findMany({
        where: { nombre_estado: { contains: 'Rechazado' } }
    });
    console.log("Aprobado IDs:", estadosAprobado.map(e => ({id: e.id_estado_tg, name: e.nombre_estado})));
    console.log("Rechazado IDs:", estadosRechazado.map(e => ({id: e.id_estado_tg, name: e.nombre_estado})));
}

main().catch(console.error).finally(() => prisma.$disconnect());
