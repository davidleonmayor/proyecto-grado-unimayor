import { Router } from "express";
import { AnnouncementController } from "./announcement.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { RoleMiddleware } from "../common/middleware/RoleMiddleware";

export class AnnouncementRoutes {
  public router: Router;
  private controller: AnnouncementController;
  private authMiddleware: AuthMiddleware;
  private roleMiddleware: RoleMiddleware;

  constructor() {
    this.router = Router();
    this.controller = new AnnouncementController();
    this.authMiddleware = new AuthMiddleware();
    this.roleMiddleware = new RoleMiddleware();
    this.initRoutes();
  }

  public initRoutes() {
    // GET all announcements (all authenticated users)
    this.router.get(
      "/",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getAnnouncements,
    );

    // POST create announcement (admin/dean only)
    this.router.post(
      "/",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.createAnnouncement,
    );

    // POST mark as read (any authenticated user)
    this.router.post(
      "/:id/read",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.markAsRead,
    );

    // DELETE announcement (admin/dean only)
    this.router.delete(
      "/:id",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.deleteAnnouncement,
    );
  }
}
