import { Router } from "express";
import { AnnouncementController } from "../controllers/announcement.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { RoleMiddleware } from "../common/middleware/RoleMiddleware";

export class AnnouncementRoutes {
    public router: Router;
    private announcementController: AnnouncementController;
    private authMiddleware: AuthMiddleware;
    private roleMiddleware: RoleMiddleware;

    constructor() {
        this.router = Router();
        this.announcementController = new AnnouncementController();
        this.authMiddleware = new AuthMiddleware();
        this.roleMiddleware = new RoleMiddleware();
        this.initRoutes();
    }

    private initRoutes() {
        // Todas las rutas de anuncios requieren autenticación
        this.router.use(this.authMiddleware.isAuthenticatedUser);

        // Obtener anuncios (Para todos los usuarios)
        this.router.get(
            "/",
            this.announcementController.getAnnouncements
        );

        // Marcar un anuncio como leído (Para todos los usuarios)
        this.router.post(
            "/:id/read",
            this.announcementController.markAsRead
        );

        // Crear un anuncio (Solo Coordinadores)
        this.router.post(
            "/",
            this.roleMiddleware.isCoordinator,
            this.announcementController.createAnnouncement
        );

        // Eliminar un anuncio (Solo Coordinadores)
        this.router.delete(
            "/:id",
            this.roleMiddleware.isCoordinator,
            this.announcementController.deleteAnnouncement
        );
    }
}
