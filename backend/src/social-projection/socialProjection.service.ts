import { prisma, logger } from "../config";

export interface CreateProyeccionSocialInput {
  nombre: string;
  descripcion: string | null;
  tipo_mime: string;
  archivo: Buffer;
  id_persona_registra: string;
  personas_impactadas?: number;
}

export interface CreateManualProyeccionSocialInput {
  nombre: string;
  descripcion: string | null;
  id_persona_registra: string;
  estudiantes: string[];
  docentes: string[];
  personas_impactadas?: number;
  estado?: string;
}

interface SearchResult {
  id_proyecto_social: string;
  nombre: string;
  descripcion: string | null;
  tipo_mime: string | null;
  fecha_registro: Date;
  id_persona_registra: string | null;
  personas_impactadas: number;
  estado: string;
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
          personas_impactadas: true,
          estado: true,
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
          personas_impactadas: true,
          estado: true,
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
          personas_impactadas: input.personas_impactadas ?? 0,
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
          personas_impactadas: true,
          estado: true,
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
          personas_impactadas: true,
          estado: true,
          integrantes: {
            select: {
              id_persona: true,
              rol: true,
              persona: {
                select: {
                  nombres: true,
                  apellidos: true,
                  correo_electronico: true,
                  num_doc_identidad: true,
                }
              }
            }
          }
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
    data: { nombre: string; descripcion?: string | null; personas_impactadas?: number; estado?: string; estudiantes?: string[]; docentes?: string[] },
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        const updated = await tx.proyecto_proyeccion_social.update({
          where: { id_proyecto_social: id },
          data: {
            nombre: data.nombre,
            descripcion: data.descripcion,
            ...(data.personas_impactadas !== undefined && { personas_impactadas: data.personas_impactadas }),
            ...(data.estado !== undefined && { estado: data.estado }),
          },
        });

        if (data.estudiantes && data.docentes) {
          // Delete existing integrantes
          await tx.integrante_proyecto_social.deleteMany({
            where: { id_proyecto_social: id },
          });

          // Insert new students
          if (data.estudiantes.length > 0) {
            await tx.integrante_proyecto_social.createMany({
              data: data.estudiantes.map((estId) => ({
                id_proyecto_social: id,
                id_persona: estId,
                rol: "Estudiante",
              })),
            });
          }

          // Insert new advisors
          if (data.docentes.length > 0) {
            await tx.integrante_proyecto_social.createMany({
              data: data.docentes.map((docId) => ({
                id_proyecto_social: id,
                id_persona: docId,
                rol: "Docente",
              })),
            });
          }
        }

        return updated;
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
            personas_impactadas: input.personas_impactadas ?? 0,
            estado: input.estado ?? "Sin entregar",
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

  async uploadAnexo(idProyecto: string, nombreArchivo: string, tipoMime: string, archivo: Buffer) {
    try {
      return await prisma.anexo_proyecto_social.create({
        data: {
          id_proyecto_social: idProyecto,
          nombre_archivo: nombreArchivo,
          tipo_mime: tipoMime,
          archivo: new Uint8Array(archivo),
        },
        select: {
          id_anexo: true,
          id_proyecto_social: true,
          nombre_archivo: true,
          tipo_mime: true,
          fecha_subida: true,
        }
      });
    } catch (error) {
      logger.error("[ProyeccionSocialService] Error uploading anexo:", error);
      throw new Error("Error al guardar el anexo del proyecto.");
    }
  }

  async getAnexos(idProyecto: string) {
    try {
      return await prisma.anexo_proyecto_social.findMany({
        where: { id_proyecto_social: idProyecto },
        select: {
          id_anexo: true,
          id_proyecto_social: true,
          nombre_archivo: true,
          tipo_mime: true,
          fecha_subida: true,
        },
        orderBy: { fecha_subida: "desc" }
      });
    } catch (error) {
      logger.error("[ProyeccionSocialService] Error getting anexos:", error);
      throw new Error("Error al obtener los anexos del proyecto.");
    }
  }

  async getAnexo(idProyecto: string, idAnexo: string) {
    try {
      return await prisma.anexo_proyecto_social.findFirst({
        where: { id_proyecto_social: idProyecto, id_anexo: idAnexo },
      });
    } catch (error) {
      logger.error("[ProyeccionSocialService] Error getting anexo by id:", error);
      throw new Error("Error al obtener el anexo.");
    }
  }

  async deleteAnexo(idProyecto: string, idAnexo: string) {
    try {
      return await prisma.anexo_proyecto_social.deleteMany({
        where: { id_proyecto_social: idProyecto, id_anexo: idAnexo },
      });
    } catch (error) {
      logger.error("[ProyeccionSocialService] Error deleting anexo:", error);
      throw new Error("Error al eliminar el anexo.");
    }
  }

  /**
   * Retorna estadísticas del dashboard de proyección social:
   * - Totales generales
   * - Gráfica de personas impactadas por semana (últimas 4 semanas)
   */
  async getSocialDashboardStats() {
    const now = new Date();

    // Total projects
    const totalProjects = await prisma.proyecto_proyeccion_social.count();

    // Total impacto acumulado
    const impactoAgg = await prisma.proyecto_proyeccion_social.aggregate({
      _sum: { personas_impactadas: true },
    });
    const totalImpactadas = impactoAgg._sum.personas_impactadas ?? 0;

    // Proyectos recientes (últimas 4 semanas)
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const proyectosRecientes = await prisma.proyecto_proyeccion_social.findMany({
      where: { fecha_registro: { gte: fourWeeksAgo } },
      select: { fecha_registro: true, personas_impactadas: true },
      orderBy: { fecha_registro: 'asc' },
    });

    // Group by week (Semana 1..4 from oldest to newest)
    const weeklyImpact: { name: string; personas_impactadas: number }[] = [
      { name: 'Semana 1', personas_impactadas: 0 },
      { name: 'Semana 2', personas_impactadas: 0 },
      { name: 'Semana 3', personas_impactadas: 0 },
      { name: 'Semana 4', personas_impactadas: 0 },
    ];

    proyectosRecientes.forEach(p => {
      const diffDays = Math.floor((now.getTime() - new Date(p.fecha_registro).getTime()) / (1000 * 60 * 60 * 24));
      // diffDays: 0-6 → semana 4 (más reciente), 7-13 → semana 3, 14-20 → semana 2, 21-27 → semana 1
      let weekIdx = 3 - Math.floor(diffDays / 7);
      if (weekIdx < 0) weekIdx = 0;
      if (weekIdx > 3) weekIdx = 3;
      weeklyImpact[weekIdx].personas_impactadas += p.personas_impactadas;
    });

    const statusCounts = await prisma.proyecto_proyeccion_social.groupBy({
      by: ['estado'],
      _count: {
        id_proyecto_social: true
      }
    });

    let finalizados = 0;
    let sinEntregar = 0;

    statusCounts.forEach(status => {
      if (status.estado === 'Finalizado' || status.estado === 'Finalizados') {
        finalizados += status._count.id_proyecto_social;
      } else {
        sinEntregar += status._count.id_proyecto_social;
      }
    });

    const totalStatus = finalizados + sinEntregar;
    const porcentajeFinalizado = totalStatus > 0 ? Math.round((finalizados / totalStatus) * 100) : 0;
    const porcentajeSinEntregar = totalStatus > 0 ? 100 - porcentajeFinalizado : 0;

    return {
      totalProjects,
      totalImpactadas,
      weeklyImpact,
      status: {
        finalizados,
        sinEntregar,
        total: totalStatus,
        porcentajeFinalizado,
        porcentajeSinEntregar
      }
    };
  }
}
