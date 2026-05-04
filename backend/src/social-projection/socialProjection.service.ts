import { prisma, logger } from "../config";

export interface CreateProyeccionSocialInput {
  nombre: string;
  descripcion: string | null;
  tipo_mime: string;
  archivo: Buffer;
  id_persona_registra: string;
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
  /**
   * Crea un nuevo proyecto de proyección social.
   */
  async create(
    input: CreateProyeccionSocialInput,
  ): Promise<{ id_proyecto_social: string; nombre: string; fecha_registro: Date }> {
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
   * Busca un proyecto por ID.
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