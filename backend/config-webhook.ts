import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const url = 'http://localhost:4000/api/messaging/webhook/consume';
    const topic = 'MESSAGE_CREATED';
    const secret = 'internal_secret';

    // Check if exists
    const existing = await prisma.webhook_subscription.findFirst({
        where: { url, topic }
    });

    if (!existing) {
        await prisma.webhook_subscription.create({
            data: {
                topic,
                url,
                secret,
                is_active: true
            }
        });
        console.log(`Successfully registered internal webhook for ${topic} -> ${url}`);
    } else {
        console.log(`Webhook already exists for ${topic} -> ${url}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
