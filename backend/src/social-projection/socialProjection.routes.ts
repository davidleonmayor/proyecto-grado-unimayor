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

    /**
     * @openapi
     * /api/proyeccion-social/dashboard:
     *   get:
     *     summary: KPIs del dashboard de proyección social
     *     tags: [ProyeccionSocial]
     *     responses:
     *       200:
     *         description: Estadísticas agregadas
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/DashboardStats' }
     *       401: { description: No autenticado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     */
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

    /**
     * @openapi
     * /api/proyeccion-social:
     *   get:
     *     summary: Listar todos los proyectos de proyección social
     *     tags: [ProyeccionSocial]
     *     responses:
     *       200:
     *         description: Lista completa
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ProyeccionSocialList' }
     *       401: { description: No autenticado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     */
    this.router.get(
      "/",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getAll,
    );

    /**
     * @openapi
     * /api/proyeccion-social/me:
     *   get:
     *     summary: Proyectos del usuario autenticado
     *     description: Proyectos donde el usuario aparece como integrante o como registrante.
     *     tags: [ProyeccionSocial]
     *     responses:
     *       200:
     *         description: Proyectos del usuario
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ProyeccionSocialList' }
     *       401: { description: No autenticado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     */
    this.router.get(
      "/me",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getByUser,
    );

    /**
     * @openapi
     * /api/proyeccion-social/search:
     *   get:
     *     summary: Buscar proyectos por nombre
     *     tags: [ProyeccionSocial]
     *     parameters:
     *       - in: query
     *         name: nombre
     *         required: true
     *         schema:
     *           type: string
     *           minLength: 1
     *           maxLength: 200
     *         description: Texto a buscar dentro del nombre del proyecto
     *       - in: query
     *         name: limit
     *         required: false
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 20
     *     responses:
     *       200:
     *         description: Resultados de búsqueda
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ProyeccionSocialList' }
     *       400: { description: Parámetros inválidos, content: { application/json: { schema: { $ref: '#/components/schemas/ValidationError' } } } }
     *       401: { description: No autenticado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     */
    this.router.get(
      "/search",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      validateSchema(SearchSocialProjectionSchema),
      this.controller.searchByName,
    );

    /**
     * @openapi
     * /api/proyeccion-social/manual:
     *   post:
     *     summary: Crear un proyecto manualmente (con estudiantes y docentes)
     *     description: Solo Profesores/Directores o Coordinadores. Requiere al menos 1 estudiante y 1 docente.
     *     tags: [ProyeccionSocial]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema: { $ref: '#/components/schemas/CreateManualProyeccionSocialRequest' }
     *     responses:
     *       201:
     *         description: Proyecto creado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message: { type: string }
     *                 data: { $ref: '#/components/schemas/ProyeccionSocialDetail' }
     *       400: { description: Datos inválidos, content: { application/json: { schema: { $ref: '#/components/schemas/ValidationError' } } } }
     *       401: { description: No autenticado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     *       403: { description: Rol insuficiente, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     */
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

    /**
     * @openapi
     * /api/proyeccion-social/{id}:
     *   get:
     *     summary: Detalle de un proyecto (incluye integrantes)
     *     tags: [ProyeccionSocial]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *         description: CUID del proyecto
     *     responses:
     *       200:
     *         description: Proyecto encontrado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ProyeccionSocialDetail' }
     *       404: { description: Proyecto no encontrado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     *       401: { description: No autenticado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     */
    this.router.get(
      "/:id",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getById,
    );

    /**
     * @openapi
     * /api/proyeccion-social/{id}:
     *   put:
     *     summary: Actualizar un proyecto de proyección social
     *     description: Solo Profesores/Directores o Coordinadores. Si se envían `estudiantes` y `docentes`, reemplaza los integrantes.
     *     tags: [ProyeccionSocial]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               nombre: { type: string, maxLength: 200 }
     *               descripcion: { type: string, nullable: true, maxLength: 2000 }
     *               personas_impactadas: { type: integer, minimum: 0 }
     *               estado: { type: string }
     *               estudiantes:
     *                 type: array
     *                 items: { type: string, description: CUID }
     *               docentes:
     *                 type: array
     *                 items: { type: string, description: CUID }
     *     responses:
     *       200:
     *         description: Proyecto actualizado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message: { type: string }
     *                 data: { $ref: '#/components/schemas/ProyeccionSocialItem' }
     *       401: { description: No autenticado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     *       403: { description: Rol insuficiente, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     */
    this.router.put(
      "/:id",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.hasAnyRole(ALLOWED_ROLES),
      this.controller.update,
    );

    /**
     * @openapi
     * /api/proyeccion-social/{id}:
     *   delete:
     *     summary: Eliminar un proyecto de proyección social
     *     description: Elimina también los integrantes y anexos asociados (cascade).
     *     tags: [ProyeccionSocial]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: Eliminado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/MessageResponse' }
     *       404: { description: Proyecto no encontrado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     *       403: { description: Rol insuficiente, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     *       401: { description: No autenticado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     */
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

    /**
     * @openapi
     * /api/proyeccion-social/{id}/anexos:
     *   post:
     *     summary: Subir un anexo (PDF, Word o Excel) al proyecto
     *     description: Solo Profesores/Directores o Coordinadores. Max 20 MB.
     *     tags: [ProyeccionSocial]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required: [archivo]
     *             properties:
     *               archivo:
     *                 type: string
     *                 format: binary
     *                 description: PDF, .doc/.docx o .xls/.xlsx
     *     responses:
     *       201:
     *         description: Anexo subido
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message: { type: string }
     *                 data: { $ref: '#/components/schemas/Anexo' }
     *       400: { description: Archivo inválido o ausente, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     *       401: { description: No autenticado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     *       403: { description: Rol insuficiente, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     */
    this.router.post(
      "/:id/anexos",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.hasAnyRole(ALLOWED_ROLES),
      anexoUpload.single("archivo"),
      validateSchema(UploadAnexoSchema),
      this.controller.uploadAnexo,
    );

    /**
     * @openapi
     * /api/proyeccion-social/{id}/anexos:
     *   get:
     *     summary: Listar anexos de un proyecto
     *     tags: [ProyeccionSocial]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: Lista de anexos
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items: { $ref: '#/components/schemas/Anexo' }
     *       401: { description: No autenticado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     */
    this.router.get(
      "/:id/anexos",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.getAnexos,
    );

    /**
     * @openapi
     * /api/proyeccion-social/{id}/anexos/{anexoId}/download:
     *   get:
     *     summary: Descargar un anexo
     *     tags: [ProyeccionSocial]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *       - in: path
     *         name: anexoId
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: Archivo binario del anexo
     *         content:
     *           application/octet-stream:
     *             schema: { type: string, format: binary }
     *       404: { description: Anexo no encontrado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     *       401: { description: No autenticado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     */
    this.router.get(
      "/:id/anexos/:anexoId/download",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.controller.downloadAnexo,
    );

    /**
     * @openapi
     * /api/proyeccion-social/{id}/anexos/{anexoId}:
     *   delete:
     *     summary: Eliminar un anexo
     *     tags: [ProyeccionSocial]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *       - in: path
     *         name: anexoId
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: Anexo eliminado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/MessageResponse' }
     *       403: { description: Rol insuficiente, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     *       401: { description: No autenticado, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
     */
    this.router.delete(
      "/:id/anexos/:anexoId",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.hasAnyRole(ALLOWED_ROLES),
      this.controller.deleteAnexo,
    );
  }
}
