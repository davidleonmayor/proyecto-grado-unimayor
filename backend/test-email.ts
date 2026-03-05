import { config } from "dotenv";
config();
import { AuthEmail } from "./src/email/AuthEmail";

async function runTest() {
    console.log("🚀 Iniciando prueba de Brevo...");
    console.log("API KEY cargada:", !!process.env.BREVO_API_KEY);
    console.log("Email remitente:", process.env.BREVO_SENDER_EMAIL);

    try {
        await AuthEmail.sendConfirmationEmail({
            name: "Usuario de Prueba",
            email: process.env.BREVO_SENDER_EMAIL as string, // enviar al mismo remitente para probar
            token: "ABC-123",
        });
        console.log("✅ ¡Correo de prueba enviado correctamente!");
    } catch (error: any) {
        console.error("❌ Ocurrió un error al enviar el correo:");
        console.error(error.message);
        if (error.response) {
            console.error("Detalles de la respuesta:", error.response.body || error.response.data);
        }
    }
}

runTest();
