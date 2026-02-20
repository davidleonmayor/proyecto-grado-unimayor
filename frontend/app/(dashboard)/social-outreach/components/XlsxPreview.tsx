import { ArrowRight, Download } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import type { ExtractedData, LineaAccion, Estudiante } from "../types"
import { ProjectCard } from "./ProjectCard"

const XlsxIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M14 2H6C4.895 2 4 2.895 4 4V20C4 21.105 4.895 22 6 22H18C19.105 22 20 21.105 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM10 17H14V19H10V17ZM10 14H14V16H10V14ZM10 11H14V13H10V11Z" />
  </svg>
)

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
            <XlsxIcon className="h-5 w-5 text-green-600" />
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
                <XlsxIcon className="h-14 w-14 text-muted-foreground/50 mb-3" />
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
