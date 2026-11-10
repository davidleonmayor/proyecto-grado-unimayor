"use client";

import { Input } from "@/shared/components/ui/input";

export interface Person {
  id: string;
  name: string;
  email: string;
  document?: string;
}

interface PersonSelectorProps {
  label: string;
  assigned: Person[];
  available: Person[];
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: (person: Person) => void;
  onRemove: (person: Person) => void;
  /** IDs that cannot be removed (e.g. current user auto-assigned as advisor) */
  protectedIds?: string[];
}

const PersonSelector = ({
  label,
  assigned,
  available,
  search,
  onSearchChange,
  onAdd,
  onRemove,
  protectedIds = [],
}: PersonSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-4">
        {/* Assigned */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Asignados ({assigned.length})
            </span>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
            {assigned.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No hay personas asignadas
              </p>
            ) : (
              <div className="space-y-2">
                {assigned.map((person) => {
                  const isProtected = protectedIds.includes(person.id);
                  return (
                    <div
                      key={person.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isProtected
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {person.name}{" "}
                          {isProtected && (
                            <span className="text-xs text-blue-700">(Tú)</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {person.id} • {person.email}
                        </div>
                      </div>
                      {!isProtected && (
                        <button
                          type="button"
                          onClick={() => onRemove(person)}
                          className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          aria-label="Quitar persona"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Available */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Disponibles
            </span>
          </div>
          <div className="mb-2">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por cédula, código o nombre..."
              className="text-sm"
            />
          </div>
          <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
            {available.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No se encontraron personas
              </p>
            ) : (
              <div className="space-y-2">
                {available.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {person.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {person.id} • {person.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAdd(person)}
                      className="ml-2 p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      aria-label="Agregar persona"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonSelector;
