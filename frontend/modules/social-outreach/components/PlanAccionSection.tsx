"use client";

import { Plus, Trash2 } from "lucide-react";

export interface PlanAccionItem {
  objetivo_especifico: string;
  actividades: string;
  duracion: string;
  responsables: string;
  meta: string;
  indicador: string;
}

interface PlanAccionSectionProps {
  items: PlanAccionItem[];
  onChange: (items: PlanAccionItem[]) => void;
}

const emptyPlan: PlanAccionItem = {
  objetivo_especifico: "",
  actividades: "",
  duracion: "",
  responsables: "",
  meta: "",
  indicador: "",
};

const PlanAccionSection = ({ items, onChange }: PlanAccionSectionProps) => {
  const addItem = () => {
    onChange([...items, { ...emptyPlan }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PlanAccionItem, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Define los objetivos específicos, actividades, duración, responsables, metas e indicadores del proyecto.
        </p>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-400">
            No hay planes de acción. Haz clic en &quot;Agregar&quot; para crear uno.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Plan #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  aria-label="Eliminar plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Objetivo específico */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Objetivo específico
                  </label>
                  <textarea
                    value={item.objetivo_especifico}
                    onChange={(e) => updateItem(index, "objetivo_especifico", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Objetivo específico de esta actividad..."
                  />
                </div>

                {/* Actividades */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Actividades
                  </label>
                  <textarea
                    value={item.actividades}
                    onChange={(e) => updateItem(index, "actividades", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Actividades a realizar..."
                  />
                </div>

                {/* Duración */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={item.duracion}
                    onChange={(e) => updateItem(index, "duracion", e.target.value)}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: 4 semanas"
                  />
                </div>

                {/* Responsables */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Responsables
                  </label>
                  <input
                    type="text"
                    value={item.responsables}
                    onChange={(e) => updateItem(index, "responsables", e.target.value)}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nombres de los responsables"
                  />
                </div>

                {/* Meta */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Meta
                  </label>
                  <textarea
                    value={item.meta}
                    onChange={(e) => updateItem(index, "meta", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Meta esperada..."
                  />
                </div>

                {/* Indicador */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Indicador
                  </label>
                  <textarea
                    value={item.indicador}
                    onChange={(e) => updateItem(index, "indicador", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Indicador de cumplimiento..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanAccionSection;
