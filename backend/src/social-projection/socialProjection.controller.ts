import { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { logger } from "../config";
import { ProyeccionSocialService } from "./socialProjection.service";

const allowedExcelMimeTypes = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);

const allowedAnexoMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

const anexoFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const ext = file.originalname.toLowerCase();
  const isAllowed =
    allowedAnexoMimeTypes.has(file.mimetype) ||
    ext.endsWith(".pdf") ||
    ext.endsWith(".doc") ||
    ext.endsWith(".docx") ||
    ext.endsWith(".xls") ||
    ext.endsWith(".xlsx");

  if (!isAllowed) {
    return cb(new Error("Solo se permiten archivos PDF, Word (.doc/.docx) o Excel (.xls/.xlsx)."));
  }

  cb(null, true);
};

export const proyeccionSocialUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: excelFileFilter,
});

export const anexoUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB para anexos
  fileFilter: anexoFileFilter,
});

export class ProyeccionSocialController {
  private service: ProyeccionSocialService;

  constructor() {
    this.service = new ProyeccionSocialService();
  }
  getAll = async (req: Request, res: Response) => {
    try {
      const records = await this.service.getAll();
      return res.status(200).json({
        total: records.length,
        items: records,
      });
    } catch (error: any) {
      logger.error("Error fetching all social projection records:", error);
      return res.status(500).json({
        error: error.message || "Error interno del servidor",
      });
    }
  };

  getByUser = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id_persona;
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }
      
      const records = await this.service.getByUser(userId);
      return res.status(200).json({
        total: records.length,
        items: records,
      });
    } catch (error: any) {
      logger.error("Error fetching user social projection records:", error);
      return res.status(500).json({
        error: error.message || "Error interno del servidor",
      });
    }
  };

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
        archivo: file.buffer as any,
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

  createManual = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id_persona;
      const { nombre, descripcion, personas_impactadas, estado, estudiantes, docentes } = req.body;

      const created = await this.service.createManual({
        nombre,
        descripcion,
        personas_impactadas,
        estado,
        id_persona_registra: userId,
        estudiantes,
        docentes,
      });

      return res.status(201).json({
        message: "Proyecto de proyección social registrado exitosamente",
        data: created,
      });
    } catch (error: any) {
      logger.error("[ProyeccionSocialService] Error creating manual project:", error);
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

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const record = await this.service.getById(id);

      if (!record) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      return res.status(200).json(record);
    } catch (error: any) {
      logger.error("Error fetching social projection project by id:", error);
      return res.status(500).json({
        error: error.message || "Error interno del servidor",
      });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, personas_impactadas, estado, estudiantes, docentes } = req.body;

      const updated = await this.service.update(id, { nombre, descripcion, personas_impactadas, estado, estudiantes, docentes });

      return res.status(200).json({
        message: "Proyecto de proyección social actualizado exitosamente",
        data: updated,
      });
    } catch (error: any) {
      logger.error("Error updating social projection project:", error);
      return res.status(500).json({
        error: error.message || "Error interno del servidor",
      });
    }
  };

  uploadAnexo = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No se proporcionó ningún archivo." });
      }

      const anexo = await this.service.uploadAnexo(id, file.originalname, file.mimetype, file.buffer as any);
      
      return res.status(201).json({
        message: "Anexo subido exitosamente",
        data: anexo,
      });
    } catch (error: any) {
      logger.error("Error uploading anexo:", error);
      return res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  };

  getAnexos = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const anexos = await this.service.getAnexos(id);
      return res.status(200).json(anexos);
    } catch (error: any) {
      logger.error("Error getting anexos:", error);
      return res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  };

  downloadAnexo = async (req: Request, res: Response) => {
    try {
      const { id, anexoId } = req.params;
      const anexo = await this.service.getAnexo(id, anexoId);
      
      if (!anexo) {
        return res.status(404).json({ error: "Anexo no encontrado" });
      }

      res.setHeader("Content-Type", anexo.tipo_mime);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${anexo.nombre_archivo}"`
      );
      return res.send(anexo.archivo);
    } catch (error: any) {
      logger.error("Error downloading anexo:", error);
      return res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  };

  deleteAnexo = async (req: Request, res: Response) => {
    try {
      const { id, anexoId } = req.params;
      await this.service.deleteAnexo(id, anexoId);
      return res.status(200).json({ message: "Anexo eliminado exitosamente" });
    } catch (error: any) {
      logger.error("Error deleting anexo:", error);
      return res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      return res.status(200).json({ message: "Proyecto de proyección social eliminado exitosamente" });
    } catch (error: any) {
      logger.error("Error deleting social projection project:", error);
      const status = error.message === "Proyecto no encontrado." ? 404 : 500;
      return res.status(status).json({ error: error.message || "Error interno del servidor" });
    }
  };

  getDashboardStats = async (_req: Request, res: Response) => {
    try {
      const data = await this.service.getSocialDashboardStats();
      return res.json(data);
    } catch (error: any) {
      logger.error("Error getting social dashboard stats:", error);
      return res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
  };
}


