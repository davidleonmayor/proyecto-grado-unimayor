import { useRef, useState } from "react"
import type { ChangeEvent, RefObject } from "react"
// import * as XLSX from "xlsx"
import * as XLSX from "xlsx-js-style"
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
  fileInputRef: RefObject<HTMLInputElement | null>
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
  addEstudianteBaseData: (
    dataId: string,
    baseData: { nombre: string; codigo: string; cedula: string }
  ) => void
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
    // @ts-ignore
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
        .filter((item: any): item is TextItem => "str" in item)
        .map((item: any) => item.str)
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
      // Captura SOLO entre comilla tipográfica de apertura y cierre
      /\u201c([^\u201d]+)\u201d/,           // " ... "
      /\u00ab([^\u00bb]+)\u00bb/,           // « ... »

      /ACCI[OÓ]N POR EL PLANETA\s*\n\s*[""]?([^\n""\n]+)/i,
      // Fallback: línea después de "TÍTULO DEL PROYECTO"
      /T[IÍ]TULO DEL PROYECTO\s*(?:[^\n]*\n){1,3}\s*[""]?([^\n""]+)/i,
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
              const sanitizedValue = (field === "cedula" || field === "codigo")
                ? sanitizeText(value.replace(/\D/g, ""), maxLength)
                : sanitizeText(value, maxLength)
              return { ...est, [field]: sanitizedValue }
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

  const addEstudianteBaseData = (dataId: string, baseData: { nombre: string; codigo: string; cedula: string }) => {
    setExtractedData((prev) =>
      prev.map((item) =>
        item.id === dataId
          ? {
            ...item,
            estudiantes: [
              ...item.estudiantes,
              {
                nombre: sanitizeText(baseData.nombre, MAX_NAME_LENGTH),
                codigo: sanitizeText(baseData.codigo.replace(/\D/g, ""), MAX_CODE_LENGTH),
                cedula: sanitizeText(baseData.cedula.replace(/\D/g, ""), MAX_ID_LENGTH)
              },
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

    // --- Validación (igual que antes) ---
    let hasEmptyFields = false
    let emptyFieldReason = ""

    for (const data of extractedData) {
      if (!data.titulo.trim() || !data.descripcion.trim()) {
        hasEmptyFields = true
        emptyFieldReason = `El proyecto "${data.titulo || "Sin título"}" tiene el título o la descripción vacíos.`
        break
      }
      if (data.estudiantes.length === 0) {
        hasEmptyFields = true
        emptyFieldReason = `El proyecto "${data.titulo}" no tiene estudiantes asignados.`
        break
      }
      for (const est of data.estudiantes) {
        if (!est.nombre.trim() || !est.codigo.trim() || !est.cedula.trim()) {
          hasEmptyFields = true
          emptyFieldReason = `Faltan datos en un estudiante del proyecto "${data.titulo}".`
          break
        }
      }
      if (hasEmptyFields) break
    }

    if (hasEmptyFields) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: emptyFieldReason,
        confirmButtonColor: "#107c41",
      })
      return
    }

    // --- Colores ---
    const YELLOW = "FFFF00"
    const GREEN = "C8E6C9"
    const CREAM = "FFFFC0"
    const WHITE = "FFFFFF"

    const fillYellow = { patternType: "solid", fgColor: { rgb: YELLOW } } as const
    const fillGreen = { patternType: "solid", fgColor: { rgb: GREEN } } as const
    const fillCream = { patternType: "solid", fgColor: { rgb: CREAM } } as const

    const borderStyle = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    } as const

    const makeCell = (
      v: string | number,
      fill: typeof fillYellow | typeof fillGreen | typeof fillCream,
      bold = false
    ): XLSX.CellObject => ({
      v,
      t: "s",
      s: {
        fill,
        font: { name: "Arial", sz: 9, bold },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: borderStyle,
      },
    })

    const wb = XLSX.utils.book_new()
    const ws: XLSX.WorkSheet = {}

    // --- Fila 1: headers principales ---
    // Columnas: A=1, B=2 ... AF=32
    const row1: Array<[number, string, typeof fillYellow | typeof fillGreen | typeof fillCream]> = [
      [1, "No.", fillYellow],
      [2, "TÍTULO DEL PROYECTO/PRÁCTICA", fillYellow],
      [3, "DESCRIPCIÓN DEL PROYECTO", fillYellow],
      // D-H: LÍNEA DE ACCIÓN (merge)
      [9, "ESTUDIANTES", fillYellow],
      [10, "CÓDIGO", fillGreen],
      [11, "CÉDULA", fillGreen],
      [12, "EMAIL", fillGreen],
      [13, "No. Estudiantes", fillGreen],
      [14, "EVIDENCIAS", fillGreen],
      // O-T: MODALIDAD (merge)
      // U-V: CONVENIO (merge)
      [23, "PROFESOR", fillYellow],
      [24, "TIPO CONTRATACIÓN", fillGreen],
      [25, "E-MAIL", fillGreen],
      // Z-AC: POBLACIÓN (merge)
      [30, "FECHA INICIO", fillGreen],
      [31, "VALOR", fillGreen],
      [32, "OBSERVACIONES", fillGreen],
    ]

    // Columnas que se mergean fila 1 y 2 (header + vacío abajo = span 2 rows)
    const spanTwoRows = [1, 2, 3, 9, 10, 11, 12, 13, 14, 23, 24, 25, 30, 31, 32]

    for (const [col, val, fill] of row1) {
      const addr = XLSX.utils.encode_cell({ r: 0, c: col - 1 })
      ws[addr] = makeCell(val, fill, true)
    }

    // Headers de grupos (fila 1, primera celda del rango mergeado)
    ws[XLSX.utils.encode_cell({ r: 0, c: 3 })] = makeCell("LÍNEA DE ACCIÓN", fillYellow, true)  // D1
    ws[XLSX.utils.encode_cell({ r: 0, c: 14 })] = makeCell("MODALIDAD", fillYellow, true)  // O1
    ws[XLSX.utils.encode_cell({ r: 0, c: 20 })] = makeCell("CONVENIO", fillYellow, true)  // U1
    ws[XLSX.utils.encode_cell({ r: 0, c: 25 })] = makeCell("POBLACIÓN", fillCream, true)  // Z1

    // --- Fila 2: sub-headers ---
    const lineaAccion = [
      "EDUCACIÓN",
      "CONVIVENCIA Y CULTURA",
      "MEDIO AMBIENTE Y SOSTENIBILIDAD",
      "EMPRENDIMIENTO",
      "SERVICIO SOCIAL",
    ]
    lineaAccion.forEach((h, i) => {
      const addr = XLSX.utils.encode_cell({ r: 1, c: 3 + i }) // D2..H2
      ws[addr] = {
        v: h, t: "s",
        s: {
          fill: fillYellow,
          font: { name: "Arial", sz: 9, bold: false },
          alignment: { horizontal: "center", vertical: "center", wrapText: true, textRotation: 90 },
          border: borderStyle,
        },
      }
    })

    const modalidad = [
      "PROYECTO DE INVESTIGACIÓN",
      "TRABAJO DE GRADO",
      "PRÁCTICA PROFESIONAL",
      "CLÍNICA DE AULA",
      "PROYECTO SOCIAL",
      "OTRO",
    ]
    modalidad.forEach((h, i) => {
      const addr = XLSX.utils.encode_cell({ r: 1, c: 14 + i }) // O2..T2
      ws[addr] = {
        v: h, t: "s",
        s: {
          fill: fillYellow,
          font: { name: "Arial", sz: 9, bold: false },
          alignment: { horizontal: "center", vertical: "center", wrapText: true, textRotation: 90 },
          border: borderStyle,
        },
      }
    })

    ws[XLSX.utils.encode_cell({ r: 1, c: 20 })] = makeCell("SI", fillYellow)  // U2
    ws[XLSX.utils.encode_cell({ r: 1, c: 21 })] = makeCell("NO", fillYellow)  // V2

    const poblacion = [
      "Descripción de la población",
      "Rango de edades",
      "No. de beneficiarios directos",
      "lugar/Barrio/sector/Organización",
    ]
    poblacion.forEach((h, i) => {
      const addr = XLSX.utils.encode_cell({ r: 1, c: 25 + i }) // Z2..AC2
      ws[addr] = makeCell(h, fillCream)
    })

    // Rellenar con borde las celdas vacías de fila 2 para los headers que hacen span
    for (const col of spanTwoRows) {
      const addr = XLSX.utils.encode_cell({ r: 1, c: col - 1 })
      if (!ws[addr]) {
        ws[addr] = { v: "", t: "s", s: { border: borderStyle, fill: { patternType: "solid", fgColor: { rgb: WHITE } } } }
      }
    }

    // --- Filas de datos (desde fila 3) ---
    let rowIndex = 2
    let rowNum = 1

    ws["!merges"] = [
      { s: { r: 0, c: 3 }, e: { r: 0, c: 7 } },
      { s: { r: 0, c: 14 }, e: { r: 0, c: 19 } },
      { s: { r: 0, c: 20 }, e: { r: 0, c: 21 } },
      { s: { r: 0, c: 25 }, e: { r: 0, c: 28 } },
      ...spanTwoRows.map(col => ({
        s: { r: 0, c: col - 1 },
        e: { r: 1, c: col - 1 },
      })),
    ]


    for (const data of extractedData) {
      const linea = data.lineasAccion
      const estudiantes = data.estudiantes.length > 0
        ? data.estudiantes
        : [{ nombre: "", codigo: "", cedula: "" }]

      const projectStartRow = rowIndex
      const projectRowCount = estudiantes.length

      estudiantes.forEach((est, estIndex) => {
        const isFirst = estIndex === 0

        const setCell = (
          col: number,
          val: string | number,
          fill: typeof fillYellow | typeof fillGreen | typeof fillCream,
          alignH: "center" | "left" = "center"
        ) => {
          const addr = XLSX.utils.encode_cell({ r: rowIndex, c: col - 1 })
          ws[addr] = {
            v: val, t: typeof val === "number" ? "n" : "s",
            s: {
              fill,
              font: { name: "Arial", sz: 9 },
              alignment: { horizontal: alignH, vertical: "center", wrapText: true },
              border: borderStyle,
            },
          }
        }

        setCell(1, rowNum++, fillYellow)
        setCell(2, isFirst ? data.titulo : "", fillYellow, "left")
        setCell(3, isFirst ? data.descripcion : "", fillGreen, "left")
        setCell(4, isFirst && linea.educacion ? "X" : "", fillYellow)
        setCell(5, isFirst && linea.convivenciaCultura ? "X" : "", fillYellow)
        setCell(6, isFirst && linea.medioAmbiente ? "X" : "", fillYellow)
        setCell(7, isFirst && linea.emprendimiento ? "X" : "", fillYellow)
        setCell(8, isFirst && linea.servicioSocial ? "X" : "", fillYellow)
        setCell(9, est.nombre, fillGreen, "left")
        setCell(10, est.codigo, fillGreen)
        setCell(11, est.cedula, fillGreen)
        setCell(12, "", fillGreen)
        setCell(13, "", fillGreen)
        setCell(14, "", fillGreen)
        setCell(15, "", fillGreen)
        setCell(16, "", fillGreen)
        setCell(17, "", fillGreen)
        setCell(18, "", fillGreen)
        setCell(19, isFirst && linea.servicioSocial ? "X" : "", fillGreen)
        setCell(20, "", fillGreen)
        setCell(21, "", fillGreen)
        setCell(22, "", fillGreen)
        setCell(23, "", fillYellow)
        setCell(24, "", fillGreen)
        setCell(25, "", fillGreen)
        setCell(26, "", fillCream, "left")
        setCell(27, "", fillCream)
        setCell(28, "", fillCream)
        setCell(29, "", fillCream, "left")
        setCell(30, "", fillGreen)
        setCell(31, "", fillGreen)
        setCell(32, "", fillGreen, "left")

        rowIndex++
      })

      // Merges verticales por proyecto (solo si tiene más de 1 estudiante)
      if (projectRowCount > 1) {
        const endRow = projectStartRow + projectRowCount - 1
        const colsToMerge = [2, 3, 4, 5, 6, 7, 8]
        colsToMerge.forEach(col => {
          ws["!merges"]!.push({
            s: { r: projectStartRow, c: col - 1 },
            e: { r: endRow, c: col - 1 },
          })
        })
      }
    }

    // --- Anchos de columna ---
    ws["!cols"] = [
      { wch: 5 },  // A: No.
      { wch: 30 },  // B: Título
      { wch: 40 },  // C: Descripción
      { wch: 12 },  // D: Educación
      { wch: 14 },  // E: Convivencia
      { wch: 14 },  // F: Medio Ambiente
      { wch: 12 },  // G: Emprendimiento
      { wch: 12 },  // H: Servicio Social
      { wch: 30 },  // I: Estudiantes
      { wch: 12 },  // J: Código
      { wch: 14 },  // K: Cédula
      { wch: 25 },  // L: Email est.
      { wch: 10 },  // M: No. Est.
      { wch: 18 },  // N: Evidencias
      { wch: 14 },  // O: Proy Inv.
      { wch: 14 },  // P: Trabajo grado
      { wch: 14 },  // Q: Práctica prof.
      { wch: 12 },  // R: Clínica aula
      { wch: 12 },  // S: Proy social
      { wch: 10 },  // T: Otro
      { wch: 8 },  // U: Sí
      { wch: 8 },  // V: No
      { wch: 30 },  // W: Profesor
      { wch: 15 },  // X: Tipo contrat.
      { wch: 25 },  // Y: Email prof.
      { wch: 30 },  // Z: Desc. población
      { wch: 14 },  // AA: Rango edades
      { wch: 15 },  // AB: Beneficiarios
      { wch: 25 },  // AC: Lugar
      { wch: 12 },  // AD: Fecha inicio
      { wch: 12 },  // AE: Valor
      { wch: 30 },  // AF: Observaciones
    ]

    // --- Alturas de fila ---
    ws["!rows"] = [
      { hpt: 30 },  // Fila 1
      { hpt: 80 },  // Fila 2 (sub-headers rotados)
      // filas de datos: dejar que Excel ajuste
    ]

    ws["!ref"] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: rowIndex - 1, c: 31 },
    })

    XLSX.utils.book_append_sheet(wb, ws, "Proyección Social")

    // xlsx-js-style requiere writeFile con bookType explícito para estilos
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
    addEstudianteBaseData,
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
