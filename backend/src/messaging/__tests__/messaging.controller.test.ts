import { createRequest, createResponse } from "node-mocks-http";
import { MessagingController } from "../messaging.controller";
import { prisma } from "../../config/prisma";

// Mock the prisma client
jest.mock("../../config/prisma", () => ({
  prisma: {
    mensaje: {
      create: jest.fn(),
      findMany: jest.fn(),
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
    webhook_subscription: {
      findMany: jest.fn(),
    },
  },
}));

const prismaMock = prisma as jest.Mocked<any>;

describe("MessagingController", () => {
  let controller: MessagingController;

  beforeAll(() => {
    controller = new MessagingController();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendMessage", () => {
    // Nota: La validación de datos (content requerido) ahora está en el schema
    // La validación de auth ahora está en el middleware
    // El controller solo procesa la lógica de negocio

    it("debería enviar un mensaje directo y retornar 201", async () => {
      // Arrange - El usuario y contenido ya están validados por middleware/schema
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
      (prismaMock.mensaje.create as jest.Mock).mockResolvedValue(newMsgMock);

      const targetUserMock = { id_persona: "teacher-456" };
      (prismaMock.persona.findUnique as jest.Mock).mockResolvedValue(targetUserMock);

      (prismaMock.mensaje_entrega.create as jest.Mock).mockResolvedValue({});

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
      expect(prismaMock.mensaje_entrega.create).toHaveBeenCalledTimes(2);
    });

    it("debería retornar 404 si el usuario destino no existe", async () => {
      // El content ya está validado por schema, el user por middleware
      const req = createRequest({
        method: "POST",
        url: "/api/messaging/send",
        user: { id_persona: "user-123", id_facultad: "fac-1" },
        body: { content: "Hola", targetUserId: "ghost-999" },
      });
      const res = createResponse();

      const newMsgMock = { id_mensaje: "msg-1", contenido: "Hola" };
      (prismaMock.mensaje.create as jest.Mock).mockResolvedValue(newMsgMock);
      (prismaMock.persona.findUnique as jest.Mock).mockResolvedValue(null);

      await controller.sendMessage(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).toBe(404);
      expect(data.error).toBe("El destinatario no existe.");
    });

    it("debería manejar un error de la base de datos (500)", async () => {
      const req = createRequest({
        method: "POST",
        url: "/api/messaging/send",
        user: { id_persona: "user-123", id_facultad: "fac-1" },
        body: { content: "Hola" }, // Sin targetUserId - usa webhook
      });
      const res = createResponse();

      (prismaMock.mensaje.create as jest.Mock).mockRejectedValue(new Error("DB Fallida"));

      await controller.sendMessage(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).toBe(500);
      expect(data.error).toBe("Error del servidor al enviar mensaje");
    });
  });

  describe("getUnreadCount", () => {
    // Nota: La validación de auth ya no está en el controller (está en middleware)
    // Ahora el controller simplemente usa req.user directamente

    it("debería retornar el número de mensajes no leídos (200)", async () => {
      const req = createRequest({
        method: "GET",
        url: "/api/messaging/unread-count",
        user: { id_persona: "user-123" },
      });
      const res = createResponse();

      (prismaMock.mensaje_entrega.count as jest.Mock).mockResolvedValue(5);

      await controller.getUnreadCount(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data.unreadCount).toBe(5);
    });

    // Este test ya no aplica - la validación de usuario está en middleware
    // Si no hay usuario, el request nunca llega al controller
    // it("debería retornar 401 si no hay usuario") - Eliminado porque el middleware lo maneja
  });
});