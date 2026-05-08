import { createRequest, createResponse } from "node-mocks-http";
import { PersonController } from "../person.controller";
import { PrismaClient } from "@prisma/client";

// 1. MOCK PRISMA GLOBALLY
jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        tipo_rol: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
        },
        persona: {
            findUnique: jest.fn(),
            count: jest.fn(),
            findMany: jest.fn(),
        },
        actores: {
            findFirst: jest.fn(),
        },
        evento: {
            findMany: jest.fn(),
        }
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prismaMock = new PrismaClient() as jest.Mocked<any>;

describe("PersonController", () => {
    let controller: PersonController;

    beforeAll(() => {
        controller = new PersonController();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getTeachers", () => {
        it("should return formatted teachers list successfully", async () => {
            const req = createRequest({
                method: "GET",
                url: "/api/person/teachers",
                query: { page: "1", limit: "10" }
            });
            const res = createResponse();

            // Mock responses for type_roles
            prismaMock.tipo_rol.findMany.mockResolvedValue([
                { id_rol: "role-1", nombre_rol: "Director" },
                { id_rol: "role-2", nombre_rol: "Asesor" },
                { id_rol: "role-3", nombre_rol: "Asesor Externo" }
            ]);

            // Mock response for coordinator
            prismaMock.tipo_rol.findFirst.mockResolvedValueOnce({ id_rol: "role-coord", nombre_rol: "Coordinador de Carrera" }) // for coordinatorRole
                .mockResolvedValueOnce({ id_rol: "role-1", nombre_rol: "Director" }) // for directorRole check
                .mockResolvedValueOnce({ id_rol: "role-2", nombre_rol: "Asesor" }) // for asesorRole check
                .mockResolvedValueOnce({ id_rol: "role-3", nombre_rol: "Asesor Externo" }); // for asesorExternoRole check

            // Mock response for total count
            prismaMock.persona.count.mockResolvedValue(1);

            // Mock response for teachers findMany
            prismaMock.persona.findMany.mockResolvedValue([{
                id_persona: "teacher-1",
                nombres: "Juan",
                apellidos: "Perez",
                correo_electronico: "juan@test.com",
                numero_celular: "123456",
                num_doc_identidad: "123456789",
                id_facultad: "fac-1",
                facultad: { nombre_facultad: "Ingeniería" },
                actores: [
                    {
                        estado: "Activo",
                        id_tipo_rol: "role-1",
                        tipo_rol: { nombre_rol: "Director" },
                        trabajo_grado: { id_trabajo_grado: "proj-1" }
                    }
                ]
            }]);

            await controller.getTeachers(req as any, res as any);

            expect(res.statusCode).toBe(200);
            const data = res._getJSONData();
            expect(data).toHaveProperty("teachers");
            expect(data.teachers).toHaveLength(1);
            expect(data.teachers[0].nombre).toBe("Juan Perez");
            expect(data.teachers[0].rol).toBe("Director"); // Has active projects as Director
            expect(data).toHaveProperty("pagination");
            expect(data.pagination.total).toBe(1);
        });

        it("should return a 500 error if prisma throws an exception", async () => {
            const req = createRequest({ method: "GET", url: "/api/person/teachers" });
            const res = createResponse();

            prismaMock.tipo_rol.findMany.mockRejectedValue(new Error("Database error"));

            await controller.getTeachers(req as any, res as any);

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toHaveProperty("message", "Error al obtener profesores");
        });
    });

    describe("getStudents", () => {
        it("should return formatted students list successfully", async () => {
            const req = createRequest({
                method: "GET",
                url: "/api/person/students",
                query: { page: "1", limit: "10" }
            });
            const res = createResponse();

            // Mock student role
            prismaMock.tipo_rol.findFirst.mockResolvedValueOnce({ id_rol: "role-student", nombre_rol: "Estudiante" })
                .mockResolvedValueOnce({ id_rol: "role-coord", nombre_rol: "Coordinador de Carrera" }); // for coordinatorRole

            prismaMock.persona.count.mockResolvedValue(1);

            prismaMock.persona.findMany.mockResolvedValue([{
                id_persona: "student-1",
                nombres: "Maria",
                apellidos: "Gomez",
                correo_electronico: "maria@test.com",
                num_doc_identidad: "987654321",
                id_programa_academico: "prog-1",
                programa_academico: {
                    nombre_programa: "Sistemas",
                    facultad: { nombre_facultad: "Ingeniería" }
                },
                actores: [
                    {
                        estado: "Activo",
                        id_tipo_rol: "role-student",
                        trabajo_grado: {
                            opcion_grado: { nombre_opcion_grado: "Tesis" },
                            estado_tg: { nombre_estado: "Aprobado" }
                        }
                    }
                ]
            }]);

            await controller.getStudents(req as any, res as any);

            expect(res.statusCode).toBe(200);
            const data = res._getJSONData();
            expect(data).toHaveProperty("students");
            expect(data.students).toHaveLength(1);
            expect(data.students[0].nombre).toBe("Maria Gomez");
            expect(data.students[0].opcionGrado).toBe("Tesis");
            expect(data.students[0].estado).toBe("Aprobado");
            expect(data).toHaveProperty("pagination");
            expect(data.pagination.total).toBe(1);
        });

        it("should return 404 if student role is not found", async () => {
            const req = createRequest({ method: "GET", url: "/api/person/students" });
            const res = createResponse();

            // Mock student role as null
            prismaMock.tipo_rol.findFirst.mockResolvedValueOnce(null);

            await controller.getStudents(req as any, res as any);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toHaveProperty("message", "Rol de estudiante no encontrado");
        });
    });

    describe("getPersonById", () => {
        it("should return a person with their events and projects successfully", async () => {
            const req = createRequest({
                method: "GET",
                url: "/api/person/1",
                params: { id: "person-1" }
            });
            const res = createResponse();

            prismaMock.persona.findUnique.mockResolvedValue({
                id_persona: "person-1",
                nombres: "Carlos",
                actores: [
                    {
                        tipo_rol: { nombre_rol: "Estudiante" },
                        trabajo_grado: { id_trabajo_grado: "proj-1" }
                    }
                ]
            });

            prismaMock.evento.findMany.mockResolvedValue([
                { id_evento: "ev-1", titulo: "Evento 1" }
            ]);

            await controller.getPersonById(req as any, res as any);

            expect(res.statusCode).toBe(200);
            const data = res._getJSONData();
            expect(data.nombres).toBe("Carlos");
            expect(data.studentProjects).toHaveLength(1);
            expect(data.teacherProjects).toHaveLength(0);
            expect(data.events).toHaveLength(1);
        });

        it("should return 404 if person does not exist", async () => {
            const req = createRequest({
                method: "GET",
                url: "/api/person/99",
                params: { id: "99" }
            });
            const res = createResponse();

            prismaMock.persona.findUnique.mockResolvedValue(null);

            await controller.getPersonById(req as any, res as any);

            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toHaveProperty("message", "Persona no encontrada");
        });
    });

    describe("createTeacher", () => {
        it("should return 501 not implemented", async () => {
            const req = createRequest({ method: "POST", url: "/api/person/teachers" });
            const res = createResponse();

            await controller.createTeacher(req as any, res as any);

            expect(res.statusCode).toBe(501);
            expect(res._getJSONData()).toHaveProperty("message", "La creación de profesores está en desarrollo");
        });
    });

    describe("createStudent", () => {
        it("should return 501 not implemented", async () => {
            const req = createRequest({ method: "POST", url: "/api/person/students" });
            const res = createResponse();

            await controller.createStudent(req as any, res as any);

            expect(res.statusCode).toBe(501);
            expect(res._getJSONData()).toHaveProperty("message", "La creación de estudiantes está en desarrollo");
        });
    });
});
