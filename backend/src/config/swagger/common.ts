/**
 * Tags, securityScheme y schemas compartidos entre todos los módulos
 * (respuestas genéricas de error, mensaje y validación).
 */
export const commonSwagger = {
  tags: [
    {
      name: "Health",
      description: "Comprobación de estado de la API.",
    },
  ],
  securitySchemes: {
    bearerAuth: {
      type: "http" as const,
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  schemas: {
    Error: {
      type: "object",
      properties: {
        error: { type: "string", example: "Mensaje descriptivo del error" },
      },
    },
    ValidationError: {
      type: "object",
      properties: {
        errors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", example: "field" },
              msg: { type: "string", example: "Email is required" },
              path: { type: "string", example: "email" },
              location: { type: "string", example: "body" },
            },
          },
        },
      },
    },
    MessageResponse: {
      type: "object",
      properties: {
        message: { type: "string", example: "Operación realizada correctamente" },
      },
    },
  },
};
