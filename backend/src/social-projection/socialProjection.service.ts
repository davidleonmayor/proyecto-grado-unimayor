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

  async getByUser(userId: string): Promise<SearchResult[]> {
    try {
      return await prisma.proyecto_proyeccion_social.findMany({
        where: {
          OR: [
            {
              integrantes: {
                some: {
                  id_persona: userId,
                },
              },
            },
            {
              id_persona_registra: userId,
            },
          ],
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
      });
    } catch (error) {
      logger.error(
        "[ProyeccionSocialService] Error fetching projects by user:",
        error,
      );
      throw new Error("Error al obtener los proyectos de proyección social del usuario.");
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

  /**
   * Crea un proyecto de proyección social de forma manual con estudiantes y docentes.
   */
  async createManual(input: CreateManualProyeccionSocialInput): Promise<{
    id_proyecto_social: string;
    nombre: string;
    descripcion: string | null;
    fecha_registro: Date;
    integrantes: {
      id_integrante: string;
      id_persona: string;
      rol: string;
    }[];
  }> {
    try {
      // Validar que los IDs de estudiantes y docentes existan en la base de datos
      const allPersonIds = [...input.estudiantes, ...input.docentes];
      
      const personasExistentes = await prisma.persona.findMany({
        where: { id_persona: { in: allPersonIds } },
        select: { id_persona: true },
      });
      
      const personasExistentesIds = new Set(personasExistentes.map(p => p.id_persona));
      
      // Verificar que todos los IDs existan
      const personasNoEncontradas = allPersonIds.filter(id => !personasExistentesIds.has(id));
      
      if (personasNoEncontradas.length > 0) {
        throw new Error(`Una o más personas no fueron encontradas: ${personasNoEncontradas.join(", ")}`);
      }

      // Crear el proyecto con sus integrantes en una transacción
      const result = await prisma.$transaction(async (tx) => {
        // Crear el proyecto
        const proyecto = await tx.proyecto_proyeccion_social.create({
          data: {
            nombre: input.nombre,
            descripcion: input.descripcion,
            id_persona_registra: input.id_persona_registra,
          },
        });

        // Agregar estudiantes (rol: "Estudiante")
        const integranteEstudiantes = await Promise.all(
          input.estudiantes.map((estudianteId) =>
            tx.integrante_proyecto_social.create({
              data: {
                id_proyecto_social: proyecto.id_proyecto_social,
                id_persona: estudianteId,
                rol: "Estudiante",
              },
            })
          )
        );

        // Agregar docentes (rol: "Docente")
        const integranteDocentes = await Promise.all(
          input.docentes.map((docenteId) =>
            tx.integrante_proyecto_social.create({
              data: {
                id_proyecto_social: proyecto.id_proyecto_social,
                id_persona: docenteId,
                rol: "Docente",
              },
            })
          )
        );

        return {
          id_proyecto_social: proyecto.id_proyecto_social,
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
          fecha_registro: proyecto.fecha_registro,
          integrantes: [
            ...integranteEstudiantes.map(i => ({ id_integrante: i.id_integrante, id_persona: i.id_persona, rol: i.rol })),
            ...integranteDocentes.map(i => ({ id_integrante: i.id_integrante, id_persona: i.id_persona, rol: i.rol })),
          ],
        };
      });

      logger.info(
        `[ProyeccionSocialService] Created manual project: ${result.id_proyecto_social} with ${result.integrantes.length} members`,
      );

      return result;
    } catch (error: any) {
      logger.error("[ProyeccionSocialService] Error creating manual project:", error);
      
      if (error.message.includes("no fueron encontradas")) {
        throw error;
      }
      
      throw new Error("Error al crear el proyecto de proyección social manualmente.");
    }
  }
}
