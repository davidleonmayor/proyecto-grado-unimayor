import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WebhookService {
    /**
     * Dispatches an event to all active webhook subscriptions listening to a specific topic.
     */
    public async dispatch(topic: string, payload: any): Promise<void> {
        try {
            // Find all active subscriptions for this topic
            const subscriptions = await (prisma as any).webhook_subscription.findMany({
                where: { topic, is_active: true }
            });

            if (subscriptions.length === 0) {
                console.log(`[WebhookService] No active subscriptions for topic: ${topic}`);
                return;
            }

            console.log(`[WebhookService] Found ${subscriptions.length} subscriptions for topic: ${topic}. Dispatching...`);

            // Fire all webhooks asynchronously (fire and forget)
            // In a production system, this would be queued in Redis/RabbitMQ/Kafka
            for (const sub of subscriptions) {
                this.sendPayload(sub.url, payload, sub.secret).catch(err => {
                    console.error(`[WebhookService] Failed to dispatch ${topic} to ${sub.url}`, err.message);
                });
            }
        } catch (error) {
            console.error('[WebhookService] Error fetching subscriptions:', error);
        }
    }

    private async sendPayload(url: string, payload: any, secret: string | null): Promise<void> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'GestionProyectos-Webhook-Dispatcher/1.0',
        };

        if (secret) {
            // Very basic security header
            headers['X-Webhook-Secret'] = secret;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
            // Small timeout for resilience
            // timeout: 5000 // Only available in node-fetch options but skipping here for simplicity
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        console.log(`[WebhookService] Successfully delivered to ${url}`);
    }
}
