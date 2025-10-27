import type { Request } from "./interfaces/auth-request.interface";
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
        this.updateCurrentUserPassword =
            this.updateCurrentUserPassword.bind(this);
        this.checkPasswordDB = this.checkPasswordDB.bind(this);
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password } = req.body;

            const existingUser = await this.authService.findUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    error: "El usuario ya existe",
                });
            }

            const user = await this.authService.createUser(
                name,
                email,
                password,
            );

            // await AuthEmail.sendConfirmationEmail({
            //     name: user.name,
            //     email: user.email,
            //     token: user.token,
            // });

            // ✅ Devolver string directamente
            return res
                .status(201)
                .json(
                    `Usuario creado correctamente, confirma tu cuenta. Token: ${user.token}`,
                );
        } catch (error) {
            console.error("Error en register:", error);
            return res.status(500).json({
                error: "Ocurrió un error interno al registrar el usuario.",
            });
        }
    }

    async confirmAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const token = String(req.body.token ?? "")
                .trim()
                .toUpperCase();

            if (!token || token.length !== 6) {
                return res.status(400).json({ error: "Token inválido" });
            }

            const user = await prisma.user.findUnique({ where: { token } });
            if (!user) {
                return res.status(401).json({ error: "Token no válido" });
            }

            if (user.confirmed) {
                return res
                    .status(400)
                    .json({ error: "La cuenta ya está confirmada" });
            }

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    confirmed: true,
                    token: null,
                },
            });

            // ✅ Devolver string directamente
            return res
                .status(200)
                .json(
                    "Cuenta confirmada exitosamente. Ya puedes iniciar sesión.",
                );
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            const userExists = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });

            if (!userExists) {
                return res.status(404).json({
                    error: "Usuario no encontrado",
                });
            }

            if (!userExists.confirmed) {
                return res.status(403).json({
                    error: "La cuenta no ha sido confirmada. Revisa tu email.",
                });
            }

            const isPasswordCorrect = await checkPassword(
                password,
                userExists.password,
            );

            if (!isPasswordCorrect) {
                return res.status(401).json({
                    error: "Contraseña incorrecta",
                });
            }

            const token = generateJWT({
                id: userExists.id,
                email: userExists.email,
            });

            // ✅ Login devuelve el token como string (caso especial)
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
            const { id } = req.user;

            const user = await prisma.user.findUnique({ where: { id } });

            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const isPasswordCorrect = await checkPassword(
                password,
                user.password,
            );
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
            const { email } = req.body;

            const user = await this.authService.findUserByEmail(
                email.toLowerCase(),
            );
            if (!user) {
                return res.status(404).json({
                    error: "Usuario no encontrado",
                });
            }

            const token = generateToken();

            await prisma.user.update({
                where: { email: user.email },
                data: { token },
            });

            await AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token,
            });

            // ✅ Devolver string directamente
            return res
                .status(200)
                .json(
                    "Se ha enviado un email con instrucciones para resetear tu contraseña",
                );
        } catch (error) {
            next(error);
        }
    }

    async validateToken(req: Request, res: Response, next: NextFunction) {
        try {
            const token = String(req.body.token ?? "")
                .trim()
                .toUpperCase();

            if (!token || token.length !== 6) {
                return res.status(400).json({ error: "Token inválido" });
            }

            const tokenFound = await prisma.user.findUnique({
                where: { token },
            });
            if (!tokenFound) {
                return res
                    .status(404)
                    .json({ error: "Token no válido o expirado" });
            }

            // ✅ Devolver string directamente
            return res.json(
                "Token válido, puedes asignar una nueva contraseña",
            );
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
            const token = String(req.params.token ?? "")
                .trim()
                .toUpperCase();
            const { password } = req.body;

            if (!token || token.length !== 6) {
                return res.status(400).json({ error: "Token inválido" });
            }

            const userWithToken = await prisma.user.findUnique({
                where: { token },
            });
            if (!userWithToken) {
                return res
                    .status(404)
                    .json({ error: "Token no válido o expirado" });
            }

            const hashedPassword = await hashPassword(password);
            await prisma.user.update({
                where: { id: userWithToken.id },
                data: {
                    token: null,
                    password: hashedPassword,
                },
            });

            // ✅ Devolver string directamente
            return res
                .status(200)
                .json("La contraseña se modificó correctamente");
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

    async updateCurrentUserPassword(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { currentPassword, password } = req.body;
            const { id } = req.user;

            const user = await prisma.user.findUnique({ where: { id } });

            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const isPasswordCorrect = await checkPassword(
                currentPassword,
                user.password,
            );

            if (!isPasswordCorrect) {
                return res.status(401).json({
                    error: "La contraseña actual es incorrecta",
                });
            }

            const newHashedPassword = await hashPassword(password);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: newHashedPassword },
            });

            // ✅ Devolver string directamente
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

            // ✅ Devolver string directamente
            return res.status(200).json("Contraseña correcta");
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email } = req.body;
            const { id } = req.user;

            // Verificar si el email ya existe (si cambió)
            if (email !== req.user.email) {
                const emailExists = await prisma.user.findUnique({
                    where: { email: email.toLowerCase() },
                });

                if (emailExists && emailExists.id !== id) {
                    return res.status(409).json({
                        error: "Este email ya está en uso",
                    });
                }
            }

            // Actualizar perfil
            await prisma.user.update({
                where: { id },
                data: {
                    name,
                    email: email.toLowerCase(),
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
            const { id } = req.user;

            const user = await prisma.user.findUnique({ where: { id } });

            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            // Verificar contraseña actual
            const isPasswordCorrect = await checkPassword(
                current_password,
                user.password,
            );

            if (!isPasswordCorrect) {
                return res.status(401).json({
                    error: "La contraseña actual es incorrecta",
                });
            }

            // Actualizar contraseña
            const newHashedPassword = await hashPassword(password);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: newHashedPassword },
            });

            return res.status(200).send("Contraseña actualizada correctamente");
        } catch (error) {
            next(error);
        }
    }
}

// import type { Request } from "./interfaces/auth-request.interface";
// import type { Response, NextFunction } from "express";

// import { AuthService } from "./auth.service";
// import { AuthEmail } from "../email/AuthEmail";
// import { prisma } from "../config/prisma";

// import { checkPassword, hashPassword } from "./utils/password";
// import { generateJWT } from "./utils/jwt";
// import { generateToken } from "../common/utils/createToken";

// export class AuthController {
//     private authService: AuthService;

//     constructor() {
//         this.authService = new AuthService();

//         this.register = this.register.bind(this);
//         this.confirmAccount = this.confirmAccount.bind(this);
//         this.login = this.login.bind(this);
//         this.checkPasswordLogin = this.checkPasswordLogin.bind(this);
//         this.forgotPassword = this.forgotPassword.bind(this);
//         this.validateToken = this.validateToken.bind(this);
//         this.resetPasswordWithToken = this.resetPasswordWithToken.bind(this);
//         this.getUser = this.getUser.bind(this);
//         this.updateCurrentUserPassword =
//             this.updateCurrentUserPassword.bind(this);
//         this.checkPasswordDB = this.checkPasswordDB.bind(this);
//     }

//     async register(req: Request, res: Response, next: NextFunction) {
//         try {
//             const { name, email, password } = req.body;

//             // Verificar si el usuario ya existe
//             const existingUser = await this.authService.findUserByEmail(email);
//             if (existingUser) {
//                 return res.status(409).json({
//                     error: "El usuario ya existe",
//                 });
//             }

//             // Crear usuario
//             const user = await this.authService.createUser(
//                 name,
//                 email,
//                 password,
//             );

//             // Enviar correo de confirmación
//             // await AuthEmail.sendConfirmationEmail({
//             //     name: user.name,
//             //     email: user.email,
//             //     token: user.token,
//             // });

//             // Retornar respuesta de éxito
//             return res
//                 .status(201)
//                 .json(
//                     "Usuario creado correctamente, confirma tu cuenta." +
//                         user.token,
//                 );
//         } catch (error) {
//             console.error("Error en register:", error);
//             return res.status(500).json({
//                 error: "Ocurrió un error interno al registrar el usuario.",
//             });
//         }
//     }

//     async confirmAccount(req: Request, res: Response, next: NextFunction) {
//         try {
//             const token = String(req.body.token ?? "")
//                 .trim()
//                 .toUpperCase();

//             if (!token || token.length !== 6) {
//                 return res.status(400).json({ error: "Token inválido" });
//             }

//             const user = await prisma.user.findUnique({ where: { token } });
//             if (!user) {
//                 return res.status(401).json({ error: "Token no válido" });
//             }

//             if (user.confirmed) {
//                 return res
//                     .status(400)
//                     .json({ error: "La cuenta ya está confirmada" });
//             }

//             await prisma.user.update({
//                 where: { id: user.id },
//                 data: {
//                     confirmed: true,
//                     token: null,
//                 },
//             });

//             return res
//                 .status(200)
//                 .json(
//                     "Cuenta confirmada exitosamente. Ya puedes iniciar sesión.",
//                 );
//         } catch (error) {
//             next(error);
//         }
//     }

//     async login(req: Request, res: Response, next: NextFunction) {
//         try {
//             const { email, password } = req.body;

//             // Revisar que el usuario exista
//             const userExists = await prisma.user.findUnique({
//                 where: { email: email.toLowerCase() },
//             });

//             if (!userExists) {
//                 return res.status(404).json({
//                     error: "Usuario no encontrado",
//                 });
//             }

//             // Revisar que la cuenta esté confirmada
//             if (!userExists.confirmed) {
//                 return res.status(403).json({
//                     error: "La cuenta no ha sido confirmada. Revisa tu email.",
//                 });
//             }

//             // Revisar que el password sea correcto
//             const isPasswordCorrect = await checkPassword(
//                 password,
//                 userExists.password,
//             );

//             if (!isPasswordCorrect) {
//                 return res.status(401).json({
//                     error: "Contraseña incorrecta",
//                 });
//             }

//             // Generar JWT
//             const token = generateJWT({
//                 id: userExists.id,
//                 email: userExists.email,
//             });

//             // ✅ SOLO ESTE CAMBIO: devolver el token directamente como string
//             return res.status(200).send(token);
//         } catch (error) {
//             console.error("Error en login:", error);
//             return res.status(500).json({
//                 error: "Ocurrió un error interno en el servidor. Inténtalo más tarde.",
//             });
//         }
//     }

//     async checkPasswordLogin(req: Request, res: Response, next: NextFunction) {
//         try {
//             const { password } = req.body;
//             const { id } = req.user;

//             const user = await prisma.user.findUnique({ where: { id } });

//             if (!user) {
//                 return res.status(404).json({ error: "Usuario no encontrado" });
//             }

//             const isPasswordCorrect = await checkPassword(
//                 password,
//                 user.password,
//             );
//             if (!isPasswordCorrect) {
//                 return res.status(401).json({
//                     error: "La contraseña actual es incorrecta",
//                 });
//             }

//             return res.json({ message: "Contraseña correcta" });
//         } catch (error) {
//             next(error);
//         }
//     }

//     async forgotPassword(req: Request, res: Response, next: NextFunction) {
//         try {
//             const { email } = req.body;

//             // Buscar usuario por email
//             const user = await this.authService.findUserByEmail(
//                 email.toLowerCase(),
//             );
//             if (!user) {
//                 return res.status(404).json({
//                     error: "Usuario no encontrado",
//                 });
//             }

//             // Generar token de reseteo
//             const token = generateToken();

//             // Actualizar usuario con el token
//             await prisma.user.update({
//                 where: { email: user.email },
//                 data: { token },
//             });

//             // Enviar email con el token
//             await AuthEmail.sendPasswordResetToken({
//                 email: user.email,
//                 name: user.name,
//                 token: token,
//             });

//             return res.status(200).json({
//                 message:
//                     "Se ha enviado un email con instrucciones para resetear tu contraseña",
//             });
//         } catch (error) {
//             next(error);
//         }
//     }

//     async validateToken(req: Request, res: Response, next: NextFunction) {
//         try {
//             const token = String(req.body.token ?? "")
//                 .trim()
//                 .toUpperCase();

//             if (!token || token.length !== 6) {
//                 return res.status(400).json({ error: "Token inválido" });
//             }

//             // validate if token exist in one user
//             const tokenFound = await prisma.user.findUnique({
//                 where: { token },
//             });
//             if (!tokenFound) {
//                 return res
//                     .status(404)
//                     .json({ error: "Token no válido o expirado" });
//             }

//             return res.json({
//                 message: "Token válido, puedes asignar una nueva contraseña",
//             });
//         } catch (error) {
//             next(error);
//         }
//     }

//     async resetPasswordWithToken(
//         req: Request,
//         res: Response,
//         next: NextFunction,
//     ) {
//         try {
//             const token = String(req.params.token ?? "")
//                 .trim()
//                 .toUpperCase();
//             const { password } = req.body;

//             if (!token || token.length !== 6) {
//                 return res.status(400).json({ error: "Token inválido" });
//             }

//             // validate user with token
//             const userWithToken = await prisma.user.findUnique({
//                 where: { token },
//             });
//             if (!userWithToken) {
//                 return res
//                     .status(404)
//                     .json({ error: "Token no válido o expirado" });
//             }

//             // Update user - hash new password and clear token
//             const hashedPassword = await hashPassword(password);
//             await prisma.user.update({
//                 where: { id: userWithToken.id },
//                 data: {
//                     token: null,
//                     password: hashedPassword,
//                 },
//             });

//             return res.status(200).json({
//                 message: "La contraseña se modificó correctamente",
//             });
//         } catch (error) {
//             next(error);
//         }
//     }

//     async getUser(req: Request, res: Response, next: NextFunction) {
//         try {
//             // Remove password from response
//             const { password: _, ...safeUser } = req.user;
//             return res.json(safeUser);
//         } catch (error) {
//             next(error);
//         }
//     }

//     async updateCurrentUserPassword(
//         req: Request,
//         res: Response,
//         next: NextFunction,
//     ) {
//         try {
//             const { currentPassword, password } = req.body;
//             const { id } = req.user;

//             const user = await prisma.user.findUnique({ where: { id } });

//             if (!user) {
//                 return res.status(404).json({ error: "Usuario no encontrado" });
//             }

//             const isPasswordCorrect = await checkPassword(
//                 currentPassword,
//                 user.password,
//             );

//             if (!isPasswordCorrect) {
//                 return res.status(401).json({
//                     error: "La contraseña actual es incorrecta",
//                 });
//             }

//             // update password
//             const newHashedPassword = await hashPassword(password);
//             await prisma.user.update({
//                 where: { id: user.id },
//                 data: { password: newHashedPassword },
//             });

//             return res.json({
//                 message: "La contraseña se modificó correctamente",
//             });
//         } catch (error) {
//             next(error);
//         }
//     }

//     async checkPasswordDB(req: Request, res: Response, next: NextFunction) {
//         try {
//             const { password } = req.body;
//             const { password: dbPassword } = req.user;

//             // compare passwords
//             const isPasswordCorrect = await checkPassword(password, dbPassword);
//             if (!isPasswordCorrect) {
//                 return res.status(401).json({
//                     error: "La contraseña actual es incorrecta",
//                 });
//             }

//             return res.status(200).json({ message: "Contraseña correcta" });
//         } catch (error) {
//             next(error);
//         }
//     }
// }
