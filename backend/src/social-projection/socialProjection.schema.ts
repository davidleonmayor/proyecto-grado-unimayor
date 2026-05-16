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

export const CreateManualSocialProjectionSchema: Schema = {
  authorization: authorizationHeaderRule,
  titulo: {
    in: ["body"],
    exists: { errorMessage: "El campo 'titulo' es obligatorio" },
    isString: { errorMessage: "El campo 'titulo' debe ser texto" },
    trim: true,
    notEmpty: { errorMessage: "El campo 'titulo' no puede estar vacío" },
    isLength: { options: { min: 1, max: 200 }, errorMessage: "El campo 'titulo' debe tener entre 1 y 200 caracteres" },
    matches: { options: socialProjectionNameRegex, errorMessage: "El campo 'titulo' solo puede contener letras, números, espacios, guiones y puntos" },
  },
  descripcion: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'descripcion' debe ser texto" },
    isLength: { options: { min: 1, max: 2000 }, errorMessage: "El campo 'descripcion' debe tener entre 1 y 2000 caracteres" },
    trim: true,
  },
  estudiantes: {
    in: ["body"],
    exists: { errorMessage: "El campo 'estudiantes' es obligatorio" },
    isArray: { errorMessage: "El campo 'estudiantes' debe ser un arreglo" },
    custom: {
      options: (value: string[]) => {
        if (value.length < 1) {
          throw new Error("Debe seleccionar al menos 1 estudiante");
        }
        if (new Set(value).size !== value.length) {
          throw new Error("Los IDs de estudiantes no pueden estar duplicados");
        }
        if (!value.every((id) => /^c[a-z0-9]{24}$/.test(id))) {
            throw new Error("Uno o más IDs de estudiantes no son CUIDs válidos");
        }
        return true;
      },
    },
  },
  docentes: {
    in: ["body"],
    exists: { errorMessage: "El campo 'docentes' es obligatorio" },
    isArray: { errorMessage: "El campo 'docentes' debe ser un arreglo" },
    custom: {
      options: (value: string[]) => {
        if (value.length < 1) {
          throw new Error("Debe seleccionar al menos 1 docente");
        }
        if (new Set(value).size !== value.length) {
          throw new Error("Los IDs de docentes no pueden estar duplicados");
        }
        if (!value.every((id) => /^c[a-z0-9]{24}$/.test(id))) {
            throw new Error("Uno o más IDs de docentes no son CUIDs válidos");
        }
        return true;
      },
    },
  },
  personas_impactadas: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isInt: {
      options: { min: 0 },
      errorMessage: "El campo 'personas_impactadas' debe ser un entero no negativo",
    },
    toInt: true,
  },
  estado: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'estado' debe ser texto" },
    trim: true,
  },
  // Campos de la Ficha Técnica — sección "Información General"
  lineas_accion: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isArray: { errorMessage: "El campo 'lineas_accion' debe ser un arreglo de CUIDs" },
    custom: {
      options: (value: unknown) => {
        if (!Array.isArray(value)) return true; // optional
        if (!value.every((id) => typeof id === "string" && /^c[a-z0-9]{24}$/.test(id))) {
          throw new Error("Uno o más IDs de líneas de acción no son CUIDs válidos");
        }
        if (new Set(value).size !== value.length) {
          throw new Error("Los IDs de líneas de acción no pueden estar duplicados");
        }
        return true;
      },
    },
  },
  semestre: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'semestre' debe ser texto" },
    isLength: { options: { max: 50 }, errorMessage: "El campo 'semestre' no puede exceder 50 caracteres" },
    trim: true,
  },
  id_programa: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'id_programa' debe ser texto" },
    matches: {
      options: /^c[a-z0-9]{24}$/,
      errorMessage: "El campo 'id_programa' debe ser un CUID válido",
    },
    trim: true,
  },
  id_asesor: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'id_asesor' debe ser texto" },
    matches: {
      options: /^c[a-z0-9]{24}$/,
      errorMessage: "El campo 'id_asesor' debe ser un CUID válido",
    },
    trim: true,
  },
  resumen: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'resumen' debe ser texto" },
    isLength: { options: { max: 200 }, errorMessage: "El campo 'resumen' no puede exceder 200 caracteres" },
    trim: true,
  },
  identificacion_problematica: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'identificacion_problematica' debe ser texto" },
    isLength: { options: { max: 1000 }, errorMessage: "El campo 'identificacion_problematica' no puede exceder 1000 caracteres" },
    trim: true,
  },
  propuesta_solucion: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'propuesta_solucion' debe ser texto" },
    isLength: { options: { max: 700 }, errorMessage: "El campo 'propuesta_solucion' no puede exceder 700 caracteres" },
    trim: true,
  },
  caracterizacion_poblacion: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'caracterizacion_poblacion' debe ser texto" },
    isLength: { options: { max: 900 }, errorMessage: "El campo 'caracterizacion_poblacion' no puede exceder 900 caracteres" },
    trim: true,
  },
  objetivos: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'objetivos' debe ser texto" },
    isLength: { options: { max: 900 }, errorMessage: "El campo 'objetivos' no puede exceder 900 caracteres" },
    trim: true,
  },
  resultados_esperados: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'resultados_esperados' debe ser texto" },
    isLength: { options: { max: 700 }, errorMessage: "El campo 'resultados_esperados' no puede exceder 700 caracteres" },
    trim: true,
  },
  metodologia: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'metodologia' debe ser texto" },
    isLength: { options: { max: 1000 }, errorMessage: "El campo 'metodologia' no puede exceder 1000 caracteres" },
    trim: true,
  },
  bibliografia: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'bibliografia' debe ser texto" },
    isLength: { options: { max: 600 }, errorMessage: "El campo 'bibliografia' no puede exceder 600 caracteres" },
    trim: true,
  },
  palabras_clave: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: { errorMessage: "El campo 'palabras_clave' debe ser texto" },
    isLength: { options: { max: 100 }, errorMessage: "El campo 'palabras_clave' no puede exceder 100 caracteres" },
    trim: true,
  },
  proponentes: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isArray: { errorMessage: "El campo 'proponentes' debe ser un arreglo de CUIDs" },
    custom: {
      options: (value: unknown) => {
        if (!Array.isArray(value)) return true;
        if (!value.every((id) => typeof id === "string" && /^c[a-z0-9]{24}$/.test(id))) {
          throw new Error("Uno o más IDs de proponentes no son CUIDs válidos");
        }
        if (new Set(value).size !== value.length) {
          throw new Error("Los IDs de proponentes no pueden estar duplicados");
        }
        return true;
      },
    },
  },
};

export const UploadAnexoSchema: Schema = {
  authorization: authorizationHeaderRule,
  id: {
    in: ["params"],
    exists: { errorMessage: "El parámetro 'id' es obligatorio" },
    isString: { errorMessage: "El parámetro 'id' debe ser texto" },
    matches: {
      options: /^c[a-z0-9]{24}$/,
      errorMessage: "El parámetro 'id' debe ser un CUID válido",
    },
    trim: true,
  },
  archivo: {
    in: ["body"],
    custom: {
      options: (_value, { req }) => {
        if (!req.file) {
          throw new Error("El archivo es obligatorio");
        }
        
        const validMimes = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
          "application/vnd.ms-excel", // xls
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
          "application/msword" // doc
        ];

        if (!validMimes.includes(req.file.mimetype)) {
            throw new Error("El archivo debe ser PDF, Excel (xlsx/xls) o Word (docx/doc)");
        }
        
        return true;
      },
    },
  },
};
