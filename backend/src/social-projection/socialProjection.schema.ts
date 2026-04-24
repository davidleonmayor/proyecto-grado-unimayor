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

const socialProjectionNameRegex = /^[\p{L}\p{N} _.-]+$/u;

const socialProjectionNameRule = {
  exists: {
    errorMessage: "El parámetro 'nombre' es obligatorio",
  },
  isString: {
    errorMessage: "El parámetro 'nombre' debe ser texto",
  },
  trim: true,
  notEmpty: {
    errorMessage: "El parámetro 'nombre' no puede estar vacío",
  },
  isLength: {
    options: { min: 1, max: 200 },
    errorMessage: "El parámetro 'nombre' debe tener entre 1 y 200 caracteres",
  },
  matches: {
    options: socialProjectionNameRegex,
    errorMessage:
      "El parámetro 'nombre' solo puede contener letras, números, espacios, guiones y puntos",
  },
};

export const SearchSocialProjectionSchema: Schema = {
  authorization: authorizationHeaderRule,
  nombre: {
    in: ["query"],
    ...socialProjectionNameRule,
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

export const CreateSocialProjectionSchema: Schema = {
  authorization: {
    ...authorizationHeaderRule,
    optional: {
      options: { nullable: true },
    },
  },
  nombre: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'nombre' es obligatorio",
    },
    isString: {
      errorMessage: "El campo 'nombre' debe ser texto",
    },
    trim: true,
    notEmpty: {
      errorMessage: "El campo 'nombre' no puede estar vacío",
    },
    isLength: {
      options: { min: 1, max: 200 },
      errorMessage: "El campo 'nombre' debe tener entre 1 y 200 caracteres",
    },
    matches: {
      options: socialProjectionNameRegex,
      errorMessage:
        "El campo 'nombre' solo puede contener letras, números, espacios, guiones y puntos",
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
    isLength: {
      options: { min: 1, max: 2000 },
      errorMessage:
        "El campo 'descripcion' debe tener entre 1 y 2000 caracteres",
    },
    trim: true,
  },
};

export const DownloadByNameSocialProjectionSchema: Schema = {
  authorization: authorizationHeaderRule,
  nombre: {
    in: ["params"],
    ...socialProjectionNameRule,
  },
};

export const DownloadByIdSocialProjectionSchema: Schema = {
  authorization: authorizationHeaderRule,
  id: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'id' es obligatorio",
    },
    isString: {
      errorMessage: "El parámetro 'id' debe ser texto",
    },
    matches: {
      options: /^c[a-z0-9]{24}$/,
      errorMessage: "El parámetro 'id' debe ser un CUID válido",
    },
    trim: true,
  },
};
