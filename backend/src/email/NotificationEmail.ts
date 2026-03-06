import nodemailer from "nodemailer";
import { envs, logger, transporter } from "../config";
import { getEventNotificationTemplate } from "./templates";

export class NotificationEmail {
    private static instance: NotificationEmail;

    private constructor() { }

    public static getInstance(): NotificationEmail {
        if (!NotificationEmail.instance) {
            NotificationEmail.instance = new NotificationEmail();
        }
        return NotificationEmail.instance;
    }



    public async sendEventCreatedEmail(
        to: string[],
        eventName: string,
        eventDescription: string,
        eventDate: string,
        eventTime: string,
        isUrgent: boolean,
        projectTitle: string
    ) {
        if (!to || to.length === 0) return;
        try {
            const html = getEventNotificationTemplate(eventName, eventDescription, eventDate, eventTime, isUrgent, projectTitle);

            await transporter.sendMail({
                from: `"Gestión de Proyectos - Unimayor" <${envs.NODEMAILER_USER}>`,
                to: envs.NODEMAILER_USER, // Usar BCC
                bcc: to,
                subject: `${isUrgent ? '🔴 URGENTE: ' : '📅 '}Nuevo Evento: ${eventName}`,
                html,
            });

            logger.info("Correos de evento enviados exitosamente a " + to.length + " usuarios.");
            return { success: true };
        } catch (error) {
            logger.error(`Error sending event email: ${error}`);
            return { success: false };
        }
    }
}
