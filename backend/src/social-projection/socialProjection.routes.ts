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
    //
    this.router.get(
      "/",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.getAll,
    );

    this.router.get(
      "/search",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      validateSchema(SearchSocialProjectionSchema),
      this.controller.searchByName,
    );

    // POST / - Create new social projection project
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
  }
}
