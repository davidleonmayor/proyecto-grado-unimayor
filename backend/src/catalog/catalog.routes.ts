import { Router } from "express";
import { CatalogController } from "./catalog.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";

export class CatalogRoutes {
  public router: Router;
  private controller: CatalogController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.controller = new CatalogController();
    this.authMiddleware = new AuthMiddleware();
    this.initRoutes();
  }

  public initRoutes() {
    // ========================================================================
    // Catálogos compartidos — listas planas de entidades de referencia
    // (facultades, programas académicos). Útil para llenar dropdowns.
    // ========================================================================

    /**
     * @openapi
     * /api/catalog/facultades:
     *   get:
     *     summary: Listar todas las facultades
     *     tags: [Catalog]
     *     responses:
     *       200:
     *         description: Lista de facultades
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id_facultad: { type: string }
     *                   nombre_facultad: { type: string }
     *                   codigo_facultad: { type: string }
     *       401: { description: No autenticado }
     */
    this.router.get(
      "/facultades",
      this.authMiddleware.isAuthenticatedUser,
      this.controller.getFacultades,
    );

    /**
     * @openapi
     * /api/catalog/programas:
     *   get:
     *     summary: Listar programas académicos (opcionalmente filtrados por facultad)
     *     tags: [Catalog]
     *     parameters:
     *       - in: query
     *         name: id_facultad
     *         required: false
     *         schema: { type: string }
     *         description: Si se envía, devuelve solo programas de esa facultad
     *     responses:
     *       200:
     *         description: Lista de programas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id_programa: { type: string }
     *                   nombre_programa: { type: string }
     *                   id_facultad: { type: string }
     *                   nombre_facultad: { type: string, nullable: true }
     *       401: { description: No autenticado }
     */
    this.router.get(
      "/programas",
      this.authMiddleware.isAuthenticatedUser,
      this.controller.getProgramas,
    );

    /**
     * @openapi
     * /api/catalog/lineas-accion:
     *   get:
     *     summary: Listar líneas de acción disponibles
     *     tags: [Catalog]
     *     responses:
     *       200:
     *         description: Lista de líneas de acción
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id_linea_accion: { type: string }
     *                   nombre: { type: string }
     *       401: { description: No autenticado }
     */
    this.router.get(
      "/lineas-accion",
      this.authMiddleware.isAuthenticatedUser,
      this.controller.getLineasAccion,
    );

    /**
     * @openapi
     * /api/catalog/estudiantes:
     *   get:
     *     summary: Listar estudiantes filtrados por facultad
     *     description: Devuelve personas confirmadas. Útil para seleccionar proponentes de proyectos.
     *     tags: [Catalog]
     *     parameters:
     *       - in: query
     *         name: id_facultad
     *         required: false
     *         schema: { type: string }
     *         description: Filtra estudiantes por facultad. Sin este parámetro devuelve todos.
     *     responses:
     *       200:
     *         description: Lista de estudiantes
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id: { type: string }
     *                   name: { type: string }
     *                   email: { type: string }
     *                   document: { type: string }
     *       401: { description: No autenticado }
     */
    this.router.get(
      "/estudiantes",
      this.authMiddleware.isAuthenticatedUser,
      this.controller.getEstudiantes,
    );
  }
}
