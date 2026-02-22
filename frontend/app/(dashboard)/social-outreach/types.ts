export type LineaAccion = {
  educacion: boolean
  convivenciaCultura: boolean
  medioAmbiente: boolean
  emprendimiento: boolean
  servicioSocial: boolean
}

export type Modalidad = {
  proyectoInvestigacion: boolean
  trabajoGrado: boolean
  practicaProfesional: boolean
  clinicaAula: boolean
  proyectoSocial: boolean
  otro: boolean
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
  modalidad: Modalidad
  estudiantes: Estudiante[]
  convenio: "si" | "no" | ""
  profesor: string
  tipoContratacion: string
  emailProfesor: string
  descripcionPoblacion: string
  rangoEdades: string
  beneficiariosDirectos: string
  lugarOrganizacion: string
  fechaInicio: string
  valor: string
  observaciones: string
}

export type FileEntry = {
  id: string
  file: File
  safeName: string
}