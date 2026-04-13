import { BaseApiClient } from "@/shared/lib/api/base-client"

type SaveSocialOutreachPayload = {
  file: File
  nombre: string
  descripcion?: string
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
}

export const socialOutreachService = new SocialOutreachService()
