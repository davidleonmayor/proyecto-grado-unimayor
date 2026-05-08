import { prisma } from "../config/prisma";
import { logger } from "../config";

export class WebhookService {
    private readonly timeout: number = 5000;

    /**
     * Dispatches an event to all active webhook subscriptions listening to a specific topic.
     * @param topic - The event topic (e.g., "MESSAGE_CREATED")
     * @param payload - The event payload to send
     */
    public async dispatch(topic: string, payload: Record<string, unknown>): Promise<void> {
        try {
            // Find all active subscriptions for this topic
            const subscriptions = await (prisma as any).suscripcionWebhook.findMany({
                where: { topico: topic, activo: true }
            });

            if (subscriptions.length === 0) {
                logger.info(`[WebhookService] No active subscriptions for topic: ${topic}`);
                return;
            }

            logger.info(`[WebhookService] Found ${subscriptions.length} subscriptions for topic: ${topic}. Dispatching...`);

            // Fire all webhooks asynchronously (fire and forget)
            // In a production system, this would be queued in Redis/RabbitMQ/Kafka
            for (const sub of subscriptions) {
                this.sendPayload(sub.url, payload, sub.secreto).catch(err => {
                    logger.error(`[WebhookService] Failed to dispatch ${topic} to ${sub.url}:`, err);
                });
            }
        } catch (error) {
            logger.error('[WebhookService] Error fetching subscriptions:', error);
        }
    }

    private async sendPayload(url: string, payload: Record<string, unknown>, secret: string | null): Promise<void> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'GestionProyectos-Webhook-Dispatcher/1.0',
        };

        if (secret) {
            // Very basic security header
            headers['X-Webhook-Secret'] = secret;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            logger.info(`[WebhookService] Successfully delivered to ${url}`);
        } catch (error) {
            logger.error(`[WebhookService] Failed to send to ${url}:`, error);
            throw error; // Re-throw for the caller's catch
        }
    }
}
