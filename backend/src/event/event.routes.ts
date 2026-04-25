import { Router } from "express";
import { EventController } from "./event.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { RoleMiddleware } from "../common/middleware/RoleMiddleware";
import { validateSchema } from "../common/middleware/validateSchema";
import {
    CreateEventSchema,
    DeleteEventSchema,
    GetEventsSchema,
    UpdateEventSchema,
} from "./event.schema";

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
            validateSchema(GetEventsSchema),
            this.authMiddleware.isAuthenticatedUser,
            this.controller.getEvents
        );

        // Create event (Protected - coordinator only)
        this.router.post(
            "/",
            validateSchema(CreateEventSchema),
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isCoordinator,
            this.controller.createEvent
        );

        // Update event (Protected - coordinator only)
        this.router.put(
            "/:id",
            validateSchema(UpdateEventSchema),
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isCoordinator,
            this.controller.updateEvent
        );

        // Delete event (Protected - coordinator only)
        this.router.delete(
            "/:id",
            validateSchema(DeleteEventSchema),
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isCoordinator,
            this.controller.deleteEvent
        );
    }
}

