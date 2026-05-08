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

const paginationPageRule: ParamSchema = {
  in: ["query"],
  optional: {
    options: { nullable: true },
  },
  isInt: {
    options: { min: 1 },
    errorMessage: "El parámetro 'page' debe ser un entero mayor o igual a 1",
  },
  toInt: true,
};

const paginationLimitRule: ParamSchema = {
  in: ["query"],
  optional: {
    options: { nullable: true },
  },
  isInt: {
    options: { min: 1, max: 100 },
    errorMessage: "El parámetro 'limit' debe ser un entero entre 1 y 100",
  },
  toInt: true,
};

const searchRule: ParamSchema = {
  in: ["query"],
  optional: {
    options: { nullable: true },
  },
  isString: {
    errorMessage: "El parámetro 'search' debe ser texto",
  },
  trim: true,
  isLength: {
    options: { min: 0, max: 150 },
    errorMessage: "El parámetro 'search' debe tener máximo 150 caracteres",
  },
};

export const GetTeachersSchema: Schema = {
  authorization: authorizationHeaderRule,
  page: paginationPageRule,
  limit: paginationLimitRule,
  search: searchRule,
  role: {
    in: ["query"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El parámetro 'role' debe ser texto",
    },
    trim: true,
    isIn: {
      options: [["all", "Director", "Asesor", "Asesor Externo", "Profesor"]],
      errorMessage:
        "El parámetro 'role' debe ser: all, Director, Asesor, Asesor Externo o Profesor",
    },
  },
  faculty: {
    in: ["query"],
    optional: {
      options: { nullable: true },
    },
    custom: {
      options: (value: unknown) =>
        typeof value === "string" &&
        (value === "all" || /^c[a-z0-9]{24}$/.test(value.trim())),
      errorMessage:
        "El parámetro 'faculty' debe ser 'all' o un id de facultad válido",
    },
  },
};

export const GetStudentsSchema: Schema = {
  authorization: authorizationHeaderRule,
  page: paginationPageRule,
  limit: paginationLimitRule,
  search: searchRule,
  program: {
    in: ["query"],
    optional: {
      options: { nullable: true },
    },
    custom: {
      options: (value: unknown) =>
        typeof value === "string" &&
        (value === "all" || /^c[a-z0-9]{24}$/.test(value.trim())),
      errorMessage:
        "El parámetro 'program' debe ser 'all' o un id de programa válido",
    },
  },
  faculty: {
    in: ["query"],
    optional: {
      options: { nullable: true },
    },
    custom: {
      options: (value: unknown) =>
        typeof value === "string" &&
        (value === "all" || /^c[a-z0-9]{24}$/.test(value.trim())),
      errorMessage:
        "El parámetro 'faculty' debe ser 'all' o un id de facultad válido",
    },
  },
};

export const GetPersonByIdSchema: Schema = {
  authorization: authorizationHeaderRule,
  id: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'id' es obligatorio",
    },
    ...cuidRule,
  },
};
