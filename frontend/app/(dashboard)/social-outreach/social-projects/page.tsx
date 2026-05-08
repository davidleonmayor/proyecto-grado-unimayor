"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { projectsService } from "@/modules/projects/services/projects.service";
import type { Project } from "@/modules/projects/types";
import { useUserRole } from "@/shared/hooks/useUserRole";
import { socialProjectsService } from "@/modules/social-outreach/services/social-projects.service";

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
}: ISolcialProjection) {
  return (
    <Link
      key={id_proyecto_social}
      href={`/social-outreach/social-projects/${id_proyecto_social}`}
      className="block group"
    >
      <div className="bg-white rounded-lg border border-gray-100 p-6 transition-all duration-300 h-full flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            {/* Status Dot */}
            {/* <span
              className={`w-2 h-2 rounded-full ${
                status === "Aprobado"
                  ? "bg-emerald-500"
                  : status === "Rechazado"
                    ? "bg-rose-500"
                    : "bg-amber-400"
              }`}
            ></span> */}
            {/* Status Text Outline */}
            {/* <span
              className={`text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border ${
                status === "Aprobado"
                  ? "text-emerald-700 border-emerald-200"
                  : status === "Rechazado"
                    ? "text-rose-700 border-rose-200"
                    : "text-amber-700 border-amber-200"
              }`}
            >
              {status}
            </span> */}
          </div>
          {/* <span className="text-[11px] text-gray-400 font-light whitespace-nowrap">
            {new Date(lastUpdate).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span> */}
        </div>

        <h3 className="text-[17px] leading-snug font-medium text-gray-800 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
          {nombre}
        </h3>

        <div className="mt-auto pt-5 border-t border-gray-50 flex flex-col gap-2">
          {/* <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Modalidad</span>
            <span className="text-gray-700 font-medium">{modality}</span>
          </div> */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Mi Rol</span>
            {/* <span className="text-gray-700 font-medium bg-gray-50 px-2 py-1 rounded">
              {role || "Coordinador/Observador"}
            </span> */}
          </div>
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
}

export default function ProjectsPage() {
  const { role, loading: roleLoading } = useUserRole();
  const [projects, setProjects] = useState<ISolcialProjection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isCoordinator = role === "admin" || role === "dean";

  useEffect(() => {
    const fetchProjects = async () => {
      if (roleLoading) return;
      try {
        let data;
        if (isCoordinator) {
          //data = await projectsService.getAllProjects();
          data = await socialProjectsService.getAllProjects();
        } else {
          data = []; //await projectsService.getProjects();
        }
        // console.log("here fuck:", data);
        setProjects(Array.isArray(data) ? data : []);
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

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-400 font-light">
          No tienes proyectos asignados actualmente.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectLink key={project.id_proyecto_social} {...project} />
          ))}
        </div>
      )}
    </div>
  );
}
