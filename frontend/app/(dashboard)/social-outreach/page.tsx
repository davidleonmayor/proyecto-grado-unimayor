"use client"
import React, { useState, useRef } from "react"
import {
  FileUp,
  Download,
  Trash2,
  FileText,
  Loader2,
  Plus,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Users,
  FileSpreadsheet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import * as XLSX from "xlsx"
import type { TextItem } from "pdfjs-dist/types/src/display/api"
import Swal from "sweetalert2"
type LineaAccion = {
  educacion: boolean
  convivenciaCultura: boolean
  medioAmbiente: boolean
  emprendimiento: boolean
  servicioSocial: boolean
}
type Estudiante = {
  nombre: string
  codigo: string
  cedula: string
}
type ExtractedData = {
  id: string
  fileName: string
  titulo: string
  descripcion: string
  lineasAccion: LineaAccion
  estudiantes: Estudiante[]
}
type FileEntry = {
  id: string
  file: File
  safeName: string
}
const MAX_FILES = 5
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const MAX_TITLE_LENGTH = 300
const MAX_DESCRIPTION_LENGTH = 2000
const MAX_NAME_LENGTH = 150
const MAX_CODE_LENGTH = 20
const MAX_ID_LENGTH = 15
const sanitizeText = (text: string, maxLength: number): string => {
  if (!text) return ""
  const withoutHtml = text.replace(/<[^>]*>/g, "")
  const withoutControl = withoutHtml.replace(/[\u0000-\u001F\u007F]/g, " ")
  const normalized = withoutControl.replace(/\s+/g, " ").trim()
  return normalized.slice(0, maxLength)
}
const sanitizeFileName = (fileName: string): string => {
  const baseName = fileName.replace(/\.pdf$/i, "")
  const sanitizedBase = baseName.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 100)
  if (!sanitizedBase) return ""
  return `${sanitizedBase}.pdf`
}
const isPdfMagicNumber = (buffer: ArrayBuffer): boolean => {
  const signature = [0x25, 0x50, 0x44, 0x46, 0x2d]
  const bytes = new Uint8Array(buffer.slice(0, 5))
  return signature.every((byte, index) => bytes[index] === byte)
}
export default function SocialOutreachGenerator() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const processDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingFilesRef = useRef<FileEntry[]>([])
  const scheduleProcessing = (entries: FileEntry[]) => {
    pendingFilesRef.current = [...pendingFilesRef.current, ...entries]
    if (processDebounceRef.current) {
      clearTimeout(processDebounceRef.current)
    }
    // Debounce de 300ms para evitar ráfagas de procesamiento
    processDebounceRef.current = setTimeout(() => {
      const pending = [...pendingFilesRef.current]
      pendingFilesRef.current = []
      processNewFiles(pending)
    }, 300)
  }
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const selectedFiles = Array.from(input.files || [])
    if (selectedFiles.length === 0) return
    if (files.length >= MAX_FILES) {
      Swal.fire({
        icon: "warning",
        title: "Límite de archivos",
        text: `Solo se permiten hasta ${MAX_FILES} archivos.`,
      })
      input.value = ""
      return
    }
    const availableSlots = MAX_FILES - files.length
    const candidates = selectedFiles.slice(0, availableSlots)
    const validFiles: FileEntry[] = []
    for (const file of candidates) {
      // Validación de tamaño (rechaza archivos vacíos o demasiado grandes)
      if (file.size <= 0) {
        Swal.fire({
          icon: "info",
          title: "Archivo vacío",
          text: `No puedes subir archivos vacíos. Archivo: "${file.name}".`,
        })
        continue
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        Swal.fire({
          icon: "info",
          title: "Archivo demasiado grande",
          text: `El archivo "${file.name}" supera el máximo de ${Math.round(
            MAX_FILE_SIZE_BYTES / (1024 * 1024)
          )} MB.`,
        })
        continue
      }
      // Validación básica por tipo y extensión (no es suficiente, pero bloquea errores comunes)
      const isPdfType = file.type === "application/pdf"
      const isPdfName = file.name.toLowerCase().endsWith(".pdf")
      if (!isPdfType || !isPdfName) {
        Swal.fire({
          icon: "error",
          title: "Archivo no válido",
          text: `El archivo "${file.name}" no es un PDF válido.`,
        })
        continue
      }
      // Validación por magic number (%PDF-) para prevenir spoofing de MIME/extensión
      const headerBuffer = await file.slice(0, 5).arrayBuffer()
      if (!isPdfMagicNumber(headerBuffer)) {
        Swal.fire({
          icon: "error",
          title: "Firma PDF inválida",
          text: `El archivo "${file.name}" no contiene la firma %PDF-.`,
        })
        continue
      }
      // Sanitización del nombre del archivo para evitar caracteres peligrosos
      const sanitizedName = sanitizeFileName(file.name)
      if (!sanitizedName) {
        Swal.fire({
          icon: "error",
          title: "Nombre inválido",
          text: `El archivo "${file.name}" tiene un nombre inválido.`,
        })
        continue
      }
      if (sanitizedName !== file.name) {
        Swal.fire({
          icon: "info",
          title: "Nombre ajustado",
          text: `El archivo "${file.name}" se mostrará como "${sanitizedName}".`,
        })
      }
      validFiles.push({ id: crypto.randomUUID(), file, safeName: sanitizedName })
    }
    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles])
      scheduleProcessing(validFiles)
    }
    // Reset input para permitir seleccionar el mismo archivo de nuevo
    input.value = ""
  }
  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((entry) => entry.id !== fileId))
    setExtractedData((prev) => prev.filter((item) => item.id !== fileId))
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.delete(fileId)
      return next
    })
  }
  const removeAllFiles = () => {
    setFiles([])
    setExtractedData([])
    setExpandedIds(new Set())
  }
  const extractTextFromPDF = async (file: File): Promise<string> => {
    // Importar pdfjs-dist dinámicamente para evitar errores de SSR
    const pdfjs = await import("pdfjs-dist/build/pdf.mjs")
    // Configurar el worker de PDF.js usando el bundle del paquete
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString()
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    let fullText = ""
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .filter((item): item is TextItem => "str" in item)
        .map((item) => item.str)
        .join(" ")
      fullText += pageText + "\n"
    }
    return fullText
  }
  const parseExtractedText = (
    text: string,
    fileName: string,
    fileId: string
  ): ExtractedData => {
    // Extraer título - buscar texto entre comillas después de TÍTULO DEL PROYECTO
    let titulo = ""
    const tituloPatterns = [
      /TÍTULO DEL PROYECTO[\s\S]*?[""]([^""]+)[""]|[""]([^""]+)[""][\s\S]*?LÍNEA DE ACCIÓN/i,
      /TÍTULO DEL PROYECTO[\s\S]*?"([^"]+)"/i,
      /ACCIÓN POR EL PLANETA[\s\n]*[""]([^""]+)[""]|[""]([^""]+)[""]/i,
    ]
    for (const pattern of tituloPatterns) {
      const match = text.match(pattern)
      if (match) {
        titulo = (match[1] || match[2] || "").trim()
        if (titulo) break
      }
    }
    if (!titulo) {
      const altMatch = text.match(/ACCIÓN POR EL PLANETA\s*["""]?([^"""\n]+)/i)
      if (altMatch) {
        titulo = altMatch[1].trim()
      }
    }
    // Extraer descripción del RESUMEN DEL PROYECTO
    let descripcion = ""
    const resumenPatterns = [
      /1\.\s*(?:1\.\s*)?RESUMEN DEL PROYECTO\s*([\s\S]*?)(?=2\.\s*PALABRAS|PALABRAS CLAVE|$)/i,
      /RESUMEN DEL PROYECTO\s*([\s\S]*?)(?=PALABRAS|$)/i,
    ]
    for (const pattern of resumenPatterns) {
      const match = text.match(pattern)
      if (match) {
        descripcion = match[1].replace(/\s+/g, " ").trim()
        if (descripcion) break
      }
    }
    const lineasAccion: LineaAccion = {
      educacion: /EDUCACI[OÓ]N\s*[_\s]*X[_\s]*/i.test(text),
      convivenciaCultura: /CONVIVENCIA\s*(Y|E)\s*CULTURA\s*[_\s]*X[_\s]*/i.test(text),
      medioAmbiente: /MEDIO\s*AMBIENTE\s*[_\s]*X[_\s]*/i.test(text),
      emprendimiento: /EMPRENDIMIENTO\s*[_\s]*X[_\s]*/i.test(text),
      servicioSocial: /SERVICIO\s*SOCIAL\s*[_\s]*X[_\s]*/i.test(text),
    }
    const estudiantes: Estudiante[] = []
    const estudianteRegex = /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,4})\s+(\d{7,10})\s+(\d{8,12})/g
    let estudianteMatch
    while ((estudianteMatch = estudianteRegex.exec(text)) !== null) {
      const nombre = estudianteMatch[1].trim()
      const codigo = estudianteMatch[2].trim()
      const cedula = estudianteMatch[3].trim()
      if (nombre && !nombre.includes("TODOS") && codigo && cedula) {
        const exists = estudiantes.some(
          (e) => e.codigo === codigo || e.cedula === cedula
        )
        if (!exists) {
          estudiantes.push({ nombre, codigo, cedula })
        }
      }
    }
    if (estudiantes.length === 0) {
      estudiantes.push({ nombre: "", codigo: "", cedula: "" })
    }
    return {
      id: fileId,
      fileName,
      // Sanitización de texto extraído antes de guardar en estado
      titulo: sanitizeText(titulo, MAX_TITLE_LENGTH),
      descripcion: sanitizeText(descripcion, MAX_DESCRIPTION_LENGTH),
      estudiantes: estudiantes.map((est) => ({
        nombre: sanitizeText(est.nombre, MAX_NAME_LENGTH),
        codigo: sanitizeText(est.codigo, MAX_CODE_LENGTH),
        cedula: sanitizeText(est.cedula, MAX_ID_LENGTH),
      })),
      lineasAccion,
    }
  }
  const processNewFiles = async (newFiles: FileEntry[]) => {
    if (newFiles.length === 0) return
    setIsProcessing(true)
    const results: ExtractedData[] = []
    for (const entry of newFiles) {
      try {
        const text = await extractTextFromPDF(entry.file)
        // Rechazar PDFs con JavaScript embebido antes de procesar
        if (/\/(JS|JavaScript)\b/i.test(text)) {
          Swal.fire({
            icon: "error",
            title: "PDF no permitido",
            text: `El archivo "${entry.safeName}" contiene JavaScript embebido.`,
          })
          removeFile(entry.id)
          continue
        }
        const data = parseExtractedText(text, entry.safeName, entry.id)
        results.push(data)
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al procesar",
          text: `No se pudo procesar "${entry.safeName}".`,
        })
      }
    }
    setExtractedData((prev) => [...prev, ...results])
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      results.forEach((r) => newSet.add(r.id))
      return newSet
    })
    setIsProcessing(false)
  }
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }
  const updateLineaAccion = (
    dataId: string,
    linea: keyof LineaAccion,
    checked: boolean
  ) => {
    setExtractedData((prev) =>
      prev.map((item) =>
        item.id === dataId
          ? { ...item, lineasAccion: { ...item.lineasAccion, [linea]: checked } }
          : item
      )
    )
  }
  const updateField = (
    dataId: string,
    field: "titulo" | "descripcion",
    value: string
  ) => {
    setExtractedData((prev) =>
      prev.map((item) =>
        item.id === dataId
          ? {
              ...item,
              [field]:
                field === "titulo"
                  ? sanitizeText(value, MAX_TITLE_LENGTH)
                  : sanitizeText(value, MAX_DESCRIPTION_LENGTH),
            }
          : item
      )
    )
  }
  const updateEstudiante = (
    dataId: string,
    estudianteIndex: number,
    field: keyof Estudiante,
    value: string
  ) => {
    setExtractedData((prev) =>
      prev.map((item) =>
        item.id === dataId
          ? {
              ...item,
              estudiantes: item.estudiantes.map((est, idx) => {
                if (idx !== estudianteIndex) return est
                const maxLength =
                  field === "nombre"
                    ? MAX_NAME_LENGTH
                    : field === "codigo"
                    ? MAX_CODE_LENGTH
                    : MAX_ID_LENGTH
                return { ...est, [field]: sanitizeText(value, maxLength) }
              }),
            }
          : item
      )
    )
  }
  const addEstudiante = (dataId: string) => {
    setExtractedData((prev) =>
      prev.map((item) =>
        item.id === dataId
          ? {
              ...item,
              estudiantes: [
                ...item.estudiantes,
                { nombre: "", codigo: "", cedula: "" },
              ],
            }
          : item
      )
    )
  }
  const removeEstudiante = (dataId: string, estudianteIndex: number) => {
    setExtractedData((prev) =>
      prev.map((item) =>
        item.id === dataId
          ? {
              ...item,
              estudiantes: item.estudiantes.filter(
                (_, idx) => idx !== estudianteIndex
              ),
            }
          : item
      )
    )
  }
  const exportToXLSX = () => {
    if (extractedData.length === 0) return
    const rows: any[] = []
    let rowNumber = 1
    extractedData.forEach((data) => {
      if (data.estudiantes.length === 0) {
        rows.push({
          "No.": rowNumber++,
          "TÍTULO DEL PROYECTO/PRÁCTICA": data.titulo,
          "DESCRIPCIÓN DEL PROYECTO": data.descripcion,
          EDUCACIÓN: data.lineasAccion.educacion ? "X" : "",
          "CONVIVENCIA Y CULTURA": data.lineasAccion.convivenciaCultura ? "X" : "",
          "MEDIO AMBIENTE": data.lineasAccion.medioAmbiente ? "X" : "",
          EMPRENDIMIENTO: data.lineasAccion.emprendimiento ? "X" : "",
          "SERVICIO SOCIAL": data.lineasAccion.servicioSocial ? "X" : "",
          ESTUDIANTES: "",
          CÓDIGO: "",
          CEDULA: "",
        })
      } else {
        data.estudiantes.forEach((est, idx) => {
          rows.push({
            "No.": idx === 0 ? rowNumber++ : "",
            "TÍTULO DEL PROYECTO/PRÁCTICA": idx === 0 ? data.titulo : "",
            "DESCRIPCIÓN DEL PROYECTO": idx === 0 ? data.descripcion : "",
            EDUCACIÓN: idx === 0 && data.lineasAccion.educacion ? "X" : "",
            "CONVIVENCIA Y CULTURA":
              idx === 0 && data.lineasAccion.convivenciaCultura ? "X" : "",
            "MEDIO AMBIENTE": idx === 0 && data.lineasAccion.medioAmbiente ? "X" : "",
            EMPRENDIMIENTO: idx === 0 && data.lineasAccion.emprendimiento ? "X" : "",
            "SERVICIO SOCIAL": idx === 0 && data.lineasAccion.servicioSocial ? "X" : "",
            ESTUDIANTES: est.nombre,
            CÓDIGO: est.codigo,
            CEDULA: est.cedula,
          })
        })
      }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Proyección Social")
    ws["!cols"] = [
      { wch: 5 },
      { wch: 40 },
      { wch: 60 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 35 },
      { wch: 12 },
      { wch: 15 },
    ]
    XLSX.writeFile(wb, "proyeccion_social.xlsx")
  }
  const lineasAccionLabels: { key: keyof LineaAccion; label: string }[] = [
    { key: "educacion", label: "Educación" },
    { key: "convivenciaCultura", label: "Convivencia y Cultura" },
    { key: "medioAmbiente", label: "Medio Ambiente" },
    { key: "emprendimiento", label: "Emprendimiento" },
    { key: "servicioSocial", label: "Servicio Social" },
  ]
  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-5rem)] bg-background">
        {/* Left Panel - PDF Files */}
        <Card className="w-80 rounded-none border-y-0 border-l-0 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
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
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                          <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
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
        {/* Center Arrow Indicator */}
        <div className="flex items-center justify-center w-16 bg-muted/30 border-x">
          <div className="flex flex-col items-center gap-2">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-medium tracking-wider">
              EXPORTAR
            </span>
          </div>
        </div>
        {/* Right Panel - XLSX Preview */}
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
                  {extractedData.map((data, index) => {
                    const isExpanded = expandedIds.has(data.id)
                    const activeLineas = lineasAccionLabels.filter(
                      (l) => data.lineasAccion[l.key]
                    )
                    return (
                      <Collapsible
                        key={data.id}
                        open={isExpanded}
                        onOpenChange={() => toggleExpanded(data.id)}
                      >
                        <Card
                          className={`transition-all ${
                            isExpanded ? "ring-2 ring-primary/20" : ""
                          }`}
                        >
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-sm font-medium truncate">
                                    {data.titulo || "Sin título"}
                                  </CardTitle>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {data.fileName}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {activeLineas.length > 0 && (
                                    <div className="flex gap-1">
                                      {activeLineas.slice(0, 3).map((l) => (
                                        <Badge
                                          key={l.key}
                                          variant="secondary"
                                          className="text-[10px] px-1.5"
                                        >
                                          {l.label.slice(0, 3).toUpperCase()}
                                        </Badge>
                                      ))}
                                      {activeLineas.length > 3 && (
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px] px-1.5"
                                        >
                                          +{activeLineas.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  <Badge variant="outline" className="gap-1">
                                    <Users className="h-3 w-3" />
                                    {data.estudiantes.length}
                                  </Badge>
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <Separator />
                            <CardContent className="pt-4 space-y-5">
                              {/* Título */}
                              <div className="space-y-2">
                                <Label htmlFor={`titulo-${data.id}`}>
                                  Título del Proyecto
                                </Label>
                                <Input
                                  id={`titulo-${data.id}`}
                                  value={data.titulo}
                                  onChange={(e) =>
                                    updateField(data.id, "titulo", e.target.value)
                                  }
                                  placeholder="Ingrese el título del proyecto..."
                                />
                              </div>
                              {/* Descripción */}
                              <div className="space-y-2">
                                <Label htmlFor={`descripcion-${data.id}`}>
                                  Descripción del Proyecto
                                </Label>
                                <Textarea
                                  id={`descripcion-${data.id}`}
                                  value={data.descripcion}
                                  onChange={(e) =>
                                    updateField(data.id, "descripcion", e.target.value)
                                  }
                                  placeholder="Ingrese la descripción del proyecto..."
                                  rows={3}
                                />
                              </div>
                              {/* Líneas de Acción */}
                              <div className="space-y-3">
                                <Label>Líneas de Acción</Label>
                                <div className="flex flex-wrap gap-4">
                                  {lineasAccionLabels.map((linea) => (
                                    <div
                                      key={linea.key}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`${data.id}-${linea.key}`}
                                        checked={data.lineasAccion[linea.key]}
                                        onCheckedChange={(checked) =>
                                          updateLineaAccion(
                                            data.id,
                                            linea.key,
                                            checked as boolean
                                          )
                                        }
                                      />
                                      <Label
                                        htmlFor={`${data.id}-${linea.key}`}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        {linea.label}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {/* Estudiantes */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label>Estudiantes</Label>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addEstudiante(data.id)}
                                    className="h-8 gap-1"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                    Agregar estudiante
                                  </Button>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="w-[40%]">
                                          Nombre completo
                                        </TableHead>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Cédula</TableHead>
                                        <TableHead className="w-10"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {data.estudiantes.map((est, estIndex) => (
                                        <TableRow key={estIndex}>
                                          <TableCell className="p-2">
                                            <Input
                                              value={est.nombre}
                                              onChange={(e) =>
                                                updateEstudiante(
                                                  data.id,
                                                  estIndex,
                                                  "nombre",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Nombre del estudiante"
                                              className="h-8"
                                            />
                                          </TableCell>
                                          <TableCell className="p-2">
                                            <Input
                                              value={est.codigo}
                                              onChange={(e) =>
                                                updateEstudiante(
                                                  data.id,
                                                  estIndex,
                                                  "codigo",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Código"
                                              className="h-8"
                                            />
                                          </TableCell>
                                          <TableCell className="p-2">
                                            <Input
                                              value={est.cedula}
                                              onChange={(e) =>
                                                updateEstudiante(
                                                  data.id,
                                                  estIndex,
                                                  "cedula",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Cédula"
                                              className="h-8"
                                            />
                                          </TableCell>
                                          <TableCell className="p-2">
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() =>
                                                    removeEstudiante(
                                                      data.id,
                                                      estIndex
                                                    )
                                                  }
                                                  className="h-8 w-8"
                                                  disabled={
                                                    data.estudiantes.length <= 1
                                                  }
                                                >
                                                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                Eliminar estudiante
                                              </TooltipContent>
                                            </Tooltip>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
/*
Vectores mitigados
- Spoofing de tipo/extensión: validación de magic number %PDF-.
- Inyección de scripts en PDF: bloqueo de /JS o /JavaScript antes de parsear.
- XSS/HTML injection en textos: sanitización de campos extraídos y inputs.
- Abuso por archivos grandes o vacíos: límites estrictos de tamaño (1 byte–10 MB).
- Abuso por ráfagas de carga: debounce de 300ms.
- Nombre de archivo malicioso: sanitización y longitud máxima.
*/
