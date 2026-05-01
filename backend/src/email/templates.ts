import { envs } from "../config";

const getBaseEmailTemplate = (title: string, contentHtml: string, accentColor: string = '#FACD05') => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
        body { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f8fafc; }
        .wrapper { padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025); border-top: 6px solid ${accentColor}; }
        .header { background-color: #ffffff; padding: 40px 40px 20px; text-align: left; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.025em; }
        .content { padding: 0 40px 40px; }
        .footer { background-color: #f8fafc; text-align: center; padding: 24px 40px; color: #64748b; font-size: 13px; border-top: 1px solid #f1f5f9; }
        
        /* Typography */
        p { margin-top: 0; margin-bottom: 16px; }
        .text-strong { font-weight: 600; color: #111827; }
        .text-subtle { color: #64748b; font-size: 14px; }
        
        /* Components */
        .btn { display: inline-block; background-color: ${accentColor} !important; color: ${accentColor === '#FACD05' || accentColor === '#facc15' ? '#422006' : '#ffffff'} !important; padding: 12px 28px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; font-size: 15px; text-align: center; transition: opacity 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .token-box { background-color: #f8fafc; color: #0f172a; font-size: 36px; font-weight: 800; padding: 20px 40px; border-radius: 12px; display: inline-block; letter-spacing: 8px; margin: 24px 0; border: 2px dashed #cbd5e1; text-align: center; }
        .info-box { background-color: #f8fafc; padding: 24px; border-radius: 12px; border-left: 4px solid ${accentColor}; margin: 32px 0; }
        .label { font-size: 12px; text-transform: uppercase; font-weight: 700; color: #64748b; display: block; margin-bottom: 4px; letter-spacing: 0.05em; }
        .value { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 16px; }
        .value:last-child { margin-bottom: 0; }
        </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        <div class="content">
            ${contentHtml}
        </div>
        <div class="footer">
            <p style="margin:0;">© ${new Date().getFullYear()} Gestión de Proyectos de Grado - Unimayor.</p>
            <p style="margin:8px 0 0; font-size: 12px;">Este es un mensaje automático, por favor no responda a este correo.</p>
        </div>
        </div>
      </div>
    </body>
    </html>
`;

export const getConfirmationEmailTemplate = (name: string, token: string) => getBaseEmailTemplate(
    'Bienvenido a la Plataforma 🎓',
    `
        <p class="text-strong" style="font-size: 16px;">Hola ${name},</p>
        <p>Tu cuenta ha sido creada exitosamente en el sistema de Gestión de Proyectos de Grado de Unimayor. Solo necesitas confirmarla para activarla.</p>
        <p>Por favor, ingresa el siguiente código de confirmación de 6 dígitos en la plataforma:</p>
        <div style="text-align: center;">
            <div class="token-box">${token}</div>
            <br/>
            <a href="${envs.FRONTEND_URL}/confirm-account" class="btn" style="background-color: #0ea5e9; color: #ffffff; text-decoration: none;">Ir a confirmar cuenta</a>
        </div>
        <p class="text-subtle" style="margin-top: 32px;"><strong>Nota:</strong> Este código expirará en 24 horas.</p>
        <p class="text-subtle">Si no solicitaste la creación de esta cuenta, por favor ignora este correo.</p>
    `,
    '#0ea5e9'
);

export const getPasswordResetTemplate = (name: string, token: string) => getBaseEmailTemplate(
    'Restablecer tu contraseña',
    `
        <p class="text-strong" style="font-size: 16px;">Hola ${name},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña en el sistema de Gestión de Proyectos de Grado.</p>
        <p>Para crear una nueva contraseña, haz clic en el siguiente botón o ingresa el código manualmente en la plataforma:</p>
        <div style="text-align: center;">
            <div class="token-box">${token}</div>
            <br/>
            <a href="${envs.FRONTEND_URL}/reset-password/${token}" class="btn" style="background-color: #0ea5e9; color: #ffffff; text-decoration: none;">Restablecer mi contraseña</a>
        </div>
        <div class="info-box" style="border-left-color: #facc15; background-color: #fefce8;">
            <strong style="color: #854d0e; display: block; margin-bottom: 8px;">Importante:</strong>
            <ul style="margin: 0; padding-left: 20px; color: #a16207; font-size: 14px;">
                <li style="margin-bottom: 4px;">El código expirará en 1 hora.</li>
                <li style="margin-bottom: 4px;">Si no solicitaste este cambio, ignora este correo.</li>
                <li>Por tu seguridad, nunca compartas este código con nadie.</li>
            </ul>
        </div>
    `,
    '#0ea5e9'
);

export const getNewIterationAlertTemplate = (directorName: string, studentName: string, projectTitle: string, shortSummary: string, eventsHtml: string = "") => getBaseEmailTemplate(
    'Nueva Entrega de Avance',
    `
        <p class="text-strong" style="font-size: 16px;">Estimado/a ${directorName},</p>
        <p>El estudiante <strong style="color:#111827;">${studentName}</strong> ha registrado un nuevo avance en el sistema para el proyecto de grado a su cargo.</p>
        
        <div class="info-box" style="border-left-color: #FACD05; background-color: #fefce8;">
            <span class="label" style="color: #a16207;">Proyecto</span>
            <div class="value">${projectTitle}</div>
            <span class="label" style="color: #a16207;">Resumen de la entrega</span>
            <div class="value" style="font-weight: 400;">${shortSummary}</div>
        </div>

        ${eventsHtml}

        <p>Por favor, ingrese a la plataforma para revisar la documentación adjunta y emitir la retroalimentación correspondiente.</p>
        
        <div style="text-align: center;">
            <a href="${envs.FRONTEND_URL}/projects" class="btn" style="background-color: #FACD05; color: #422006; text-decoration: none;">Gestionar Proyecto</a>
        </div>
    `,
    '#FACD05'
);

export const getReviewAlertTemplate = (studentName: string, reviewerName: string, projectTitle: string, statusHtml: string, resolutionHtml: string, shortComments: string, eventsHtml: string = "") => getBaseEmailTemplate(
    'Actualización de Proyecto',
    `
        <p class="text-strong" style="font-size: 16px;">Hola ${studentName},</p>
        <p>Se ha registrado una nueva revisión en tu proyecto de grado por parte de <strong style="color:#111827;">${reviewerName}</strong>.</p>
        
        <div class="info-box" style="border-left-color: #0ea5e9; background-color: #f0f9ff;">
            <span class="label" style="color: #0369a1;">Proyecto</span>
            <div class="value">${projectTitle}</div>
            
            ${statusHtml}
            ${resolutionHtml}
            
            <span class="label" style="color: #0369a1; margin-top: 16px;">Comentarios</span>
            <div class="value" style="font-weight: 400;">${shortComments}</div>
        </div>

        ${eventsHtml}

        <p>Ingresa a la plataforma web para analizar los detalles y descargar los documentos de la revisión, si fueron adjuntados.</p>
        
        <div style="text-align: center;">
            <a href="${envs.FRONTEND_URL}/projects" class="btn" style="background-color: #0ea5e9; color: #ffffff; text-decoration: none;">Ir a Mis Proyectos</a>
        </div>
    `,
    '#0ea5e9'
);

export const getNotificationEmailTemplate = (name: string, title: string, content: string, date: string) => getBaseEmailTemplate(
    'Notificación de Coordinación',
    `
        <p class="text-strong" style="font-size: 16px;">Hola ${name},</p>
        <p>Se ha publicado un nuevo anuncio que requiere tu atención <span class="text-subtle">(${date})</span>:</p>
        
        <div class="info-box" style="border-left-color: #facc15; background-color: #fefce8;">
            <span class="label" style="color: #ca8a04;">Asunto</span>
            <div class="value">${title}</div>
            <span class="label" style="color: #ca8a04;">Mensaje</span>
            <div class="value" style="font-weight: 400;">${content}</div>
        </div>

        <p>Puedes revisar todas tus notificaciones e historial directamente desde el panel principal de nuestra plataforma web.</p>
        
        <div style="text-align: center;">
            <a href="${envs.FRONTEND_URL}/" class="btn" style="background-color: #eab308; color: #ffffff; text-decoration: none;">Ingresar al Sistema</a>
        </div>
    `,
    '#eab308'
);

export const getDirectMessageTemplate = (senderName: string, recipientName: string, messageContent: string, date: string) => getBaseEmailTemplate(
    'Nuevo Mensaje Recibido',
    `
        <p class="text-strong" style="font-size: 16px;">Hola ${recipientName},</p>
        <p>Te informamos que <strong style="color:#111827;">${senderName}</strong> te ha enviado un mensaje directo a través de nuestra plataforma <span class="text-subtle">(${date})</span>:</p>
        
        <div class="info-box" style="border-left-color: #10b981; background-color: #ecfdf5;">
            <div style="font-style: italic; color: #047857; font-size: 16px;">
               "${messageContent}"
            </div>
        </div>

        <p>Para responder a este mensaje, ingresa a la plataforma web e interactúa desde el widget de chat o notificaciones.</p>
        
        <div style="text-align: center;">
            <a href="${envs.FRONTEND_URL}/" class="btn" style="background-color: #10b981; color: #ffffff; text-decoration: none;">Ver Mensaje en el Sistema</a>
        </div>
    `,
    '#10b981'
);

export const getEventNotificationTemplate = (eventName: string, eventDescription: string, eventDate: string, eventTime: string, isUrgent: boolean, projectTitle: string) => getBaseEmailTemplate(
    'Evento Programado',
    `
        ${isUrgent ? '<div style="display: inline-block; background-color: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 20px;">¡ATENCIÓN! ESTE EVENTO ES PRONTO</div>' : ''}
        
        <p class="text-strong" style="font-size: 16px;">Hola,</p>
        <p>Se ha programado un nuevo evento para el proyecto de grado al que estás adscrito (<strong style="color:#111827;">${projectTitle}</strong>).</p>
        
        <div class="info-box" style="border-left-color: ${isUrgent ? '#ef4444' : '#0ea5e9'}; background-color: ${isUrgent ? '#fef2f2' : '#f0f9ff'};">
            <span class="label" style="color: ${isUrgent ? '#b91c1c' : '#0369a1'};">Asunto</span>
            <div class="value">${eventName}</div>
            
            ${eventDescription ? `
                <span class="label" style="color: ${isUrgent ? '#b91c1c' : '#0369a1'};">Descripción</span>
                <div class="value" style="font-weight: 400;">${eventDescription}</div>
            ` : ''}
            
            <span class="label" style="color: ${isUrgent ? '#b91c1c' : '#0369a1'}; margin-top: 16px;">Fecha y Hora</span>
            <div class="value">${eventDate} a las ${eventTime}</div>
        </div>

        <p>Por favor, revisa el calendario en la plataforma y organízate para asistir si es requerido.</p>
        
        <div style="text-align: center;">
            <a href="${envs.FRONTEND_URL}/" class="btn" style="background-color: ${isUrgent ? '#ef4444' : '#0ea5e9'}; color: #ffffff; text-decoration: none;">Ver en el Calendario</a>
        </div>
    `,
    isUrgent ? '#ef4444' : '#0ea5e9'
);
