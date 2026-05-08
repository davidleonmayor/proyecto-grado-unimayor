import { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { logger } from "../config";
import { ProyeccionSocialService } from "./socialProjection.service";

const allowedExcelMimeTypes = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);

const storage = multer.memoryStorage();

const excelFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const isExcel =
    allowedExcelMimeTypes.has(file.mimetype) ||
    file.originalname.toLowerCase().endsWith(".xlsx") ||
    file.originalname.toLowerCase().endsWith(".xls");

  if (!isExcel) {
    return cb(new Error("Solo se permiten archivos Excel (.xlsx o .xls)."));
  }

  cb(null, true);
};

export const proyeccionSocialUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: excelFileFilter,
});

export class ProyeccionSocialController {
  private service: ProyeccionSocialService;

  constructor() {
    this.service = new ProyeccionSocialService();
  }

  create = async (req: Request, res: Response) => {
    try {
      // req.user is guaranteed to exist - middleware handled auth
      // req.body.nombre is guaranteed to exist and valid - schema validated it
      // req.body.descripcion is guaranteed to be valid if present - schema validated it
      // req.file is guaranteed to exist - schema validated it (archivo custom validator)
      // Role check: handled by ProyeccionSocialRoleMiddleware (router)

      const userId = req.user!.id_persona;
      const file = req.file;

      // Fallback defensive check (tests call controller directly without middleware)
      if (!file) {
        return res
          .status(400)
          .json({ error: "El archivo Excel es obligatorio" });
      }

      const { nombre, descripcion } = req.body;

      const created = await this.service.create({
        nombre,
        descripcion,
        tipo_mime: file.mimetype,
        archivo: Buffer.from(file.buffer),
        id_persona_registra: userId,
      });

      return res.status(201).json({
        message: "Proyecto de proyección social registrado exitosamente",
        data: created,
      });
    } catch (error: any) {
      logger.error("Error creating social projection project:", error);
      return res.status(500).json({
        error: error.message || "Error interno del servidor",
      });
    }
  };

  downloadByName = async (req: Request, res: Response) => {
    try {
      // req.params.nombre is guaranteed to exist and valid - schema validated it
      const rawName = req.params.nombre;
      const nombre = typeof rawName === "string" ? rawName.trim() : "";

      // Fallback defensive check (tests call controller directly without middleware)
      if (!nombre) {
        return res
          .status(400)
          .json({ error: "El parámetro nombre es obligatorio" });
      }

      const record = await this.service.findByName(nombre);

      if (!record?.archivo) {
        return res
          .status(404)
          .json({ error: "No se encontró archivo para el nombre indicado" });
      }

      const extension =
        record.tipo_mime === "application/vnd.ms-excel" ? ".xls" : ".xlsx";

      const safeBaseName = record.nombre
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_\-]/g, "");

      const downloadName = `${safeBaseName || "proyeccion_social"}_${record.fecha_registro
        .toISOString()
        .slice(0, 10)}${extension}`;

      res.setHeader(
        "Content-Type",
        record.tipo_mime ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${downloadName}"`,
      );
      return res.send(record.archivo);
    } catch (error: any) {
      logger.error("Error downloading social projection file by name:", error);
      return res.status(500).json({
        error: error.message || "Error interno del servidor",
      });
    }
  };

  searchByName = async (req: Request, res: Response) => {
    try {
      // req.query.nombre is guaranteed to exist and valid - schema validated it
      // req.query.limit is guaranteed to be valid - schema validated it
      const rawNombre = req.query.nombre;
      const nombre = typeof rawNombre === "string" ? rawNombre.trim() : "";
      const rawLimit = req.query.limit;
      const parsedLimit = Number(rawLimit);
      const limit = Number.isFinite(parsedLimit)
        ? Math.min(Math.max(parsedLimit, 1), 100)
        : 20;

      // Fallback defensive check (tests call controller directly without middleware)
      if (!nombre) {
        return res.status(400).json({
          error: "El parámetro de consulta 'nombre' es obligatorio",
        });
      }

      const records = await this.service.searchByName(nombre, limit);

      return res.status(200).json({
        total: records.length,
        items: records,
      });
    } catch (error: any) {
      logger.error("Error searching social projection files by name:", error);
      return res.status(500).json({
        error: error.message || "Error interno del servidor",
      });
    }
  };

  downloadById = async (req: Request, res: Response) => {
    try {
      // req.params.id is guaranteed to exist and valid - schema validated it
      const { id } = req.params;

      // Fallback defensive check (tests call controller directly without middleware)
      if (!id || !id.trim()) {
        return res
          .status(400)
          .json({ error: "El parámetro id es obligatorio" });
      }

      const record = await this.service.findById(id.trim());

      if (!record?.archivo) {
        return res.status(404).json({ error: "Archivo no encontrado" });
      }

      const extension =
        record.tipo_mime === "application/vnd.ms-excel" ? ".xls" : ".xlsx";

      const safeBaseName = record.nombre
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_\-]/g, "");

      const downloadName = `${safeBaseName || "proyeccion_social"}_${record.fecha_registro
        .toISOString()
        .slice(0, 10)}${extension}`;

      res.setHeader(
        "Content-Type",
        record.tipo_mime ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${downloadName}"`,
      );
      return res.send(record.archivo);
    } catch (error: any) {
      logger.error("Error downloading social projection file by id:", error);
      return res.status(500).json({
        error: error.message || "Error interno del servidor",
      });
    }
  };
}
