import { Router } from "express";
import { ProjectController, upload } from "../controllers/project.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { RoleMiddleware } from "../common/middleware/RoleMiddleware";

export class ProjectRoutes {
    public router: Router;
    private controller: ProjectController;
    private authMiddleware: AuthMiddleware;
    private roleMiddleware: RoleMiddleware;

    constructor() {
        this.router = Router();
        this.controller = new ProjectController();
        this.authMiddleware = new AuthMiddleware();
        this.roleMiddleware = new RoleMiddleware();
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

        // Get statuses (for review form - any authenticated user)
        this.router.get("/statuses",
            this.authMiddleware.isAuthenticatedUser,
            this.controller.getStatuses
        );

        // HELPER ENDPOINTS FOR FORMS

        // Get form data (modalities, statuses, programs)
        this.router.get("/form-data",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isPrivilegedUser,
            this.controller.getFormData
        );

        // Get available students
        this.router.get("/students",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isPrivilegedUser,
            this.controller.getAvailableStudents
        );

        // Get available advisors
        this.router.get("/advisors",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isPrivilegedUser,
            this.controller.getAvailableAdvisors
        );

        // Get dashboard statistics (Privileged - Admin)
        this.router.get("/stats/dashboard",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isPrivilegedUser,
            this.controller.getDashboardStats
        );

        // Get dashboard statistics for teachers/directors (Non-student roles)
        this.router.get("/stats/teacher-dashboard",
            this.authMiddleware.isAuthenticatedUser,
            this.controller.getTeacherDashboardStats
        );

        // CRUD OPERATIONS (Privileged users only)

        // Get ALL projects (Privileged)
        this.router.get("/admin/all",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isPrivilegedUser,
            this.controller.getAllProjects
        );

        // Create project (Privileged)
        this.router.post("/admin",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isPrivilegedUser,
            this.controller.createProject
        );

        // Get project detail (Privileged)
        this.router.get("/admin/:id",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isPrivilegedUser,
            this.controller.getProjectById
        );

        // Update project (Privileged)
        this.router.put("/admin/:id",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isPrivilegedUser,
            this.controller.updateProject
        );

        // Delete project (Privileged)
        this.router.delete("/admin/:id",
            this.authMiddleware.isAuthenticatedUser,
            this.roleMiddleware.isPrivilegedUser,
            this.controller.deleteProject
        );
    }
}
