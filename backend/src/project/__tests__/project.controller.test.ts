import { createRequest, createResponse } from "node-mocks-http";
import { ProjectController } from "../project.controller";
import { PrismaClient } from "@prisma/client";

// 1. MOCK PRISMA GLOBALLY
jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        persona: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        actores: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        seguimiento_tg: {
            findMany: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
        },
        accion_seg: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
        estado_tg: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        trabajo_grado: {
            findUnique: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
        tipo_rol: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
        },
        opcion_grado: {
            findMany: jest.fn(),
        },
        programa_academico: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        empresa: {
            findMany: jest.fn(),
        }
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prismaMock = new PrismaClient() as jest.Mocked<any>;

// Mock logger to avoid noisy console outputs during testing
jest.mock("../../config", () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }
}));

describe("ProjectController", () => {
    let controller: ProjectController;

    beforeAll(() => {
        controller = new ProjectController();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getProjects", () => {
        it("should return a list of projects for an authenticated user", async () => {
            const req = createRequest({
                method: "GET",
                url: "/api/projects",
                user: { id_persona: "user-123" }
            });
            const res = createResponse();

            prismaMock.persona.findUnique.mockResolvedValue({
                id_persona: "user-123",
                correo_electronico: "test@test.com",
                actores: [
                    {
                        id_actor: "actor-1",
                        tipo_rol: { nombre_rol: "Estudiante" },
                        trabajo_grado: {
                            id_trabajo_grado: "proj-1",
                            titulo_trabajo: "Sistema de Prueba",
                            objetivos: "Objetivos de prueba",
                            fecha_registro: new Date(),
                            estado_tg: { nombre_estado: "Aprobado" },
                            opcion_grado: { nombre_opcion_grado: "Tesis" }
                        }
                    }
                ]
            });

            await controller.getProjects(req as any, res as any);

            expect(res.statusCode).toBe(200);
            const data = res._getJSONData();
            expect(data).toHaveLength(1);
            expect(data[0].id).toBe("proj-1");
            expect(data[0].title).toBe("Sistema de Prueba");
            expect(data[0].role).toBe("Estudiante");
        });

        it("should return 401 if user is not authenticated", async () => {
            const req = createRequest({
                method: "GET",
                url: "/api/projects"
            });
            const res = createResponse();

            await controller.getProjects(req as any, res as any);

            expect(res.statusCode).toBe(401);
            expect(res._getJSONData()).toHaveProperty("error", "No autorizado");
        });

        it("should return 404 if user does not exist in DB", async () => {
            const req = createRequest({
                method: "GET",
                url: "/api/projects",
                user: { id_persona: "ghost-user" }
            });
            const res = createResponse();

            prismaMock.persona.findUnique.mockResolvedValue(null);

            await controller.getProjects(req as any, res as any);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toHaveProperty("error", "Usuario no encontrado");
        });
    });

    describe("getProjectHistory", () => {
        it("should return formatted history for a project", async () => {
            const req = createRequest({
                method: "GET",
                url: "/api/projects/1/history",
                params: { id: "proj-1" }
            });
            const res = createResponse();

            prismaMock.seguimiento_tg.findMany.mockResolvedValue([{
                id_seguimiento: "seg-1",
                fecha_registro: new Date(),
                resumen: "Primer avance",
                nombre_documento: "avance.pdf",
                archivo: Buffer.from("test"),
                numero_resolucion: null,
                accion_seg: { tipo_accion: "Entrega de Avance" },
                estado_anterior: { nombre_estado: "Inicio" },
                estado_nuevo: { nombre_estado: "En Revisión" },
                actores: {
                    persona: { nombres: "Juan", apellidos: "Perez" },
                    tipo_rol: { nombre_rol: "Estudiante" }
                }
            }]);

            await controller.getProjectHistory(req as any, res as any);

            expect(res.statusCode).toBe(200);
            const data = res._getJSONData();
            expect(data).toHaveLength(1);
            expect(data[0].id).toBe("seg-1");
            expect(data[0].action).toBe("Entrega de Avance");
            expect(data[0].file).toBe(true);
            expect(data[0].statusChange.from).toBe("Inicio");
            expect(data[0].statusChange.to).toBe("En Revisión");
        });
    });

    describe("getStatuses", () => {
        it("should return all statuses except 'Pendiente de Aprobación'", async () => {
            const req = createRequest({ method: "GET", url: "/api/projects/statuses" });
            const res = createResponse();

            prismaMock.estado_tg.findMany.mockResolvedValue([
                { id_estado_tg: "1", nombre_estado: "Activo" },
                { id_estado_tg: "2", nombre_estado: "Finalizado" }
            ]);

            await controller.getStatuses(req as any, res as any);

            expect(res.statusCode).toBe(200);
            const data = res._getJSONData();
            expect(data).toHaveLength(2);
            expect(prismaMock.estado_tg.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { nombre_estado: { not: "Pendiente de Aprobación" } }
                })
            );
        });
    });
});
