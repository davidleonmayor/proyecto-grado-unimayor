import type { ParamSchema, Schema } from "express-validator";

const authorizationHeaderRule: ParamSchema = {
  in: "headers",
  exists: {
    errorMessage: "Authorization header is required",
  },
  isString: {
    errorMessage: "Authorization header must be a string",
  },
  trim: true,
  matches: {
    options: /^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/,
    errorMessage: "Authorization header must be in the format: Bearer <token>",
  },
};

const cuidRegex = /^c[a-z0-9]{24}$/;

const cuidRule = {
  isString: {
    errorMessage: "Debe ser texto",
  },
  trim: true,
  matches: {
    options: cuidRegex,
    errorMessage: "Debe ser un CUID válido",
  },
};

const optionalShortTextRule = {
  optional: {
    options: { nullable: true },
  },
  isString: {
    errorMessage: "Debe ser texto",
  },
  trim: true,
  isLength: {
    options: { min: 1, max: 50 },
    errorMessage: "Debe tener entre 1 y 50 caracteres",
  },
};

export const GetProjectsSchema: Schema = {
  authorization: authorizationHeaderRule,
};

export const GetProjectHistorySchema: Schema = {
  authorization: authorizationHeaderRule,
  id: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'id' es obligatorio",
    },
    ...cuidRule,
  },
};

export const CreateIterationSchema: Schema = {
  authorization: authorizationHeaderRule,
  id: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'id' es obligatorio",
    },
    ...cuidRule,
  },
  description: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'description' debe ser texto",
    },
    trim: true,
    isLength: {
      options: { min: 1, max: 2000 },
      errorMessage: "El campo 'description' debe tener entre 1 y 2000 caracteres",
    },
  },
  numero_resolucion: {
    in: ["body"],
    ...optionalShortTextRule,
  },
};

export const ReviewIterationSchema: Schema = {
  authorization: authorizationHeaderRule,
  id: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'id' es obligatorio",
    },
    ...cuidRule,
  },
  description: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'description' debe ser texto",
    },
    trim: true,
    isLength: {
      options: { min: 1, max: 2000 },
      errorMessage: "El campo 'description' debe tener entre 1 y 2000 caracteres",
    },
  },
  numero_resolucion: {
    in: ["body"],
    ...optionalShortTextRule,
  },
  newStatusId: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    custom: {
      options: (value: unknown) => {
        if (value === null || value === undefined) return true;
        if (typeof value !== "string") return false;
        const trimmed = value.trim();
        return trimmed === "" || cuidRegex.test(trimmed);
      },
      errorMessage: "El campo 'newStatusId' debe ser vacío o un CUID válido",
    },
  },
  actionType: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'actionType' debe ser texto",
    },
    trim: true,
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: "El campo 'actionType' debe tener entre 1 y 100 caracteres",
    },
  },
};

export const DownloadProjectHistoryFileSchema: Schema = {
  authorization: authorizationHeaderRule,
  historyId: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'historyId' es obligatorio",
    },
    ...cuidRule,
  },
};

export const GetStatusesSchema: Schema = {
  authorization: authorizationHeaderRule,
};

export const GetFormDataSchema: Schema = {
  authorization: authorizationHeaderRule,
};

export const GetAvailableStudentsSchema: Schema = {
  authorization: authorizationHeaderRule,
  programId: {
    in: ["query"],
    optional: {
      options: { nullable: true },
    },
    ...cuidRule,
    errorMessage: "El parámetro 'programId' debe ser un CUID válido",
  },
};

export const GetAvailableAdvisorsSchema: Schema = {
  authorization: authorizationHeaderRule,
};

export const GetDashboardStatsSchema: Schema = {
  authorization: authorizationHeaderRule,
};

export const GetTeacherDashboardStatsSchema: Schema = {
  authorization: authorizationHeaderRule,
};

export const GetAllProjectsSchema: Schema = {
  authorization: authorizationHeaderRule,
};

export const CreateProjectSchema: Schema = {
  authorization: authorizationHeaderRule,
  title: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'title' es obligatorio",
    },
    isString: {
      errorMessage: "El campo 'title' debe ser texto",
    },
    trim: true,
    notEmpty: {
      errorMessage: "El campo 'title' no puede estar vacío",
    },
    isLength: {
      options: { min: 1, max: 500 },
      errorMessage: "El campo 'title' debe tener entre 1 y 500 caracteres",
    },
  },
  summary: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'summary' debe ser texto",
    },
    trim: true,
    isLength: {
      options: { min: 1, max: 2000 },
      errorMessage: "El campo 'summary' debe tener entre 1 y 2000 caracteres",
    },
  },
  objectives: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'objectives' debe ser texto",
    },
    trim: true,
  },
  modalityId: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'modalityId' es obligatorio",
    },
    ...cuidRule,
  },
  statusId: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'statusId' es obligatorio",
    },
    ...cuidRule,
  },
  programId: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'programId' es obligatorio",
    },
    ...cuidRule,
  },
  companyId: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    custom: {
      options: (value: unknown) => {
        if (value === null || value === undefined) return true;
        if (typeof value !== "string") return false;
        const trimmed = value.trim();
        return trimmed === "" || cuidRegex.test(trimmed);
      },
      errorMessage: "El campo 'companyId' debe ser vacío o un CUID válido",
    },
  },
  startDate: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'startDate' es obligatorio",
    },
    isISO8601: {
      errorMessage: "El campo 'startDate' debe ser una fecha válida (ISO 8601)",
    },
  },
  endDate: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isISO8601: {
      errorMessage: "El campo 'endDate' debe ser una fecha válida (ISO 8601)",
    },
  },
  students: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'students' es obligatorio",
    },
    isArray: {
      options: { min: 1, max: 2 },
      errorMessage: "El campo 'students' debe ser un arreglo con 1 o 2 elementos",
    },
  },
  "students.*": {
    in: ["body"],
    custom: {
      options: (value: unknown) => typeof value === "string" && cuidRegex.test(value.trim()),
      errorMessage: "Cada estudiante debe ser un CUID válido",
    },
  },
  advisors: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isArray: {
      options: { min: 0, max: 1 },
      errorMessage: "El campo 'advisors' debe ser un arreglo con máximo 1 elemento",
    },
  },
  "advisors.*": {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    custom: {
      options: (value: unknown) => typeof value === "string" && cuidRegex.test(value.trim()),
      errorMessage: "Cada asesor debe ser un CUID válido",
    },
  },
};

export const BulkUploadProjectsSchema: Schema = {
  authorization: authorizationHeaderRule,
};

export const DownloadBulkTemplateSchema: Schema = {
  authorization: authorizationHeaderRule,
};

export const GetProjectByIdSchema: Schema = {
  authorization: authorizationHeaderRule,
  id: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'id' es obligatorio",
    },
    ...cuidRule,
  },
};

export const UpdateProjectSchema: Schema = {
  authorization: authorizationHeaderRule,
  id: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'id' es obligatorio",
    },
    ...cuidRule,
  },
  title: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'title' debe ser texto",
    },
    trim: true,
    notEmpty: {
      errorMessage: "El campo 'title' no puede estar vacío",
    },
    isLength: {
      options: { min: 1, max: 500 },
      errorMessage: "El campo 'title' debe tener entre 1 y 500 caracteres",
    },
  },
  summary: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'summary' debe ser texto",
    },
    trim: true,
    isLength: {
      options: { min: 1, max: 2000 },
      errorMessage: "El campo 'summary' debe tener entre 1 y 2000 caracteres",
    },
  },
  objectives: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'objectives' debe ser texto",
    },
    trim: true,
  },
  modalityId: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    ...cuidRule,
  },
  statusId: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    ...cuidRule,
  },
  programId: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    ...cuidRule,
  },
  companyId: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    custom: {
      options: (value: unknown) => {
        if (value === null || value === undefined) return true;
        if (typeof value !== "string") return false;
        const trimmed = value.trim();
        return trimmed === "" || cuidRegex.test(trimmed);
      },
      errorMessage: "El campo 'companyId' debe ser vacío o un CUID válido",
    },
  },
  startDate: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isISO8601: {
      errorMessage: "El campo 'startDate' debe ser una fecha válida (ISO 8601)",
    },
  },
  endDate: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    custom: {
      options: (value: unknown) => {
        if (value === null || value === undefined) return true;
        if (typeof value !== "string") return false;
        const trimmed = value.trim();
        return trimmed === "" || !Number.isNaN(new Date(trimmed).getTime());
      },
      errorMessage: "El campo 'endDate' debe ser vacío o una fecha válida",
    },
  },
  students: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isArray: {
      options: { min: 1, max: 2 },
      errorMessage: "El campo 'students' debe ser un arreglo con 1 o 2 elementos",
    },
  },
  "students.*": {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    custom: {
      options: (value: unknown) => typeof value === "string" && cuidRegex.test(value.trim()),
      errorMessage: "Cada estudiante debe ser un CUID válido",
    },
  },
  advisors: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isArray: {
      options: { min: 0, max: 2 },
      errorMessage: "El campo 'advisors' debe ser un arreglo con máximo 2 elementos",
    },
  },
  "advisors.*": {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    custom: {
      options: (value: unknown) => typeof value === "string" && cuidRegex.test(value.trim()),
      errorMessage: "Cada asesor debe ser un CUID válido",
    },
  },
};

export const DeleteProjectSchema: Schema = {
  authorization: authorizationHeaderRule,
  id: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'id' es obligatorio",
    },
    ...cuidRule,
  },
};
