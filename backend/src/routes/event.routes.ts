import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { RoleMiddleware } from "../common/middleware/RoleMiddleware";

export class EventRoutes {
    public router: Router;
    private controller: EventController;
    private authMiddleware: AuthMiddleware;
    private roleMiddleware: RoleMiddleware;

    constructor() {
        this.router = Router();
        this.controller = new EventController();
        this.authMiddleware = new AuthMiddleware();
        this.roleMiddleware = new RoleMiddleware();
        this.initRoutes();
    }

    public initRoutes() {
        // Get all events (Protected - all authenticated users)
        this.router.get(
            "/",
            this.authMiddleware.isAuthenticatedUser,
            this.controller.getEvents
        );

        // Create event (Protected - coordinator only)
        this.router.post(
            "/",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isCoordinator,
            this.controller.createEvent
        );

        // Update event (Protected - coordinator only)
        this.router.put(
            "/:id",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isCoordinator,
            this.controller.updateEvent
        );

        // Delete event (Protected - coordinator only)
        this.router.delete(
            "/:id",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isCoordinator,
            this.controller.deleteEvent
        );
    }
}

