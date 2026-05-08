import { prisma, logger } from "../config";

export interface CreateProyeccionSocialInput {
  nombre: string;
  descripcion: string | null;
  tipo_mime: string;
  archivo: Buffer;
  id_persona_registra: string;
}

export interface CreateManualProyeccionSocialInput {
  nombre: string;
  descripcion: string | null;
  id_persona_registra: string;
  estudiantes: string[];
  docentes: string[];
}

interface SearchResult {
  id_proyecto_social: string;
  nombre: string;
  descripcion: string | null;
  tipo_mime: string;
  fecha_registro: Date;
  id_persona_registra: string;
}

interface DownloadResult {
  archivo: Uint8Array;
  tipo_mime: string;
  nombre: string;
  fecha_registro: Date;
}

export class ProyeccionSocialService {
  async getAll(): Promise<SearchResult[]> {
    try {
      return await prisma.proyecto_proyeccion_social.findMany({
        select: {
          id_proyecto_social: true,
          nombre: true,
          descripcion: true,
          tipo_mime: true,
          fecha_registro: true,
          id_persona_registra: true,
        },
        orderBy: { fecha_registro: "desc" },
      });
    } catch (error) {
      logger.error(
        "[ProyeccionSocialService] Error fetching all projects:",
        error,
      );
      throw new Error("Error al obtener los proyectos de proyección social.");
    }
  }

  /**
   * Crea un nuevo proyecto de proyección social.
   */
  async create(input: CreateProyeccionSocialInput): Promise<{
    id_proyecto_social: string;
    nombre: string;
    fecha_registro: Date;
  }> {
    try {
      const created = await prisma.proyecto_proyeccion_social.create({
        data: {
          nombre: input.nombre,
          descripcion: input.descripcion,
          tipo_mime: input.tipo_mime,
          archivo: new Uint8Array(input.archivo),
          id_persona_registra: input.id_persona_registra,
        },
        select: {
          id_proyecto_social: true,
          nombre: true,
          fecha_registro: true,
        },
      });

      logger.info(
        `[ProyeccionSocialService] Created project: ${created.id_proyecto_social}`,
      );

      return created;
    } catch (error: any) {
      logger.error("[ProyeccionSocialService] Error creating project:", error);

      if (error.code === "P2002") {
        throw new Error("Ya existe un proyecto con ese nombre.");
      }

      throw new Error("Error al crear el proyecto de proyección social.");
    }
  }

  /**
   * Busca proyectos por nombre.
   */
  async searchByName(nombre: string, limit: number): Promise<SearchResult[]> {
    try {
      return await prisma.proyecto_proyeccion_social.findMany({
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
    } catch (error) {
      logger.error(
        "[ProyeccionSocialService] Error searching projects:",
        error,
      );
      throw new Error("Error al buscar proyectos de proyección social.");
    }
  }

  /**
   * Busca un proyecto por nombre (para descarga).
   */
  async findByName(nombre: string): Promise<DownloadResult | null> {
    try {
      return await prisma.proyecto_proyeccion_social.findFirst({
        where: { nombre },
        orderBy: { fecha_registro: "desc" },
        select: {
          archivo: true,
          tipo_mime: true,
          nombre: true,
          fecha_registro: true,
        },
      });
    } catch (error) {
      logger.error(
        "[ProyeccionSocialService] Error finding project by name:",
        error,
      );
      throw new Error("Error al buscar el proyecto.");
    }
  }

  /**
   * Busca un proyecto por ID para detalles de edición.
   */
  async getById(id: string): Promise<SearchResult | null> {
    try {
      return await prisma.proyecto_proyeccion_social.findUnique({
        where: { id_proyecto_social: id },
        select: {
          id_proyecto_social: true,
          nombre: true,
          descripcion: true,
          tipo_mime: true,
          fecha_registro: true,
          id_persona_registra: true,
        },
      });
    } catch (error) {
      logger.error(
        "[ProyeccionSocialService] Error finding project by id:",
        error,
      );
      throw new Error("Error al buscar el proyecto.");
    }
  }

  /**
   * Actualiza los datos de un proyecto de proyección social.
   */
  async update(
    id: string,
    data: { nombre: string; descripcion?: string | null },
  ) {
    try {
      return await prisma.proyecto_proyeccion_social.update({
        where: { id_proyecto_social: id },
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
        },
      });
    } catch (error: any) {
      logger.error("[ProyeccionSocialService] Error updating project:", error);
      throw new Error("Error al actualizar el proyecto de proyección social.");
    }
  }

  /**
   * Busca un proyecto por ID (para descarga).
   */
  async findById(id: string): Promise<DownloadResult | null> {
    try {
      return await prisma.proyecto_proyeccion_social.findUnique({
        where: { id_proyecto_social: id },
        select: {
          archivo: true,
          tipo_mime: true,
          nombre: true,
          fecha_registro: true,
        },
      });
    } catch (error) {
      logger.error(
        "[ProyeccionSocialService] Error finding project by id:",
        error,
      );
      throw new Error("Error al buscar el proyecto.");
    }
  }
}
nSocialService] Error finding project by id:",
        error,
      );
      throw new Error("Error al buscar el proyecto.");
    }
  }

  /**
   * Actualiza los datos de un proyecto de proyección social.
   */
  async update(
    id: string,
    data: { nombre: string; descripcion?: string | null },
  ) {
    try {
      return await prisma.proyecto_proyeccion_social.update({
        where: { id_proyecto_social: id },
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
        },
      });
    } catch (error: any) {
      logger.error("[ProyeccionSocialService] Error updating project:", error);
      throw new Error("Error al actualizar el proyecto de proyección social.");
    }
  }

  /**
   * Busca un proyecto por ID (para descarga).
   */
  async findById(id: string): Promise<DownloadResult | null> {
    try {
      return await prisma.proyecto_proyeccion_social.findUnique({
        where: { id_proyecto_social: id },
        select: {
          archivo: true,
          tipo_mime: true,
          nombre: true,
          fecha_registro: true,
        },
      });
    } catch (error) {
      logger.error(
        "[ProyeccionSocialService] Error finding project by id:",
        error,
      );
      throw new Error("Error al buscar el proyecto.");
    }
  }
}
