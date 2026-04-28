import { createRequest, createResponse } from "node-mocks-http";
import { EventController } from "../event.controller";
import { PrismaClient } from "@prisma/client";

// 1. MOCK DE PRISMA CLIENT
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    actores: {
      findMany: jest.fn(),
    },
    tipo_rol: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    persona: {
      findUnique: jest.fn(),
    },
    evento: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prismaMock = new PrismaClient() as jest.Mocked<any>;

describe("EventController", () => {
  let controller: EventController;

  beforeAll(() => {
    controller = new EventController();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getEvents", () => {
    it("debería retornar 401 si no hay usuario autenticado", async () => {
      // Arrange
      const req = createRequest({
        method: "GET",
        url: "/api/events",
        query: { page: "1", limit: "10" },
      });
      const res = createResponse();

      // Act
      await controller.getEvents(req, res);

      // Assert
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData().message).toBe("Usuario no autenticado");
      expect(prismaMock.evento.findMany).not.toHaveBeenCalled();
    });

    it("debería retornar eventos para un Estudiante (200)", async () => {
      // Arrange: Usuario estudiante
      const req = createRequest({
        method: "GET",
        url: "/api/events",
        user: { id_persona: "student-123" },
        query: { page: "1", limit: "10" },
      });
      const res = createResponse();

      // Mock de roles y actores
      prismaMock.tipo_rol.findFirst
        .mockResolvedValueOnce({
          id_rol: "rol-estudiante",
          nombre_rol: "Estudiante",
        })
        .mockResolvedValueOnce(null); // Coordinador nulo

      prismaMock.tipo_rol.findMany.mockResolvedValue([]); // Profesores vacio

      prismaMock.actores.findMany.mockResolvedValue([
        { id_tipo_rol: "rol-estudiante", id_trabajo_grado: "proj-1" },
      ]);

      // Mock de eventos
      const mockEventDate = new Date();
      mockEventDate.setDate(mockEventDate.getDate() + 5); // Evento en 5 dias (Futuro)

      prismaMock.evento.count.mockResolvedValue(1);
      prismaMock.evento.findMany.mockResolvedValue([
        {
          id_evento: "event-1",
          titulo: "Revisión 1",
          prioridad: "alta",
          fecha_inicio: mockEventDate,
          fecha_fin: mockEventDate,
        },
      ]);

      // Act
      await controller.getEvents(req, res);

      // Assert
      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data.pagination.total).toBe(1);
      expect(data.events).toHaveLength(1);
      expect(data.events[0].id).toBe("event-1");
      expect(data.events[0].color).toBeDefined(); // Verifica que el algoritmo de colores corrió

      // Verifica que el filtro de prisma se aplicó para su proyecto
      expect(prismaMock.evento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_trabajo_grado: { in: ["proj-1"] },
          }),
        }),
      );
    });

    it("debería retornar eventos vacíos si el usuario tiene un rol desconocido (200)", async () => {
      // Arrange
      const req = createRequest({
        method: "GET",
        url: "/api/events",
        user: { id_persona: "unknown-123" },
      });
      const res = createResponse();

      prismaMock.actores.findMany.mockResolvedValue([]); // Sin roles activos
      prismaMock.tipo_rol.findFirst.mockResolvedValue(null);
      prismaMock.tipo_rol.findMany.mockResolvedValue([]);

      prismaMock.evento.count.mockResolvedValue(0);
      prismaMock.evento.findMany.mockResolvedValue([]);

      // Act
      await controller.getEvents(req, res);

      // Assert
      const data = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(data.events).toHaveLength(0);

      // Verifica la query imposible que pusiste en el controlador para casos nulos
      expect(prismaMock.evento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              { id_trabajo_grado: { not: null } },
              { id_trabajo_grado: null },
            ],
          }),
        }),
      );
    });

    it("debería manejar errores de Prisma con status 500", async () => {
      const req = createRequest({
        method: "GET",
        url: "/api/events",
        user: { id_persona: "user-123" },
      });
      const res = createResponse();

      prismaMock.actores.findMany.mockRejectedValue(new Error("Prisma Error"));

      await controller.getEvents(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData().message).toBe("Error al obtener eventos");
    });
  });

  describe("createEvent", () => {
    const validEventData = {
      titulo: "Sustentación Final",
      fecha_inicio: "2026-06-01T10:00:00Z",
      fecha_fin: "2026-06-01T12:00:00Z",
      prioridad: "Alta",
    };

    it("debería crear un evento correctamente (201)", async () => {
      const req = createRequest({
        method: "POST",
        url: "/api/events",
        body: validEventData,
      });
      const res = createResponse();

      const mockCreatedEvent = {
        id_evento: "new-ev-1",
        ...validEventData,
        prioridad: "alta",
      };
      prismaMock.evento.create.mockResolvedValue(mockCreatedEvent);

      await controller.createEvent(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toMatchObject({ id_evento: "new-ev-1" });

      expect(prismaMock.evento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            titulo: "Sustentación Final",
            prioridad: "alta", // Verifica que lo pase a minúscula
          }),
        }),
      );
    });

    it("debería fallar si faltan campos requeridos (400)", async () => {
      const req = createRequest({
        method: "POST",
        url: "/api/events",
        body: { titulo: "Solo Titulo" }, // Faltan fechas y prioridad
      });
      const res = createResponse();

      await controller.createEvent(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().message).toBe("Faltan campos requeridos");
      expect(prismaMock.evento.create).not.toHaveBeenCalled();
    });
  });

  describe("updateEvent", () => {
    it("debería actualizar un evento existente (200)", async () => {
      const req = createRequest({
        method: "PUT",
        url: "/api/events/ev-1",
        params: { id: "ev-1" },
        body: { prioridad: "Baja" },
      });
      const res = createResponse();

      prismaMock.evento.update.mockResolvedValue({
        id_evento: "ev-1",
        prioridad: "baja",
      });

      await controller.updateEvent(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().prioridad).toBe("baja");
      expect(prismaMock.evento.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_evento: "ev-1" },
          data: expect.objectContaining({ prioridad: "baja" }),
        }),
      );
    });
  });

  describe("deleteEvent", () => {
    it("debería realizar un soft delete (activo: false) (200)", async () => {
      const req = createRequest({
        method: "DELETE",
        url: "/api/events/ev-1",
        params: { id: "ev-1" },
      });
      const res = createResponse();

      prismaMock.evento.update.mockResolvedValue({});

      await controller.deleteEvent(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().message).toBe("Evento eliminado correctamente");
      expect(prismaMock.evento.update).toHaveBeenCalledWith({
        where: { id_evento: "ev-1" },
        data: { activo: false },
      });
    });

    it("debería manejar errores de DB al eliminar (500)", async () => {
      const req = createRequest({
        method: "DELETE",
        url: "/api/events/ev-1",
        params: { id: "ev-1" },
      });
      const res = createResponse();

      prismaMock.evento.update.mockRejectedValue(new Error("No existe"));

      await controller.deleteEvent(req, res);

      expect(res.statusCode).toBe(500);
    });
  });
});
