import request from "supertest";
import Server from "../../server";
import { prisma } from "../../config/prisma";
import { checkPassword } from "../../auth/utils/password";

// Mock the password utility
jest.mock("../utils/password", () => ({
  ...jest.requireActual("../utils/password"),
  checkPassword: jest.fn(),
}));

// Mock the prisma client
jest.mock("../../config/prisma", () => ({
  prisma: {
    persona: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock the AuthEmail module
jest.mock("../../email/AuthEmail", () => ({
  AuthEmail: {
    sendConfirmationEmail: jest.fn(),
  },
}));

const server = new Server();
const app = server["app"];

describe("Auth Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should create a new persona and return it", async () => {
      const userData = {
        names: "Test",
        lastNames: "User",
        typeOfDentityDocument: "CC",
        idDocumentNumber: "123456789",
        phoneNumber: "3001234567",
        email: "test@example.com",
        password: "Password123!",
      };

      const newPersona = {
        id_persona: "1",
        nombres: "Test",
        apellidos: "User",
        id_tipo_doc_identidad: "CC",
        num_doc_identidad: "123456789",
        numero_celular: "3001234567",
        correo_electronico: "test@example.com",
        password: "hashedpassword",
        token: "123456",
        confirmed: false,
      };

      (prisma.persona.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.persona.create as jest.Mock).mockResolvedValue(newPersona);

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toMatch(/Usuario creado correctamente/);
    });
  });

  describe("POST /api/auth/confirm-account", () => {
    it("should confirm the account", async () => {
      const persona = {
        id_persona: "1",
        nombres: "Test User",
        correo_electronico: "test@example.com",
        password: "Password123!",
        token: "123456",
        confirmed: false,
      };

      (prisma.persona.findUnique as jest.Mock).mockResolvedValue(persona);
      (prisma.persona.update as jest.Mock).mockResolvedValue({
        ...persona,
        confirmed: true,
        token: null,
      });

      const response = await request(app)
        .post("/api/auth/confirm-account")
        .send({ token: "123456" });

      expect(response.status).toBe(200);
      expect(response.body).toBe(
        "Cuenta confirmada exitosamente. Ya puedes iniciar sesión.",
      );
    });
  });

  describe("POST /api/auth/login", () => {
    const loginCredentials = {
      email: "test@example.com",
      password: "Password123!",
    };

    it("should login the user and return a token", async () => {
      const persona = {
        id_persona: "1",
        nombres: "Test User",
        correo_electronico: loginCredentials.email,
        password: "hashedpassword",
        token: null,
        confirmed: true,
      };

      // Used by authMiddleware.isConfirmed to fetch the user
      (prisma.persona.findUnique as jest.Mock).mockResolvedValue(persona);
      (checkPassword as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginCredentials);

      expect(response.status).toBe(200);
      expect(typeof response.text).toBe("string");
    });
  });
});
