import swaggerJsdoc, { Options } from "swagger-jsdoc";
import { envs } from "./envs";
import { commonSwagger } from "./swagger/common";
import { authSwagger } from "./swagger/auth";
import { proyeccionSocialSwagger } from "./swagger/socialProjection";

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
    tags: [
      ...authSwagger.tags,
      ...proyeccionSocialSwagger.tags,
      ...commonSwagger.tags,
    ],
    components: {
      securitySchemes: commonSwagger.securitySchemes,
      schemas: {
        ...commonSwagger.schemas,
        ...authSwagger.schemas,
        ...proyeccionSocialSwagger.schemas,
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
