import { envs, logger, transporter } from "../config";
import { getNewIterationAlertTemplate, getReviewAlertTemplate } from "./templates";

type DeliveryAlertInfo = {
  projectTitle: string;
  studentName: string;
  directorEmail: string;
  directorName: string;
  summary: string | null;
  eventsHtml?: string;
};

type ReviewAlertInfo = {
  projectTitle: string;
  status: string | null;
  resolution: string | null;
  reviewerName: string;
  studentEmail: string;
  studentName: string;
  comments: string | null;
  eventsHtml?: string;
};

export class ProjectEmail {
  /**
   * Envía email a los directores cuando un estudiante entrega un avance
   */
  static sendNewIterationAlert = async (info: DeliveryAlertInfo) => {
    try {
      const shortSummary = info.summary ? info.summary : "Sin comentarios adicionales.";
      const htmlContent = getNewIterationAlertTemplate(info.directorName, info.studentName, info.projectTitle, shortSummary, info.eventsHtml || "");

      const email = await transporter.sendMail({
        from: `"${envs.BREVO_SENDER_NAME}" <${envs.BREVO_SENDER_EMAIL}>`,
        to: info.directorEmail,
        subject: `Gestión de Proyectos de Grado - Nuevo avance en tu proyecto: ${info.projectTitle}`,
        text: `Hola ${info.directorName},\n\nEl estudiante ${info.studentName} ha subido un nuevo avance para el proyecto:\n${info.projectTitle}\n\nResumen de la entrega:\n${shortSummary}\n\nIngresa a la plataforma (${envs.FRONTEND_URL}) para revisar el documento.`,
        html: htmlContent,
      });

      logger.info(`New iteration email sent to ${info.directorEmail}. MessageId: ${email.messageId}`);
      return email;
    } catch (error: any) {
      logger.error(`Failed to send new iteration email to ${info.directorEmail}:`, error.message);
      return null;
    }
  };

  /**
   * Envía email a los estudiantes cuando el proyecto se revisa, o cambia de estado/resolución
   */
  static sendReviewAlert = async (info: ReviewAlertInfo) => {
    try {
      const shortComments = info.comments ? info.comments : "Se ha registrado una nueva iteración o cambio en tu proyecto.";

      let statusHtml = "";
      let resolutionHtml = "";

      if (info.status) {
        statusHtml = `<p><span class="label">Nuevo Estado:</span> <span style="color: #0284c7; font-weight: bold; font-size: 14px;">${info.status}</span></p>`;
      }

      if (info.resolution) {
        resolutionHtml = `<p><span class="label">Resolución Asignada:</span> <strong>${info.resolution}</strong></p>`;
      }

      const htmlContent = getReviewAlertTemplate(
        info.studentName,
        info.reviewerName,
        info.projectTitle,
        statusHtml,
        resolutionHtml,
        shortComments,
        info.eventsHtml || ""
      );

      const email = await transporter.sendMail({
        from: `"${envs.BREVO_SENDER_NAME}" <${envs.BREVO_SENDER_EMAIL}>`,
        to: info.studentEmail,
        subject: `Gestión de Proyectos de Grado - Actualización en tu proyecto: ${info.projectTitle}`,
        text: `Hola ${info.studentName},\n\nSe ha registrado una nueva revisión en tu proyecto de grado por parte de ${info.reviewerName}.\n\nProyecto:\n${info.projectTitle}\n\n${info.status ? 'Nuevo Estado: ' + info.status + '\n' : ''}${info.resolution ? 'Resolución Asignada: ' + info.resolution + '\n' : ''}Comentarios:\n${shortComments}\n\nIngresa a la plataforma (${envs.FRONTEND_URL}) para ver los detalles y descargar los documentos adjuntos si los hay.`,
        html: htmlContent,
      });

      logger.info(`Review alert email sent to ${info.studentEmail}. MessageId: ${email.messageId}`);
      return email;
    } catch (error: any) {
      logger.error(`Failed to send review alert email to ${info.studentEmail}:`, error.message);
      return null;
    }
  };
}
