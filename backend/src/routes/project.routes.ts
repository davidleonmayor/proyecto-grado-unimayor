import { Router } from "express";
import { ProjectController, upload } from "../controllers/project.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";

export class ProjectRoutes {
    public router: Router;
    private controller: ProjectController;
    private authMiddleware: AuthMiddleware;

    constructor() {
        this.router = Router();
        this.controller = new ProjectController();
        this.authMiddleware = new AuthMiddleware();
        this.initRoutes();
    }

    public initRoutes() {

        // Get user's projects (Protected)
        this.router.get("/",
            this.authMiddleware.isAuthenticatedUser,
            this.controller.getProjects
        );

        // Get project history (Protected)
        this.router.get("/:id/history",
            this.authMiddleware.isAuthenticatedUser,
            this.controller.getProjectHistory
        );

        // Student: Create iteration (upload file) (Protected)
        this.router.post("/:id/iteration",
            this.authMiddleware.isAuthenticatedUser,
            upload.single("file"),
            this.controller.createIteration
        );

        // Privileged: Review iteration (Protected)
        this.router.post("/:id/review",
            this.authMiddleware.isAuthenticatedUser,
            this.controller.reviewIteration
        );

        // Download file (Protected)
        this.router.get("/history/:historyId/download",
            this.authMiddleware.isAuthenticatedUser,
            this.controller.downloadFile
        );
    }
}
