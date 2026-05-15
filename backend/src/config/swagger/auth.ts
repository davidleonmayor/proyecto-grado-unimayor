import {
  RegisterSchema,
  UserConfirmationSchema,
  UserLoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
  CheckAuthUserPasswordSchema,
} from "../../auth/auth.schema";
import { buildComponentSchemas } from "./from-validator";

/**
 * Schemas de request auto-generados desde los Schemas de express-validator
 * de auth. Para cambiar la forma del body, modificá `auth.schema.ts`.
 */
const requestSchemas = buildComponentSchemas({
  RegisterRequest: RegisterSchema,
  TokenBody: UserConfirmationSchema,
  LoginRequest: UserLoginSchema,
  EmailBody: ForgotPasswordSchema,
  ResetPasswordBody: ResetPasswordSchema,
  UpdatePasswordBody: UpdatePasswordSchema,
  CheckPasswordBody: CheckAuthUserPasswordSchema,
});

const responseSchemas = {
  User: {
    type: "object",
    properties: {
      id_persona: { type: "string", example: "ckxyz..." },
      nombres: { type: "string", example: "Juan" },
      apellidos: { type: "string", example: "Pérez" },
      correo_electronico: { type: "string", format: "email" },
      num_doc_identidad: { type: "string" },
      numero_celular: { type: "string" },
      confirmed: { type: "boolean" },
    },
  },
  LoginResponse: {
    type: "object",
    properties: {
      token: { type: "string", description: "JWT firmado", example: "eyJhbGciOi..." },
      user: { $ref: "#/components/schemas/User" },
    },
  },
};

export const authSwagger = {
  tags: [
    {
      name: "Auth",
      description:
        "Registro, login, confirmación de cuenta y manejo de contraseñas.",
    },
  ],
  schemas: {
    ...responseSchemas,
    ...requestSchemas,
  },
};
