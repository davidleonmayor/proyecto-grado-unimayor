"use client"
import { useState, useRef, useEffect } from "react"
import { GripVertical } from "lucide-react"
import { TooltipProvider } from "@/shared/components/ui/tooltip"
import Swal from "sweetalert2"
import { PdfFileList } from "./components/PdfFileList"
import { XlsxPreview } from "./components/XlsxPreview"
import { PdfViewer } from "./components/PdfViewer"
import { useSocialOutreach } from "./useSocialOutreach"
import { socialOutreachService } from "./services/socialOutreach.service"

export default function SocialOutreachGenerator() {
  const outreach = useSocialOutreach()
  const [isSavingToDb, setIsSavingToDb] = useState(false)

  // Resizable panel state
  const [leftWidth, setLeftWidth] = useState(320)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)
  const dividerWidth = 8

  // PDF Viewer state
  const [viewingPdfId, setViewingPdfId] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const updateContainerWidth = () => {
      const width = containerRef.current?.getBoundingClientRect().width ?? 0
      setContainerWidth(width)
      if (width > 0) {
        setLeftWidth(prev => Math.min(prev, width))
      }
    }

    updateContainerWidth()

    const observer = new ResizeObserver(updateContainerWidth)
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const delta = e.clientX - startX.current
      const newWidth = startWidth.current + delta
      const maxWidth = containerWidth
        || containerRef.current?.getBoundingClientRect().width
        || 0

      if (maxWidth <= 0) return

      const clampedWidth = Math.min(Math.max(newWidth, 0), maxWidth)
      setLeftWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.classList.remove("cursor-col-resize")
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startX.current = e.clientX
    startWidth.current = leftWidth
    document.body.classList.add("cursor-col-resize")
  }

  // Find currently viewed PDF
  const prevFilesLength = useRef(outreach.files.length)

  useEffect(() => {
    // If the currently viewed PDF was removed, fall back or close
    if (viewingPdfId && !outreach.files.find(f => f.id === viewingPdfId)) {
      setViewingPdfId(outreach.files.length > 0 ? outreach.files[0].id : null)
    }
    // Auto-open if we just uploaded our first file
    if (prevFilesLength.current === 0 && outreach.files.length > 0) {
      setViewingPdfId(outreach.files[0].id)
    }
    prevFilesLength.current = outreach.files.length
  }, [outreach.files, viewingPdfId])

  const viewedFile = viewingPdfId
    ? outreach.files.find(f => f.id === viewingPdfId)
    : null

  const handleSaveToDatabase = async () => {
    try {
      const generatedFile = outreach.buildXlsxFileForDb()

      if (!generatedFile) {
        await Swal.fire({
          icon: "warning",
          title: "Sin datos",
          text: "No hay datos para guardar en la base de datos.",
          confirmButtonColor: "#107c41",
        })
        return
      }

      const defaultName = outreach.extractedData[0]?.titulo?.trim() || "proyecto proyeccion social"

      const { value: nombre } = await Swal.fire({
        title: "Guardar en DB",
        input: "text",
        inputLabel: "Nombre del registro",
        inputValue: defaultName,
        inputPlaceholder: "Ej: Proyecto Proyección Social 2026",
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#0f6cbd",
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return "El nombre es obligatorio"
          }
          return undefined
        },
      })

      if (!nombre) return

      setIsSavingToDb(true)
      const response = await socialOutreachService.saveXlsxToDatabase({
        file: generatedFile,
        nombre: nombre.trim(),
        descripcion: `Generado desde Social Outreach (${outreach.extractedData.length} proyecto(s))`,
      })

      await Swal.fire({
        icon: "success",
        title: "Guardado correctamente",
        text: response.message,
        confirmButtonColor: "#107c41",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el archivo en la base de datos"
      await Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: message,
        confirmButtonColor: "#d33",
      })
    } finally {
      setIsSavingToDb(false)
    }
  }

  const dividerLeft = Math.min(
    leftWidth,
    Math.max(containerWidth - dividerWidth, 0)
  )

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className="flex flex-col md:flex-row h-[calc(100vh-5rem)] bg-background overflow-hidden relative"
        style={{ '--left-width': `${leftWidth}px` } as React.CSSProperties}
      >
        {/* Left Panel */}
        <div
          className="flex-shrink-0 flex flex-col h-1/2 md:h-full w-full md:w-[var(--left-width)] overflow-hidden relative z-0 border-b md:border-b-0 md:border-r"
        >
          {viewingPdfId && viewedFile ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              <PdfViewer
                file={viewedFile.file}
                safeName={viewedFile.safeName}
                onClose={() => setViewingPdfId(null)}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-hidden">
              <PdfFileList
                files={outreach.files}
                extractedData={outreach.extractedData}
                isProcessing={outreach.isProcessing}
                fileInputRef={outreach.fileInputRef}
                handleFileInput={outreach.handleFileInput}
                removeFile={outreach.removeFile}
                removeAllFiles={outreach.removeAllFiles}
                viewingPdfId={viewingPdfId}
                onViewPdf={setViewingPdfId}
              />
            </div>
          )}
        </div>

        {/* Resizable Divider */}
        <div
          className="hidden md:flex absolute top-0 bottom-0 w-2 bg-muted/30 cursor-col-resize hover:bg-muted/60 transition-colors items-center justify-center z-10"
          style={{ left: dividerLeft }}
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background border-l">
          <XlsxPreview
            extractedData={outreach.extractedData}
            updateField={outreach.updateField}
            updateModalidad={outreach.updateModalidad}   
            updateConvenio={outreach.updateConvenio}     
            updateLineaAccion={outreach.updateLineaAccion}
            updateEstudiante={outreach.updateEstudiante}
            addEstudianteBaseData={outreach.addEstudianteBaseData}
            removeAllFiles={outreach.removeAllFiles}
            exportToXLSX={outreach.exportToXLSX}
            saveToDatabase={handleSaveToDatabase}
            isSavingToDb={isSavingToDb}
            isProcessing={outreach.isProcessing}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
