import { prisma, logger } from "../config";

export interface CreateManualProyeccionSocialInput {
  titulo: string;
  descripcion: string | null;
  id_persona_registra: string;
  estudiantes: string[];
  docentes: string[];
  personas_impactadas?: number;
  estado?: string;
  lineas_accion?: string[] | null;
  semestre?: string | null;
  id_programa?: string | null;
  id_asesor?: string | null;
  proponentes?: string[];
  planes_accion?: { objetivo_especifico?: string; actividades?: string; duracion?: string; responsables?: string; meta?: string; indicador?: string }[];
  resumen?: string | null;
  palabras_clave?: string | null;
  identificacion_problematica?: string | null;
  propuesta_solucion?: string | null;
  caracterizacion_poblacion?: string | null;
  objetivos?: string | null;
  resultados_esperados?: string | null;
  metodologia?: string | null;
  bibliografia?: string | null;
}

interface SearchResult {
  id_proyecto_social: string;
  titulo: string;
  descripcion: string | null;
  fecha_de_presentacion: Date;
  id_persona_registra: string | null;
  personas_impactadas: number;
  estado: string;
}

export class ProyeccionSocialService {
  async getAll(): Promise<SearchResult[]> {
    try {
      return await prisma.proyecto_proyeccion_social.findMany({
        select: {
          id_proyecto_social: true,
          titulo: true,
          descripcion: true,
          fecha_de_presentacion: true,
          id_persona_registra: true,
          personas_impactadas: true,
          estado: true,
        },
        orderBy: { fecha_de_presentacion: "desc" },
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
          titulo: true,
          descripcion: true,
          fecha_de_presentacion: true,
          id_persona_registra: true,
          personas_impactadas: true,
          estado: true,
        },
        orderBy: { fecha_de_presentacion: "desc" },
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
   * Busca proyectos por nombre.
   */
  async searchByName(nombre: string, limit: number): Promise<SearchResult[]> {
    try {
      return await prisma.proyecto_proyeccion_social.findMany({
        where: {
          titulo: {
            contains: nombre,
          },
        },
        select: {
          id_proyecto_social: true,
          titulo: true,
          descripcion: true,
          fecha_de_presentacion: true,
          id_persona_registra: true,
          personas_impactadas: true,
          estado: true,
        },
        orderBy: { fecha_de_presentacion: "desc" },
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
   * Busca un proyecto por ID para detalles de edición.
   */
  async getById(id: string) {
    try {
      return await prisma.proyecto_proyeccion_social.findUnique({
        where: { id_proyecto_social: id },
        include: {
          programa_academico: { select: { id_programa: true, nombre_programa: true } },
          facultad: { select: { id_facultad: true, nombre_facultad: true } },
          asesor: { select: { id_persona: true, nombres: true, apellidos: true, correo_electronico: true } },
          lineas_accion: {
            include: { linea_accion: { select: { id_linea_accion: true, nombre: true } } },
          },
          proponentes: {
            include: { persona: { select: { id_persona: true, nombres: true, apellidos: true, correo_electronico: true } } },
          },
          integrantes: {
            include: { persona: { select: { id_persona: true, nombres: true, apellidos: true, correo_electronico: true, num_doc_identidad: true } } },
          },
          planes_accion: true,
        },
      });
    } catch (error) {
      logger.error(
        "[ProyeccionSocialService] Error getting project by id:",
        error,
      );
      throw new Error("Error al obtener el proyecto.");
    }
  }

  /**
   * Actualiza los datos de un proyecto de proyección social.
   */
  async update(
    id: string,
    data: {
      titulo?: string;
      descripcion?: string | null;
      personas_impactadas?: number;
      estado?: string;
      estudiantes?: string[];
      docentes?: string[];
      lineas_accion?: string[];
      semestre?: string | null;
      id_programa?: string | null;
      id_asesor?: string | null;
      id_facultad?: string | null;
      resumen?: string | null;
      palabras_clave?: string | null;
      identificacion_problematica?: string | null;
      propuesta_solucion?: string | null;
      caracterizacion_poblacion?: string | null;
      objetivos?: string | null;
      resultados_esperados?: string | null;
      metodologia?: string | null;
      bibliografia?: string | null;
      proponentes?: string[];
      planes_accion?: { objetivo_especifico?: string; actividades?: string; duracion?: string; responsables?: string; meta?: string; indicador?: string }[];
    },
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        const updated = await tx.proyecto_proyeccion_social.update({
          where: { id_proyecto_social: id },
          data: {
            ...(data.titulo !== undefined && { titulo: data.titulo }),
            ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
            ...(data.personas_impactadas !== undefined && { personas_impactadas: data.personas_impactadas }),
            ...(data.estado !== undefined && { estado: data.estado }),
            ...(data.semestre !== undefined && { semestre: data.semestre }),
            ...(data.id_programa !== undefined && { id_programa: data.id_programa }),
            ...(data.id_asesor !== undefined && { id_asesor: data.id_asesor }),
            ...(data.id_facultad !== undefined && { id_facultad: data.id_facultad }),
            ...(data.resumen !== undefined && { resumen: data.resumen }),
            ...(data.palabras_clave !== undefined && { palabras_clave: data.palabras_clave }),
            ...(data.identificacion_problematica !== undefined && { identificacion_problematica: data.identificacion_problematica }),
            ...(data.propuesta_solucion !== undefined && { propuesta_solucion: data.propuesta_solucion }),
            ...(data.caracterizacion_poblacion !== undefined && { caracterizacion_poblacion: data.caracterizacion_poblacion }),
            ...(data.objetivos !== undefined && { objetivos: data.objetivos }),
            ...(data.resultados_esperados !== undefined && { resultados_esperados: data.resultados_esperados }),
            ...(data.metodologia !== undefined && { metodologia: data.metodologia }),
            ...(data.bibliografia !== undefined && { bibliografia: data.bibliografia }),
          },
        });

        // Replace integrantes if both arrays provided
        if (data.estudiantes && data.docentes) {
          await tx.integrante_proyecto_social.deleteMany({
            where: { id_proyecto_social: id },
          });

          if (data.estudiantes.length > 0) {
            await tx.integrante_proyecto_social.createMany({
              data: data.estudiantes.map((estId) => ({
                id_proyecto_social: id,
                id_persona: estId,
                rol: "Estudiante",
              })),
            });
          }

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

        // Replace líneas de acción if provided
        if (data.lineas_accion !== undefined) {
          await tx.linea_accion_proyeccion_social.deleteMany({
            where: { id_proyecto_social: id },
          });

          if (data.lineas_accion.length > 0) {
            await tx.linea_accion_proyeccion_social.createMany({
              data: data.lineas_accion.map((idLinea) => ({
                id_proyecto_social: id,
                id_linea_accion: idLinea,
              })),
            });
          }
        }

        // Replace proponentes if provided
        if (data.proponentes !== undefined) {
          await tx.proponente_proyeccion_social.deleteMany({
            where: { id_proyecto_social: id },
          });

          if (data.proponentes.length > 0) {
            await tx.proponente_proyeccion_social.createMany({
              data: data.proponentes.map((personaId) => ({
                id_proyecto_social: id,
                id_persona: personaId,
              })),
            });
          }
        }

        // Replace planes de acción if provided
        if (data.planes_accion !== undefined) {
          await tx.plan_accion_proyecto.deleteMany({
            where: { id_proyecto_social: id },
          });

          if (data.planes_accion.length > 0) {
            await tx.plan_accion_proyecto.createMany({
              data: data.planes_accion.map((plan) => ({
                id_proyecto_social: id,
                objetivo_especifico: plan.objetivo_especifico || null,
                actividades: plan.actividades || null,
                duracion: plan.duracion || null,
                responsables: plan.responsables || null,
                meta: plan.meta || null,
                indicador: plan.indicador || null,
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
   * Crea un proyecto de proyección social de forma manual con estudiantes y docentes.
   */
  async createManual(input: CreateManualProyeccionSocialInput): Promise<{
    id_proyecto_social: string;
    titulo: string;
    descripcion: string | null;
    fecha_de_presentacion: Date;
    integrantes: {
      id_integrante: string;
      id_persona: string;
      rol: string;
    }[];
  }> {
    try {
      // Validar que los IDs de estudiantes, docentes y proponentes existan en la base de datos
      const allPersonIds = [...input.estudiantes, ...input.docentes, ...(input.proponentes ?? [])];
      
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
            titulo: input.titulo,
            descripcion: input.descripcion,
            id_persona_registra: input.id_persona_registra,
            personas_impactadas: input.personas_impactadas ?? 0,
            estado: input.estado ?? "En proceso",
            ...(input.semestre !== undefined && { semestre: input.semestre }),
            ...(input.id_programa !== undefined && { id_programa: input.id_programa }),
            ...(input.id_asesor !== undefined && { id_asesor: input.id_asesor }),
            ...(input.resumen !== undefined && { resumen: input.resumen }),
            ...(input.palabras_clave !== undefined && { palabras_clave: input.palabras_clave }),
            ...(input.identificacion_problematica !== undefined && { identificacion_problematica: input.identificacion_problematica }),
            ...(input.propuesta_solucion !== undefined && { propuesta_solucion: input.propuesta_solucion }),
            ...(input.caracterizacion_poblacion !== undefined && { caracterizacion_poblacion: input.caracterizacion_poblacion }),
            ...(input.objetivos !== undefined && { objetivos: input.objetivos }),
            ...(input.resultados_esperados !== undefined && { resultados_esperados: input.resultados_esperados }),
            ...(input.metodologia !== undefined && { metodologia: input.metodologia }),
            ...(input.bibliografia !== undefined && { bibliografia: input.bibliografia }),
            ...(input.lineas_accion && input.lineas_accion.length > 0 && {
              lineas_accion: {
                create: input.lineas_accion.map((id_linea_accion) => ({ id_linea_accion })),
              },
            }),
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

        // Agregar proponentes
        const proponentesCreados = input.proponentes && input.proponentes.length > 0
          ? await Promise.all(
              input.proponentes.map((personaId) =>
                tx.proponente_proyeccion_social.create({
                  data: {
                    id_proyecto_social: proyecto.id_proyecto_social,
                    id_persona: personaId,
                  },
                })
              )
            )
          : [];

        // Create planes de acción
        if (input.planes_accion && input.planes_accion.length > 0) {
          await Promise.all(
            input.planes_accion.map((plan) =>
              tx.plan_accion_proyecto.create({
                data: {
                  id_proyecto_social: proyecto.id_proyecto_social,
                  objetivo_especifico: plan.objetivo_especifico || null,
                  actividades: plan.actividades || null,
                  duracion: plan.duracion || null,
                  responsables: plan.responsables || null,
                  meta: plan.meta || null,
                  indicador: plan.indicador || null,
                },
              })
            )
          );
        }

        return {
          id_proyecto_social: proyecto.id_proyecto_social,
          titulo: proyecto.titulo,
          descripcion: proyecto.descripcion,
          fecha_de_presentacion: proyecto.fecha_de_presentacion,
          integrantes: [
            ...integranteEstudiantes.map(i => ({ id_integrante: i.id_integrante, id_persona: i.id_persona, rol: i.rol })),
            ...integranteDocentes.map(i => ({ id_integrante: i.id_integrante, id_persona: i.id_persona, rol: i.rol })),
          ],
          proponentes: proponentesCreados.map(p => ({ id_proponente: p.id_proponente, id_persona: p.id_persona })),
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

  async delete(id: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        await tx.anexo_proyecto_social.deleteMany({
          where: { id_proyecto_social: id },
        });
        await tx.integrante_proyecto_social.deleteMany({
          where: { id_proyecto_social: id },
        });
        return await tx.proyecto_proyeccion_social.delete({
          where: { id_proyecto_social: id },
        });
      });
    } catch (error: any) {
      logger.error("[ProyeccionSocialService] Error deleting project:", error);
      if (error.code === "P2025") {
        throw new Error("Proyecto no encontrado.");
      }
      throw new Error("Error al eliminar el proyecto de proyección social.");
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
      where: { fecha_de_presentacion: { gte: fourWeeksAgo } },
      select: { fecha_de_presentacion: true, personas_impactadas: true },
      orderBy: { fecha_de_presentacion: 'asc' },
    });

    // Group by week (Semana 1..4 from oldest to newest)
    const weeklyImpact: { name: string; personas_impactadas: number }[] = [
      { name: 'Semana 1', personas_impactadas: 0 },
      { name: 'Semana 2', personas_impactadas: 0 },
      { name: 'Semana 3', personas_impactadas: 0 },
      { name: 'Semana 4', personas_impactadas: 0 },
    ];

    proyectosRecientes.forEach(p => {
      const diffDays = Math.floor((now.getTime() - new Date(p.fecha_de_presentacion).getTime()) / (1000 * 60 * 60 * 24));
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

    // Obtener proyecciones sociales finalizadas agrupadas por mes (Ene - Dic)
    const proyectosFinalizados = await prisma.proyecto_proyeccion_social.findMany({
      where: {
        estado: {
          in: ["Finalizado", "Finalizados"]
        }
      },
      select: {
        fecha_de_presentacion: true
      }
    });

    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthlyFinalized = meses.map(m => ({ name: m, finalizados: 0 }));

    proyectosFinalizados.forEach(p => {
      const fecha = new Date(p.fecha_de_presentacion);
      const mesIdx = fecha.getMonth(); // 0 - 11
      if (mesIdx >= 0 && mesIdx <= 11) {
        monthlyFinalized[mesIdx].finalizados += 1;
      }
    });

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
      },
      monthlyFinalized
    };
  }
}
