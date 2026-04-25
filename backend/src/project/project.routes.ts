import { Router } from "express";
import { ProjectController, upload, excelUpload } from "./project.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { RoleMiddleware } from "../common/middleware/RoleMiddleware";
import { validateSchema } from "../common/middleware/validateSchema";
import {
  BulkUploadProjectsSchema,
  CreateIterationSchema,
  CreateProjectSchema,
  DeleteProjectSchema,
  DownloadBulkTemplateSchema,
  DownloadProjectHistoryFileSchema,
  GetAllProjectsSchema,
  GetAvailableAdvisorsSchema,
  GetAvailableStudentsSchema,
  GetDashboardStatsSchema,
  GetFormDataSchema,
  GetProjectByIdSchema,
  GetProjectHistorySchema,
  GetProjectsSchema,
  GetStatusesSchema,
  GetTeacherDashboardStatsSchema,
  ReviewIterationSchema,
  UpdateProjectSchema,
} from "./project.schema";

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
    this.router.get(
      "/",
      validateSchema(GetProjectsSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.controller.getProjects,
    );

    // Get project history (Protected)
    this.router.get(
      "/:id/history",
      validateSchema(GetProjectHistorySchema),
      this.authMiddleware.isAuthenticatedUser,
      this.controller.getProjectHistory,
    );

    // Student: Create iteration (upload file) (Protected)
    this.router.post(
      "/:id/iteration",
      this.authMiddleware.isAuthenticatedUser,
      upload.single("file"),
      validateSchema(CreateIterationSchema),
      this.controller.createIteration,
    );

    // Privileged: Review iteration (Protected) - with optional file upload
    this.router.post(
      "/:id/review",
      this.authMiddleware.isAuthenticatedUser,
      upload.single("file"), // File is optional for reviews
      validateSchema(ReviewIterationSchema),
      this.controller.reviewIteration,
    );

    // Download file (Protected)
    this.router.get(
      "/history/:historyId/download",
      validateSchema(DownloadProjectHistoryFileSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.controller.downloadFile,
    );

    // Get statuses (for review form - any authenticated user)
    this.router.get(
      "/statuses",
      validateSchema(GetStatusesSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.controller.getStatuses,
    );

    // HELPER ENDPOINTS FOR FORMS

    // Get form data (modalities, statuses, programs)
    this.router.get(
      "/form-data",
      validateSchema(GetFormDataSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.getFormData,
    );

    // Get available students
    this.router.get(
      "/students",
      validateSchema(GetAvailableStudentsSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.getAvailableStudents,
    );

    // Get available advisors
    this.router.get(
      "/advisors",
      validateSchema(GetAvailableAdvisorsSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.getAvailableAdvisors,
    );

    // Get dashboard statistics (Privileged - Admin)
    this.router.get(
      "/stats/dashboard",
      validateSchema(GetDashboardStatsSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.getDashboardStats,
    );

    // Get dashboard statistics for teachers/directors (Non-student roles)
    this.router.get(
      "/stats/teacher-dashboard",
      validateSchema(GetTeacherDashboardStatsSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.controller.getTeacherDashboardStats,
    );

    // CRUD OPERATIONS (Privileged users only)

    // Get ALL projects (Privileged)
    this.router.get(
      "/admin/all",
      validateSchema(GetAllProjectsSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.getAllProjects,
    );

    // Create project (Only Directors/Professors)
    this.router.post(
      "/admin",
      validateSchema(CreateProjectSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isDirectorOrProfessor,
      this.controller.createProject,
    );

    // Bulk upload projects via Excel (Privileged)
    this.router.post(
      "/admin/bulk-upload",
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isPrivilegedUser,
      excelUpload.single("file"),
      validateSchema(BulkUploadProjectsSchema),
      this.controller.bulkUploadProjects,
    );
    this.router.get(
      "/admin/bulk-template",
      validateSchema(DownloadBulkTemplateSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.downloadBulkTemplate,
    );

    // Get project detail (Privileged)
    this.router.get(
      "/admin/:id",
      validateSchema(GetProjectByIdSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.getProjectById,
    );

    // Update project (Privileged)
    this.router.put(
      "/admin/:id",
      validateSchema(UpdateProjectSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.updateProject,
    );

    // Delete project (Privileged)
    this.router.delete(
      "/admin/:id",
      validateSchema(DeleteProjectSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.deleteProject,
    );
  }
}
