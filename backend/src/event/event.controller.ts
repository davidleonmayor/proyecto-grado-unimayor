import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";
import { prisma } from "../config/prisma";

import { EventService } from "./event.service";
import { logger } from "../config";

export class EventController {
  // Get all events (notifications) with pagination, filtered by user role
  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;

      // Auto-cleanup: delete events expired more than 60 days ago
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const deleted = await prisma.evento.deleteMany({
        where: {
          fecha_fin: { lt: sixtyDaysAgo },
        },
      });
      if (deleted.count > 0) {
        logger.info(`Auto-cleanup: deleted ${deleted.count} events expired more than 60 days ago.`);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Get user's roles and determine their type
      const userActors = await prisma.actores.findMany({
        where: {
          id_persona: user.id_persona,
          estado: "Activo",
        },
        include: {
          tipo_rol: true,
          trabajo_grado: {
            include: {
              programa_academico: {
                include: {
                  facultad: true,
                },
              },
            },
          },
        },
      });

      // Determine user role type
      const studentRole = await prisma.tipo_rol.findFirst({
        where: { nombre_rol: "Estudiante" },
      });
      const coordinatorRole = await prisma.tipo_rol.findFirst({
        where: { nombre_rol: "Coordinador de Carrera" },
      });
      const teacherRoles = await prisma.tipo_rol.findMany({
        where: {
          nombre_rol: { in: ["Director", "Asesor", "Asesor Externo"] },
        },
      });
      const teacherRoleIds = teacherRoles.map((r) => r.id_rol);

      const isStudent = userActors.some(
        (a) => a.id_tipo_rol === studentRole?.id_rol,
      );
      const isCoordinator = userActors.some(
        (a) => a.id_tipo_rol === coordinatorRole?.id_rol,
      );
      const isTeacher = userActors.some((a) =>
        teacherRoleIds.includes(a.id_tipo_rol),
      );

      // Build where clause based on user role
      let whereClause: any = {
        activo: true,
      };

      if (isCoordinator) {
        // Coordinators see all events from projects in their faculty
        const coordinatorPersona = await prisma.persona.findUnique({
          where: { id_persona: user.id_persona },
          select: { id_facultad: true },
        });

        if (coordinatorPersona?.id_facultad) {
          whereClause.trabajo_grado = {
            programa_academico: {
              id_facultad: coordinatorPersona.id_facultad,
            },
          };
        } else {
          whereClause.AND = [
            { id_trabajo_grado: { not: null } },
            { id_trabajo_grado: null },
          ];
        }
      } else if (isStudent) {
        // Students see only events from their projects
        const studentProjectIds = userActors
          .filter((a) => a.id_tipo_rol === studentRole?.id_rol)
          .map((a) => a.id_trabajo_grado);

        if (studentProjectIds.length > 0) {
          whereClause.id_trabajo_grado = {
            in: studentProjectIds,
          };
        } else {
          whereClause.AND = [
            { id_trabajo_grado: { not: null } },
            { id_trabajo_grado: null },
          ];
        }
      } else if (isTeacher) {
        // Teachers/Directors see only events from projects they direct/advise
        const teacherProjectIds = userActors
          .filter((a) => teacherRoleIds.includes(a.id_tipo_rol))
          .map((a) => a.id_trabajo_grado);

        if (teacherProjectIds.length > 0) {
          whereClause.id_trabajo_grado = {
            in: teacherProjectIds,
          };
        } else {
          whereClause.AND = [
            { id_trabajo_grado: { not: null } },
            { id_trabajo_grado: null },
          ];
        }
      } else {
        whereClause.AND = [
          { id_trabajo_grado: { not: null } },
          { id_trabajo_grado: null },
        ];
      }

      // Apply optional query filters
      const filterStatus = (req.query.status as string) || 'all';
      const filterPriority = (req.query.priority as string) || 'all';
      const search = (req.query.search as string) || '';
      const now = new Date();

      if (filterStatus === 'active') {
        whereClause.fecha_fin = { gte: now };
      } else if (filterStatus === 'past') {
        whereClause.fecha_fin = { lt: now };
      } else if (filterStatus === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        whereClause.fecha_inicio = { gte: startOfDay, lte: endOfDay };
      }

      if (filterPriority !== 'all') {
        whereClause.prioridad = filterPriority;
      }

      if (search) {
        whereClause.OR = [
          { titulo: { contains: search } },
          { descripcion: { contains: search } },
        ];
      }

      // Get total count for pagination
      const total = await prisma.evento.count({
        where: whereClause,
      });

      const events = await prisma.evento.findMany({
        where: whereClause,
        skip,
        take: limit,
      });

      // Sort: upcoming events first (closest deadline first), expired events last
      events.sort((a, b) => {
        const aEndDate = new Date(a.fecha_fin);
        const bEndDate = new Date(b.fecha_fin);
        const aDaysRemaining = Math.ceil(
          (aEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        const bDaysRemaining = Math.ceil(
          (bEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        const aIsUpcoming = aDaysRemaining >= 0;
        const bIsUpcoming = bDaysRemaining >= 0;

        // Upcoming always before expired
        if (aIsUpcoming && !bIsUpcoming) return -1;
        if (!aIsUpcoming && bIsUpcoming) return 1;

        // Both upcoming: closest deadline first
        if (aIsUpcoming && bIsUpcoming) {
          if (aDaysRemaining !== bDaysRemaining) return aDaysRemaining - bDaysRemaining;
        } else {
          // Both expired: closest to today first (least negative)
          if (aDaysRemaining !== bDaysRemaining) return bDaysRemaining - aDaysRemaining;
        }

        // Secondary sort: priority
        const priorityOrder: { [key: string]: number } = { alta: 0, media: 1, baja: 2 };
        return (priorityOrder[a.prioridad] ?? 3) - (priorityOrder[b.prioridad] ?? 3);
      });

      const eventsWithColors = events.map((event) => {
        const eventDate = new Date(event.fecha_fin);
        const daysRemaining = Math.ceil(
          (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        let color = "gray";
        let borderColor = "border-gray-300";

        if (daysRemaining < 0) {
          color = "gray";
          borderColor = "border-gray-300";
        } else if (event.prioridad === "alta") {
          if (daysRemaining <= 1) {
            color = "red";
            borderColor = "border-red-500";
          } else if (daysRemaining <= 3) {
            color = "orange";
            borderColor = "border-orange-500";
          } else {
            color = "red";
            borderColor = "border-red-400";
          }
        } else if (event.prioridad === "media") {
          if (daysRemaining <= 1) {
            color = "orange";
            borderColor = "border-orange-500";
          } else if (daysRemaining <= 7) {
            color = "yellow";
            borderColor = "border-yellow-500";
          } else {
            color = "blue";
            borderColor = "border-blue-400";
          }
        } else {
          if (daysRemaining <= 1) {
            color = "yellow";
            borderColor = "border-yellow-400";
          } else if (daysRemaining <= 7) {
            color = "blue";
            borderColor = "border-blue-300";
          } else {
            color = "green";
            borderColor = "border-green-400";
          }
        }

        return {
          id: event.id_evento,
          title: event.titulo,
          description: event.descripcion,
          start: event.fecha_inicio,
          end: event.fecha_fin,
          horaInicio: event.hora_inicio,
          horaFin: event.hora_fin,
          prioridad: event.prioridad,
          allDay: event.todo_el_dia,
          daysRemaining,
          color,
          borderColor,
        };
      });

      res.json({
        events: eventsWithColors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      logger.error("Error getting events:", error);
      next(error);
    }
  };

  // Create event (coordinator only)
  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const event = await EventService.create(req.body);
      res.status(201).json(event);
    } catch (error) {
      logger.error("Error creating event:", error);
      next(error);
    }
  };

  // Update event (coordinator only)
  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const cleanData = matchedData(req, { locations: ["body"] });

      const event = await EventService.update(id, cleanData);

      res.json(event);
    } catch (error) {
      logger.error("Error updating event:", error);
      next(error);
    }
  };

  // Delete event (admin only)
  deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await EventService.delete(id);
      res.json({ message: "Evento eliminado correctamente" });
    } catch (error) {
      logger.error("Error deleting event:", error);
      next(error);
    }
  };
}
