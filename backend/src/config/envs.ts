import { z } from "zod";
import "dotenv/config";
import { logger } from "./index";

const envSchema = z.object({
    // Aplication
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: z.string().regex(/^\d+$/).transform(Number).default(4000),
    // Database
    DATABASE_URL: z.string(),
    // Auth
    JWT_SECRET: z.string().min(10, "JWT_SECRET Must be at least 10 characters"),
    // Origin
    FRONTEND_URL: z.string(),
    // Nodemiler
    NODEMAILER_HOST: z.string(),
    NODEMAILER_PORT: z.string().transform(Number),
    NODEMAILER_USER: z.string(),
    NODEMAILER_PASS: z.string(),
    // Brevo (reemplaza nodemailer)
    BREVO_API_KEY: z.string().min(1, "BREVO_API_KEY is required"),
    BREVO_SENDER_EMAIL: z.string().email(),
    BREVO_SENDER_NAME: z.string().default("MoneyUp"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error(`[Env] error: \n ${parsedEnv.error}`);
    throw new Error(`[Env] error: \n ${parsedEnv.error}`);
}

console.log("[env] success loaded");

export const envs = parsedEnv.data;
