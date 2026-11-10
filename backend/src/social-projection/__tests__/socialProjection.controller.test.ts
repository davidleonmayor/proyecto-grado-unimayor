import { createRequest, createResponse } from "node-mocks-http";
import { ProyeccionSocialController } from "../socialProjection.controller";

// Mock the ProyeccionSocialService
const mockService = {
  searchByName: jest.fn(),
};

jest.mock("../socialProjection.service", () => ({
  ProyeccionSocialService: jest.fn().mockImplementation(() => mockService),
}));

describe("ProyeccionSocialController", () => {
  let controller: ProyeccionSocialController;

  beforeAll(() => {
    controller = new ProyeccionSocialController();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchByName", () => {
    it("should return a list of projects matching the name", async () => {
      const req = createRequest({
        method: "GET",
        url: "/api/social-projection/search",
        query: { nombre: "Test" },
      });
      const res = createResponse();

      mockService.searchByName.mockResolvedValue([
        {
          id_proyecto_social: "soc-1",
          nombre: "Proyecto Test",
          descripcion: "Desc",
          fecha_registro: new Date(),
          id_persona_registra: "prof-123",
        },
      ]);

      await controller.searchByName(req as any, res as any);

      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data).toHaveProperty("total", 1);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].nombre).toBe("Proyecto Test");
    });

    it("should return 400 if nombre query is missing", async () => {
      const req = createRequest({
        method: "GET",
        url: "/api/social-projection/search",
        query: {},
      });
      const res = createResponse();

      await controller.searchByName(req as any, res as any);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty(
        "error",
        "El parámetro de consulta 'nombre' es obligatorio",
      );
    });
  });
});
