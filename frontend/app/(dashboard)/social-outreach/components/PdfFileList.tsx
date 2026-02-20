import { FileUp, Loader2, Trash2 } from "lucide-react"
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
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M7 2H13.5L19 7.5V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V4C5 2.9 5.9 2 7 2ZM13 3.5V8H17.5L13 3.5ZM9 12H15V13.5H9V12ZM9 15H13V16.5H9V15Z" />
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
}

export const PdfFileList = ({
  files,
  extractedData,
  isProcessing,
  fileInputRef,
  handleFileInput,
  removeFile,
  removeAllFiles,
}: PdfFileListProps) => {
  return (
    <Card className="w-80 rounded-none border-y-0 border-l-0 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <PdfIcon className="h-5 w-5 text-red-600" />
          pdf
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {files.length === 0 && !isProcessing && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileUp className="h-10 w-10 text-muted-foreground/50 mb-3" />
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
              return (
                <Card
                  key={index}
                  className="group cursor-pointer transition-all hover:shadow-md"
                  onClick={() => window.open(URL.createObjectURL(entry.file), '_blank')}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                      <PdfIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.safeName}
                      </p>
                      {data && (
                        <p className="text-xs text-muted-foreground truncate">
                          {data.titulo || "Sin título extraído"}
                        </p>
                      )}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(entry.id)
                          }}
                          aria-label={`Eliminar ${entry.safeName}`}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
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
            <FileUp className="mr-2 h-4 w-4" />
            Cargar archivo
          </Button>
          {files.length > 0 && (
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={removeAllFiles}
              disabled={isProcessing}
            >
              Eliminar todos
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
