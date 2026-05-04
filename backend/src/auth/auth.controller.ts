import type { Request } from "./interfaces/authRequest.interface";
import type { Response, NextFunction } from "express";

import { AuthService } from "./auth.service";
import { AuthEmail } from "../email/AuthEmail";
import { prisma } from "../config/prisma";

import { checkPassword, hashPassword } from "./utils/password";
import { generateJWT } from "./utils/jwt";
import { generateToken } from "../common/utils/createToken";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();

    this.register = this.register.bind(this);
    this.confirmAccount = this.confirmAccount.bind(this);
    this.login = this.login.bind(this);
    this.checkPasswordLogin = this.checkPasswordLogin.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.validateToken = this.validateToken.bind(this);
    this.resetPasswordWithToken = this.resetPasswordWithToken.bind(this);
    this.getUser = this.getUser.bind(this);
    this.resetAuthenticatedUserPassword =
      this.resetAuthenticatedUserPassword.bind(this);
    this.checkPasswordDB = this.checkPasswordDB.bind(this);
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        names,
        lastNames,
        typeOfDentityDocument,
        idDocumentNumber,
        phoneNumber,
        email,
        password,
      } = req.body;

      const existingPersona = await this.authService.findUserByEmail(email);
      if (existingPersona) {
        return res.status(409).json({
          error: "El usuario ya existe",
        });
      }

      console.log("data to create user: ", req.body);

      const persona = await this.authService.createUser(
        names,
        lastNames,
        typeOfDentityDocument,
        idDocumentNumber,
        phoneNumber,
        email,
        password,
      );

      // TODO: solve brevo error, they closed me the permission
      // await AuthEmail.sendConfirmationEmail({
      //     name: persona.nombres,
      //     email: persona.correo_electronico,
      //     token: persona.token,
      // });

      return res.status(201).json(
        // `Usuario creado correctamente, confirma tu cuenta. Token: ${persona.token}`,
        `Usuario creado correctamente, confirma tu cuenta. Token: ${persona.token}`,
      );
    } catch (error: any) {
      console.error("Error en register:", error);

      return res.status(500).json({
        error:
          error.message || "Ocurrió un error interno al registrar el usuario.",
      });
    }
  }

  async confirmAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      const persona = await this.authService.findUserByToken(token);
      if (!persona) {
        return res.status(401).json({ error: "Token no válido o expirado" });
      }

      if (persona.confirmed) {
        return res.status(409).json({ error: "La cuenta ya está confirmada" });
      }

      await prisma.persona.update({
        where: { id_persona: persona.id_persona },
        data: {
          confirmed: true,
          token: null,
        },
      });

      return res
        .status(200)
        .json("Cuenta confirmada exitosamente. Ya puedes iniciar sesión.");
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;
      const { password: dbPassword, id_persona, correo_electronico } = req.user;

      const isPasswordCorrect = await checkPassword(password, dbPassword);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          error: "Contraseña incorrecta",
        });
      }

      const token = generateJWT({
        id: id_persona,
        email: correo_electronico,
      });

      return res.status(200).send(token);
    } catch (error) {
      console.error("Error en login:", error);
      return res.status(500).json({
        error: "Ocurrió un error interno en el servidor. Inténtalo más tarde.",
      });
    }
  }

  async checkPasswordLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;
      const { id_persona } = req.user;

      const persona = await prisma.persona.findUnique({
        where: { id_persona },
      });

      if (!persona) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const isPasswordCorrect = await checkPassword(password, persona.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          error: "La contraseña actual es incorrecta",
        });
      }

      // ✅ Devolver string directamente
      return res.json("Contraseña correcta");
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { correo_electronico } = req.user;

      // set new token to active user
      const token = generateToken();
      await prisma.persona.update({
        where: { correo_electronico: correo_electronico },
        data: { token },
      });

      // TODO: Configure email sender and remove
      // await AuthEmail.sendPasswordResetToken({
      //   email: persona.correo_electronico,
      //   name: persona.nombres,
      //   token: token,
      // });
      return res.status(200).json(
        `Se ha enviado un email con instrucciones para resetear tu contraseña - ${token}`, // TODO: token from response
      );
    } catch (error) {
      next(error);
    }
  }

  async validateToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      const tokenFound = await this.authService.findUserByToken(token);
      if (!tokenFound) {
        return res.status(404).json({ error: "Token no válido o expirado" });
      }

      return res.json("Token válido, puedes asignar una nueva contraseña");
    } catch (error) {
      next(error);
    }
  }

  async resetPasswordWithToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const personaWithToken = await this.authService.findUserByToken(token);
      if (!personaWithToken) {
        return res.status(404).json({ error: "Token no válido o expirado" });
      }

      // hash new setted password and save
      const hashedPassword = await hashPassword(password);
      await this.authService.updatePerson(personaWithToken.id_persona, {
        token: null,
        password: hashedPassword,
      });

      return res.status(200).json("La contraseña se modificó correctamente");
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { password: _, ...safeUser } = req.user;
      return res.json(safeUser);
    } catch (error) {
      next(error);
    }
  }

  async resetAuthenticatedUserPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { currentPassword, password } = req.body;
      const { id_persona } = req.user;

      const persona = await this.authService.findUserById(id_persona);
      if (!persona) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const isPasswordCorrect = await checkPassword(
        currentPassword,
        persona.password,
      );
      if (!isPasswordCorrect) {
        return res.status(401).json({
          error: "La contraseña actual es incorrecta",
        });
      }

      // update new password
      const newHashedPassword = await hashPassword(password);
      const payload = {
        password: newHashedPassword,
      };
      await this.authService.updatePerson(persona.id_persona, payload);

      return res.json("La contraseña se modificó correctamente");
    } catch (error) {
      next(error);
    }
  }

  async checkPasswordDB(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;
      const { password: dbPassword } = req.user;

      const isPasswordCorrect = await checkPassword(password, dbPassword);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          error: "La contraseña actual es incorrecta",
        });
      }

      return res.status(200).json("Contraseña correcta");
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email } = req.body;
      const { id_persona } = req.user;

      // Verificar si el email ya esta en uso o si es el mismo del usuario actual
      if (email !== req.user.correo_electronico) {
        const emailExists = await prisma.persona.findUnique({
          where: { correo_electronico: email.toLowerCase() },
        });

        if (emailExists && emailExists.id_persona !== id_persona) {
          return res.status(409).json({
            error: "Este email ya está en uso",
          });
        }
      }

      // Actualizar perfil
      await prisma.persona.update({
        where: { id_persona },
        data: {
          nombres: name,
          correo_electronico: email.toLowerCase(),
        },
      });

      return res.status(200).send("Perfil actualizado correctamente");
    } catch (error) {
      next(error);
    }
  }

  // 2. UPDATE PASSWORD (con contraseña actual)
  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { current_password, password } = req.body;
      const { id_persona } = req.user;

      const persona = await prisma.persona.findUnique({
        where: { id_persona },
      });
      if (!persona) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Verificar contraseña actual
      const isPasswordCorrect = await checkPassword(
        current_password,
        persona.password,
      );
      if (!isPasswordCorrect) {
        return res.status(401).json({
          error: "La contraseña actual es incorrecta",
        });
      }

      // Actualizar contraseña
      const newHashedPassword = await hashPassword(password);
      await prisma.persona.update({
        where: { id_persona: persona.id_persona },
        data: { password: newHashedPassword },
      });

      return res.status(200).send("Contraseña actualizada correctamente");
    } catch (error) {
      next(error);
    }
  }
}
