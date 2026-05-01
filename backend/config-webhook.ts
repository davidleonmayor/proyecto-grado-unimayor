import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const url = 'http://localhost:4000/api/messaging/webhook/consume';
    const topic = 'MESSAGE_CREATED';
    const secret = 'internal_secret';

    // Check if exists
    const existing = await (prisma as any).suscripcion_webhook.findFirst({
        where: { url, topico: topic }
    });

    if (!existing) {
        await (prisma as any).suscripcion_webhook.create({
            data: {
                topico: topic,
                url,
                secreto: secret,
                activo: true
            }
        });
        console.log(`Successfully registered internal webhook for ${topic} -> ${url}`);
    } else {
        console.log(`Webhook already exists for ${topic} -> ${url}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
