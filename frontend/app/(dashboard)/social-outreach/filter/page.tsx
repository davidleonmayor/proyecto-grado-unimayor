"use client"

import { useEffect, useState } from "react"
import { TableSearch } from "@/shared/components/ui/TableSearch"
import { socialOutreachService, type SocialOutreachSearchItem } from "../services/socialOutreach.service"
import * as XLSX from "xlsx-js-style"

export default function SocialOutreachFilterPage() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SocialOutreachSearchItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([])
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([])
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  useEffect(() => {
    const normalized = query.trim()

    if (!normalized) {
      setResults([])
      setError(null)
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await socialOutreachService.searchByName(normalized, 50)
        setResults(response.items)
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo realizar la búsqueda"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }, 350)

    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const run = async () => {
      if (!selectedId) {
        setPreviewRows([])
        setPreviewHeaders([])
        setPreviewError(null)
        return
      }

      try {
        setIsPreviewLoading(true)
        setPreviewError(null)
        const fileBuffer = await socialOutreachService.downloadById(selectedId)
        const workbook = XLSX.read(fileBuffer, { type: "array" })
        const firstSheetName = workbook.SheetNames[0]

        if (!firstSheetName) {
          setPreviewRows([])
          setPreviewHeaders([])
          setPreviewError("El archivo no contiene hojas para previsualizar")
          return
        }

        const worksheet = workbook.Sheets[firstSheetName]
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: "",
        })

        const headers = rows.length > 0
          ? Object.keys(rows[0])
          : []

        setPreviewRows(rows)
        setPreviewHeaders(headers)
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo previsualizar el archivo"
        setPreviewError(message)
      } finally {
        setIsPreviewLoading(false)
      }
    }

    run()
  }, [selectedId])

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-xl font-semibold">Filtrar archivos de proyección social</h1>
        <TableSearch
          placeholder="Buscar por nombre..."
          onSearch={setQuery}
        />
      </div>

      {!query.trim() && (
        <p className="text-sm text-gray-500">
          Escribí un nombre para buscar archivos guardados en base de datos.
        </p>
      )}

      {isLoading && <p className="text-sm text-gray-500">Buscando...</p>}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {query.trim() && !isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-md border border-gray-200 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Descripción</th>
                  <th className="text-left p-3 font-medium">Tipo</th>
                  <th className="text-left p-3 font-medium">Fecha registro</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td className="p-3 text-gray-500" colSpan={4}>
                      No se encontraron coincidencias para "{query.trim()}".
                    </td>
                  </tr>
                ) : (
                  results.map((item) => {
                    const isSelected = selectedId === item.id_proyecto_social
                    return (
                      <tr
                        key={item.id_proyecto_social}
                        className={`border-t border-gray-100 cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                        onClick={() => setSelectedId(item.id_proyecto_social)}
                      >
                        <td className="p-3">{item.nombre}</td>
                        <td className="p-3">{item.descripcion || "-"}</td>
                        <td className="p-3">{item.tipo_mime}</td>
                        <td className="p-3">
                          {new Date(item.fecha_registro).toLocaleString("es-CO")}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-md border border-gray-200 p-3 overflow-x-auto">
            <h2 className="text-sm font-semibold mb-3">Previsualización XLSX</h2>

            {!selectedId && (
              <p className="text-sm text-gray-500">Seleccioná un registro para ver su contenido.</p>
            )}

            {selectedId && isPreviewLoading && (
              <p className="text-sm text-gray-500">Cargando previsualización...</p>
            )}

            {selectedId && previewError && (
              <p className="text-sm text-red-600">{previewError}</p>
            )}

            {selectedId && !isPreviewLoading && !previewError && (
              previewRows.length === 0 ? (
                <p className="text-sm text-gray-500">El archivo no tiene filas para mostrar.</p>
              ) : (
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {previewHeaders.map((header) => (
                        <th key={header} className="text-left p-2 font-medium whitespace-nowrap">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.slice(0, 50).map((row, rowIndex) => (
                      <tr key={`row-${rowIndex}`} className="border-t border-gray-100">
                        {previewHeaders.map((header) => (
                          <td key={`${rowIndex}-${header}`} className="p-2 whitespace-nowrap">
                            {String(row[header] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
