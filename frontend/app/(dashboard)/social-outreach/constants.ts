import type { LineaAccion } from "./types"

export const MAX_FILES = 5
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
export const MAX_TITLE_LENGTH = 300
export const MAX_DESCRIPTION_LENGTH = 2000
export const MAX_NAME_LENGTH = 150
export const MAX_CODE_LENGTH = 20
export const MAX_ID_LENGTH = 15

export const lineasAccionLabels: { key: keyof LineaAccion; label: string }[] = [
  { key: "educacion", label: "Educación" },
  { key: "convivenciaCultura", label: "Convivencia y Cultura" },
  { key: "medioAmbiente", label: "Medio Ambiente" },
  { key: "emprendimiento", label: "Emprendimiento" },
  { key: "servicioSocial", label: "Servicio Social" },
]
