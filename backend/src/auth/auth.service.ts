import { generateToken } from "../common/utils/createToken";
import { prisma } from "../config/prisma";
import { hashPassword } from "./utils/password";

export class AuthService {
  constructor() {}

  async createUser(name: string, email: string, password: string) {
    const hashedPassword = await hashPassword(password);
    const token = generateToken();

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        token,
      },
    });

    return user;
  }

  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }
}
