import { BaseApiClient } from "@/shared/lib/api/base-client";

export interface Facultad {
  id_facultad: string;
  nombre_facultad: string;
  codigo_facultad: string;
}

export interface Programa {
  id_programa: string;
  nombre_programa: string;
  id_facultad: string;
  nombre_facultad: string | null;
}

export interface LineaAccion {
  id_linea_accion: string;
  nombre: string;
}

export interface Estudiante {
  id: string;
  name: string;
  email: string;
  document: string;
}

class CatalogService extends BaseApiClient {
  async getFacultades(): Promise<Facultad[]> {
    return this.request<Facultad[]>("/api/catalog/facultades", {
      requiresAuth: true,
    });
  }

  async getProgramas(idFacultad?: string): Promise<Programa[]> {
    const qs = idFacultad ? `?id_facultad=${encodeURIComponent(idFacultad)}` : "";
    return this.request<Programa[]>(`/api/catalog/programas${qs}`, {
      requiresAuth: true,
    });
  }

  async getEstudiantes(idFacultad?: string, idPrograma?: string): Promise<Estudiante[]> {
    const params = new URLSearchParams();
    if (idFacultad) params.set("id_facultad", idFacultad);
    if (idPrograma) params.set("id_programa", idPrograma);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return this.request<Estudiante[]>(`/api/catalog/estudiantes${qs}`, {
      requiresAuth: true,
    });
  }

  async getLineasAccion(): Promise<LineaAccion[]> {
    return this.request<LineaAccion[]>("/api/catalog/lineas-accion", {
      requiresAuth: true,
    });
  }
}

export const catalogService = new CatalogService();
