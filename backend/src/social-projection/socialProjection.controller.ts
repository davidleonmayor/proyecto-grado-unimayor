import { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { prisma, logger } from "../config";

const allowedExcelMimeTypes = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);

const allowedRoleNames = [
  "Director",
  "Profesor",
  "Profesores/Directores",
  "Coordinador",
  "Coordinador de Carrera",
];

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
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id_persona;
      const { nombre, descripcion } = req.body;
      const file = req.file;

      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
        return res
          .status(400)
          .json({ error: "El campo nombre es obligatorio" });
      }

      if (!file) {
        return res
          .status(400)
          .json({ error: "El archivo Excel es obligatorio" });
      }

      const hasAllowedRole = await prisma.actores.findFirst({
        where: {
          id_persona: userId,
          tipo_rol: {
            nombre_rol: {
              in: allowedRoleNames,
            },
          },
        },
        select: { id_actor: true },
      });

      if (!hasAllowedRole) {
        return res.status(403).json({
          error:
            "Solo Profesores/Directores o Coordinadores pueden registrar este documento",
        });
      }

      const created = await prisma.proyecto_proyeccion_social.create({
        data: {
          nombre: nombre.trim(),
          descripcion:
            typeof descripcion === "string" && descripcion.trim()
              ? descripcion.trim()
              : null,
          tipo_mime: file.mimetype,
          archivo: Buffer.from(file.buffer),
          id_persona_registra: userId,
        },
        select: {
          id_proyecto_social: true,
          nombre: true,
          fecha_registro: true,
        },
      });

      return res.status(201).json({
        message: "Proyecto de proyección social registrado exitosamente",
        data: created,
      });
    } catch (error) {
      logger.error("Error creating social projection project:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async downloadByName(req: Request, res: Response) {
    try {
      const rawName = req.params.nombre;
      const nombre = typeof rawName === "string" ? rawName.trim() : "";

      if (!nombre) {
        return res
          .status(400)
          .json({ error: "El parámetro nombre es obligatorio" });
      }

      const record = await prisma.proyecto_proyeccion_social.findFirst({
        where: { nombre },
        orderBy: { fecha_registro: "desc" },
        select: {
          archivo: true,
          tipo_mime: true,
          nombre: true,
          fecha_registro: true,
        },
      });

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
    } catch (error) {
      logger.error("Error downloading social projection file by name:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async searchByName(req: Request, res: Response) {
    try {
      const rawNombre = req.query.nombre;
      const nombre = typeof rawNombre === "string" ? rawNombre.trim() : "";
      const rawLimit = req.query.limit;
      const parsedLimit = Number(rawLimit);
      const limit = Number.isFinite(parsedLimit)
        ? Math.min(Math.max(parsedLimit, 1), 100)
        : 20;

      if (!nombre) {
        return res.status(400).json({
          error: "El parámetro de consulta 'nombre' es obligatorio",
        });
      }

      const records = await prisma.proyecto_proyeccion_social.findMany({
        where: {
          nombre: {
            contains: nombre,
          },
        },
        select: {
          id_proyecto_social: true,
          nombre: true,
          descripcion: true,
          tipo_mime: true,
          fecha_registro: true,
          id_persona_registra: true,
        },
        orderBy: { fecha_registro: "desc" },
        take: limit,
      });

      return res.status(200).json({
        total: records.length,
        items: records,
      });
    } catch (error) {
      logger.error("Error searching social projection files by name:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async downloadById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || !id.trim()) {
        return res
          .status(400)
          .json({ error: "El parámetro id es obligatorio" });
      }

      const record = await prisma.proyecto_proyeccion_social.findUnique({
        where: { id_proyecto_social: id.trim() },
        select: {
          archivo: true,
          tipo_mime: true,
          nombre: true,
          fecha_registro: true,
        },
      });

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
    } catch (error) {
      logger.error("Error downloading social projection file by id:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
