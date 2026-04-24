"use client"

import { useState, useMemo } from "react"
import { Download, Save, Trash2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { DataSheetGrid, textColumn, checkboxColumn, keyColumn } from 'react-datasheet-grid'
import 'react-datasheet-grid/dist/style.css'
import type { ExtractedData, Modalidad } from "../types"

const XlsxIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className}>
    <path fill="#ECEFF1" d="M39 16v24c0 2.2-1.8 4-4 4H13c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4h14l12 12z" />
    <path fill="#CFD8DC" d="M39 16l-12-2v-10z" />
    <path fill="#B0BEC5" d="M27 4v12h12z" />
    <path fill="#4CAF50" d="M6 24h22v11H6z" />
    <path fill="#FFF" d="M9 33.5l2-3.5-2-3.5h1.5l1.2 2.5 1.2-2.5H14l-2 3.5 2 3.5h-1.5L11.2 31 10 33.5z" />
    <path fill="#FFF" d="M14.5 26.5h1.5v6H19v1.5h-4.5z" />
    <path fill="#FFF" d="M20.5 27.5h3v1h-1.5c-1 0-1.5.5-1.5 1.5v1c0 1 .5 1.5 1.5 1.5h3v-1.5h-3v-1h1.5c1 0 1.5-.5 1.5-1.5v-1c0-1-.5-1.5-1.5-1.5h-3z" />
    <path fill="#FFF" d="M24 33.5l2-3.5-2-3.5h1.5l1.2 2.5 1.2-2.5H29l-2 3.5 2 3.5h-1.5l-1.3-2.5-1.2 2.5z" />
    <path fill="#90A4AE" d="M13 15h14v2H13zM13 19h14v2H13z" />
    <path fill="#CFD8DC" d="M29 25h8v2h-8zM29 29h8v2h-8z" />
  </svg>
)

type XlsxPreviewProps = {
  extractedData: ExtractedData[]
  updateField: (dataId: string, field: "titulo" | "descripcion" | "profesor" | "tipoContratacion" | "emailProfesor" | "descripcionPoblacion" | "rangoEdades" | "beneficiariosDirectos" | "lugarOrganizacion" | "fechaInicio" | "valor" | "observaciones", value: string) => void
  updateLineaAccion: (dataId: string, linea: "educacion" | "convivenciaCultura" | "medioAmbiente" | "emprendimiento" | "servicioSocial", checked: boolean) => void
  updateModalidad: (dataId: string, campo: keyof Modalidad, checked: boolean) => void
  updateConvenio: (dataId: string, value: "si" | "no" | "") => void
  updateEstudiante: (dataId: string, index: number, field: "nombre" | "codigo" | "cedula", value: string) => void
  addEstudianteBaseData: (dataId: string, baseData: { nombre: string; codigo: string; cedula: string }) => void
  removeAllFiles: () => void
  exportToXLSX: () => void
  saveToDatabase: () => Promise<void>
  isSavingToDb: boolean
  isProcessing: boolean
}

type FlatRow = {
  projectId: string
  titulo: string
  descripcion: string
  edu: boolean
  conv: boolean
  med: boolean
  emp: boolean
  serv: boolean
  modProjInv: boolean
  modTrabGrado: boolean
  modPracProf: boolean
  modCliAula: boolean
  modProjSocial: boolean
  modOtro: boolean
  convenioSi: boolean
  convenioNo: boolean
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
  studentIndex: number
  nombre: string
  codigo: string
  cedula: string
  isFirstStudent: boolean
}

export const XlsxPreview = ({
  extractedData,
  updateField,
  updateLineaAccion,
  updateModalidad,
  updateConvenio,
  updateEstudiante,
  addEstudianteBaseData,
  removeAllFiles,
  exportToXLSX,
  saveToDatabase,
  isSavingToDb,
  isProcessing,
}: XlsxPreviewProps) => {

  const data = useMemo(() => {
    const flat: FlatRow[] = []
    extractedData.forEach((project) => {
      const estudiantes = project.estudiantes.length > 0
        ? project.estudiantes
        : [{ nombre: "", codigo: "", cedula: "" }]

      estudiantes.forEach((est, sIndex) => {
        flat.push({
          projectId: project.id,
          titulo: project.titulo,
          descripcion: project.descripcion,
          edu: project.lineasAccion.educacion,
          conv: project.lineasAccion.convivenciaCultura,
          med: project.lineasAccion.medioAmbiente,
          emp: project.lineasAccion.emprendimiento,
          serv: project.lineasAccion.servicioSocial,
          modProjInv: project.modalidad.proyectoInvestigacion,
          modTrabGrado: project.modalidad.trabajoGrado,
          modPracProf: project.modalidad.practicaProfesional,
          modCliAula: project.modalidad.clinicaAula,
          modProjSocial: project.modalidad.proyectoSocial,
          modOtro: project.modalidad.otro,
          convenioSi: project.convenio === "si",
          convenioNo: project.convenio === "no",
          profesor: project.profesor,
          tipoContratacion: project.tipoContratacion,
          emailProfesor: project.emailProfesor,
          descripcionPoblacion: project.descripcionPoblacion,
          rangoEdades: project.rangoEdades,
          beneficiariosDirectos: project.beneficiariosDirectos,
          lugarOrganizacion: project.lugarOrganizacion,
          fechaInicio: project.fechaInicio,
          valor: project.valor,
          observaciones: project.observaciones,
          studentIndex: sIndex,
          nombre: est.nombre,
          codigo: est.codigo,
          cedula: est.cedula,
          isFirstStudent: sIndex === 0,
        })
      })
    })
    return flat
  }, [extractedData])

  const handleChange = (newValue: any[], operations: any) => {
    const newRows = newValue as FlatRow[]

    if (newRows.length > data.length) {
      const addedCount = newRows.length - data.length
      const lastValidRow = [...data].reverse().find(r => r.projectId !== "")
      if (lastValidRow?.projectId) {
        for (let i = 0; i < addedCount; i++) {
          addEstudianteBaseData(lastValidRow.projectId, { nombre: "", codigo: "", cedula: "" })
        }
      }
      return
    }

    newRows.forEach((newRow, index) => {
      const oldRow = data[index]
      if (!oldRow || !newRow.projectId) return

      // Campos de texto del proyecto
      const textFields = ["titulo", "descripcion", "profesor", "tipoContratacion", "emailProfesor",
        "descripcionPoblacion", "rangoEdades", "beneficiariosDirectos", "lugarOrganizacion",
        "fechaInicio", "valor", "observaciones"] as const
      textFields.forEach(field => {
        if (newRow[field] !== oldRow[field]) updateField(newRow.projectId, field, newRow[field])
      })

      // Líneas de acción
      if (newRow.edu  !== oldRow.edu)  updateLineaAccion(newRow.projectId, "educacion", newRow.edu)
      if (newRow.conv !== oldRow.conv) updateLineaAccion(newRow.projectId, "convivenciaCultura", newRow.conv)
      if (newRow.med  !== oldRow.med)  updateLineaAccion(newRow.projectId, "medioAmbiente", newRow.med)
      if (newRow.emp  !== oldRow.emp)  updateLineaAccion(newRow.projectId, "emprendimiento", newRow.emp)
      if (newRow.serv !== oldRow.serv) updateLineaAccion(newRow.projectId, "servicioSocial", newRow.serv)

      // Modalidad
      if (newRow.modProjInv    !== oldRow.modProjInv)    updateModalidad(newRow.projectId, "proyectoInvestigacion", newRow.modProjInv)
      if (newRow.modTrabGrado  !== oldRow.modTrabGrado)  updateModalidad(newRow.projectId, "trabajoGrado", newRow.modTrabGrado)
      if (newRow.modPracProf   !== oldRow.modPracProf)   updateModalidad(newRow.projectId, "practicaProfesional", newRow.modPracProf)
      if (newRow.modCliAula    !== oldRow.modCliAula)    updateModalidad(newRow.projectId, "clinicaAula", newRow.modCliAula)
      if (newRow.modProjSocial !== oldRow.modProjSocial) updateModalidad(newRow.projectId, "proyectoSocial", newRow.modProjSocial)
      if (newRow.modOtro       !== oldRow.modOtro)       updateModalidad(newRow.projectId, "otro", newRow.modOtro)

      // Convenio
      if (newRow.convenioSi !== oldRow.convenioSi) updateConvenio(newRow.projectId, newRow.convenioSi ? "si" : "")
      if (newRow.convenioNo !== oldRow.convenioNo) updateConvenio(newRow.projectId, newRow.convenioNo ? "no" : "")

      // Estudiante
      if (newRow.nombre  !== oldRow.nombre)  updateEstudiante(newRow.projectId, newRow.studentIndex, "nombre", newRow.nombre)
      if (newRow.codigo  !== oldRow.codigo)  updateEstudiante(newRow.projectId, newRow.studentIndex, "codigo", newRow.codigo)
      if (newRow.cedula  !== oldRow.cedula)  updateEstudiante(newRow.projectId, newRow.studentIndex, "cedula", newRow.cedula)
    })
  }

  const columns = [
    { ...keyColumn('titulo',               textColumn),     title: 'TÍTULO',             minWidth: 180 },
    { ...keyColumn('descripcion',          textColumn),     title: 'DESCRIPCIÓN',        minWidth: 220 },
    { ...keyColumn('edu',                  checkboxColumn), title: 'EDU',                minWidth: 45  },
    { ...keyColumn('conv',                 checkboxColumn), title: 'CONV',               minWidth: 45  },
    { ...keyColumn('med',                  checkboxColumn), title: 'MED AMB',            minWidth: 55  },
    { ...keyColumn('emp',                  checkboxColumn), title: 'EMP',                minWidth: 45  },
    { ...keyColumn('serv',                 checkboxColumn), title: 'SERV SOC',           minWidth: 55  },
    { ...keyColumn('nombre',               textColumn),     title: 'ESTUDIANTE',         minWidth: 180 },
    { ...keyColumn('codigo',               textColumn),     title: 'CÓDIGO',             minWidth: 100 },
    { ...keyColumn('cedula',               textColumn),     title: 'CÉDULA',             minWidth: 100 },
    { ...keyColumn('modProjInv',           checkboxColumn), title: 'PROY INV',           minWidth: 55  },
    { ...keyColumn('modTrabGrado',         checkboxColumn), title: 'TRAB GRA',           minWidth: 55  },
    { ...keyColumn('modPracProf',          checkboxColumn), title: 'PRAC PRO',           minWidth: 55  },
    { ...keyColumn('modCliAula',           checkboxColumn), title: 'CLIN AULA',          minWidth: 60  },
    { ...keyColumn('modProjSocial',        checkboxColumn), title: 'PROY SOC',           minWidth: 55  },
    { ...keyColumn('modOtro',              checkboxColumn), title: 'OTRO',               minWidth: 45  },
    { ...keyColumn('convenioSi',           checkboxColumn), title: 'CONV SI',            minWidth: 55  },
    { ...keyColumn('convenioNo',           checkboxColumn), title: 'CONV NO',            minWidth: 55  },
    { ...keyColumn('profesor',             textColumn),     title: 'PROFESOR',           minWidth: 180 },
    { ...keyColumn('tipoContratacion',     textColumn),     title: 'TIPO CONT.',         minWidth: 110 },
    { ...keyColumn('emailProfesor',        textColumn),     title: 'EMAIL PROF.',        minWidth: 160 },
    { ...keyColumn('descripcionPoblacion', textColumn),     title: 'DESC. POBLACIÓN',    minWidth: 180 },
    { ...keyColumn('rangoEdades',          textColumn),     title: 'RANGO EDADES',       minWidth: 100 },
    { ...keyColumn('beneficiariosDirectos',textColumn),     title: 'BENEFICIARIOS',      minWidth: 100 },
    { ...keyColumn('lugarOrganizacion',    textColumn),     title: 'LUGAR/ORG.',         minWidth: 160 },
    { ...keyColumn('fechaInicio',          textColumn),     title: 'FECHA INICIO',       minWidth: 100 },
    { ...keyColumn('valor',                textColumn),     title: 'VALOR',              minWidth: 100 },
    { ...keyColumn('observaciones',        textColumn),     title: 'OBSERVACIONES',      minWidth: 180 },
  ]

  return (
    <Card className="w-full flex flex-col h-full rounded-none border-0 shadow-none bg-background">
      <CardHeader className="py-3 px-4 flex-shrink-0 flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <XlsxIcon className="h-6 w-6 text-[#107c41]" />
            Hoja de cálculo interactiva
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs text-muted-foreground ml-2">.xlsx</Badge>
        </div>
        <div className="flex gap-2">
          {extractedData.length > 0 && (
            <Button variant="outline" size="sm" onClick={removeAllFiles} className="text-muted-foreground">
              <Trash2 className="mr-2 h-4 w-4" />
              Limpiar todos
            </Button>
          )}
          <Button
            size="sm"
            onClick={exportToXLSX}
            disabled={extractedData.length === 0 || isSavingToDb || isProcessing}
            className="bg-[#107c41] hover:bg-[#0c5a2f] text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar XLSX
          </Button>
          <Button
            size="sm"
            onClick={saveToDatabase}
            disabled={extractedData.length === 0 || isSavingToDb || isProcessing}
            className="bg-[#0f6cbd] hover:bg-[#0b4f8a] text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSavingToDb ? "Guardando..." : "Guardar en DB"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col min-h-0 overflow-hidden relative">
        {extractedData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/10">
            <XlsxIcon className="h-16 w-16 text-muted-foreground/30 mb-4 filter drop-shadow-sm" />
            <p className="text-sm font-medium text-muted-foreground">Vista previa del archivo Excel</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Carga archivos PDF para ver los datos extraídos</p>
          </div>
        ) : (
          <div className="flex-1 h-full w-full min-h-0 overflow-hidden relative">
            <DataSheetGrid
              value={data}
              onChange={handleChange}
              columns={columns}
              className="h-full xlsx-react-grid"
              rowClassName={({ rowData }) => rowData.isFirstStudent && rowData.projectId ? "border-t-[3px] border-[#107c41]/40" : ""}
              rowHeight={40}
              headerRowHeight={48}
              gutterColumn={{
                title: 'No.',
                component: ({ rowIndex }) => (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    {rowIndex + 1}
                  </div>
                )
              }}
              addRowsComponent={(props) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const [customRows, setCustomRows] = useState("1")
                return (
                  <div className="flex bg-background border-t border-border px-3 py-2 items-center gap-4 text-sm font-medium">
                    <button onClick={() => props.addRows(1)} className="text-[#107c41] hover:underline">Agregar 1 estudiante</button>
                    <span className="text-muted-foreground/30">|</span>
                    <button onClick={() => props.addRows(10)} className="text-[#107c41] hover:underline">Agregar 10 estudiantes</button>
                    <span className="text-muted-foreground/30">|</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-normal">Agregar</span>
                      <input
                        type="number" min="1" max="100" value={customRows}
                        onChange={(e) => setCustomRows(e.target.value)}
                        className="w-16 h-7 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#107c41]"
                      />
                      <button
                        onClick={() => { const num = parseInt(customRows) || 1; if (num > 0) props.addRows(num) }}
                        className="text-[#107c41] hover:underline"
                      >
                        estudiantes
                      </button>
                    </div>
                  </div>
                )
              }}
              createRow={() => ({
                projectId: "", titulo: "", descripcion: "",
                edu: false, conv: false, med: false, emp: false, serv: false,
                modProjInv: false, modTrabGrado: false, modPracProf: false,
                modCliAula: false, modProjSocial: false, modOtro: false,
                convenioSi: false, convenioNo: false,
                profesor: "", tipoContratacion: "", emailProfesor: "",
                descripcionPoblacion: "", rangoEdades: "", beneficiariosDirectos: "",
                lugarOrganizacion: "", fechaInicio: "", valor: "", observaciones: "",
                studentIndex: 0, nombre: "", codigo: "", cedula: "", isFirstStudent: true,
              })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
