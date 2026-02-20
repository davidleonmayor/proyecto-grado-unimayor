import { ArrowRight, Download, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { ExtractedData, LineaAccion, Estudiante } from "../types"
import { ProjectCard } from "./ProjectCard"

type XlsxPreviewProps = {
  extractedData: ExtractedData[]
  expandedIds: Set<string>
  toggleExpanded: (id: string) => void
  updateField: (dataId: string, field: "titulo" | "descripcion", value: string) => void
  updateLineaAccion: (
    dataId: string,
    linea: keyof LineaAccion,
    checked: boolean
  ) => void
  addEstudiante: (dataId: string) => void
  updateEstudiante: (
    dataId: string,
    estudianteIndex: number,
    field: keyof Estudiante,
    value: string
  ) => void
  removeEstudiante: (dataId: string, estudianteIndex: number) => void
  exportToXLSX: () => void
}

export const XlsxPreview = ({
  extractedData,
  expandedIds,
  toggleExpanded,
  updateField,
  updateLineaAccion,
  addEstudiante,
  updateEstudiante,
  removeEstudiante,
  exportToXLSX,
}: XlsxPreviewProps) => {
  return (
    <>
      <div className="flex items-center justify-center w-16 bg-muted/30 border-x">
        <div className="flex flex-col items-center gap-2">
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium tracking-wider">
            EXPORTAR
          </span>
        </div>
      </div>
      <Card className="flex-1 rounded-none border-y-0 border-r-0 flex flex-col">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            .xlsx
          </CardTitle>
          <Button
            size="sm"
            onClick={exportToXLSX}
            disabled={extractedData.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar XLSX
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
            {extractedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Vista previa del archivo Excel
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Carga archivos PDF para ver los datos extraídos
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {extractedData.map((data, index) => (
                  <ProjectCard
                    key={data.id}
                    data={data}
                    index={index}
                    isExpanded={expandedIds.has(data.id)}
                    toggleExpanded={toggleExpanded}
                    updateField={updateField}
                    updateLineaAccion={updateLineaAccion}
                    addEstudiante={addEstudiante}
                    updateEstudiante={updateEstudiante}
                    removeEstudiante={removeEstudiante}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  )
}
