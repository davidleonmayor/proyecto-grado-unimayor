import swaggerJsdoc, { Options } from "swagger-jsdoc";
import { envs } from "./envs";

const options: Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "UniMayor API",
      version: "1.0.0",
      description:
        "API del sistema de gestión de trabajos de grado y proyección social — UniMayor.",
    },
    servers: [
      {
        url: `http://localhost:${envs.PORT}`,
        description: "Local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    "./src/server.ts",
    "./src/**/*.routes.ts",
    "./src/**/*.controller.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
