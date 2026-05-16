"use client";

import { Plus, Trash2 } from "lucide-react";

export interface PresupuestoEquipoItem {
  nombre: string;
  cargo: string;
  funcion: string;
  tipo_vinculacion: string;
  salario: number | "";
  total: number | "";
}

interface PresupuestoEquipoSectionProps {
  items: PresupuestoEquipoItem[];
  onChange: (items: PresupuestoEquipoItem[]) => void;
}

const emptyItem: PresupuestoEquipoItem = {
  nombre: "",
  cargo: "",
  funcion: "",
  tipo_vinculacion: "",
  salario: "",
  total: "",
};

const PresupuestoEquipoSection = ({ items, onChange }: PresupuestoEquipoSectionProps) => {
  const addItem = () => {
    onChange([...items, { ...emptyItem }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PresupuestoEquipoItem, value: string | number) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Registra el personal vinculado al proyecto con su cargo, función y remuneración.
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
            No hay equipo humano registrado. Haz clic en &quot;Agregar&quot; para añadir uno.
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
                  Persona #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  aria-label="Eliminar persona"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={item.nombre}
                    onChange={(e) => updateItem(index, "nombre", e.target.value)}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nombre completo"
                  />
                </div>

                {/* Cargo */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={item.cargo}
                    onChange={(e) => updateItem(index, "cargo", e.target.value)}
                    maxLength={150}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Coordinador del proyecto"
                  />
                </div>

                {/* Función */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Función
                  </label>
                  <textarea
                    value={item.funcion}
                    onChange={(e) => updateItem(index, "funcion", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Descripción de la función que desempeña..."
                  />
                </div>

                {/* Tipo de vinculación */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tipo de vinculación
                  </label>
                  <input
                    type="text"
                    value={item.tipo_vinculacion}
                    onChange={(e) => updateItem(index, "tipo_vinculacion", e.target.value)}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Docente de planta, Contratista"
                  />
                </div>

                {/* Salario */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Salario mensual ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.salario}
                    onChange={(e) => updateItem(index, "salario", e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Total */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Total ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.total}
                    onChange={(e) => updateItem(index, "total", e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
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

export default PresupuestoEquipoSection;
