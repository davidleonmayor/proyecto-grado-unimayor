import type { Schema, ParamSchema } from "express-validator";

const AuthorizationHeaderRule: ParamSchema = {
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

// Schema for routes that only need auth validation (no body params)
export const AuthOnlySchema: Schema = {
  authorization: AuthorizationHeaderRule,
};

export const SendMessageSchema: Schema = {
  authorization: AuthorizationHeaderRule,
  content: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'content' es obligatorio",
    },
    isString: {
      errorMessage: "El campo 'content' debe ser texto",
    },
    isLength: {
      options: { min: 1, max: 2000 },
      errorMessage: "El campo 'content' debe tener entre 1 y 2000 caracteres",
    },
    trim: true,
  },
  targetUserId: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "El campo 'targetUserId' debe ser texto",
    },
    isLength: {
      options: { max: 100 },
      errorMessage: "El campo 'targetUserId' no puede exceder 100 caracteres",
    },
    trim: true,
  },
  targetRole: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "El campo 'targetRole' debe ser texto",
    },
    isLength: {
      options: { max: 50 },
      errorMessage: "El campo 'targetRole' no puede exceder 50 caracteres",
    },
    trim: true,
  },
};

export const UserIdParamSchema: Schema = {
  authorization: AuthorizationHeaderRule,
  userId: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'userId' es obligatorio",
    },
    isString: {
      errorMessage: "El parámetro 'userId' debe ser texto",
    },
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: "El parámetro 'userId' debe tener entre 1 y 100 caracteres",
    },
    trim: true,
  },
};

export const ConsumeWebhookSchema: Schema = {
  "x-webhook-secret": {
    in: ["headers"],
    exists: {
      errorMessage: "El header 'x-webhook-secret' es obligatorio",
    },
    isString: {
      errorMessage: "El header 'x-webhook-secret' debe ser texto",
    },
    isLength: {
      options: { min: 1, max: 200 },
      errorMessage:
        "El header 'x-webhook-secret' no debe exceder 200 caracteres",
    },
    trim: true,
    // custom: {
    //   options: (value: string) => {
    //     // Allow either the env secret or internal_secret for testing
    //     if (
    //       value === process.env.WEBHOOK_SECRET ||
    //       value === "internal_secret"
    //     ) {
    //       return true;
    //     }
    //     throw new Error("Invalid Webhook Signature");
    //   },
    // },
  },
  event: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'event' es obligatorio",
    },
    isString: {
      errorMessage: "El campo 'event' debe ser texto",
    },
    matches: {
      options: /^MESSAGE_CREATED$/,
      errorMessage: "El evento debe ser exactamente 'MESSAGE_CREATED'",
    },
    trim: true,
  },
  data: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'data' es obligatorio",
    },
    isObject: {
      errorMessage: "El campo 'data' debe ser un objeto válido",
    },
  },
  "data.messageId": {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'data.messageId' es obligatorio",
    },
    isString: {
      errorMessage: "El campo 'data.messageId' debe ser texto",
    },
    trim: true,
  },
  "data.senderFacultyId": {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "El campo 'data.senderFacultyId' debe ser texto",
    },
    trim: true,
  },
};
