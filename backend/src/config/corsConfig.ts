import { CorsOptions } from "cors";
import { envs } from "./envs";

export const corsConfig: CorsOptions = {
  origin: function (origin: string | undefined, callback) {
    const allowedOrigins = [envs.FRONTEND_URL];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow
    } else {
      callback(new Error(`Origen no permitido por CORS: ${origin}`)); // Rechazar
    }
  },

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // needed for cookies
};
