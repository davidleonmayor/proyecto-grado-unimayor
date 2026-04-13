import { Router } from "express";
import {
    ProyeccionSocialController,
    proyeccionSocialUpload,
} from "../controllers/proyeccionSocial.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";

export class ProyeccionSocialRoutes {
    public router: Router;
    private controller: ProyeccionSocialController;
    private authMiddleware: AuthMiddleware;

    constructor() {
        this.router = Router();
        this.controller = new ProyeccionSocialController();
        this.authMiddleware = new AuthMiddleware();
        this.initRoutes();
    }

    public initRoutes() {
        this.router.post(
            "/",
            this.authMiddleware.isAuthenticatedUser,
            proyeccionSocialUpload.single("archivo"),
            this.controller.create,
        );
    }
}
