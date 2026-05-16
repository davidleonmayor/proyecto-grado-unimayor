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

  async getLineasAccion(): Promise<LineaAccion[]> {
    return this.request<LineaAccion[]>("/api/catalog/lineas-accion", {
      requiresAuth: true,
    });
  }
}

export const catalogService = new CatalogService();
