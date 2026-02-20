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
        // public routes
        this.router.post(
            "/register",
            validateSchema(RegisterSchema),
            this.authController.register,
        );
        // don't use get because we don't want splited data in the url var
        this.router.post(
            "/confirm-account",
            validateSchema(UserConfirmationSchema),
            this.authController.confirmAccount,
        );
        this.router.post(
            "/login",
            validateSchema(UserLoginSchema),
            this.authController.login,
        );

        this.router.post(
            "/forgot-password",
            validateSchema(ForgotPasswordSchema),
            this.authController.forgotPassword,
        );
        this.router.post(
            "/validate-token",
            validateSchema(ValidateTokenSchema),
            this.authController.validateToken,
        );
        this.router.post(
            "/reset-password/:token",
            validateSchema(ResetPasswordSchema),
            this.authController.resetPasswordWithToken,
        );

        /*      privates routes       */
        this.router.get(
            "/user",
            this.authMiddleware.isAuthenticatedUser,
            this.authController.getUser,
        );
        this.router.post(
            "/reset-auth-password",
            validateSchema(UpdatePasswordSchema),
            this.authMiddleware.isAuthenticatedUser,
            this.authController.updateCurrentUserPassword,
        );
        this.router.post(
            "/check-password",
            validateSchema(CheckAuthUserPasswordSchema),
            this.authMiddleware.isAuthenticatedUser,
            this.authController.checkPasswordDB,
        );
    }
}
