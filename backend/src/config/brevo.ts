import * as brevo from "@getbrevo/brevo";
import { envs, logger } from "./index";

class BrevoService {
    private static instance: brevo.TransactionalEmailsApi;

    private constructor() {}

    public static getInstance(): brevo.TransactionalEmailsApi {
        if (!BrevoService.instance) {
            const apiInstance = new brevo.TransactionalEmailsApi();

            // Configurar API Key
            apiInstance.setApiKey(
                brevo.TransactionalEmailsApiApiKeys.apiKey,
                envs.BREVO_API_KEY,
            );

            BrevoService.instance = apiInstance;
            logger.info("✅ Brevo email service initialized");
        }

        return BrevoService.instance;
    }
}

export const brevoClient = BrevoService.getInstance();
