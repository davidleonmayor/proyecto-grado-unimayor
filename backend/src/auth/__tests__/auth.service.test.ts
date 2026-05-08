import { AuthService } from "../auth.service";
import { prisma } from "../../config/prisma";

jest.mock("../../config/prisma", () => ({
  prisma: {
    persona: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe("AuthService", () => {
  const authService = new AuthService();

  it("should create a new user", async () => {
    const user = {
      id_persona: "1",
      nombres: "Test User",
      apellidos: "User",
      id_tipo_doc_identidad: "CC",
      num_doc_identidad: "clxyz6bvt0000kh0gao8tqvhz",
      numero_celular: "3001234567",
      correo_electronico: "test@example.com",
      password: "password123",
      token: "token",
    };

    (prisma.persona.create as jest.Mock).mockResolvedValue(user);

    const createdUser = await authService.createUser(
      user.nombres,
      user.apellidos,
      user.id_tipo_doc_identidad,
      user.num_doc_identidad,
      user.numero_celular,
      user.correo_electronico,
      user.password,
    );

    console.log("Created User:", createdUser);

    expect(createdUser).toBeDefined();
    expect(createdUser.nombres).toBe(user.nombres);
    expect(createdUser.correo_electronico).toBe(user.correo_electronico);
    expect(prisma.persona.create).toHaveBeenCalledTimes(1);
  });
});
