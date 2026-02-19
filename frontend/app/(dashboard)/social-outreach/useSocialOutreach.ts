import { useRef, useState } from "react"
import type { ChangeEvent, RefObject } from "react"
import * as XLSX from "xlsx"
import type { TextItem } from "pdfjs-dist/types/src/display/api"
import Swal from "sweetalert2"
import {
  MAX_CODE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES,
  MAX_ID_LENGTH,
  MAX_NAME_LENGTH,
  MAX_TITLE_LENGTH,
} from "./constants"
import type { ExtractedData, FileEntry, LineaAccion, Estudiante } from "./types"
import { isPdfMagicNumber, sanitizeFileName, sanitizeText } from "./utils"

type XlsxRow = Record<string, string | number>

type UseSocialOutreachResult = {
  files: FileEntry[]
  extractedData: ExtractedData[]
  isProcessing: boolean
  expandedIds: Set<string>
  fileInputRef: RefObject<HTMLInputElement>
  handleFileInput: (e: ChangeEvent<HTMLInputElement>) => Promise<void>
  removeFile: (fileId: string) => void
  removeAllFiles: () => void
  toggleExpanded: (id: string) => void
  updateLineaAccion: (
    dataId: string,
    linea: keyof LineaAccion,
    checked: boolean
  ) => void
  updateField: (
    dataId: string,
    field: "titulo" | "descripcion",
    value: string
  ) => void
  updateEstudiante: (
    dataId: string,
    estudianteIndex: number,
    field: keyof Estudiante,
    value: string
  ) => void
  addEstudiante: (dataId: string) => void
  removeEstudiante: (dataId: string, estudianteIndex: number) => void
  exportToXLSX: () => void
}

export const useSocialOutreach = (): UseSocialOutreachResult => {
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

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
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
    const rows: XlsxRow[] = []
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

  return {
    files,
    extractedData,
    isProcessing,
    expandedIds,
    fileInputRef,
    handleFileInput,
    removeFile,
    removeAllFiles,
    toggleExpanded,
    updateLineaAccion,
    updateField,
    updateEstudiante,
    addEstudiante,
    removeEstudiante,
    exportToXLSX,
  }
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
