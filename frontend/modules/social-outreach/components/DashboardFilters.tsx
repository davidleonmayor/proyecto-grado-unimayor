"use client";

import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import {
  catalogService,
  type Facultad,
  type Programa,
} from "@/modules/social-outreach/services/catalog.service";

export interface DashboardFilterValues {
  fecha_inicio?: string;
  fecha_fin?: string;
  id_facultad?: string;
  id_programa?: string;
}

interface DashboardFiltersProps {
  onFilterChange: (filters: DashboardFilterValues) => void;
}

const DashboardFilters = ({ onFilterChange }: DashboardFiltersProps) => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idFacultad, setIdFacultad] = useState("");
  const [idPrograma, setIdPrograma] = useState("");

  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load facultades on mount
  useEffect(() => {
    catalogService.getFacultades().then(setFacultades).catch(() => {});
  }, []);

  // Load programas when faculty changes
  useEffect(() => {
    if (!idFacultad) {
      setProgramas([]);
      setIdPrograma("");
      return;
    }
    catalogService.getProgramas(idFacultad).then(setProgramas).catch(() => setProgramas([]));
  }, [idFacultad]);

  const applyFilters = () => {
    onFilterChange({
      fecha_inicio: fechaInicio || undefined,
      fecha_fin: fechaFin || undefined,
      id_facultad: idFacultad || undefined,
      id_programa: idPrograma || undefined,
    });
  };

  const clearFilters = () => {
    setFechaInicio("");
    setFechaFin("");
    setIdFacultad("");
    setIdPrograma("");
    onFilterChange({});
  };

  const hasActiveFilters = fechaInicio || fechaFin || idFacultad || idPrograma;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
          {hasActiveFilters && (
            <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
              Activos
            </span>
          )}
        </div>
      </button>

      {/* Filter panel */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date from */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Date to */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Faculty */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Facultad
              </label>
              <select
                value={idFacultad}
                onChange={(e) => setIdFacultad(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="">Todas</option>
                {facultades.map((f) => (
                  <option key={f.id_facultad} value={f.id_facultad}>
                    {f.nombre_facultad}
                  </option>
                ))}
              </select>
            </div>

            {/* Program */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Programa
              </label>
              <select
                value={idPrograma}
                onChange={(e) => setIdPrograma(e.target.value)}
                disabled={!idFacultad}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">{idFacultad ? "Todos" : "Selecciona facultad"}</option>
                {programas.map((p) => (
                  <option key={p.id_programa} value={p.id_programa}>
                    {p.nombre_programa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-4">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
            <button
              type="button"
              onClick={applyFilters}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
