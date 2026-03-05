import { envs, logger, transporter } from "../config";
import { getConfirmationEmailTemplate, getPasswordResetTemplate } from "./templates";

type EmailType = {
  name: string;
  email: string;
  token?: string;
};

export class AuthEmail {
  /**
   * Envía email de confirmación de cuenta
   */
  static sendConfirmationEmail = async (user: EmailType) => {
    try {
      const htmlContent = getConfirmationEmailTemplate(user.name, user.token || "");

      const email = await transporter.sendMail({
        from: `"${envs.BREVO_SENDER_NAME}" <${envs.BREVO_SENDER_EMAIL}>`,
        to: user.email,
        subject: "Gestión de Proyectos de Grado - Confirma tu cuenta",
        text: `Hola ${user.name},\n\nGracias por registrarte en Gestión de Proyectos de Grado de Unimayor.\n\nTu código de confirmación es: ${user.token}\n\nIngrésalo en ${envs.FRONTEND_URL}/confirm-account para activar tu cuenta.\n\nEste código expira en 24 horas.`,
        html: htmlContent,
      });

      logger.info(`Confirmation email sent to ${user.email}. MessageId: ${email.messageId}`);
      return email;
    } catch (error: any) {
      logger.error(`Failed to send confirmation email to ${user.email}:`, error.message);
      // No detiene el flujo
      return null;
    }
  };

  /**
   * Envía email para resetear contraseña
   */
  static sendPasswordResetToken = async (user: EmailType) => {
    try {
      const htmlContent = getPasswordResetTemplate(user.name, user.token || "");

      const email = await transporter.sendMail({
        from: `"${envs.BREVO_SENDER_NAME}" <${envs.BREVO_SENDER_EMAIL}>`,
        to: user.email,
        subject: "Gestión de Proyectos de Grado - Restablece tu contraseña",
        text: `Hola ${user.name},\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nTu código para restablecer la contraseña es: ${user.token}\n\nIngrésalo en ${envs.FRONTEND_URL}/reset-password para crear una nueva contraseña.\n\nEste código expira en 1 hora.`,
        html: htmlContent,
      });

      logger.info(`Password reset email sent to ${user.email}. MessageId: ${email.messageId}`);
      return email;
    } catch (error: any) {
      logger.error(`Failed to send password reset email to ${user.email}:`, error.message);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  };
}
