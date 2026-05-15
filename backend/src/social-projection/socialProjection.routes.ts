import { Router } from "express";
import {
  ProyeccionSocialController,
  anexoUpload,
} from "./socialProjection.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { RoleMiddleware } from "../common/middleware/RoleMiddleware";
import { validateSchema } from "../common/middleware/validateSchema";
import {
  SearchSocialProjectionSchema,
  CreateManualSocialProjectionSchema,
  UploadAnexoSchema,
} from "./socialProjection.schema";

// Roles allowed to create social projection projects
const ALLOWED_ROLES = [
  "Director",
  "Profesor",
  "Profesores/Directores",
  "Coordinador",
  "Coordinador de Carrera",
];

export class ProyeccionSocialRoutes {
  public router: Router;
  private controller: ProyeccionSocialController;
  private authMiddleware: AuthMiddleware;
  private roleMiddleware: RoleMiddleware;

  constructor() {
    this.router = Router();
    this.controller = new ProyeccionSocialController();
    this.authMiddleware = new AuthMiddleware();
    this.roleMiddleware = new RoleMiddleware();
    this.initRoutes();
  }

  public initRoutes() {
    // ========================================================================
    // Dashboard — KPIs agregados de proyección social (totales, por estado, etc.)
    // ========================================================================
    this.router.get(
      "/dashboard",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getDashboardStats,
    );

    // ========================================================================
    // CRUD del proyecto de proyección social
    // Las rutas con path fijo (/, /me, /search, /manual) deben declararse
    // ANTES que las paramétricas (/:id) para que Express no las capture.
    // ========================================================================
    this.router.get(
      "/",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getAll,
    );

    this.router.get(
      "/me",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getByUser,
    );

    this.router.get(
      "/search",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      validateSchema(SearchSocialProjectionSchema),
      this.controller.searchByName,
    );

    this.router.post(
      "/manual",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.hasAnyRole(
        ALLOWED_ROLES,
        "Solo Profesores/Directores o Coordinadores pueden registrar este documento",
      ),
      validateSchema(CreateManualSocialProjectionSchema),
      this.controller.createManual,
    );

    this.router.get(
      "/:id",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getById,
    );

    this.router.put(
      "/:id",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.hasAnyRole(ALLOWED_ROLES),
      this.controller.update,
    );

    this.router.delete(
      "/:id",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.hasAnyRole(ALLOWED_ROLES),
      this.controller.delete,
    );

    // ========================================================================
    // Anexos — sub-recurso 1:N de cada proyecto (PDF, Word, Excel)
    // ========================================================================
    this.router.post(
      "/:id/anexos",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.hasAnyRole(ALLOWED_ROLES),
      anexoUpload.single("archivo"),
      validateSchema(UploadAnexoSchema),
      this.controller.uploadAnexo,
    );

    this.router.get(
      "/:id/anexos",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getAnexos,
    );

    this.router.get(
      "/:id/anexos/:anexoId/download",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.downloadAnexo,
    );

    this.router.delete(
      "/:id/anexos/:anexoId",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.hasAnyRole(ALLOWED_ROLES),
      this.controller.deleteAnexo,
    );
  }
}
