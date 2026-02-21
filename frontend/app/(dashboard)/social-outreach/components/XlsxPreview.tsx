import { useState, useMemo } from "react"
import { Download, Trash2, Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { DataSheetGrid, textColumn, checkboxColumn, keyColumn, intColumn } from 'react-datasheet-grid'
import 'react-datasheet-grid/dist/style.css'
import type { ExtractedData } from "../types"

const XlsxIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className={className}
  >
    {/* Base Document Shape */}
    <path fill="#ECEFF1" d="M39 16v24c0 2.2-1.8 4-4 4H13c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4h14l12 12z" />
    <path fill="#CFD8DC" d="M39 16l-12-2v-10z" />
    <path fill="#B0BEC5" d="M27 4v12h12z" />
    {/* XLSX Green Badge Rectangle */}
    <path fill="#4CAF50" d="M6 24h22v11H6z" />
    {/* X Letter */}
    <path fill="#FFF" d="M9 33.5l2-3.5-2-3.5h1.5l1.2 2.5 1.2-2.5H14l-2 3.5 2 3.5h-1.5L11.2 31 10 33.5z" />
    {/* L Letter */}
    <path fill="#FFF" d="M14.5 26.5h1.5v6H19v1.5h-4.5z" />
    {/* S Letter */}
    <path fill="#FFF" d="M20.5 27.5h3v1h-1.5c-1 0-1.5.5-1.5 1.5v1c0 1 .5 1.5 1.5 1.5h3v-1.5h-3v-1h1.5c1 0 1.5-.5 1.5-1.5v-1c0-1-.5-1.5-1.5-1.5h-3z" />
    {/* X Letter */}
    <path fill="#FFF" d="M24 33.5l2-3.5-2-3.5h1.5l1.2 2.5 1.2-2.5H29l-2 3.5 2 3.5h-1.5l-1.3-2.5-1.2 2.5z" />
    {/* Spreadsheet Grid Decoration Lines */}
    <path fill="#90A4AE" d="M13 15h14v2H13zM13 19h14v2H13z" />
    <path fill="#CFD8DC" d="M29 25h8v2h-8zM29 29h8v2h-8z" />
  </svg>
)

type XlsxPreviewProps = {
  extractedData: ExtractedData[]
  updateField: (dataId: string, field: "titulo" | "descripcion", value: string) => void
  updateLineaAccion: (dataId: string, linea: "educacion" | "convivenciaCultura" | "medioAmbiente" | "emprendimiento" | "servicioSocial", checked: boolean) => void
  updateEstudiante: (dataId: string, index: number, field: "nombre" | "codigo" | "cedula", value: string) => void
  addEstudianteBaseData: (dataId: string, baseData: { nombre: string; codigo: string; cedula: string }) => void
  removeAllFiles: () => void
  exportToXLSX: () => void
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
  studentIndex: number // Used to target correct student update
  nombre: string
  codigo: string
  cedula: string
  isFirstStudent: boolean
}

export const XlsxPreview = ({
  extractedData,
  updateField,
  updateLineaAccion,
  updateEstudiante,
  addEstudianteBaseData,
  removeAllFiles,
  exportToXLSX,
  isProcessing,
}: XlsxPreviewProps) => {

  // Flatten the structural extractedData into generic datagrid rows
  const data = useMemo(() => {
    const flat: FlatRow[] = []
    extractedData.forEach((project) => {
      if (project.estudiantes.length === 0) {
        flat.push({
          projectId: project.id,
          titulo: project.titulo,
          descripcion: project.descripcion,
          edu: project.lineasAccion.educacion,
          conv: project.lineasAccion.convivenciaCultura,
          med: project.lineasAccion.medioAmbiente,
          emp: project.lineasAccion.emprendimiento,
          serv: project.lineasAccion.servicioSocial,
          studentIndex: 0,
          nombre: "",
          codigo: "",
          cedula: "",
          isFirstStudent: true
        })
      } else {
        project.estudiantes.forEach((est, sIndex) => {
          flat.push({
            projectId: project.id,
            titulo: project.titulo,
            descripcion: project.descripcion,
            edu: project.lineasAccion.educacion,
            conv: project.lineasAccion.convivenciaCultura,
            med: project.lineasAccion.medioAmbiente,
            emp: project.lineasAccion.emprendimiento,
            serv: project.lineasAccion.servicioSocial,
            studentIndex: sIndex,
            nombre: est.nombre,
            codigo: est.codigo,
            cedula: est.cedula,
            isFirstStudent: sIndex === 0
          })
        })
      }
    })

    return flat
  }, [extractedData])

  // Handle changes propagated from the spreadsheet
  const handleChange = (newValue: any[], operations: any) => {
    const newRows = newValue as FlatRow[]

    // Handle addition of new rows via the AddRowsComponent (newValue length increases)
    if (newRows.length > data.length) {
      const addedCount = newRows.length - data.length
      // Find the last valid project ID to associate new rows with
      const lastValidRow = [...data].reverse().find(r => r.projectId !== "")

      if (lastValidRow?.projectId) {
        for (let i = 0; i < addedCount; i++) {
          addEstudianteBaseData(lastValidRow.projectId, { nombre: "", codigo: "", cedula: "" })
        }
      }
      return // skip field updates to let React state synchronize row structure
    }

    newRows.forEach((newRow, index) => {
      const oldRow = data[index]

      if (!oldRow || !newRow.projectId) return

      // Update structural fields from any student row of a project
      if (newRow.titulo !== oldRow.titulo) updateField(newRow.projectId, "titulo", newRow.titulo)
      if (newRow.descripcion !== oldRow.descripcion) updateField(newRow.projectId, "descripcion", newRow.descripcion)
      if (newRow.edu !== oldRow.edu) updateLineaAccion(newRow.projectId, "educacion", newRow.edu)
      if (newRow.conv !== oldRow.conv) updateLineaAccion(newRow.projectId, "convivenciaCultura", newRow.conv)
      if (newRow.med !== oldRow.med) updateLineaAccion(newRow.projectId, "medioAmbiente", newRow.med)
      if (newRow.emp !== oldRow.emp) updateLineaAccion(newRow.projectId, "emprendimiento", newRow.emp)
      if (newRow.serv !== oldRow.serv) updateLineaAccion(newRow.projectId, "servicioSocial", newRow.serv)

      // Update student fields
      if (newRow.nombre !== oldRow.nombre) updateEstudiante(newRow.projectId, newRow.studentIndex, "nombre", newRow.nombre)
      if (newRow.codigo !== oldRow.codigo) updateEstudiante(newRow.projectId, newRow.studentIndex, "codigo", newRow.codigo)
      if (newRow.cedula !== oldRow.cedula) updateEstudiante(newRow.projectId, newRow.studentIndex, "cedula", newRow.cedula)
    })
  }

  const columns = [
    { ...keyColumn('titulo', textColumn), title: 'TÍTULO DEL PROYECTO/PRÁCTICA', minWidth: 200 },
    { ...keyColumn('descripcion', textColumn), title: 'DESCRIPCIÓN', minWidth: 250 },
    { ...keyColumn('edu', checkboxColumn), title: 'EDU', minWidth: 50 },
    { ...keyColumn('conv', checkboxColumn), title: 'CONV', minWidth: 50 },
    { ...keyColumn('med', checkboxColumn), title: 'MED', minWidth: 50 },
    { ...keyColumn('emp', checkboxColumn), title: 'EMP', minWidth: 50 },
    { ...keyColumn('serv', checkboxColumn), title: 'SERV', minWidth: 50 },
    { ...keyColumn('nombre', textColumn), title: 'ESTUDIANTE', minWidth: 200 },
    { ...keyColumn('codigo', textColumn), title: 'CÓDIGO', minWidth: 120 },
    { ...keyColumn('cedula', textColumn), title: 'CÉDULA', minWidth: 120 },
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
            <Button
              variant="outline"
              size="sm"
              onClick={removeAllFiles}
              className="text-muted-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Limpiar todos
            </Button>
          )}

          <Button
            size="sm"
            onClick={exportToXLSX}
            disabled={extractedData.length === 0}
            className="bg-[#107c41] hover:bg-[#0c5a2f] text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar XLSX
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col min-h-0 overflow-hidden relative">
        {extractedData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/10">
            <XlsxIcon className="h-16 w-16 text-muted-foreground/30 mb-4 filter drop-shadow-sm" />
            <p className="text-sm font-medium text-muted-foreground">
              Vista previa del archivo Excel
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Carga archivos PDF para ver los datos extraídos
            </p>
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
                        type="number"
                        min="1"
                        max="100"
                        value={customRows}
                        onChange={(e) => setCustomRows(e.target.value)}
                        className="w-16 h-7 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-[#107c41]"
                      />
                      <button
                        onClick={() => {
                          const num = parseInt(customRows) || 1
                          if (num > 0) props.addRows(num)
                        }}
                        className="text-[#107c41] hover:underline"
                      >
                        estudiantes
                      </button>
                    </div>
                  </div>
                )
              }}
              createRow={() => ({
                projectId: "",
                titulo: "",
                descripcion: "",
                edu: false,
                conv: false,
                med: false,
                emp: false,
                serv: false,
                studentIndex: 0,
                nombre: "",
                codigo: "",
                cedula: "",
                isFirstStudent: true
              })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
