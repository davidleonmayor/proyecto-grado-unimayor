//En este archivo exportamos las variables de entorno

import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string(),
  PORT: z.string().regex(/^\d+$/).transform(Number).default(3000),
  JWT_SECRET: z.string().min(10, "JWT_SECRET Must be at least 10 characters"),
  NODEMAILER_HOST: z.string(),
  NODEMAILER_PORT: z.string().transform(Number),
  NODEMAILER_USER: z.string(),
  NODEMAILER_PASS: z.string()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success)
  throw new Error(`Invalid environment variables: ${parsedEnv.error}`);
console.log(".env data: ", parsedEnv.data);

export const envs = parsedEnv.data;
