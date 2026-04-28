import type { Schema } from "express-validator";

export const SendMessageSchema: Schema = {
  content: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'content' es obligatorio",
    },
    isString: {
      errorMessage: "El campo 'content' debe ser texto",
    },
    trim: true,
    notEmpty: {
      errorMessage: "El campo 'content' no puede estar vacío",
    },
    isLength: {
      options: { max: 2000 },
      errorMessage: "El campo 'content' no puede exceder los 2000 caracteres",
    },
  },
  targetUserId: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'targetUserId' debe ser texto",
    },
    trim: true,
  },
  targetRole: {
    in: ["body"],
    optional: {
      options: { nullable: true },
    },
    isString: {
      errorMessage: "El campo 'targetRole' debe ser texto",
    },
    trim: true,
  },
};

export const UserIdParamSchema: Schema = {
  userId: {
    in: ["params"],
    exists: {
      errorMessage: "El parámetro 'userId' es obligatorio",
    },
    isString: {
      errorMessage: "El parámetro 'userId' debe ser texto",
    },
    trim: true,
    notEmpty: {
      errorMessage: "El parámetro 'userId' no puede estar vacío",
    },
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
  },
  event: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'event' es obligatorio",
    },
    isString: {
      errorMessage: "El campo 'event' debe ser texto",
    },
    equals: {
      options: "MESSAGE_CREATED",
      errorMessage: "El evento debe ser 'MESSAGE_CREATED'",
    },
  },
  data: {
    in: ["body"],
    exists: {
      errorMessage: "El campo 'data' es obligatorio",
    },
    isObject: {
      errorMessage: "El campo 'data' debe ser un objeto",
    },
  },
};
