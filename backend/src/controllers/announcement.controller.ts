import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { NotificationEmail } from "../email/NotificationEmail";
import { logger } from "../config";

export class AnnouncementController {

    // Obtener anuncios (Para todos). Se adjunta booleano "leido" dependiendo del usuario que consulta
    public getAnnouncements = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id_persona;
            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }

            const me = await prisma.persona.findUnique({
                where: { id_persona: userId },
                include: { actores: { include: { tipo_rol: true } } }
            });

            if (!me) return res.status(404).json({ message: "Usuario no encontrado" });

            const isPrivileged = me.actores.some(a => ["admin", "Administrador", "Admin", "Decano"].includes(a.tipo_rol.nombre_rol));

            let filter: any = {};
            if (!isPrivileged) {
                // Si no es un admin/decano, solo ve los anuncios globales o los de su misma facultad
                filter = {
                    OR: [
                        { autor: { actores: { some: { tipo_rol: { nombre_rol: { in: ["admin", "Administrador", "Admin", "Decano"] } } } } } },
                        { autor: { id_facultad: me.id_facultad } }
                    ]
                };
            }

            // Conseguir todos los anuncios ordenados del más reciente al más antiguo
            const anuncios = await prisma.anuncio.findMany({
                where: filter,
                orderBy: { fecha_creacion: "desc" },
                include: {
                    autor: {
                        select: { nombres: true, apellidos: true }
                    },
                    lecturas: {
                        where: { id_persona: userId },
                        select: { id_lectura: true }
                    }
                }
            });

            // Mapearlos para que sea facil de leer en frontend
            const formatted = anuncios.map((a) => ({
                id_anuncio: a.id_anuncio,
                titulo: a.titulo,
                contenido: a.contenido,
                fecha_creacion: a.fecha_creacion,
                autor_nombre: `${a.autor.nombres} ${a.autor.apellidos}`,
                leido: a.lecturas.length > 0
            }));

            res.json(formatted);
        } catch (error: any) {
            logger.error(`getAnnouncements Error: ${error.message}`);
            res.status(500).json({ message: "Error obteniendo anuncios" });
        }
    };

    // Crear un anuncio y enviar correo masivo
    public createAnnouncement = async (req: Request, res: Response) => {
        try {
            const { titulo, contenido } = req.body;
            const authorId = req.user?.id_persona;

            if (!authorId) return res.status(401).json({ message: "No autorizado" });

            if (!titulo || !contenido) {
                return res.status(400).json({ message: "El título y contenido son obligatorios" });
            }

            const authorInfo = await prisma.persona.findUnique({
                where: { id_persona: authorId },
                include: { actores: { include: { tipo_rol: true } } }
            });

            if (!authorInfo) return res.status(404).json({ message: "Autor no encontrado" });

            const isGlobal = authorInfo.actores.some(a => ["admin", "Administrador", "Admin", "Decano"].includes(a.tipo_rol.nombre_rol));
            const isCoordinator = authorInfo.actores.some(a => ["Coordinador de Carrera", "Coordinador"].includes(a.tipo_rol.nombre_rol));

            if (!isGlobal && !isCoordinator) {
                return res.status(403).json({ message: "No tienes permisos para crear anuncios" });
            }

            const newAnnouncement = await prisma.anuncio.create({
                data: {
                    titulo,
                    contenido,
                    id_autor: authorId
                }
            });

            res.status(201).json({
                message: "Anuncio creado exitosamente",
                anuncio: newAnnouncement
            });

            // --- Disparar Correos Asíncronamente ---
            (async () => {
                try {
                    const emailFilter = isGlobal ? {} : { id_facultad: authorInfo.id_facultad };

                    const allUsers = await prisma.persona.findMany({
                        where: emailFilter,
                        select: { correo_electronico: true }
                    });

                    const emails = allUsers
                        .map(u => u.correo_electronico)
                        .filter(Boolean); // filtra los vacíos o nulos

                    if (emails.length > 0) {
                        const mailer = NotificationEmail.getInstance();
                        const dateString = new Date().toLocaleDateString("es-CO");
                        // chunking en 100 para no hacer throw del SMTP limit
                        const chunkSize = 100;
                        for (let i = 0; i < emails.length; i += chunkSize) {
                            const chunk = emails.slice(i, i + chunkSize);
                            await mailer.sendAnnouncementEmail(chunk, "Usuario de Unimayor", titulo, contenido, dateString);
                        }
                    }
                } catch (emailError: any) {
                    logger.error(`Error enviando email masivo post-creación: ${emailError.message}`);
                }
            })();

        } catch (error: any) {
            logger.error(`createAnnouncement Error: ${error.message}`);
            res.status(500).json({ message: "Error creando anuncio" });
        }
    };

    // Marcar como leido
    public markAsRead = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id_persona;
            const announcementId = req.params.id;

            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }

            // Verificar si ya existe lectura
            const existing = await prisma.anuncio_leido.findUnique({
                where: {
                    id_anuncio_id_persona: {
                        id_anuncio: announcementId,
                        id_persona: userId
                    }
                }
            });

            if (!existing) {
                await prisma.anuncio_leido.create({
                    data: {
                        id_anuncio: announcementId,
                        id_persona: userId
                    }
                });
            }

            res.json({ message: "Anuncio marcado como leído" });
        } catch (error: any) {
            logger.error(`markAsRead Error: ${error.message}`);
            res.status(500).json({ message: "Error al marcar como leído" });
        }
    };

    // Eliminar anuncio (borrando leidos asociados primero)
    public deleteAnnouncement = async (req: Request, res: Response) => {
        try {
            const announcementId = req.params.id;

            await prisma.anuncio_leido.deleteMany({
                where: { id_anuncio: announcementId }
            });

            await prisma.anuncio.delete({
                where: { id_anuncio: announcementId }
            });

            res.json({ message: "Anuncio eliminado" });
        } catch (error: any) {
            logger.error(`deleteAnnouncement Error: ${error.message}`);
            res.status(500).json({ message: "Error eliminando anuncio" });
        }
    };
}
