import { body } from "express-validator";
import { validate } from "../middlewares/validate.middleware.js";

export const emailValidationRules = [
    body("fecha")
        .optional()
        .isString()
        .withMessage("La fecha debe ser un texto válido"),

    body("ciudad")
        .notEmpty()
        .withMessage("La ciudad es obligatoria")
        .isString()
        .withMessage("La ciudad debe ser texto"),

    body("programa")
        .optional()
        .isString()
        .withMessage("El programa debe ser texto"),

    body("estudiantes")
        .isArray({ min: 1 })
        .withMessage("Debe enviar al menos un estudiante"),
    body("estudiantes.*.nombre")
        .notEmpty()
        .withMessage("El nombre del estudiante es obligatorio")
        .isString()
        .withMessage("El nombre del estudiante debe ser texto"),

    body("estado")
        .isIn(["Aprobado", "No aprobado"])
        .withMessage('El estado debe ser "Aprobado" o "No aprobado"'),

    body("comentarios")
        .isString()
        .withMessage("Los comentarios deben ser texto"),

    body("firmante")
        .notEmpty()
        .withMessage("El firmante es obligatorio")
        .isString()
        .withMessage("El firmante debe ser texto"),

    body("destinatario")
        .isEmail()
        .withMessage("El destinatario debe ser un correo válido"),
    validate
];
