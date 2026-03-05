import { envs } from "../config";

export const getConfirmationEmailTemplate = (name: string, token: string) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #4b5563; margin: 0; padding: 0; background-color: #f4f6f8; }
        .wrapper { padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-top: 6px solid #0ea5e9; }
        .header { background-color: #ffffff; padding: 30px 30px 10px; text-align: left; border-bottom: 1px solid #f3f4f6; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 600; color: #111827; }
        .content { padding: 30px; }
        .token { background-color: #f0f9ff; color: #0369a1; font-size: 32px; font-weight: 700; padding: 15px 30px; border-radius: 8px; display: inline-block; letter-spacing: 5px; margin: 20px 0; border: 1px dashed #7dd3fc; }
        .button { background-color: #0ea5e9; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: 600; font-size: 15px; }
        .footer { background-color: #f9fafb; text-align: center; padding: 20px; color: #9ca3af; font-size: 13px; border-top: 1px solid #f3f4f6; }
        </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
        <div class="header">
            <h1>Bienvenido a Gestión de Proyectos de Grado 🎓</h1>
        </div>
        <div class="content">
            <p style="color: #111827; font-size: 16px;">Hola <strong>${name}</strong>,</p>
            <p>Gracias por registrarte en el sistema de Gestión de Proyectos de Grado de Unimayor. Tu cuenta ha sido creada exitosamente, solo necesitas confirmarla para activarla.</p>
            <p>Por favor, visita el siguiente enlace e ingresa el código de confirmación de 6 dígitos:</p>
            <div style="text-align: center;">
            <a href="${envs.FRONTEND_URL}/confirm-account" class="button">Confirmar mi cuenta</a>
            <br/>
            <div class="token">${token}</div>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;"><strong>Nota:</strong> Este código expirará en 24 horas.</p>
            <p style="font-size: 14px; color: #6b7280;">Si no solicitaste la creación de esta cuenta, por favor ignora este correo.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Gestión de Proyectos de Grado - Unimayor. Todos los derechos reservados.</p>
        </div>
        </div>
      </div>
    </body>
    </html>
`;

export const getPasswordResetTemplate = (name: string, token: string) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #4b5563; margin: 0; padding: 0; background-color: #f4f6f8; }
        .wrapper { padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-top: 6px solid #0ea5e9; }
        .header { background-color: #ffffff; padding: 30px 30px 10px; text-align: left; border-bottom: 1px solid #f3f4f6; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 600; color: #111827; }
        .content { padding: 30px; }
        .token { background-color: #f0f9ff; color: #0369a1; font-size: 32px; font-weight: 700; padding: 15px 30px; border-radius: 8px; display: inline-block; letter-spacing: 5px; margin: 20px 0; border: 1px dashed #7dd3fc; }
        .button { background-color: #0ea5e9; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: 600; font-size: 15px; }
        .warning { background-color: #fefce8; border-left: 4px solid #facc15; padding: 15px; margin: 30px 0 10px; border-radius: 4px; color: #854d0e; font-size: 14px; }
        .footer { background-color: #f9fafb; text-align: center; padding: 20px; color: #9ca3af; font-size: 13px; border-top: 1px solid #f3f4f6; }
        </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
        <div class="header">
            <h1>Restablecer tu contraseña</h1>
        </div>
        <div class="content">
            <p style="color: #111827; font-size: 16px;">Hola <strong>${name}</strong>,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña en el sistema de Gestión de Proyectos de Grado.</p>
            <p>Para crear una contraseña nueva, visita el siguiente enlace e ingresa este código:</p>
            <div style="text-align: center;">
            <a href="${envs.FRONTEND_URL}/reset-password" class="button">Restablecer mi contraseña</a>
            <br/>
            <div class="token">${token}</div>
            </div>
            <div class="warning">
            <strong>Importante:</strong>
            <ul style="margin: 5px 0 0; padding-left: 20px;">
                <li>El código expirará en 1 hora.</li>
                <li>Si no solicitaste este cambio, ignora este correo.</li>
                <li>Por tu seguridad, nunca compartas este código con nadie.</li>
            </ul>
            </div>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Gestión de Proyectos de Grado - Unimayor. Todos los derechos reservados.</p>
        </div>
        </div>
      </div>
    </body>
    </html>
`;

export const getNewIterationAlertTemplate = (directorName: string, studentName: string, projectTitle: string, shortSummary: string, eventsHtml: string = "") => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #4b5563; margin: 0; padding: 0; background-color: #f4f6f8; }
        .wrapper { padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-top: 6px solid #FACD05; }
        .header { background-color: #ffffff; padding: 30px 30px 10px; text-align: left; border-bottom: 1px solid #f3f4f6; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 600; color: #111827; }
        .content { padding: 30px; }
        .info-box { background-color: #fefce8; padding: 20px; border-radius: 6px; border-left: 4px solid #facc15; margin: 25px 0; }
        .button { background-color: #0ea5e9; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: 600; font-size: 15px; }
        .footer { background-color: #f9fafb; text-align: center; padding: 20px; color: #9ca3af; font-size: 13px; border-top: 1px solid #f3f4f6; }
        .label { font-size: 13px; text-transform: uppercase; font-weight: 700; color: #854d0e; display: inline-block; margin-bottom: 4px; letter-spacing: 0.05em; }
        </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
        <div class="header">
            <h1>Nueva Entrega de Avance</h1>
        </div>
        <div class="content">
            <p style="color: #111827; font-size: 16px;">Estimado/a <strong>${directorName}</strong>,</p>
            <p>Nos complace informarle que el estudiante <strong>${studentName}</strong> ha registrado un nuevo avance en el sistema para el proyecto de grado a su cargo.</p>
            
            <div class="info-box">
            <p style="margin-top: 0; color: #4b5563;"><span class="label">Proyecto</span><br/> <strong style="color: #111827;">${projectTitle}</strong></p>
            <p style="margin-bottom: 0; color: #4b5563;"><span class="label">Resumen de la entrega</span><br/> ${shortSummary}</p>
            </div>

            ${eventsHtml}

            <p>Por favor, ingrese a la plataforma para revisar la documentación adjunta y emitir la retroalimentación correspondiente.</p>
            
            <div style="text-align: center;">
            <a href="${envs.FRONTEND_URL}/dashboard/projects" class="button">Gestionar Proyecto</a>
            </div>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Gestión de Proyectos de Grado - Unimayor. Todos los derechos reservados.</p>
        </div>
        </div>
      </div>
    </body>
    </html>
`;

export const getReviewAlertTemplate = (studentName: string, reviewerName: string, projectTitle: string, statusHtml: string, resolutionHtml: string, shortComments: string, eventsHtml: string = "") => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #4b5563; margin: 0; padding: 0; background-color: #f4f6f8; }
        .wrapper { padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-top: 6px solid #0ea5e9; }
        .header { background-color: #ffffff; padding: 30px 30px 10px; text-align: left; border-bottom: 1px solid #f3f4f6; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 600; color: #111827; }
        .content { padding: 30px; }
        .info-box { background-color: #f0f9ff; padding: 20px; border-radius: 6px; border-left: 4px solid #0ea5e9; margin: 25px 0; }
        .button { background-color: #0ea5e9; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: 600; font-size: 15px; }
        .footer { background-color: #f9fafb; text-align: center; padding: 20px; color: #9ca3af; font-size: 13px; border-top: 1px solid #f3f4f6; }
        .label { font-size: 13px; text-transform: uppercase; font-weight: 700; color: #0369a1; display: inline-block; margin-bottom: 4px; letter-spacing: 0.05em; }
        </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
        <div class="header">
            <h1>Actualización de Proyecto</h1>
        </div>
        <div class="content">
            <p style="color: #111827; font-size: 16px;">Hola <strong>${studentName}</strong>,</p>
            <p>Se ha registrado una nueva revisión en tu proyecto de grado por parte de <strong>${reviewerName}</strong>.</p>
            
            <div class="info-box">
            <p style="margin-top: 0; color: #4b5563;"><span class="label">Proyecto</span><br/> <strong style="color: #111827;">${projectTitle}</strong></p>
            ${statusHtml}
            ${resolutionHtml}
            <p style="margin-bottom: 0; color: #4b5563;"><span class="label">Comentarios</span><br/> ${shortComments}</p>
            </div>

            ${eventsHtml}

            <p>Ingresa a la plataforma web para analizar los detalles y descargar los documentos de la revisión, si fueron adjuntados.</p>
            
            <div style="text-align: center;">
            <a href="${envs.FRONTEND_URL}/dashboard/projects" class="button">Ir a Mis Proyectos</a>
            </div>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Gestión de Proyectos de Grado - Unimayor. Todos los derechos reservados.</p>
        </div>
        </div>
      </div>
    </body>
    </html>
`;

export const getNotificationEmailTemplate = (name: string, title: string, content: string, date: string) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #4b5563; margin: 0; padding: 0; background-color: #f4f6f8; }
        .wrapper { padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-top: 6px solid #eab308; }
        .header { background-color: #ffffff; padding: 30px 30px 10px; text-align: left; border-bottom: 1px solid #f3f4f6; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 600; color: #111827; }
        .content { padding: 30px; }
        .info-box { background-color: #fefce8; padding: 20px; border-radius: 6px; border-left: 4px solid #facc15; margin: 25px 0; }
        .button { background-color: #eab308; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: 600; font-size: 15px; }
        .footer { background-color: #f9fafb; text-align: center; padding: 20px; color: #9ca3af; font-size: 13px; border-top: 1px solid #f3f4f6; }
        .label { font-size: 13px; text-transform: uppercase; font-weight: 700; color: #ca8a04; display: inline-block; margin-bottom: 4px; letter-spacing: 0.05em; }
        </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
        <div class="header">
            <h1>Notificación de Coordinación</h1>
        </div>
        <div class="content">
            <p style="color: #111827; font-size: 16px;">Hola <strong>${name}</strong>,</p>
            <p>Se ha publicado un nuevo anuncio que requiere tu atención (${date}):</p>
            
            <div class="info-box">
            <p style="margin-top: 0; color: #4b5563;"><span class="label">Asunto</span><br/> <strong style="color: #111827;">${title}</strong></p>
            <p style="margin-bottom: 0; color: #4b5563;"><span class="label">Mensaje</span><br/> ${content}</p>
            </div>

            <p>Puedes revisar todas tus notificaciones e historial directamente desde el panel principal de nuestra plataforma web.</p>
            
            <div style="text-align: center;">
            <a href="${envs.FRONTEND_URL}/dashboard" class="button">Ingresar al Sistema</a>
            </div>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Gestión de Proyectos de Grado - Unimayor. Todos los derechos reservados.</p>
        </div>
        </div>
      </div>
    </body>
    </html>
`;
