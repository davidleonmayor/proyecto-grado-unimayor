import { Loader2, Eye } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import type { ChangeEvent, RefObject } from "react"
import type { ExtractedData, FileEntry } from "../types"

const PdfIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className={className}
  >
    {/* Base Document Shape */}
    <path fill="#ECEFF1" d="M39 16v24c0 2.2-1.8 4-4 4H13c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4h14l12 12z" />

    {/* Page Fold Shadow & Fold */}
    <path fill="#CFD8DC" d="M39 16l-12-2v-10z" />
    <path fill="#B0BEC5" d="M27 4v12h12z" />

    {/* PDF Badge Rectangle */}
    <path fill="#F44336" d="M6 24h18v11H6z" />

    {/* P Letter */}
    <path fill="#FFF" d="M9 26.5h2.5c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5H10.5v2h-1.5v-7zm1.5 1.5v2H11.5c.6 0 1-.4 1-1s-.4-1-1-1H10.5z" />

    {/* D Letter */}
    <path fill="#FFF" d="M15 26.5h2c1.9 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5h-2v-7zm1.5 1.5v4H17c1.1 0 2-.9 2-2s-.9-2-2-2h-.5z" />

    {/* F Letter */}
    <path fill="#FFF" d="M22 26.5h3.5v1.5H23.5v1H25v1.5h-1.5v3H22v-7z" />

    {/* Decoration Lines */}
    <path fill="#CFD8DC" d="M27 19h8v2h-8zM27 25h8v2h-8zM27 31h8v2h-8z" />
  </svg>
)

const DeleteIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className={className}
  >
    {/* Bin Handle and Lid */}
    <path fill="#90A4AE" d="M20 10h8v4h-8z" />
    <path fill="#CFD8DC" d="M12 14h24v4H12z" />

    {/* Bin Body */}
    <path fill="#ECEFF1" d="M15 18h18v22c0 2.2-1.8 4-4 4H19c-2.2 0-4-1.8-4-4V18z" />

    {/* Red accent for destruction */}
    <path fill="#F44336" d="M12 17h24v1H12z" />

    {/* Grooves */}
    <path fill="#CFD8DC" d="M19 24h2v14h-2zM27 24h2v14h-2z" />
  </svg>
)

const UploadIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className={className}
  >
    {/* Folder Back */}
    <path fill="#FFC107" d="M40 14H24l-4-4H8C5.8 10 4 11.8 4 14v22h40V18c0-2.2-1.8-4-4-4z" />
    {/* Paper/Document */}
    <path fill="#ECEFF1" d="M12 18h24v16H12z" />
    {/* Arrow Up Container */}
    <path fill="#4CAF50" d="M24 10c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12 5.4-12 12-12z" />
    {/* Arrow Up SVG */}
    <path fill="#FFF" d="M24 14l-6 6h4v8h4v-8h4l-6-6z" />
  </svg>
)

type PdfFileListProps = {
  files: FileEntry[]
  extractedData: ExtractedData[]
  isProcessing: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  handleFileInput: (e: ChangeEvent<HTMLInputElement>) => void | Promise<void>
  removeFile: (fileId: string) => void
  removeAllFiles: () => void
  viewingPdfId: string | null
  onViewPdf: (id: string | null) => void
}

export const PdfFileList = ({
  files,
  extractedData,
  isProcessing,
  fileInputRef,
  handleFileInput,
  removeFile,
  removeAllFiles,
  viewingPdfId,
  onViewPdf,
}: PdfFileListProps) => {
  return (
    <Card className="w-full rounded-none border-y-0 border-l-0 flex flex-col h-full bg-background">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <PdfIcon className="h-5 w-5 text-red-600" />
          Lista de Archivos PDF
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {files.length === 0 && !isProcessing && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UploadIcon className="h-16 w-16 mb-4 filter grayscale opacity-60" />
                <p className="text-sm text-muted-foreground">
                  No hay archivos cargados
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Sube archivos PDF para comenzar
                </p>
              </div>
            )}
            {files.map((entry, index) => {
              const data = extractedData.find((d) => d.id === entry.id)
              const isViewing = viewingPdfId === entry.id
              return (
                <Card
                  key={index}
                  className={`group cursor-pointer transition-all hover:shadow-md border-2 ${isViewing ? 'border-primary ring-1 ring-primary/20 bg-muted/20' : 'border-border'}`}
                  onClick={() => {
                    onViewPdf(isViewing ? null : entry.id)
                  }}
                >
                  <CardContent className="p-3 flex items-center gap-3 relative">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ">
                      <PdfIcon className="h-9 w-9 drop-shadow-sm" />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className={`text-sm font-semibold truncate pr-2 ${isViewing ? 'text-primary' : 'text-foreground'}`}>
                        {entry.safeName}
                      </p>
                      {data && (
                        <p className="text-xs text-muted-foreground truncate">
                          {data.titulo || "Sin título extraído"}
                        </p>
                      )}
                    </div>

                    {isViewing && (
                      <div className="absolute top-1/2 -translate-y-1/2 right-12 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-foreground/80" />
                      </div>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(entry.id)
                            if (isViewing) onViewPdf(null) // Unset if deleting viewed text
                          }}
                          aria-label={`Eliminar ${entry.safeName}`}
                        >
                          <DeleteIcon className="h-6 w-6 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all drop-shadow-sm" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Eliminar archivo</TooltipContent>
                    </Tooltip>
                  </CardContent>
                </Card>
              )
            })}
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Procesando archivos...
                </span>
              </div>
            )}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <UploadIcon className="mr-2 h-5 w-5 grayscale opacity-70" />
            Cargar archivo
          </Button>
          {files.length > 0 && (
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={removeAllFiles}
              disabled={isProcessing}
            >
              <DeleteIcon className="mr-2 h-5 w-5 grayscale opacity-70" />
              Eliminar todos
            </Button>
          )}
        </div>
      </CardContent>
    </Card >
  )
}
