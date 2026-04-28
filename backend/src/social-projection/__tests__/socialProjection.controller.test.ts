import { createRequest, createResponse } from "node-mocks-http";
import { ProyeccionSocialController } from "../socialProjection.controller";
import { PrismaClient } from "@prisma/client";

// 1. MOCK PRISMA GLOBALLY
jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        actores: {
            findFirst: jest.fn(),
        },
        proyecto_proyeccion_social: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

// Mock logger and config
jest.mock("../../config", () => {
    // Return a mocked object directly instead of instantiating PrismaClient here
    return {
        prisma: {
            actores: {
                findFirst: jest.fn(),
            },
            proyecto_proyeccion_social: {
                create: jest.fn(),
                findFirst: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
            },
        },
        logger: {
            error: jest.fn(),
        }
    };
});

const prismaMock = require("../../config").prisma as jest.Mocked<any>;

describe("ProyeccionSocialController", () => {
    let controller: ProyeccionSocialController;

    beforeAll(() => {
        controller = new ProyeccionSocialController();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("should upload a social projection excel successfully", async () => {
            const req = createRequest({
                method: "POST",
                url: "/api/social-projection",
                user: { id_persona: "prof-123" },
                body: { nombre: "Proyecto Social 2026", descripcion: "Desc" },
                file: {
                    mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    buffer: Buffer.from("fake-excel-data")
                }
            });
            const res = createResponse();

            // Mock user role validation (user has Director/Profesor role)
            prismaMock.actores.findFirst.mockResolvedValue({ id_actor: "actor-1" });

            // Mock database creation
            prismaMock.proyecto_proyeccion_social.create.mockResolvedValue({
                id_proyecto_social: "soc-1",
                nombre: "Proyecto Social 2026",
                fecha_registro: new Date()
            });

            await controller.create(req as any, res as any);

            expect(res.statusCode).toBe(201);
            const data = res._getJSONData();
            expect(data).toHaveProperty("message", "Proyecto de proyección social registrado exitosamente");
            expect(data.data).toHaveProperty("id_proyecto_social", "soc-1");
        });

        it("should return 400 if file is missing", async () => {
            const req = createRequest({
                method: "POST",
                url: "/api/social-projection",
                user: { id_persona: "prof-123" },
                body: { nombre: "Proyecto Social 2026" },
                // file is missing
            });
            const res = createResponse();

            await controller.create(req as any, res as any);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toHaveProperty("error", "El archivo Excel es obligatorio");
        });

        it("should return 403 if user lacks required role", async () => {
            const req = createRequest({
                method: "POST",
                url: "/api/social-projection",
                user: { id_persona: "student-123" },
                body: { nombre: "Proyecto" },
                file: { buffer: Buffer.from("data") }
            });
            const res = createResponse();

            // Mock user lacks role
            prismaMock.actores.findFirst.mockResolvedValue(null);

            await controller.create(req as any, res as any);

            expect(res.statusCode).toBe(403);
            expect(res._getJSONData()).toHaveProperty("error", "Solo Profesores/Directores o Coordinadores pueden registrar este documento");
        });
    });

    describe("downloadByName", () => {
        it("should return the file as a download stream", async () => {
            const req = createRequest({
                method: "GET",
                url: "/api/social-projection/download/Mi_Proyecto",
                params: { nombre: "Mi_Proyecto" }
            });
            const res = createResponse();
            const date = new Date("2026-04-27T00:00:00.000Z");

            prismaMock.proyecto_proyeccion_social.findFirst.mockResolvedValue({
                archivo: Buffer.from("fake-file"),
                tipo_mime: "application/vnd.ms-excel",
                nombre: "Mi Proyecto",
                fecha_registro: date
            });

            await controller.downloadByName(req as any, res as any);

            expect(res.statusCode).toBe(200);
            expect(res.getHeader("Content-Type")).toBe("application/vnd.ms-excel");
            expect(res.getHeader("Content-Disposition")).toContain('filename="Mi_Proyecto_2026-04-27.xls"');
            expect(res._getData()).toEqual(Buffer.from("fake-file"));
        });

        it("should return 404 if file by name does not exist", async () => {
            const req = createRequest({
                method: "GET",
                url: "/api/social-projection/download/Mi_Proyecto",
                params: { nombre: "Mi_Proyecto" }
            });
            const res = createResponse();

            prismaMock.proyecto_proyeccion_social.findFirst.mockResolvedValue(null);

            await controller.downloadByName(req as any, res as any);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toHaveProperty("error", "No se encontró archivo para el nombre indicado");
        });
    });

    describe("downloadById", () => {
        it("should return the file as a download stream by id", async () => {
            const req = createRequest({
                method: "GET",
                url: "/api/social-projection/download/id/soc-1",
                params: { id: "soc-1" }
            });
            const res = createResponse();
            const date = new Date("2026-04-27T00:00:00.000Z");

            prismaMock.proyecto_proyeccion_social.findUnique.mockResolvedValue({
                archivo: Buffer.from("fake-file"),
                tipo_mime: "application/vnd.ms-excel",
                nombre: "Mi Proyecto",
                fecha_registro: date
            });

            await controller.downloadById(req as any, res as any);

            expect(res.statusCode).toBe(200);
            expect(res.getHeader("Content-Type")).toBe("application/vnd.ms-excel");
            expect(res.getHeader("Content-Disposition")).toContain('filename="Mi_Proyecto_2026-04-27.xls"');
        });
    });

    describe("searchByName", () => {
        it("should return a list of projects matching the name", async () => {
            const req = createRequest({
                method: "GET",
                url: "/api/social-projection/search",
                query: { nombre: "Test" }
            });
            const res = createResponse();

            prismaMock.proyecto_proyeccion_social.findMany.mockResolvedValue([
                {
                    id_proyecto_social: "soc-1",
                    nombre: "Proyecto Test",
                    descripcion: "Desc",
                    tipo_mime: "application/vnd.ms-excel",
                    fecha_registro: new Date(),
                    id_persona_registra: "prof-123"
                }
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
                query: {}
            });
            const res = createResponse();

            await controller.searchByName(req as any, res as any);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toHaveProperty("error", "El parámetro de consulta 'nombre' es obligatorio");
        });
    });
});
