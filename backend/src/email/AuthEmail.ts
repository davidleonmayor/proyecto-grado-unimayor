import * as brevo from "@getbrevo/brevo";
import { envs, logger, brevoClient } from "../config";

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
            const sendSmtpEmail = new brevo.SendSmtpEmail();

            sendSmtpEmail.subject = "MoneyUp - Confirma tu cuenta";
            sendSmtpEmail.to = [
                {
                    email: user.email,
                    name: user.name,
                },
            ];
            sendSmtpEmail.sender = {
                // name: envs.BREVO_SENDER_NAME,
                // email: envs.BREVO_SENDER_EMAIL,
                name: "MoneyUp",
                email: "jd.leon@unimayor.edu.co", // Tu email verificado
            };
            sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .token { background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; display: inline-block; letter-spacing: 5px; margin: 20px 0; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a MoneyUp! 💰</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${user.name}</strong>,</p>
              <p>Gracias por registrarte en MoneyUp. Tu cuenta está casi lista, solo necesitas confirmarla.</p>
              <p>Para confirmar tu cuenta, visita el siguiente enlace e ingresa el código:</p>
              <div style="text-align: center;">
                <a href="${envs.FRONTEND_URL}/auth/confirm-account" class="button">Confirmar Cuenta</a>
                <div class="token">${user.token}</div>
              </div>
              <p><strong>Nota:</strong> Este código expirará en 24 horas.</p>
              <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MoneyUp. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

            const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
            logger.info(
                `Confirmation email sent to ${user.email}. MessageId: ${response.body.messageId}`,
            );

            return response;
        } catch (error: any) {
            logger.error(
                `Failed to send confirmation email to ${user.email}:`,
                error.message,
            );
            throw new Error(`Email sending failed: ${error.message}`);
        }
    };

    /**
     * Envía email para resetear contraseña
     */
    static sendPasswordResetToken = async (user: EmailType) => {
        try {
            const sendSmtpEmail = new brevo.SendSmtpEmail();

            sendSmtpEmail.subject = "MoneyUp - Restablece tu contraseña";
            sendSmtpEmail.to = [
                {
                    email: user.email,
                    name: user.name,
                },
            ];
            sendSmtpEmail.sender = {
                name: envs.BREVO_SENDER_NAME,
                email: envs.BREVO_SENDER_EMAIL,
            };
            sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .token { background: #f5576c; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; display: inline-block; letter-spacing: 5px; margin: 20px 0; }
            .button { background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Restablece tu contraseña</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${user.name}</strong>,</p>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en MoneyUp.</p>
              <p>Para continuar, visita el siguiente enlace e ingresa el código:</p>
              <div style="text-align: center;">
                <a href="${envs.FRONTEND_URL}/auth/new-password" class="button">Restablecer Contraseña</a>
                <div class="token">${user.token}</div>
              </div>
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 10px 0;">
                  <li>Este código expirará en 1 hora</li>
                  <li>Si no solicitaste este cambio, ignora este correo</li>
                  <li>Tu contraseña actual seguirá siendo válida</li>
                </ul>
              </div>
              <p>Por tu seguridad, nunca compartas este código con nadie.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MoneyUp. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

            const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
            logger.info(
                `Password reset email sent to ${user.email}. MessageId: ${response.body.messageId}`,
            );

            return response;
        } catch (error: any) {
            logger.error(
                `Failed to send password reset email to ${user.email}:`,
                error.message,
            );
            throw new Error(`Email sending failed: ${error.message}`);
        }
    };
}

// USING NODEMAILER
// import { envs, logger, transporter } from "../config";

// type EmailType = {
//   name: string;
//   email: string;
//   token?: string; // TODO: token have to be necesary
// };

// export class AuthEmail {
//   static sendConfirmationEmail = async (user: EmailType) => {
//     const email = await transporter.sendMail({
//       from: "MoneyUp <admin@moneyup.com>",
//       to: user.email,
//       subject: "MoneyUp - Confirma tu cuenta",
//       html: `<p>Hola: ${user.name}, has creado tu cuenta en MoneyUp, ya esta casi lista</p>
//                 <p>Visita el siguiente enlace:</p>
//                 <a href="${envs.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
//                 <p>e ingresa el código: <b>${user.token}</b></p>`,
//     });

//     logger.info("Mensaje enviado ", email.messageId);
//   };

//   static sendPasswordResetToken = async (user: EmailType) => {
//     const email = await transporter.sendMail({
//       from: "MoneyUp <admin@moneyup.com>",
//       to: user.email,
//       subject: "MoneyUp - Reestablece tu Password",
//       html: `<p>Hola: ${user.name}, has solicitado reestablecer tu password</p>
//                 <p>Visita el siguiente enlace:</p>
//                 <a href="${envs.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
//                 <p>e ingresa el código: <b>${user.token}</b></p>`,
//     });

//     logger.info("Mensaje enviado ", email.messageId);
//   };
// }
