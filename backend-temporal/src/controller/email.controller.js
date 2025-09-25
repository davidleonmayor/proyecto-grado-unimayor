import { generatePdf } from '../lib/generate-pdf.js';
import { sendEmail } from '../lib/send-email.js';

export const sendEmailController = async (req, res) => {

    const body = req.body;

    try {

        await sendEmail(body)

        return res.json({
            body,
            message: 'Carta de proyecto enviada con exito'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json('No se pudo enviar la carta')

    }
}

