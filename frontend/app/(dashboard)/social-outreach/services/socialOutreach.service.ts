import { BaseApiClient } from "@/shared/lib/api/base-client"

type SaveSocialOutreachPayload = {
  file: File
  nombre: string
  descripcion?: string
}

export type SocialOutreachSearchItem = {
  id_proyecto_social: string
  nombre: string
  descripcion: string | null
  tipo_mime: string
  fecha_registro: string
  id_persona_registra: string | null
}

export type SearchSocialOutreachResponse = {
  total: number
  items: SocialOutreachSearchItem[]
}

type SaveSocialOutreachResponse = {
  message: string
  data: {
    id_proyecto_social: string
    nombre: string
    fecha_registro: string
  }
}

class SocialOutreachService extends BaseApiClient {
  async saveXlsxToDatabase(payload: SaveSocialOutreachPayload): Promise<SaveSocialOutreachResponse> {
    const formData = new FormData()
    formData.append("nombre", payload.nombre)
    if (payload.descripcion) {
      formData.append("descripcion", payload.descripcion)
    }
    formData.append("archivo", payload.file)

    return this.requestFormData<SaveSocialOutreachResponse>(
      "/api/proyeccion-social",
      formData,
      {
        method: "POST",
        requiresAuth: true,
      },
    )
  }

  async searchByName(nombre: string, limit: number = 20): Promise<SearchSocialOutreachResponse> {
    const params = new URLSearchParams({
      nombre,
      limit: String(limit),
    })

    return this.request<SearchSocialOutreachResponse>(
      `/api/proyeccion-social/search?${params.toString()}`,
      {
        method: "GET",
        requiresAuth: true,
      },
    )
  }

  async downloadById(id: string): Promise<ArrayBuffer> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error("No se encontró el token de autenticación")
    }

    const response = await fetch(`${this.baseURL}/api/proyeccion-social/${id}/download`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData?.error || errorData?.message || "Error al descargar archivo",
      )
    }

    return response.arrayBuffer()
  }
}

export const socialOutreachService = new SocialOutreachService()
