export type LineaAccion = {
  educacion: boolean
  convivenciaCultura: boolean
  medioAmbiente: boolean
  emprendimiento: boolean
  servicioSocial: boolean
}

export type Estudiante = {
  nombre: string
  codigo: string
  cedula: string
}

export type ExtractedData = {
  id: string
  fileName: string
  titulo: string
  descripcion: string
  lineasAccion: LineaAccion
  estudiantes: Estudiante[]
}

export type FileEntry = {
  id: string
  file: File
  safeName: string
}
