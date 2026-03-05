import nodemailer from "nodemailer";
import { envs, logger } from "../config";
import { getNotificationEmailTemplate, getDirectMessageTemplate } from "./templates";

export class NotificationEmail {
    private transporter;
    private static instance: NotificationEmail;

    private constructor() {
        this.transporter = nodemailer.createTransport({
            host: envs.NODEMAILER_HOST || "smtp.gmail.com",
            port: Number(envs.NODEMAILER_PORT) || 587,
            secure: false,
            auth: {
                user: envs.NODEMAILER_USER,
                pass: envs.NODEMAILER_PASS,
            },
        });
    }

    public static getInstance(): NotificationEmail {
        if (!NotificationEmail.instance) {
            NotificationEmail.instance = new NotificationEmail();
        }
        return NotificationEmail.instance;
    }

    public async sendAnnouncementEmail(
        to: string[],
        name: string,
        title: string,
        content: string,
        date: string
    ) {
        if (!to || to.length === 0) return;

        try {
            const html = getNotificationEmailTemplate(name, title, content, date);

            // Enviamos con BCC para no exponer correos de los demás y no superar límites, o de a chunks.
            // Lo más seguro es mandar a todos como BCC. El receptor "to" puede ser un proxy o el remitente mismo.
            await this.transporter.sendMail({
                from: `"Gestión de Proyectos - Unimayor" <${envs.NODEMAILER_USER}>`,
                to: envs.NODEMAILER_USER, // Envío al mismo SMTP_USER para no tener un campo To vacío o inválido.
                bcc: to,
                subject: `📢 ${title} - Nuevo Anuncio de Coordinación`,
                html,
            });

            logger.info("Correos de anuncio enviados exitosamente a " + to.length + " usuarios.");
            return {
                success: true,
                message: "Email sent successfully",
            };
        } catch (error) {
            logger.error(`Error sending announcement email: ${error}`);
            // No arrojar error para no romper la creación del anuncio
            return {
                success: false,
                message: "Error sending email",
            };
        }
    }

    public async sendDirectMessageEmail(
        to: string,
        senderName: string,
        recipientName: string,
        content: string,
        date: string
    ) {
        if (!to) return;
        try {
            const html = getDirectMessageTemplate(senderName, recipientName, content, date);

            await this.transporter.sendMail({
                from: `"Gestión de Proyectos - Unimayor" <${envs.NODEMAILER_USER}>`,
                to: to,
                subject: `💬 Nuevo mensaje de ${senderName}`,
                html,
            });

            logger.info("Correo de mensaje directo enviado exitosamente a " + to);
            return { success: true };
        } catch (error) {
            logger.error(`Error sending direct message email: ${error}`);
            return { success: false };
        }
    }
}
