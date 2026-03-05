import { PrismaClient } from "@prisma/client";
import { ProjectEmail } from "./ProjectEmail";

const prisma = new PrismaClient();

export class ProjectNotificationService {
    private static async getProjectEventsHtml(projectId: string): Promise<string> {
        try {
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const events = await prisma.evento.findMany({
                where: {
                    activo: true,
                    fecha_fin: { gte: now },
                    OR: [
                        { id_trabajo_grado: projectId },
                        { id_trabajo_grado: null }
                    ]
                },
                orderBy: [
                    { fecha_inicio: 'asc' }
                ]
            });

            if (!events || events.length === 0) return "";

            let htmlString = `<div style="margin: 25px 0; padding: 15px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">`;
            htmlString += `<h3 style="margin-top: 0; color: #334155; font-size: 16px;"> Próximos Eventos</h3>`;
            htmlString += `<ul style="padding-left: 20px; color: #475569; margin-bottom: 0;">`;

            for (const event of events) {
                const eventStartDate = new Date(event.fecha_inicio);
                const eventStartDateObj = new Date(eventStartDate);
                eventStartDateObj.setHours(0, 0, 0, 0);

                const isToday = eventStartDateObj.getTime() === now.getTime();

                const formatOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
                const dateString = eventStartDate.toLocaleDateString('es-ES', formatOptions);

                if (isToday) {
                    htmlString += `<li style="margin-bottom: 10px;">
                        <span style="background-color: #ffedd5; color: #c2410c; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-right: 5px;">¡HOY!</span>
                        <strong style="color: #111827;">${event.titulo}</strong>
                        <div style="font-size: 13px; margin-top: 2px;">
                            <span style="color: #ea580c; font-weight: bold;">¡El evento inicia hoy${event.hora_inicio ? ` a las ${event.hora_inicio}` : ''}!</span>
                        </div>
                    </li>`;
                } else {
                    htmlString += `<li style="margin-bottom: 10px;">
                        <strong style="color: #111827;">${event.titulo}</strong> - ${dateString} ${event.hora_inicio ? `a las ${event.hora_inicio}` : ''}
                    </li>`;
                }
            }

            htmlString += `</ul></div>`;
            return htmlString;
        } catch (error) {
            console.error("Error generating events HTML:", error);
            return "";
        }
    }

    /**
     * Notifica a los estudiantes cuando se ha revisado su avance o cambiado el estado
     */
    static async notifyReview(
        projectId: string,
        reviewerId: string,
        statusId: string | null,
        resolution: string | null,
        comments: string | null
    ) {
        try {
            const reviewerInfo = await prisma.persona.findUnique({
                where: { id_persona: reviewerId }
            });

            const projectInfo = await prisma.trabajo_grado.findUnique({
                where: { id_trabajo_grado: projectId },
                include: { estado_tg: true }
            });

            const students = await prisma.actores.findMany({
                where: {
                    id_trabajo_grado: projectId,
                    tipo_rol: { nombre_rol: "Estudiante" },
                    estado: "Activo"
                },
                include: { persona: true }
            });

            if (reviewerInfo && projectInfo && students.length > 0) {
                const reviewerName = `${reviewerInfo.nombres} ${reviewerInfo.apellidos}`;
                const projectName = projectInfo.titulo_trabajo;
                const statusName = statusId && projectInfo.estado_tg ? projectInfo.estado_tg.nombre_estado : null;
                const eventsHtml = await this.getProjectEventsHtml(projectId);

                for (const student of students) {
                    const studentName = `${student.persona.nombres} ${student.persona.apellidos}`;
                    await ProjectEmail.sendReviewAlert({
                        projectTitle: projectName,
                        status: statusName,
                        resolution: resolution,
                        reviewerName: reviewerName,
                        studentEmail: student.persona.correo_electronico,
                        studentName: studentName,
                        comments: comments,
                        eventsHtml: eventsHtml
                    });
                }
            }
        } catch (emailError) {
            console.error("Failed sending email notification on reviewIteration:", emailError);
        }
    }

    /**
     * Notifica a los directores cuando un estudiante sube un nuevo avance
     */
    static async notifyNewIteration(
        projectId: string,
        studentId: string,
        summary: string | null
    ) {
        try {
            const studentInfo = await prisma.persona.findUnique({
                where: { id_persona: studentId }
            });

            const projectInfo = await prisma.trabajo_grado.findUnique({
                where: { id_trabajo_grado: projectId }
            });

            const directors = await prisma.actores.findMany({
                where: {
                    id_trabajo_grado: projectId,
                    tipo_rol: { nombre_rol: "Director" },
                    estado: "Activo"
                },
                include: { persona: true }
            });

            if (studentInfo && projectInfo && directors.length > 0) {
                const studentName = `${studentInfo.nombres} ${studentInfo.apellidos}`;
                const projectName = projectInfo.titulo_trabajo;
                const eventsHtml = await this.getProjectEventsHtml(projectId);

                for (const director of directors) {
                    const directorName = `${director.persona.nombres} ${director.persona.apellidos}`;
                    await ProjectEmail.sendNewIterationAlert({
                        projectTitle: projectName,
                        studentName: studentName,
                        directorEmail: director.persona.correo_electronico,
                        directorName: directorName,
                        summary: summary,
                        eventsHtml: eventsHtml
                    });
                }
            }
        } catch (emailError) {
            console.error("Failed sending email notification on createIteration:", emailError);
        }
    }
}
