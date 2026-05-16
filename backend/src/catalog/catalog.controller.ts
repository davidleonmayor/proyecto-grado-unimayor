import { Request, Response } from "express";
import { logger, prisma } from "../config";

export class CatalogController {
  /**
   * GET /api/catalog/facultades
   * Lista todas las facultades disponibles.
   */
  getFacultades = async (_req: Request, res: Response) => {
    try {
      const facultades = await prisma.facultad.findMany({
        select: {
          id_facultad: true,
          nombre_facultad: true,
          codigo_facultad: true,
        },
        orderBy: { nombre_facultad: "asc" },
      });
      return res.status(200).json(facultades);
    } catch (error: any) {
      logger.error("Error fetching facultades:", error);
      return res
        .status(500)
        .json({ error: error.message || "Error interno del servidor" });
    }
  };

  /**
   * GET /api/catalog/lineas-accion
   * Lista todas las líneas de acción disponibles.
   */
  getLineasAccion = async (_req: Request, res: Response) => {
    try {
      const lineas = await prisma.linea_accion.findMany({
        select: { id_linea_accion: true, nombre: true },
        orderBy: { nombre: "asc" },
      });
      return res.status(200).json(lineas);
    } catch (error: any) {
      logger.error("Error fetching líneas de acción:", error);
      return res
        .status(500)
        .json({ error: error.message || "Error interno del servidor" });
    }
  };

  /**
   * GET /api/catalog/programas?id_facultad=...
   * Lista programas académicos, opcionalmente filtrados por facultad.
   */
  getProgramas = async (req: Request, res: Response) => {
    try {
      const { id_facultad } = req.query;
      const where = typeof id_facultad === "string" && id_facultad.trim()
        ? { id_facultad: id_facultad.trim() }
        : {};

      const programas = await prisma.programa_academico.findMany({
        where,
        select: {
          id_programa: true,
          nombre_programa: true,
          id_facultad: true,
          facultad: { select: { nombre_facultad: true } },
        },
        orderBy: { nombre_programa: "asc" },
      });

      return res.status(200).json(
        programas.map((p) => ({
          id_programa: p.id_programa,
          nombre_programa: p.nombre_programa,
          id_facultad: p.id_facultad,
          nombre_facultad: p.facultad?.nombre_facultad ?? null,
        })),
      );
    } catch (error: any) {
      logger.error("Error fetching programas:", error);
      return res
        .status(500)
        .json({ error: error.message || "Error interno del servidor" });
    }
  };
}
