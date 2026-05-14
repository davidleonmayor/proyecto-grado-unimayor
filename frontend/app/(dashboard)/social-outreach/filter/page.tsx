"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { TableSearch } from "@/shared/components/ui/TableSearch";
import RoleProtectedRoute from "@/shared/components/layout/RoleProtectedRoute";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import {
  socialOutreachService,
  type SocialOutreachSearchItem,
} from "../services/socialOutreach.service";
import { XlsxPreview } from "../components/XlsxPreview";
import { useFilterEditor } from "./useFilterEditor";

function SocialOutreachFilterPageContent() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SocialOutreachSearchItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] =
    useState<SocialOutreachSearchItem | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isSavingToDb, setIsSavingToDb] = useState(false);

  const editor = useFilterEditor();

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) {
      setResults([]);
      setError(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await socialOutreachService.searchByName(
          normalized,
          50,
        );
        setResults(response.items);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo realizar la búsqueda";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const run = async () => {
      if (!selectedId) {
        editor.clear();
        setSelectedItem(null);
        setPreviewError(null);
        return;
      }

      try {
        setIsLoadingPreview(true);
        setPreviewError(null);
        const item = results.find((r) => r.id_proyecto_social === selectedId);
        setSelectedItem(item ?? null);

        const buffer = await socialOutreachService.downloadById(selectedId);
        editor.loadFromBuffer(buffer, {
          nombre: item?.nombre ?? "",
          descripcion: item?.descripcion ?? null,
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo cargar el registro seleccionado";
        setPreviewError(message);
        editor.clear();
      } finally {
        setIsLoadingPreview(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const handleSaveChanges = async () => {
    if (!selectedId) return;
    if (editor.extractedData.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Sin datos",
        text: "No hay datos para guardar.",
        confirmButtonColor: "#0f6cbd",
      });
      return;
    }

    const firstProject = editor.extractedData[0];
    const defaultNombre =
      firstProject.titulo?.trim() || selectedItem?.nombre || "";
    const defaultDescripcion = firstProject.descripcion?.trim() || "";

    const { value: formValues } = await Swal.fire<{
      nombre: string;
      descripcion: string;
    }>({
      title: "Guardar cambios",
      html: `
        <div style="text-align:left">
          <label style="font-size:12px;color:#555">Nombre</label>
          <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${defaultNombre.replace(/"/g, "&quot;")}" />
          <label style="font-size:12px;color:#555">Descripción</label>
          <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Descripción">${defaultDescripcion.replace(/</g, "&lt;")}</textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Actualizar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0f6cbd",
      preConfirm: () => {
        const nombre = (
          document.getElementById("swal-nombre") as HTMLInputElement | null
        )?.value.trim();
        const descripcion = (
          document.getElementById(
            "swal-descripcion",
          ) as HTMLTextAreaElement | null
        )?.value.trim();

        if (!nombre) {
          Swal.showValidationMessage("El nombre es obligatorio");
          return undefined;
        }
        return { nombre, descripcion: descripcion ?? "" };
      },
    });

    if (!formValues) return;

    try {
      setIsSavingToDb(true);
      const archivo = editor.buildFile() ?? undefined;
      const response = await socialOutreachService.updateProjectMetadata(
        selectedId,
        {
          nombre: formValues.nombre,
          descripcion: formValues.descripcion || null,
          archivo,
        },
      );

      setSelectedItem((prev) =>
        prev
          ? {
              ...prev,
              nombre: formValues.nombre,
              descripcion: formValues.descripcion || null,
            }
          : prev,
      );
      setResults((prev) =>
        prev.map((r) =>
          r.id_proyecto_social === selectedId
            ? {
                ...r,
                nombre: formValues.nombre,
                descripcion: formValues.descripcion || null,
              }
            : r,
        ),
      );

      await Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: response.message ?? "Cambios guardados correctamente",
        confirmButtonColor: "#107c41",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo actualizar el registro";
      await Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: message,
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSavingToDb(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-xl font-semibold">
          Filtrar archivos de proyección social
        </h1>
        <TableSearch placeholder="Buscar por nombre..." onSearch={setQuery} />
      </div>

      {!query.trim() && (
        <p className="text-sm text-gray-500">
          Escribí un nombre para buscar archivos guardados en base de datos.
        </p>
      )}

      {isLoading && <p className="text-sm text-gray-500">Buscando...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {query.trim() && !isLoading && !error && (
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
                  const isSelected = selectedId === item.id_proyecto_social;
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedId && (
        <div className="rounded-md border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b">
            <div className="text-sm">
              <span className="font-medium">Editando:</span>{" "}
              <span className="text-gray-700">
                {selectedItem?.nombre ?? "Cargando..."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Cerrar
            </button>
          </div>

          {isLoadingPreview && (
            <p className="p-4 text-sm text-gray-500">
              Cargando previsualización...
            </p>
          )}

          {previewError && (
            <p className="p-4 text-sm text-red-600">{previewError}</p>
          )}

          {!isLoadingPreview && !previewError && (
            <div className="h-[calc(100vh-22rem)] min-h-[420px]">
              <TooltipProvider>
                <XlsxPreview
                  extractedData={editor.extractedData}
                  updateField={editor.updateField}
                  updateLineaAccion={editor.updateLineaAccion}
                  updateModalidad={editor.updateModalidad}
                  updateConvenio={editor.updateConvenio}
                  updateEstudiante={editor.updateEstudiante}
                  addEstudianteBaseData={editor.addEstudianteBaseData}
                  addManualProject={editor.addManualProject}
                  removeAllFiles={editor.clear}
                  exportToXLSX={editor.exportToXLSX}
                  saveToDatabase={handleSaveChanges}
                  isSavingToDb={isSavingToDb}
                  isProcessing={false}
                />
              </TooltipProvider>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SocialOutreachFilter() {
  return (
    <RoleProtectedRoute allowedRoles={["admin"]} redirectTo="/">
      <SocialOutreachFilterPageContent />
    </RoleProtectedRoute>
  );
}
