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

const cuidRule = {
  isString: {
    errorMessage: "Debe ser texto",
  },
  trim: true,
  matches: {
    options: /^c[a-z0-9]{24}$/,
    errorMessage: "Debe ser un CUID válido",
  },
};

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export const GetEventsSchema: Schema = {
  authorization: authorizationHeaderRule,
  page: {
    in: ["query"],
    optional: {
      options: { nullable: true },
    },
    isInt: {
      options: { min: 1 },
      errorMessage: "El parámetro 'page' debe ser un entero mayor o igual a 1",
    },
    toInt: true,
  },
  limit: {
    in: ["query"],
    optional: {
      options: { nullable: true },
    },
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: "El parámetro 'limit' debe ser un entero entre 1 y 100",
    },
    toInt: true,
  },
};

export const CreateEventSchema: Schema = {
  authorization: authorizationHeaderRule,
  titulo: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'titulo' es obligatorio",
    },
    isString: {
      errorMessage: "El campo 'titulo' debe ser texto",
    },
    trim: true,
    notEmpty: {
      errorMessage: "El campo 'titulo' no puede estar vacío",
    },
    isLength: {
      options: { min: 1, max: 200 },
      errorMessage: "El campo 'titulo' debe tener entre 1 y 200 caracteres",
    },
  },
  descripcion: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'descripcion' debe ser texto",
    },
    trim: true,
    isLength: {
      options: { min: 1, max: 4000 },
      errorMessage: "El campo 'descripcion' debe tener entre 1 y 4000 caracteres",
    },
  },
  fecha_inicio: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'fecha_inicio' es obligatorio",
    },
    isISO8601: {
      errorMessage: "El campo 'fecha_inicio' debe ser una fecha válida (ISO 8601)",
    },
  },
  fecha_fin: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'fecha_fin' es obligatorio",
    },
    isISO8601: {
      errorMessage: "El campo 'fecha_fin' debe ser una fecha válida (ISO 8601)",
    },
    custom: {
      options: (value: unknown, { req }) => {
        if (typeof value !== "string" || typeof req.body?.fecha_inicio !== "string") {
          return false;
        }
        return new Date(value).getTime() >= new Date(req.body.fecha_inicio).getTime();
      },
      errorMessage: "El campo 'fecha_fin' debe ser mayor o igual a 'fecha_inicio'",
    },
  },
  hora_inicio: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'hora_inicio' debe ser texto",
    },
    matches: {
      options: timeRegex,
      errorMessage: "El campo 'hora_inicio' debe tener formato HH:mm o HH:mm:ss",
    },
  },
  hora_fin: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'hora_fin' debe ser texto",
    },
    matches: {
      options: timeRegex,
      errorMessage: "El campo 'hora_fin' debe tener formato HH:mm o HH:mm:ss",
    },
  },
  prioridad: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'prioridad' es obligatorio",
    },
    isString: {
      errorMessage: "El campo 'prioridad' debe ser texto",
    },
    trim: true,
    toLowerCase: true,
    isIn: {
      options: [["alta", "media", "baja"]],
      errorMessage: "El campo 'prioridad' debe ser: alta, media o baja",
    },
  },
  todo_el_dia: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isBoolean: {
      errorMessage: "El campo 'todo_el_dia' debe ser booleano",
    },
    toBoolean: true,
  },
  id_trabajo_grado: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    custom: {
      options: (value: unknown) => {
        if (value === null || value === undefined) return true;
        if (typeof value !== "string") return false;
        const trimmed = value.trim();
        return trimmed === "" || /^c[a-z0-9]{24}$/.test(trimmed);
      },
      errorMessage:
        "El campo 'id_trabajo_grado' debe ser vacío o un CUID válido",
    },
  },
};

export const UpdateEventSchema: Schema = {
  authorization: authorizationHeaderRule,
  id: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'id' es obligatorio",
    },
    ...cuidRule,
  },
  titulo: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'titulo' debe ser texto",
    },
    trim: true,
    notEmpty: {
      errorMessage: "El campo 'titulo' no puede estar vacío",
    },
    isLength: {
      options: { min: 1, max: 200 },
      errorMessage: "El campo 'titulo' debe tener entre 1 y 200 caracteres",
    },
  },
  descripcion: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'descripcion' debe ser texto",
    },
    trim: true,
    isLength: {
      options: { min: 1, max: 4000 },
      errorMessage: "El campo 'descripcion' debe tener entre 1 y 4000 caracteres",
    },
  },
  fecha_inicio: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isISO8601: {
      errorMessage: "El campo 'fecha_inicio' debe ser una fecha válida (ISO 8601)",
    },
  },
  fecha_fin: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isISO8601: {
      errorMessage: "El campo 'fecha_fin' debe ser una fecha válida (ISO 8601)",
    },
    custom: {
      options: (value: unknown, { req }) => {
        if (value === null || value === undefined) return true;
        if (typeof value !== "string") return false;

        const startValue = req.body?.fecha_inicio;
        if (startValue && typeof startValue === "string") {
          return new Date(value).getTime() >= new Date(startValue).getTime();
        }
        return true;
      },
      errorMessage: "El campo 'fecha_fin' debe ser mayor o igual a 'fecha_inicio'",
    },
  },
  hora_inicio: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'hora_inicio' debe ser texto",
    },
    matches: {
      options: timeRegex,
      errorMessage: "El campo 'hora_inicio' debe tener formato HH:mm o HH:mm:ss",
    },
  },
  hora_fin: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'hora_fin' debe ser texto",
    },
    matches: {
      options: timeRegex,
      errorMessage: "El campo 'hora_fin' debe tener formato HH:mm o HH:mm:ss",
    },
  },
  prioridad: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'prioridad' debe ser texto",
    },
    trim: true,
    toLowerCase: true,
    isIn: {
      options: [["alta", "media", "baja"]],
      errorMessage: "El campo 'prioridad' debe ser: alta, media o baja",
    },
  },
  todo_el_dia: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isBoolean: {
      errorMessage: "El campo 'todo_el_dia' debe ser booleano",
    },
    toBoolean: true,
  },
  id_trabajo_grado: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    custom: {
      options: (value: unknown) => {
        if (value === null || value === undefined) return true;
        if (typeof value !== "string") return false;
        const trimmed = value.trim();
        return trimmed === "" || /^c[a-z0-9]{24}$/.test(trimmed);
      },
      errorMessage:
        "El campo 'id_trabajo_grado' debe ser vacío o un CUID válido",
    },
  },
};

export const DeleteEventSchema: Schema = {
  authorization: authorizationHeaderRule,
  id: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'id' es obligatorio",
    },
    ...cuidRule,
  },
};
