"use client";

interface CheckboxGroupItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface CheckboxGroupProps {
  label: string;
  description?: string;
  items: CheckboxGroupItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  emptyMessage?: string;
}

const CheckboxGroup = ({
  label,
  description,
  items,
  selectedIds,
  onChange,
  emptyMessage = "No hay opciones disponibles.",
}: CheckboxGroupProps) => {
  const toggleItem = (id: string, checked: boolean) => {
    onChange(
      checked
        ? [...selectedIds, id]
        : selectedIds.filter((selectedId) => selectedId !== id),
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {selectedIds.length > 0 && (
          <span className="ml-2 text-xs text-gray-500 font-normal">
            ({selectedIds.length} seleccionada
            {selectedIds.length === 1 ? "" : "s"})
          </span>
        )}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <div className="border border-gray-300 rounded-lg p-3 bg-white space-y-2 max-h-48 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 italic">{emptyMessage}</p>
        ) : (
          items.map((item) => {
            const checked = selectedIds.includes(item.id);
            return (
              <label
                key={item.id}
                className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => toggleItem(item.id, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{item.label}</span>
                {item.sublabel && (
                  <span className="text-xs text-gray-400">{item.sublabel}</span>
                )}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CheckboxGroup;
