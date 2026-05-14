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

export type SocialOutreachIntegrante = {
  id_persona: string
  rol: string
  persona: {
    nombres: string
    apellidos: string
    correo_electronico: string | null
    num_doc_identidad: string | null
  }
}

export type SocialOutreachProjectDetail = {
  id_proyecto_social: string
  nombre: string
  descripcion: string | null
  tipo_mime: string | null
  fecha_registro: string
  id_persona_registra: string | null
  personas_impactadas: number
  estado: string
  integrantes: SocialOutreachIntegrante[]
}

type UpdateSocialOutreachPayload = {
  nombre: string
  descripcion?: string | null
  personas_impactadas?: number
  estado?: string
  archivo?: File
}

type UpdateSocialOutreachResponse = {
  message: string
  data: {
    id_proyecto_social: string
    nombre: string
  }
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
    console.log("Enviando archivo a la base de datos:", payload.nombre, payload.descripcion, payload.file)
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

  async getProjectById(id: string): Promise<SocialOutreachProjectDetail> {
    return this.request<SocialOutreachProjectDetail>(
      `/api/proyeccion-social/${id}`,
      {
        method: "GET",
        requiresAuth: true,
      },
    )
  }

  async updateProjectMetadata(
    id: string,
    payload: UpdateSocialOutreachPayload,
  ): Promise<UpdateSocialOutreachResponse> {
    if (payload.archivo) {
      const formData = new FormData()
      formData.append("nombre", payload.nombre)
      if (payload.descripcion !== undefined && payload.descripcion !== null) {
        formData.append("descripcion", payload.descripcion)
      }
      if (payload.personas_impactadas !== undefined) {
        formData.append("personas_impactadas", String(payload.personas_impactadas))
      }
      if (payload.estado !== undefined) {
        formData.append("estado", payload.estado)
      }
      formData.append("archivo", payload.archivo)

      return this.requestFormData<UpdateSocialOutreachResponse>(
        `/api/proyeccion-social/${id}`,
        formData,
        {
          method: "PUT",
          requiresAuth: true,
        },
      )
    }

    const { archivo: _archivo, ...rest } = payload
    return this.request<UpdateSocialOutreachResponse>(
      `/api/proyeccion-social/${id}`,
      {
        method: "PUT",
        requiresAuth: true,
        body: JSON.stringify(rest),
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
