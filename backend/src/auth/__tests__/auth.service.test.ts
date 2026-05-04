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
      id: "1",
      names: "Test User",
      lastNames: "User",
      typeOfDentityDocument: "CC",
      idDocumentNumber: "clxyz6bvt0000kh0gao8tqvhz",
      phoneNumber: "3001234567",
      email: "test@example.com",
      password: "password123",
      token: "token",
      // confirmed: false,
      // createdAt: new Date(),
      // updatedAt: new Date(),
    };

    (prisma.persona.create as jest.Mock).mockResolvedValue(user);

    const createdUser = await authService.createUser(
      user.names,
      user.lastNames,
      user.typeOfDentityDocument,
      user.idDocumentNumber,
      user.phoneNumber,
      user.email,
      user.password,
    );

    console.log("Created User:", createdUser);

    expect(createdUser).toBeDefined();
    expect(createdUser.names).toBe(user.names);
    expect(createdUser.email).toBe(user.email);
    expect(prisma.persona.create).toHaveBeenCalledTimes(1);
  });
});
