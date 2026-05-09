import { Router } from "express";
import {
  ProyeccionSocialController,
  proyeccionSocialUpload,
} from "./socialProjection.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { RoleMiddleware } from "../common/middleware/RoleMiddleware";
import { validateSchema } from "../common/middleware/validateSchema";
import {
  CreateSocialProjectionSchema,
  DownloadByIdSocialProjectionSchema,
  DownloadByNameSocialProjectionSchema,
  SearchSocialProjectionSchema,
  CreateManualSocialProjectionSchema,
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
    // Get all projects (Coordinators/Deans — role check done in frontend)
    this.router.get(
      "/",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getAll,
    );

    // Get user's projects
    this.router.get(
      "/me",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getByUser,
    );

    // CREA AQUI EL POST PARA CREAR UNA NUEVA PROYECCION SOCIAL.

    this.router.get(
      "/search",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      validateSchema(SearchSocialProjectionSchema),
      this.controller.searchByName,
    );

    // POST /manual - Create new social projection project manually
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

    // POST / - Create new Proyeccion social DE ARCHIVO EXCEL
    // Order: authMiddleware → roleMiddleware → multer → validateSchema → controller
    this.router.post(
      "/",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.hasAnyRole(
        ALLOWED_ROLES,
        "Solo Profesores/Directores o Coordinadores pueden registrar este documento",
      ),
      proyeccionSocialUpload.single("archivo"),
      // validateSchema(CreateSocialProjectionSchema),
      this.controller.create,
    );

    this.router.get(
      "/by-name/:nombre/download",
      this.authMiddleware.isAuthenticatedUser,
      validateSchema(DownloadByNameSocialProjectionSchema),
      this.controller.downloadByName,
    );

    this.router.get(
      "/:id/download",
      this.authMiddleware.isAuthenticatedUser,
      validateSchema(DownloadByIdSocialProjectionSchema),
      this.controller.downloadById,
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
  }
}
