"use client";

import { Plus, Trash2 } from "lucide-react";

export interface PresupuestoRecursoItem {
  tipo_recurso: string;
  valor_unitario: number | "";
  cantidad: number | "";
  valor_total: number | "";
}

interface PresupuestoRecursosSectionProps {
  items: PresupuestoRecursoItem[];
  onChange: (items: PresupuestoRecursoItem[]) => void;
}

const emptyItem: PresupuestoRecursoItem = {
  tipo_recurso: "",
  valor_unitario: "",
  cantidad: "",
  valor_total: "",
};

const PresupuestoRecursosSection = ({ items, onChange }: PresupuestoRecursosSectionProps) => {
  const addItem = () => {
    onChange([...items, { ...emptyItem }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PresupuestoRecursoItem, value: string | number) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [field]: value };
      // Auto-calculate valor_total when unitario or cantidad change
      if (field === "valor_unitario" || field === "cantidad") {
        const unitario = field === "valor_unitario" ? (value || 0) : (item.valor_unitario || 0);
        const cant = field === "cantidad" ? (value || 0) : (item.cantidad || 0);
        newItem.valor_total = Number(unitario) * Number(cant) || "";
      }
      return newItem;
    });
    onChange(updated);
  };

  const totalGeneral = items.reduce(
    (sum, item) => sum + (typeof item.valor_total === "number" ? item.valor_total : 0),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Registra los recursos materiales, equipos, transporte y otros gastos del proyecto.
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
            No hay recursos registrados. Haz clic en &quot;Agregar&quot; para añadir uno.
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
                  Recurso #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  aria-label="Eliminar recurso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Tipo de recurso */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tipo de recurso
                  </label>
                  <input
                    type="text"
                    value={item.tipo_recurso}
                    onChange={(e) => updateItem(index, "tipo_recurso", e.target.value)}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Materiales, Transporte"
                  />
                </div>

                {/* Valor unitario */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Valor unitario ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.valor_unitario}
                    onChange={(e) => updateItem(index, "valor_unitario", e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={item.cantidad}
                    onChange={(e) => updateItem(index, "cantidad", e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Valor total (auto-calculado) */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Valor total ($)
                  </label>
                  <input
                    type="number"
                    value={item.valor_total}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total general */}
      {items.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg border border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            Total Recursos
          </span>
          <span className="text-lg font-bold text-primary-700">
            $ {totalGeneral.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  );
};

export default PresupuestoRecursosSection;
