"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, X } from "lucide-react"
import Swal from "sweetalert2"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { FileEntry } from "../types"
import type {
  PDFDocumentProxy,
  RenderTask,
  TextLayer,
} from "pdfjs-dist"

type PdfPreviewPanelProps = {
  entry: FileEntry | null
  onClose: () => void
}

export const PdfPreviewPanel = ({
  entry,
  onClose,
}: PdfPreviewPanelProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRendering, setIsRendering] = useState(false)

  useEffect(() => {
    let isCancelled = false
    let pdfDoc: PDFDocumentProxy | null = null
    const renderTasks: RenderTask[] = []
    const textLayers: TextLayer[] = []

    const clearContainer = () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }

    const renderPdf = async () => {
      if (!entry) {
        clearContainer()
        return
      }

      setIsRendering(true)
      clearContainer()

      try {
        const pdfjs = await import("pdfjs-dist/build/pdf.mjs")
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString()

        const arrayBuffer = await entry.file.arrayBuffer()
        pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise

        const container = containerRef.current
        if (!container) return

        for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
          if (isCancelled) break
          const page = await pdfDoc.getPage(pageNumber)
          const baseViewport = page.getViewport({ scale: 1 })
          const availableWidth = container.clientWidth
            ? container.clientWidth - 16
            : baseViewport.width
          const scale =
            availableWidth > 0
              ? Math.min(availableWidth / baseViewport.width, 2)
              : 1
          const viewport = page.getViewport({ scale })

          const pageWrapper = document.createElement("div")
          pageWrapper.className = "relative mb-4 last:mb-0"
          pageWrapper.style.width = `${viewport.width}px`
          pageWrapper.style.height = `${viewport.height}px`
          pageWrapper.style.overflow = "hidden"  

          const canvas = document.createElement("canvas")
          const context = canvas.getContext("2d")
          if (!context) continue

          const outputScale = window.devicePixelRatio || 1
          canvas.width = Math.floor(viewport.width * outputScale)
          canvas.height = Math.floor(viewport.height * outputScale)
          canvas.style.width = `${viewport.width}px`
          canvas.style.height = `${viewport.height}px`
          context.setTransform(outputScale, 0, 0, outputScale, 0, 0)

          const renderTask = page.render({ canvasContext: context, viewport })
          renderTasks.push(renderTask)

          const textLayerDiv = document.createElement("div")
          textLayerDiv.className = "textLayer"
          textLayerDiv.style.width = `${viewport.width}px`
          textLayerDiv.style.height = `${viewport.height}px`

          pageWrapper.appendChild(canvas)
          pageWrapper.appendChild(textLayerDiv)
          container.appendChild(pageWrapper)

          const textContent = await page.getTextContent()
          const textLayer = new pdfjs.TextLayer({
            textContentSource: textContent,
            container: textLayerDiv,
            viewport,
          })
          textLayers.push(textLayer)

          await Promise.all([renderTask.promise, textLayer.render()])
        }
      } catch (error) {
        if (!isCancelled) {
          Swal.fire({
            icon: "error",
            title: "Error al cargar",
            text: "No se pudo renderizar el PDF.",
          })
        }
      } finally {
        if (!isCancelled) {
          setIsRendering(false)
        }
      }
    }

    renderPdf()

    return () => {
      isCancelled = true
      renderTasks.forEach((task) => task.cancel())
      textLayers.forEach((layer) => layer.cancel())
      void pdfDoc?.destroy()
    }
  }, [entry])

  const handleCopySelection = () => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim()
    if (!selectedText) return
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(selectedText).catch(() => { })
    }
  }

  return (
    <Card className="w-80 rounded-none border-y-0 border-l-0 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="truncate">{entry?.safeName ?? "Preview"}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Cerrar previsualización"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1">
          <div
            className="p-3"
            ref={containerRef}
            onMouseUp={handleCopySelection}
          />
        </ScrollArea>
        {isRendering && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">
              Renderizando PDF...
            </span>
          </div>
        )}
      </CardContent>
      <style jsx>{`
        .textLayer {
          position: absolute;
          inset: 0;
          overflow: hidden;
          color: transparent;
          -webkit-text-fill-color: transparent;
          transform-origin: 0 0;
        }
        .textLayer span {
          position: absolute;
          white-space: pre;
          cursor: text;
          transform-origin: 0 0;
        }
      `}</style>
    </Card>
  )
}
