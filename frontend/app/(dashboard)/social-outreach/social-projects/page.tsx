"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { projectsService } from "@/modules/projects/services/projects.service";
import type { Project } from "@/modules/projects/types";
import { useUserRole } from "@/shared/hooks/useUserRole";
import { socialProjectsService } from "@/modules/social-outreach/services/social-projects.service";
import { useSocialProjectsFilter } from "@/shared/hooks/useSocialProjectsFilter";

function CreateNewAdmin() {
  return (
    <div className="flex l-0 gap-3">
      <Link
        href="/social-outreach/social-projects/admin/new"
        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Nuevo Proyecto
      </Link>

      <Link
        href="/social-outreach/social-projects/admin"
        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Administrar Proyectos
      </Link>
    </div>
  );
}

type TProject = {
  id: string;
  status: string;
  lastUpdate: string;
  title: string;
  modality: string;
  role: string;
};

function ProjectLink({
  id_persona_registra,
  nombre,
  descripcion,
  tipo_mime,
  fecha_registro,
  id_proyecto_social,
  estado = "En proceso",
  personas_impactadas = 0,
}: ISolcialProjection) {
  const isFinalizado = estado === "Finalizado";

  return (
    <Link
      key={id_proyecto_social}
      href={`/social-outreach/social-projects/${id_proyecto_social}`}
      className="block group"
    >
      <div className="bg-white rounded-xl border border-gray-100 hover:border-primary-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-300 ${isFinalizado ? "bg-emerald-500" : "bg-amber-400 group-hover:bg-primary-500"}`} />

        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            {/* Status Indicator */}
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase border ${
              isFinalizado
                ? "bg-emerald-50/50 border-emerald-100 text-emerald-700"
                : "bg-amber-50/50 border-amber-100 text-amber-700"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isFinalizado ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`}></span>
              {estado}
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-400 text-xs font-light">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {new Date(fecha_registro).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <h3 className="text-[17px] leading-snug font-bold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
          {nombre}
        </h3>

        <p className="text-sm text-gray-500 font-light line-clamp-3 leading-relaxed mb-5 flex-grow">
          {descripcion || "Sin descripción disponible."}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-semibold text-gray-700">{(personas_impactadas || 0).toLocaleString()}</span>
            <span>beneficiarios</span>
          </div>

          <span className="text-xs font-semibold text-primary-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
            Detalles
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

interface ISolcialProjection {
  id_proyecto_social: string;
  nombre: string;
  descripcion: string;
  tipo_mime: string;
  fecha_registro: string;
  id_persona_registra: string | null;
  estado?: string;
  personas_impactadas?: number;
}

export default function ProjectsPage() {
  const { role, loading: roleLoading } = useUserRole();
  const [projects, setProjects] = useState<ISolcialProjection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredProjects,
    isAnyFilterActive,
    clearFilters,
  } = useSocialProjectsFilter(projects);

  const isCoordinator = role === "admin" || role === "dean";

  useEffect(() => {
    const fetchProjects = async () => {
      if (roleLoading) return;
      try {
        let data;
        if (isCoordinator) {
          data = await socialProjectsService.getAllProjects();
        } else {
          data = await socialProjectsService.getProjects();
        }
        setProjects(data?.items || []);
      } catch (err) {
        setError("Error al cargar proyectos");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [role, roleLoading, isCoordinator]);

  if (isLoading || roleLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Proyecciones Sociales
        </h1>
        {/* Admin button - Only visible for privileged users */}
        {isCoordinator && <CreateNewAdmin />}
      </div>

      {/* Filter and Search Bar Panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.015)] p-4 md:p-5 mb-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Text Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar proyecto..."
              className="w-full pl-9 pr-3 py-2 border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 focus:bg-white focus:border-secondary-400 rounded-lg text-xs outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 focus:bg-white focus:border-secondary-400 rounded-lg text-xs outline-none transition-all text-gray-600 appearance-none cursor-pointer"
            >
              <option value="all">Todos los Estados</option>
              <option value="Finalizado">Finalizado</option>
              <option value="En Curso">En Curso</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Clear Filter Toolbar details */}
        <div className="flex items-center justify-between text-xs text-gray-400 font-light border-t border-gray-50 pt-3 mt-1">
          <span>
            Mostrando <strong className="font-semibold text-gray-600">{filteredProjects.length}</strong> de <strong className="font-semibold text-gray-600">{projects.length}</strong> proyectos registrados.
          </span>
          {isAnyFilterActive && (
            <button
              onClick={clearFilters}
              className="text-secondary-500 hover:text-secondary-600 font-semibold flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-400 font-light">
          No tienes proyectos asignados actualmente.
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-400 font-light">
          No se encontraron proyectos que coincidan con los filtros aplicados.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectLink key={project.id_proyecto_social} {...project} />
          ))}
        </div>
      )}
    </div>
  );
}
