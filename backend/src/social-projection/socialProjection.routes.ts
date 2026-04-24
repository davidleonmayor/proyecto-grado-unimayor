import { Router } from "express";
import {
  ProyeccionSocialController,
  proyeccionSocialUpload,
} from "./socialProjection.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { validateSchema } from "../common/middleware/validateSchema";
import {
  CreateSocialProjectionSchema,
  DownloadByIdSocialProjectionSchema,
  DownloadByNameSocialProjectionSchema,
  SearchSocialProjectionSchema,
} from "./socialProjection.schema";

export class ProyeccionSocialRoutes {
  public router: Router;
  private controller: ProyeccionSocialController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.controller = new ProyeccionSocialController();
    this.authMiddleware = new AuthMiddleware();
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get(
      "/search",
      validateSchema(SearchSocialProjectionSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.controller.searchByName,
    );

    this.router.post(
      "/",
      this.authMiddleware.isAuthenticatedUser,
      proyeccionSocialUpload.single("archivo"),
      validateSchema(CreateSocialProjectionSchema),
      this.controller.create,
    );

    this.router.get(
      "/by-name/:nombre/download",
      validateSchema(DownloadByNameSocialProjectionSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.controller.downloadByName,
    );

    this.router.get(
      "/:id/download",
      validateSchema(DownloadByIdSocialProjectionSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.controller.downloadById,
    );
  }
}
