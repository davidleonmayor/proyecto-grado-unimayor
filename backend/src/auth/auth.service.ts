import { type tipo_documento as Tipo_documento } from "@prisma/client";
import { generateToken } from "../common/utils/createToken";
import { prisma } from "../config/prisma";
import { hashPassword } from "./utils/password";
import { logger } from "../config";

export class AuthService {
  async createUser(
    names: string,
    lastNames: string,
    typeOfDentityDocument: string,
    idDocumentNumber: string,
    phoneNumber: string,
    email: string,
    password: string,
    // tipo_documento: string,
  ) {
    try {
      const hashedPassword = await hashPassword(password);
      const token = generateToken();

      // TODO: request all props nedeeds
      const user = await prisma.persona.create({
        data: {
          nombres: names.trim(),
          apellidos: lastNames.trim(),
          id_tipo_doc_identidad: typeOfDentityDocument.trim(),
          num_doc_identidad: idDocumentNumber.trim(),
          numero_celular: phoneNumber.trim(),
          correo_electronico: email.toLowerCase().trim(),
          password: hashedPassword,
          token,
          ultimo_acceso: new Date(),
          // bloqueado_hasta: null, // create a null property as default
        },
      });

      return user;
    } catch (error: any) {
      logger.error("Error al crear usuario:", error);

      if (error.code === "P2002") {
        // Prisma: violación de campo único (correo o documento)
        throw new Error(
          "El correo electrónico o el número de documento ya están registrados.",
        );
      }

      throw new Error("Error al crear el usuario en la base de datos.");
    }
  }

  async updatePerson(
    id_persona: string,
    data: import("@prisma/client").Prisma.personaUpdateInput,
  ) {
    try {
      return await prisma.persona.update({
        where: { id_persona },
        data,
      });
    } catch (error) {
      logger.error(`Error al actualizar persona con ID ${id_persona}:`, error);
      throw new Error("Error al actualizar el usuario en la base de datos.");
    }
  }

  async findUserByEmail(email: string) {
    try {
      return await prisma.persona.findUnique({
        where: { correo_electronico: email },
      });
    } catch (error) {
      logger.error("Error al buscar usuario por email:", error);
      throw new Error("Error al consultar el usuario en la base de datos.");
    }
  }

  async findUserById(id_persona: string) {
    try {
      return await prisma.persona.findUnique({
        where: { id_persona: id_persona },
      });
    } catch (error) {
      logger.error("Error al buscar usuario por ID:", error);
      throw new Error("Error al consultar el usuario en la base de datos.");
    }
  }

  async findUserByToken(token: string) {
    try {
      return await prisma.persona.findUnique({
        where: { token: token },
      });
    } catch (error) {
      logger.error("Error al buscar usuario por token:", error);
      throw new Error(
        "Error al consultar el usuario en la base de datos por token.",
      );
    }
  }
}
