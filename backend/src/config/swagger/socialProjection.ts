import { CreateManualSocialProjectionSchema } from "../../social-projection/socialProjection.schema";
import { buildComponentSchemas } from "./from-validator";

/**
 * Schemas de request auto-generados desde los Schemas de express-validator
 * de proyección social. Para cambiar la forma del body, modificá
 * `socialProjection.schema.ts`.
 */
const requestSchemas = buildComponentSchemas({
  CreateManualProyeccionSocialRequest: CreateManualSocialProjectionSchema,
});

const responseSchemas = {
  ProyeccionSocialItem: {
    type: "object",
    properties: {
      id_proyecto_social: { type: "string", example: "ckxyz..." },
      nombre: { type: "string", example: "Brigada de salud rural" },
      descripcion: { type: "string", nullable: true },
      fecha_registro: { type: "string", format: "date-time" },
      id_persona_registra: { type: "string", nullable: true },
      personas_impactadas: { type: "integer", example: 120 },
      estado: { type: "string", example: "En proceso" },
    },
  },
  ProyeccionSocialList: {
    type: "object",
    properties: {
      total: { type: "integer", example: 20 },
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/ProyeccionSocialItem" },
      },
    },
  },
  Integrante: {
    type: "object",
    properties: {
      id_persona: { type: "string" },
      rol: { type: "string", enum: ["Estudiante", "Docente"] },
      persona: {
        type: "object",
        properties: {
          nombres: { type: "string" },
          apellidos: { type: "string" },
          correo_electronico: { type: "string", format: "email" },
          num_doc_identidad: { type: "string" },
        },
      },
    },
  },
  ProyeccionSocialDetail: {
    allOf: [
      { $ref: "#/components/schemas/ProyeccionSocialItem" },
      {
        type: "object",
        properties: {
          integrantes: {
            type: "array",
            items: { $ref: "#/components/schemas/Integrante" },
          },
        },
      },
    ],
  },
  Anexo: {
    type: "object",
    properties: {
      id_anexo: { type: "string" },
      id_proyecto_social: { type: "string" },
      nombre_archivo: { type: "string", example: "informe.pdf" },
      tipo_mime: { type: "string", example: "application/pdf" },
      fecha_subida: { type: "string", format: "date-time" },
    },
  },
  DashboardStats: {
    type: "object",
    properties: {
      totalProjects: { type: "integer", example: 20 },
      totalImpactadas: { type: "integer", example: 4500 },
      weeklyImpact: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", example: "Semana 4" },
            personas_impactadas: { type: "integer" },
          },
        },
      },
      status: {
        type: "object",
        properties: {
          finalizados: { type: "integer" },
          sinEntregar: { type: "integer" },
          total: { type: "integer" },
          porcentajeFinalizado: { type: "integer" },
          porcentajeSinEntregar: { type: "integer" },
        },
      },
      monthlyFinalized: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", example: "Ene" },
            finalizados: { type: "integer" },
          },
        },
      },
    },
  },
};

export const proyeccionSocialSwagger = {
  tags: [
    {
      name: "ProyeccionSocial",
      description: "Gestión de proyectos de proyección social y sus anexos.",
    },
  ],
  schemas: {
    ...responseSchemas,
    ...requestSchemas,
  },
};
