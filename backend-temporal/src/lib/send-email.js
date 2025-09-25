import transporter from "../config/email.config.js"
import { generatePdf } from "./generate-pdf.js";

export const sendEmail = async (data) => {

    try {

        const pdfPath = await generatePdf(data);

        const info = await transporter.sendMail({
            from: `Facultad de ingenieria <${process.env.EMAIL_USER}>`,
            to: data.destinatario,
            subject: `Proyecto de grado - ${data.estado}`,
            html: `
                <h2>Informe del Proyecto</h2>
                <p>Estimado(a), se adjunta el informe del proyecto.</p>
                <p><b>Programa:</b> ${data.programa || "N/A"}</p>
                <p><b>Estado:</b> ${data.estado}</p>
                <p>Saludos cordiales,</p>
                <p>${data.firmante}</p>
            `,
            attachments: [
                {
                    filename: "informe-proyecto.pdf",
                    path: pdfPath, 
                },
            ],
        });


        return info;

    } catch (error) {
        console.error('Error al enviar correo', error);
        throw error;

    }
}