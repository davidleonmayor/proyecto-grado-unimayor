import nodemailer from "nodemailer";
import { envs } from "./envs";

const config = () => ({
  host: envs.NODEMAILER_HOST,
  port: +envs.NODEMAILER_PORT,
  auth: {
    user: envs.NODEMAILER_USER,
    pass: envs.NODEMAILER_PASS,
  },
});

export const transporter = nodemailer.createTransport(config());
