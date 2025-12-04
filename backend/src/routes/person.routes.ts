import { Router } from "express";
import { PersonController } from "../controllers/person.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { RoleMiddleware } from "../common/middleware/RoleMiddleware";

export class PersonRoutes {
    public router: Router;
    private controller: PersonController;
    private authMiddleware: AuthMiddleware;
    private roleMiddleware: RoleMiddleware;

    constructor() {
        this.router = Router();
        this.controller = new PersonController();
        this.authMiddleware = new AuthMiddleware();
        this.roleMiddleware = new RoleMiddleware();
        this.initRoutes();
    }

    public initRoutes() {
        // Get all teachers (Protected - privileged users)
        this.router.get(
            "/teachers",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isPrivilegedUser,
            this.controller.getTeachers
        );

        // Get all students (Protected - privileged users)
        this.router.get(
            "/students",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isPrivilegedUser,
            this.controller.getStudents
        );

        // Get person by ID (Protected - all authenticated users)
        this.router.get(
            "/:id",
            this.authMiddleware.isAuthenticatedUser,
            this.controller.getPersonById
        );
    }
}

