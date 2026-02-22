import { useEffect, useRef, useState } from "react"
import { Loader2, X, FileText } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import type { PDFDocumentProxy, RenderParameters } from "pdfjs-dist/types/src/display/api"

type PdfViewerProps = {
    file: File
    safeName: string
    width?: number
    onClose: () => void
}

export const PdfViewer = ({ file, safeName, onClose }: PdfViewerProps) => {
    const [numPages, setNumPages] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)
    const [containerWidth, setContainerWidth] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const pdfDocRef = useRef<PDFDocumentProxy | null>(null)

    useEffect(() => {
        let isMounted = true

        const loadPdf = async () => {
            setIsLoading(true)
            try {
                const pdfjs = (await import("pdfjs-dist/build/pdf.mjs")) as typeof import("pdfjs-dist/build/pdf")
                if (!pdfjs.GlobalWorkerOptions.workerSrc) {
                    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
                        "pdfjs-dist/build/pdf.worker.min.mjs",
                        import.meta.url
                    ).toString()
                }

                const arrayBuffer = await file.arrayBuffer()
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise

                if (isMounted) {
                    pdfDocRef.current = pdf
                    setNumPages(pdf.numPages)
                }
            } catch (error) {
                console.error("Error loading PDF", error)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        loadPdf()

        return () => {
            isMounted = false
        }
    }, [file])

    useEffect(() => {
        let active = true

        const renderPages = async () => {
            if (!pdfDocRef.current || numPages === 0 || !containerRef.current) return

            const container = containerRef.current
            const rawWidth = Math.max(container.clientWidth - 48, 0)
            const targetWidth = Math.min(rawWidth, 850)

            if (targetWidth <= 0) return

            container.innerHTML = ""

            const pdf = pdfDocRef.current

            for (let i = 1; i <= pdf.numPages; i++) {
                if (!active) break

                const page = await pdf.getPage(i)

                const unscaledViewport = page.getViewport({ scale: 1.0 })
                const scale = targetWidth / unscaledViewport.width
                const viewport = page.getViewport({ scale })

                const canvas = document.createElement("canvas")
                const context = canvas.getContext("2d")

                if (!context) continue

                canvas.height = viewport.height
                canvas.width = viewport.width
                canvas.style.display = "block"
                canvas.style.marginBottom = "24px"
                canvas.style.borderRadius = "8px"
                canvas.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.05)"
                canvas.style.backgroundColor = "white"
                canvas.style.maxWidth = "100%"
                canvas.style.height = "auto"

                container.appendChild(canvas)

                const renderContext: RenderParameters = {
                    canvasContext: context,
                    viewport: viewport,
                }

                await page.render(renderContext).promise
            }
        }

        if (!isLoading) {
            setTimeout(() => {
                if (active) renderPages()
            }, 50)
        }

        return () => {
            active = false
        }
    }, [numPages, file, isLoading, containerWidth])

    useEffect(() => {
        if (!containerRef.current) return

        const updateWidth = () => {
            const width = containerRef.current?.getBoundingClientRect().width ?? 0
            setContainerWidth(width)
        }

        updateWidth()

        const observer = new ResizeObserver(updateWidth)
        observer.observe(containerRef.current)

        return () => {
            observer.disconnect()
        }
    }, [])

    return (
        <div className="flex flex-col h-full bg-background relative w-full overflow-hidden">
            <div className="relative flex items-center gap-2 p-3 border-b border-t bg-muted/20 flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <h3 className="text-[13px] font-medium truncate text-foreground/80">
                        {safeName}
                    </h3>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7 rounded hover:bg-muted"
                    onClick={onClose}
                >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
            </div>

            <ScrollArea className="flex-1 bg-muted/10 h-full">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
                        <span className="text-xs">Cargando vista previa...</span>
                    </div>
                ) : (
                    <div
                        className="p-3 flex flex-col items-center relative overflow-hidden h-full min-h-full"
                        ref={containerRef}
                    />
                )}
            </ScrollArea>
        </div>
    )
}
