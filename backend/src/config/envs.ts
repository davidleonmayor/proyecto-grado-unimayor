//En este archivo exportamos las variables de entorno

import { z } from "zod";
import 'dotenv/config';

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string(),
    PORT: z.string().regex(/^\d+$/).transform(Number).default(3000),
    JWT_SECRET: z.string().min(10, "JWT_SECRET Must be at least 10 characters"),
});


const parsedEnv = envSchema.safeParse(process.env);

if(!parsedEnv.success) throw new Error(`Invalid environment variables: ${parsedEnv.error}`);

export const envs = parsedEnv.data;
