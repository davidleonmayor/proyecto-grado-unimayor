"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Swal from "sweetalert2";
import { socialProjectsService } from "@/modules/social-outreach/services/social-projects.service";
import { useUserRole } from "@/shared/hooks/useUserRole";
import Link from "next/link";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [anexos, setAnexos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProjectRole, setHasProjectRole] = useState(false);
  const { role } = useUserRole();
  const isPrivileged = hasProjectRole || role === "admin" || role === "dean";

  const [activeTab, setActiveTab] = useState<"history" | "review">("history");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const projectData = await socialProjectsService.getProjectById(projectId);
      setProject(projectData);

      const anexosData = await socialProjectsService.getAnexos(projectId);
      setAnexos(anexosData);

      setHasProjectRole(true); // Any authenticated user can view if they can access the page
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo cargar la información del proyecto", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Detalle del Proyecto</h1>
        <button
          onClick={() => loadData()}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Top section: Info + Members side by side */}
      {project && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Left: Project Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{project.nombre}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Registrado el {new Date(project.fecha_registro).toLocaleDateString("es-CO", {
                    year: "numeric", month: "long", day: "numeric"
                  })}
                </p>
              </div>
              {isPrivileged && (
                <Link
                  href={`/social-outreach/social-projects/admin/edit/${projectId}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors flex-shrink-0"
                >
                  Editar
                </Link>
              )}
            </div>

            {project.descripcion ? (
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Descripción</h3>
                <p className="text-gray-700 text-sm">{project.descripcion}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Sin descripción registrada.</p>
            )}
          </div>

          {/* Right: Members with scroll */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Integrantes {project.integrantes?.length > 0 && `(${project.integrantes.length})`}
            </h3>
            {project.integrantes && project.integrantes.length > 0 ? (
              <div className="overflow-y-auto max-h-48 space-y-2 pr-1">
                {project.integrantes.map((integrante: any) => (
                  <div key={integrante.id_persona} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                      {integrante.persona?.nombres?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {integrante.persona?.nombres} {integrante.persona?.apellidos}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        integrante.rol === "Docente"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {integrante.rol}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Sin integrantes registrados.</p>
            )}
          </div>
        </div>
      )}

      {/* Attachments section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">Archivos Adjuntos (Anexos)</h3>
          {isPrivileged && (
            <div className="relative">
              <input
                type="file"
                id="upload-anexo"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setIsLoading(true);
                    await socialProjectsService.uploadAnexo(projectId, file);
                    Swal.fire("Éxito", "Archivo subido correctamente", "success");
                    loadData();
                  } catch (error: any) {
                    Swal.fire("Error", error.message || "Error al subir archivo", "error");
                    setIsLoading(false);
                  }
                }}
              />
              <label
                htmlFor="upload-anexo"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Subir Archivo
              </label>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : anexos.length === 0 ? (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            No hay anexos subidos a este proyecto.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Archivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Subida</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {anexos.map((anexo) => (
                  <tr key={anexo.id_anexo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {anexo.nombre_archivo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(anexo.fecha_subida).toLocaleString("es-CO")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => socialProjectsService.downloadAnexo(projectId, anexo.id_anexo, anexo.nombre_archivo)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Descargar
                      </button>
                      {isPrivileged && (
                        <button
                          onClick={async () => {
                            const result = await Swal.fire({
                              title: "¿Estás seguro?",
                              text: "Esta acción no se puede deshacer",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonColor: "#d33",
                              cancelButtonColor: "#3085d6",
                              confirmButtonText: "Sí, eliminar",
                              cancelButtonText: "Cancelar",
                            });
                            if (result.isConfirmed) {
                              try {
                                setIsLoading(true);
                                await socialProjectsService.deleteAnexo(projectId, anexo.id_anexo);
                                Swal.fire("Eliminado", "El archivo ha sido eliminado.", "success");
                                loadData();
                              } catch (error: any) {
                                Swal.fire("Error", error.message || "No se pudo eliminar el archivo", "error");
                                setIsLoading(false);
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
