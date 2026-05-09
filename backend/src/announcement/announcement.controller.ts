import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config";

export class AnnouncementController {
  // GET /api/announcement — list announcements (all authenticated users)
  getAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id_persona;

      const announcements = await prisma.anuncio.findMany({
        orderBy: { fecha_creacion: "desc" },
        include: {
          autor: {
            select: {
              id_persona: true,
              nombres: true,
              apellidos: true,
            },
          },
          lecturas: {
            where: { id_persona: userId },
            select: { id_lectura: true },
          },
        },
      });

      const result = announcements.map((a) => ({
        id_anuncio: a.id_anuncio,
        titulo: a.titulo,
        contenido: a.contenido,
        fecha_creacion: a.fecha_creacion,
        id_autor: a.id_autor,
        autor_nombre: `${a.autor.nombres} ${a.autor.apellidos}`,
        leido: a.lecturas.length > 0,
      }));

      res.json(result);
    } catch (error) {
      logger.error("Error getting announcements:", error);
      next(error);
    }
  };

  // POST /api/announcement — create (admin/dean only)
  createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id_persona;
      const { titulo, contenido } = req.body;

      if (!titulo || !contenido) {
        return res.status(400).json({ error: "El título y el contenido son obligatorios." });
      }

      const anuncio = await prisma.anuncio.create({
        data: {
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          id_autor: userId,
        },
        include: {
          autor: {
            select: { nombres: true, apellidos: true },
          },
        },
      });

      return res.status(201).json({
        message: "Anuncio creado exitosamente.",
        anuncio: {
          id_anuncio: anuncio.id_anuncio,
          titulo: anuncio.titulo,
          contenido: anuncio.contenido,
          fecha_creacion: anuncio.fecha_creacion,
          autor_nombre: `${anuncio.autor.nombres} ${anuncio.autor.apellidos}`,
          leido: false,
        },
      });
    } catch (error) {
      logger.error("Error creating announcement:", error);
      next(error);
    }
  };

  // POST /api/announcement/:id/read — mark as read
  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id_persona;
      const { id } = req.params;

      await prisma.anuncio_leido.upsert({
        where: { id_anuncio_id_persona: { id_anuncio: id, id_persona: userId } },
        update: {},
        create: { id_anuncio: id, id_persona: userId },
      });

      return res.json({ message: "Marcado como leído." });
    } catch (error) {
      logger.error("Error marking announcement as read:", error);
      next(error);
    }
  };

  // DELETE /api/announcement/:id — delete (admin/dean only)
  deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Delete reads first (cascade)
      await prisma.anuncio_leido.deleteMany({ where: { id_anuncio: id } });
      await prisma.anuncio.delete({ where: { id_anuncio: id } });

      return res.json({ message: "Anuncio eliminado correctamente." });
    } catch (error) {
      logger.error("Error deleting announcement:", error);
      next(error);
    }
  };
}
