"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Swal from "sweetalert2";
import { socialProjectsService } from "@/modules/social-outreach/services/social-projects.service";
import { useUserRole } from "@/shared/hooks/useUserRole";
import Link from "next/link";
import { FilePreviewModal } from "@/shared/components/ui/FilePreviewModal";

function InfoField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </h4>
      <p className="text-sm text-gray-700 whitespace-pre-line break-words overflow-hidden">
        {value}
      </p>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [anexos, setAnexos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProjectRole, setHasProjectRole] = useState(false);
  const { role } = useUserRole();
  const isPrivileged = hasProjectRole || role === "admin" || role === "dean";

  const [previewAnexo, setPreviewAnexo] = useState<{
    id: string;
    nombre: string;
  } | null>(null);

  const fetchPreviewBlob = useCallback(async () => {
    if (!previewAnexo) throw new Error("No hay archivo seleccionado");
    return socialProjectsService.getAnexoBlob(projectId, previewAnexo.id);
  }, [previewAnexo, projectId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const projectData =
        await socialProjectsService.getProjectById(projectId);
      setProject(projectData);

      const anexosData = await socialProjectsService.getAnexos(projectId);
      setAnexos(anexosData);

      setHasProjectRole(true);
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        "No se pudo cargar la información del proyecto",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Detalle del Proyecto
        </h1>
        <button
          onClick={() => loadData()}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizar
        </button>
      </div>

      {project && (
        <>
          {/* Top section: Info + Members */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left: Project Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {project.titulo}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Registrado el{" "}
                    {new Date(
                      project.fecha_de_presentacion,
                    ).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      project.estado === "Finalizado"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {project.estado}
                  </span>
                  {isPrivileged && (
                    <Link
                      href={`/social-outreach/social-projects/admin/edit/${projectId}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors flex-shrink-0"
                    >
                      Editar
                    </Link>
                  )}
                </div>
              </div>

              {project.resumen && (
                <InfoField label="Resumen" value={project.resumen} />
              )}
              {project.descripcion && (
                <InfoField label="Descripción" value={project.descripcion} />
              )}

              {/* Quick stats */}
              <div className="flex gap-4 pt-2 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-semibold text-blue-600">
                    {project.personas_impactadas}
                  </p>
                  <p className="text-xs text-gray-500">Personas impactadas</p>
                </div>
                {project.semestre && (
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800">
                      {project.semestre}
                    </p>
                    <p className="text-xs text-gray-500">Semestre</p>
                  </div>
                )}
                {project.duracion && (
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800">
                      {project.duracion}
                    </p>
                    <p className="text-xs text-gray-500">Duración</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Members */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Integrantes{" "}
                {project.integrantes?.length > 0 &&
                  `(${project.integrantes.length})`}
              </h3>
              {project.integrantes && project.integrantes.length > 0 ? (
                <div className="overflow-y-auto max-h-48 space-y-2 pr-1">
                  {project.integrantes.map((integrante: any) => (
                    <div
                      key={integrante.id_persona || integrante.id_integrante}
                      className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                        {integrante.persona?.nombres?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {integrante.persona?.nombres}{" "}
                          {integrante.persona?.apellidos}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            integrante.rol === "Docente"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {integrante.rol}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Sin integrantes registrados.
                </p>
              )}
            </div>
          </div>

          {/* Ficha Técnica — Información General */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 overflow-hidden">
            <h3 className="text-base font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Líneas de acción */}
              {project.lineas_accion && project.lineas_accion.length > 0 && (
                <div className="md:col-span-2">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Líneas de acción
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.lineas_accion.map((la: any) => (
                      <span
                        key={la.id_linea || la.linea_accion?.id_linea_accion}
                        className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full"
                      >
                        {la.linea_accion?.nombre || la.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Facultad */}
              {project.facultad && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Facultad
                  </h4>
                  <p className="text-sm text-gray-700">
                    {project.facultad.nombre_facultad}
                  </p>
                </div>
              )}

              {/* Programa */}
              {project.programa_academico && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Programa académico
                  </h4>
                  <p className="text-sm text-gray-700">
                    {project.programa_academico.nombre_programa}
                  </p>
                </div>
              )}

              {/* Asesor */}
              {project.asesor && (
                <div className="min-w-0">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Docente Asesor
                  </h4>
                  <p className="text-sm text-gray-700 truncate">
                    {project.asesor.nombres} {project.asesor.apellidos}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {project.asesor.correo_electronico}
                  </p>
                </div>
              )}

              {/* Proponentes */}
              {project.proponentes && project.proponentes.length > 0 && (
                <div className="min-w-0">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Proponentes
                  </h4>
                  <div className="space-y-1">
                    {project.proponentes.map((p: any) => (
                      <p
                        key={p.id_proponente}
                        className="text-sm text-gray-700 truncate"
                      >
                        {p.persona?.nombres} {p.persona?.apellidos}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Palabras clave */}
              {project.palabras_clave && (
                <div className="md:col-span-2">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Palabras clave
                  </h4>
                  <p className="text-sm text-gray-700">
                    {project.palabras_clave}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ficha Técnica — Contenido del Proyecto */}
          {(project.identificacion_problematica ||
            project.propuesta_solucion ||
            project.caracterizacion_poblacion ||
            project.objetivos ||
            project.resultados_esperados ||
            project.metodologia ||
            project.bibliografia) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 overflow-hidden">
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                Contenido del Proyecto
              </h3>
              <div className="space-y-5">
                <InfoField
                  label="Identificación de la problemática"
                  value={project.identificacion_problematica}
                />
                <InfoField
                  label="Propuesta de solución"
                  value={project.propuesta_solucion}
                />
                <InfoField
                  label="Caracterización de la población beneficiaria"
                  value={project.caracterizacion_poblacion}
                />
                <InfoField label="Objetivos" value={project.objetivos} />
                <InfoField
                  label="Resultados esperados"
                  value={project.resultados_esperados}
                />
                <InfoField label="Metodología" value={project.metodologia} />
                <InfoField label="Bibliografía" value={project.bibliografia} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Attachments section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            Archivos Adjuntos (Anexos)
          </h3>
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
                    Swal.fire(
                      "Error",
                      error.message || "Error al subir archivo",
                      "error",
                    );
                    setIsLoading(false);
                  }
                }}
              />
              <label
                htmlFor="upload-anexo"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Subir Archivo
              </label>
            </div>
          )}
        </div>

        {anexos.length === 0 ? (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            No hay anexos subidos a este proyecto.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre del Archivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Subida
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {anexos.map((anexo) => (
                  <tr
                    key={anexo.id_anexo}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewAnexo({
                            id: anexo.id_anexo,
                            nombre: anexo.nombre_archivo,
                          })
                        }
                        className="flex items-center gap-2 text-left hover:text-blue-600 transition-colors group"
                        title="Previsualizar archivo"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="group-hover:underline">
                          {anexo.nombre_archivo}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(anexo.fecha_subida).toLocaleString("es-CO")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          socialProjectsService.downloadAnexo(
                            projectId,
                            anexo.id_anexo,
                            anexo.nombre_archivo,
                          )
                        }
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
                                await socialProjectsService.deleteAnexo(
                                  projectId,
                                  anexo.id_anexo,
                                );
                                Swal.fire(
                                  "Eliminado",
                                  "El archivo ha sido eliminado.",
                                  "success",
                                );
                                loadData();
                              } catch (error: any) {
                                Swal.fire(
                                  "Error",
                                  error.message ||
                                    "No se pudo eliminar el archivo",
                                  "error",
                                );
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

      {previewAnexo && (
        <FilePreviewModal
          filename={previewAnexo.nombre}
          fetcher={fetchPreviewBlob}
          onClose={() => setPreviewAnexo(null)}
        />
      )}
    </div>
  );
}
