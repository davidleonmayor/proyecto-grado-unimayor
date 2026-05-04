import { prisma, logger } from "../../config";

export class ActoresService {
  /**
   * Verifica si un usuario tiene uno de los roles permitidos.
   * @param userId - ID de la persona a verificar
   * @param allowedRoles - Lista de nombres de roles permitidos
   * @returns true si el usuario tiene al menos uno de los roles permitidos
   */
  async hasAllowedRole(
    userId: string,
    allowedRoles: string[],
  ): Promise<boolean> {
    try {
      const actor = await prisma.actores.findFirst({
        where: {
          id_persona: userId,
          tipo_rol: {
            nombre_rol: {
              in: allowedRoles,
            },
          },
          estado: "activo",
        },
        select: { id_actor: true },
      });

      return actor !== null;
    } catch (error) {
      logger.error("[ActoresService] Error verifying user role:", error);
      throw new Error("Error al verificar los permisos del usuario.");
    }
  }

  /**
   * Obtiene los roles activos de un usuario.
   * @param userId - ID de la persona
   * @returns Lista de nombres de roles activos del usuario
   */
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const actores = await prisma.actores.findMany({
        where: {
          id_persona: userId,
          estado: "activo",
        },
        include: {
          tipo_rol: {
            select: { nombre_rol: true },
          },
        },
      });

      return actores.map((a) => a.tipo_rol.nombre_rol);
    } catch (error) {
      logger.error("[ActoresService] Error fetching user roles:", error);
      throw new Error("Error al obtener los roles del usuario.");
    }
  }
}