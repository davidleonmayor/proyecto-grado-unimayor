import { logger, prisma } from "../config";

// types/event.types.ts (o donde tengas los tipos)
export interface CreateEventInput {
  titulo: string;
  descripcion?: string | null;
  fecha_inicio: string | Date; // acepta ambos
  fecha_fin: string | Date;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  prioridad: string;
  todo_el_dia?: boolean | null;
  id_trabajo_grado?: string | null;
}

export interface UpdateEventInput {
  titulo?: string;
  descripcion?: string | null;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  prioridad?: string;
  todo_el_dia?: boolean;
  id_trabajo_grado?: string | null;
}

export class EventService {
  public static async create(data: CreateEventInput) {
    try {
      return await prisma.evento.create({
        data: {
          titulo: data.titulo,
          descripcion: data.descripcion ?? null,
          fecha_inicio: new Date(data.fecha_inicio),
          fecha_fin: new Date(data.fecha_fin),
          hora_inicio: data.hora_inicio ?? null,
          hora_fin: data.hora_fin ?? null,
          prioridad: data.prioridad,
          todo_el_dia: data.todo_el_dia ?? false,
          id_trabajo_grado: data.id_trabajo_grado ?? null,
        },
      });
    } catch (error) {
      logger.error("Error creating event:", error);
      throw new Error("Error creating event");
    }
  }

  public static async update(id: string, data: Partial<UpdateEventInput>) {
    try {
      return await prisma.evento.update({
        where: { id_evento: id },
        data,
      });
    } catch (error) {
      logger.error("Error updating event:", error);
      throw new Error("Error updating event");
    }
  }

  public static async delete(id: string) {
    try {
      return await prisma.evento.update({
        where: { id_evento: id },
        data: { activo: false },
      });
    } catch (error) {
      logger.error("Error deleting event:", error);
      throw new Error("Error deleting event");
    }
  }
}
