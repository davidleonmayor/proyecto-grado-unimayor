import { createRequest, createResponse } from "node-mocks-http";
import { MessagingController } from "../messaging.controller";
import { PrismaClient } from "@prisma/client";

// 1. Mockeamos PrismaClient directamente, tal como hacías con tus modelos
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    mensaje: {
      create: jest.fn(),
    },
    mensaje_entrega: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    persona: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    actores: {
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prismaMock = new PrismaClient() as jest.Mocked<any>;

describe("MessagingController", () => {
  let controller: MessagingController;

  beforeAll(() => {
    controller = new MessagingController();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendMessage", () => {
    it("debería enviar un mensaje directo y retornar 201", async () => {
      // Arrange
      const req = createRequest({
        method: "POST",
        url: "/api/messaging/send",
        user: { id_persona: "user-123", id_facultad: "fac-1" },
        body: { content: "Hola", targetUserId: "teacher-456" },
      });
      const res = createResponse();

      const newMsgMock = {
        id_mensaje: "msg-1",
        contenido: "Hola",
        id_emisor: "user-123",
      };
      prismaMock.mensaje.create.mockResolvedValue(newMsgMock);

      const targetUserMock = { id_persona: "teacher-456" };
      prismaMock.persona.findUnique.mockResolvedValue(targetUserMock);

      prismaMock.mensaje_entrega.create.mockResolvedValue({});

      // Act
      await controller.sendMessage(req, res);

      // Assert
      const data = res._getJSONData();
      expect(res.statusCode).toBe(201);
      expect(data.message).toBe("Mensaje enviado exitosamente");
      expect(prismaMock.mensaje.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.persona.findUnique).toHaveBeenCalledWith({
        where: { id_persona: "teacher-456" },
      });
      // Se crean 2 entregas: una para el receptor y otra para el emisor
      expect(prismaMock.mensaje_entrega.create).toHaveBeenCalledTimes(2);
    });

    it("debería retornar 400 si falta el contenido del mensaje", async () => {
      const req = createRequest({
        method: "POST",
        url: "/api/messaging/send",
        user: { id_persona: "user-123" },
        body: { targetUserId: "teacher-456" }, // Sin content
      });
      const res = createResponse();

      await controller.sendMessage(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).toBe(400);
      expect(data.error).toBe("El contenido del mensaje es requerido");
      expect(prismaMock.mensaje.create).not.toHaveBeenCalled();
    });

    it("debería retornar 404 si el usuario destino no existe", async () => {
      const req = createRequest({
        method: "POST",
        url: "/api/messaging/send",
        user: { id_persona: "user-123" },
        body: { content: "Hola", targetUserId: "ghost-999" },
      });
      const res = createResponse();

      prismaMock.mensaje.create.mockResolvedValue({ id_mensaje: "msg-1" });
      prismaMock.persona.findUnique.mockResolvedValue(null); // Usuario no encontrado

      await controller.sendMessage(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).toBe(404);
      expect(data.error).toBe("El destinatario no existe.");
    });

    it("debería manejar un error de la base de datos (500)", async () => {
      const req = createRequest({
        method: "POST",
        url: "/api/messaging/send",
        user: { id_persona: "user-123" },
        body: { content: "Hola" },
      });
      const res = createResponse();

      prismaMock.mensaje.create.mockRejectedValue(new Error("DB Fallida"));

      await controller.sendMessage(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).toBe(500);
      expect(data.error).toBe("Error del servidor al enviar mensaje");
    });
  });

  describe("getUnreadCount", () => {
    it("debería retornar el número de mensajes no leídos (200)", async () => {
      const req = createRequest({
        method: "GET",
        url: "/api/messaging/unread-count",
        user: { id_persona: "user-123" },
      });
      const res = createResponse();

      prismaMock.mensaje_entrega.count.mockResolvedValue(5);

      await controller.getUnreadCount(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data.unreadCount).toBe(5);
      expect(prismaMock.mensaje_entrega.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id_receptor: "user-123",
          estado: "PENDING",
        }),
      });
    });

    it("debería retornar 401 si no hay usuario", async () => {
      const req = createRequest({
        method: "GET",
        url: "/api/messaging/unread-count",
        // Sin req.user
      });
      const res = createResponse();

      await controller.getUnreadCount(req, res);

      expect(res.statusCode).toBe(401);
      expect(res._getJSONData().error).toBe("No autorizado");
    });
  });
});
