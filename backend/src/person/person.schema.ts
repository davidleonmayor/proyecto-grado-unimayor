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

export const CreateTeacherSchema: Schema = {
  authorization: authorizationHeaderRule,
  username: {
    in: ["body"],
    exists: { errorMessage: "El nombre de usuario es obligatorio" },
    isString: { errorMessage: "El nombre de usuario debe ser texto" },
    isLength: { options: { min: 3, max: 20 }, errorMessage: "El nombre de usuario debe tener entre 3 y 20 caracteres" },
    trim: true,
  },
  email: {
    in: ["body"],
    exists: { errorMessage: "El correo electrónico es obligatorio" },
    isEmail: { errorMessage: "Correo electrónico inválido" },
    trim: true,
    toLowerCase: true,
  },
  document: {
    in: ["body"],
    exists: { errorMessage: "El documento es obligatorio" },
    isString: { errorMessage: "El documento debe ser texto" },
    isLength: { options: { min: 5, max: 20 }, errorMessage: "El documento debe tener entre 5 y 20 caracteres" },
    trim: true,
  },
  password: {
    in: ["body"],
    exists: { errorMessage: "La contraseña es obligatoria" },
    isString: { errorMessage: "La contraseña debe ser texto" },
    isLength: { options: { min: 8, max: 60 }, errorMessage: "La contraseña debe tener entre 8 y 60 caracteres" },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      errorMessage: "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial",
    },
  },
  firstName: {
    in: ["body"],
    exists: { errorMessage: "El nombre es obligatorio" },
    isString: { errorMessage: "El nombre debe ser texto" },
    trim: true,
  },
  lastName: {
    in: ["body"],
    exists: { errorMessage: "El apellido es obligatorio" },
    isString: { errorMessage: "El apellido debe ser texto" },
    trim: true,
  },
};

export const CreateStudentSchema: Schema = {
  ...CreateTeacherSchema,
  programId: {
    in: ["body"],
    exists: { errorMessage: "El programa académico es obligatorio" },
    ...cuidRule,
  },
  codigoInstitucional: {
    in: ["body"],
    exists: { errorMessage: "El código institucional es obligatorio" },
    isString: { errorMessage: "El código institucional debe ser texto" },
    trim: true,
  },
};

export const UpdatePersonSchema: Schema = {
  authorization: authorizationHeaderRule,
  id: {
    in: ["params"],
    ...cuidRule,
  },
  email: {
    in: ["body"],
    optional: true,
    isEmail: { errorMessage: "Correo electrónico inválido" },
    trim: true,
    toLowerCase: true,
  },
  password: {
    in: ["body"],
    optional: true,
    custom: {
      options: (value) => {
        if (!value) return true;
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      },
      errorMessage: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial",
    },
  },
};
