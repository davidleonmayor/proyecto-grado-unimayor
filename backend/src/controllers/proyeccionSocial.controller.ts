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
                return res.status(400).json({ error: "El campo nombre es obligatorio" });
            }

            if (!file) {
                return res.status(400).json({ error: "El archivo Excel es obligatorio" });
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
                    error: "Solo Profesores/Directores o Coordinadores pueden registrar este documento",
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
}
