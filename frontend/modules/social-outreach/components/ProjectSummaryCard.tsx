"use client";

import Link from "next/link";

export interface ProjectSummary {
  id_proyecto_social: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  fecha_de_presentacion: string;
  fecha_finalizacion?: string | null;
  personas_impactadas: number;
}

interface ProjectSummaryCardProps {
  project: ProjectSummary;
}

const ProjectSummaryCard = ({ project }: ProjectSummaryCardProps) => {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link
      href={`/social-outreach/social-projects/${project.id_proyecto_social}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-primary-300 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-gray-800 truncate">
            {project.titulo}
          </h4>
          {project.descripcion && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {project.descripcion}
            </p>
          )}
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
            project.estado === "Finalizado"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {project.estado}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div>
          <span className="text-gray-400">Registro:</span>{" "}
          {formatDate(project.fecha_de_presentacion)}
        </div>
        <div>
          <span className="text-gray-400">Finalización:</span>{" "}
          {formatDate(project.fecha_finalizacion)}
        </div>
        <div>
          <span className="text-gray-400">Impacto:</span>{" "}
          <span className="font-medium text-primary-600">
            {project.personas_impactadas}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectSummaryCard;
