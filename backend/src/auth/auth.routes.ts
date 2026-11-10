import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateSchema } from "../common/middleware/validateSchema";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import {
  RegisterSchema,
  UserConfirmationSchema,
  UserLoginSchema,
  ForgotPasswordSchema,
  ValidateTokenSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
  CheckAuthUserPasswordSchema,
} from "./auth.schema";
import { authLimiter } from "../config";

export class AuthRoutes {
  public router: Router;
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.router.use(authLimiter);
    this.authController = new AuthController();
    this.authMiddleware = new AuthMiddleware();
    this.initRoutes();
  }

  initRoutes() {
    // ========================================================================
    // Rutas públicas — no requieren JWT
    // ========================================================================

    /**
     * @openapi
     * /api/auth/register:
     *   post:
     *     summary: Registrar una nueva cuenta
     *     description: Crea una persona y envía un código de confirmación al email.
     *     tags: [Auth]
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RegisterRequest'
     *     responses:
     *       201:
     *         description: Cuenta creada. Se envió código de confirmación al email.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       400:
     *         description: Datos inválidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     *       409:
     *         description: Email o número de documento ya registrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      "/register",
      validateSchema(RegisterSchema),
      this.authController.register,
    );

    /**
     * @openapi
     * /api/auth/confirm-account:
     *   post:
     *     summary: Confirmar cuenta con código de 6 caracteres
     *     tags: [Auth]
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/TokenBody'
     *     responses:
     *       200:
     *         description: Cuenta confirmada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       400:
     *         description: Token inválido o expirado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      "/confirm-account",
      validateSchema(UserConfirmationSchema),
      this.authController.confirmAccount,
    );

    /**
     * @openapi
     * /api/auth/login:
     *   post:
     *     summary: Login con email y password
     *     description: La cuenta debe estar confirmada previamente.
     *     tags: [Auth]
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       200:
     *         description: Login exitoso — retorna JWT y datos del usuario
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/LoginResponse'
     *       401:
     *         description: Credenciales inválidas o cuenta no confirmada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       429:
     *         description: Demasiados intentos — rate limit superado
     */
    this.router.post(
      "/login",
      validateSchema(UserLoginSchema),
      this.authMiddleware.isConfirmed,
      this.authController.login,
    );

    /**
     * @openapi
     * /api/auth/forgot-password:
     *   post:
     *     summary: Solicitar recuperación de contraseña
     *     description: Envía un token al email del usuario para reestablecer la contraseña.
     *     tags: [Auth]
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/EmailBody'
     *     responses:
     *       200:
     *         description: Email enviado (si la cuenta existe)
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       404:
     *         description: Email no registrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      "/forgot-password",
      validateSchema(ForgotPasswordSchema),
      this.authMiddleware.isConfirmed,
      this.authController.forgotPassword,
    );

    /**
     * @openapi
     * /api/auth/reset-password/{token}:
     *   post:
     *     summary: Reestablecer contraseña con token recibido por email
     *     tags: [Auth]
     *     security: []
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *           minLength: 6
     *           maxLength: 6
     *         description: Código de 6 caracteres enviado al email
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ResetPasswordBody'
     *     responses:
     *       200:
     *         description: Contraseña actualizada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       400:
     *         description: Token inválido o expirado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      "/reset-password/:token",
      validateSchema(ResetPasswordSchema),
      this.authController.resetPasswordWithToken,
    );

    /**
     * @openapi
     * /api/auth/validate-token:
     *   post:
     *     summary: Verificar que un token de recuperación sea válido
     *     description: Útil para validar el token antes de mostrar el formulario de nueva contraseña.
     *     tags: [Auth]
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/TokenBody'
     *     responses:
     *       200:
     *         description: Token válido
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       400:
     *         description: Token inválido o expirado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      "/validate-token",
      validateSchema(ValidateTokenSchema),
      this.authController.validateToken,
    );

    // ========================================================================
    // Rutas privadas — requieren JWT en header Authorization
    // ========================================================================

    /**
     * @openapi
     * /api/auth/user:
     *   get:
     *     summary: Obtener el usuario autenticado
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: Datos del usuario
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       401:
     *         description: No autenticado o token inválido
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get(
      "/user",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.authController.getUser,
    );

    /**
     * @openapi
     * /api/auth/reset-auth-password:
     *   post:
     *     summary: Cambiar la contraseña del usuario autenticado
     *     description: Requiere la contraseña actual. La nueva debe ser distinta.
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdatePasswordBody'
     *     responses:
     *       200:
     *         description: Contraseña actualizada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       400:
     *         description: Datos inválidos (la nueva contraseña no puede ser igual a la actual)
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     *       401:
     *         description: Contraseña actual incorrecta o no autenticado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      "/reset-auth-password",
      validateSchema(UpdatePasswordSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.authController.resetAuthenticatedUserPassword,
    );

    /**
     * @openapi
     * /api/auth/check-password:
     *   post:
     *     summary: Verificar la contraseña del usuario autenticado
     *     description: Útil para confirmar identidad antes de operaciones sensibles.
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CheckPasswordBody'
     *     responses:
     *       200:
     *         description: Contraseña correcta
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MessageResponse'
     *       401:
     *         description: Contraseña incorrecta o no autenticado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      "/check-password",
      validateSchema(CheckAuthUserPasswordSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.authController.checkPasswordDB,
    );
  }
}
