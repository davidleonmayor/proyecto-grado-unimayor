"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

import Swal from "sweetalert2";
import RoleProtectedRoute from "@/shared/components/layout/RoleProtectedRoute";
import { socialProjectsService } from "@/modules/social-outreach/services/social-projects.service";
import { projectsService } from "@/modules/projects/services/projects.service";
import { authService } from "@/modules/auth/services/auth.service";
import {
  catalogService,
  type Facultad,
  type Programa,
  type LineaAccion,
} from "@/modules/social-outreach/services/catalog.service";

interface Person {
  id: string;
  name: string;
  email: string;
  document?: string;
}

function NewProjectPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<Person | null>(null);

  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    general: true,
    plan: false,
    presupuesto: false,
  });
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // --- Información General — campos básicos ---
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [lineasAccionIds, setLineasAccionIds] = useState<string[]>([]);
  const [idFacultad, setIdFacultad] = useState("");
  const [idPrograma, setIdPrograma] = useState("");
  const [semestre, setSemestre] = useState("");
  const [personasImpactadas] = useState<number>(0);

  // --- Catálogos (facultades / programas / líneas de acción) ---
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [lineasAccion, setLineasAccion] = useState<LineaAccion[]>([]);

  // --- Listas de personas ---
  const [assignedStudents, setAssignedStudents] = useState<Person[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Person[]>([]);
  const [filteredAvailableStudents, setFilteredAvailableStudents] = useState<
    Person[]
  >([]);
  const [assignedAdvisors, setAssignedAdvisors] = useState<Person[]>([]);
  const [availableAdvisors, setAvailableAdvisors] = useState<Person[]>([]);
  const [filteredAvailableAdvisors, setFilteredAvailableAdvisors] = useState<
    Person[]
  >([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [advisorSearch, setAdvisorSearch] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [studentsData, advisorsData, userData, facultadesData, lineasData] =
        await Promise.all([
          projectsService.getAvailableStudents(),
          projectsService.getAvailableAdvisors(),
          authService.getCurrentUser(),
          catalogService.getFacultades(),
          catalogService.getLineasAccion(),
        ]);

      let initialAssignedAdvisors: Person[] = [];
      let initialAvailableAdvisors = advisorsData as Person[];

      if (userData) {
        const mappedUser: Person = {
          id: userData.id_persona,
          name: `${userData.nombres} ${userData.apellidos}`,
          email: userData.correo_electronico,
          document: userData.num_doc_identidad,
        };
        setCurrentUser(mappedUser);

        const fromList = advisorsData.find(
          (a: Person) => a.id === mappedUser.id,
        );
        initialAssignedAdvisors = [fromList ?? mappedUser];
        initialAvailableAdvisors = advisorsData.filter(
          (a: Person) => a.id !== mappedUser.id,
        );
      }

      setAvailableStudents(studentsData);
      setFilteredAvailableStudents(studentsData);

      setAssignedAdvisors(initialAssignedAdvisors);
      setAvailableAdvisors(initialAvailableAdvisors);
      setFilteredAvailableAdvisors(initialAvailableAdvisors);

      setFacultades(facultadesData);
      setLineasAccion(lineasData);
    } catch (error) {
      Swal.fire("Error", "No se pudo cargar los datos iniciales", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Carga programas cuando cambia la facultad seleccionada
  useEffect(() => {
    if (!idFacultad) {
      setProgramas([]);
      setIdPrograma("");
      return;
    }
    let cancelled = false;
    catalogService
      .getProgramas(idFacultad)
      .then((data) => {
        if (cancelled) return;
        setProgramas(data);
        // Si el programa actual no pertenece a la facultad, limpiarlo
        setIdPrograma((current) =>
          data.some((p) => p.id_programa === current) ? current : "",
        );
      })
      .catch(() => {
        if (!cancelled) setProgramas([]);
      });
    return () => {
      cancelled = true;
    };
  }, [idFacultad]);

  const filterStudents = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredAvailableStudents(availableStudents);
        return;
      }
      const search = searchTerm.toLowerCase().trim();
      const filtered = availableStudents.filter((student) => {
        const documentMatch = student.document?.toLowerCase().includes(search);
        const idMatch = student.id.toLowerCase().includes(search);
        const nameMatch = student.name.toLowerCase().includes(search);
        const emailMatch = student.email.toLowerCase().includes(search);
        return documentMatch || idMatch || nameMatch || emailMatch;
      });
      setFilteredAvailableStudents(filtered);
    },
    [availableStudents],
  );

  const filterAdvisors = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredAvailableAdvisors(availableAdvisors);
        return;
      }
      const search = searchTerm.toLowerCase().trim();
      const filtered = availableAdvisors.filter((advisor) => {
        const documentMatch = advisor.document?.toLowerCase().includes(search);
        const idMatch = advisor.id.toLowerCase().includes(search);
        const nameMatch = advisor.name.toLowerCase().includes(search);
        const emailMatch = advisor.email.toLowerCase().includes(search);
        return documentMatch || idMatch || nameMatch || emailMatch;
      });
      setFilteredAvailableAdvisors(filtered);
    },
    [availableAdvisors],
  );

  useEffect(() => {
    filterStudents(studentSearch);
  }, [studentSearch, filterStudents]);

  useEffect(() => {
    filterAdvisors(advisorSearch);
  }, [advisorSearch, filterAdvisors]);

  const addStudent = (student: Person) => {
    setAssignedStudents([...assignedStudents, student]);
    const newAvailable = availableStudents.filter((s) => s.id !== student.id);
    setAvailableStudents(newAvailable);
    setFilteredAvailableStudents(
      studentSearch.trim()
        ? newAvailable.filter((s) => matchesSearch(s, studentSearch))
        : newAvailable,
    );
  };

  const removeStudent = (student: Person) => {
    setAssignedStudents(assignedStudents.filter((s) => s.id !== student.id));
    const newAvailable = [...availableStudents, student];
    setAvailableStudents(newAvailable);
    setFilteredAvailableStudents(
      studentSearch.trim()
        ? newAvailable.filter((s) => matchesSearch(s, studentSearch))
        : newAvailable,
    );
  };

  const addAdvisor = (advisor: Person) => {
    setAssignedAdvisors([...assignedAdvisors, advisor]);
    const newAvailable = availableAdvisors.filter((a) => a.id !== advisor.id);
    setAvailableAdvisors(newAvailable);
    setFilteredAvailableAdvisors(
      advisorSearch.trim()
        ? newAvailable.filter((a) => matchesSearch(a, advisorSearch))
        : newAvailable,
    );
  };

  const removeAdvisor = (advisor: Person) => {
    if (currentUser && advisor.id === currentUser.id) return;
    setAssignedAdvisors(assignedAdvisors.filter((a) => a.id !== advisor.id));
    const newAvailable = [...availableAdvisors, advisor];
    setAvailableAdvisors(newAvailable);
    setFilteredAvailableAdvisors(
      advisorSearch.trim()
        ? newAvailable.filter((a) => matchesSearch(a, advisorSearch))
        : newAvailable,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      Swal.fire("Error", "El título es obligatorio", "error");
      return;
    }
    if (assignedStudents.length < 1) {
      Swal.fire("Error", "Debe seleccionar al menos 1 estudiante", "error");
      return;
    }
    if (assignedAdvisors.length < 1) {
      Swal.fire("Error", "Debe seleccionar al menos 1 docente", "error");
      return;
    }

    setIsSaving(true);
    try {
      await socialProjectsService.createProject({
        titulo,
        descripcion: descripcion || null,
        personas_impactadas: personasImpactadas,
        estudiantes: assignedStudents.map((s) => s.id),
        docentes: assignedAdvisors.map((a) => a.id),
        lineas_accion: lineasAccionIds,
        semestre: semestre || null,
        id_programa: idPrograma || null,
      });

      await Swal.fire(
        "¡Éxito!",
        "Proyecto de proyección social creado exitosamente",
        "success",
      );
      router.push("/social-outreach/social-projects/admin");
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.message || "No se pudo crear el proyecto de proyección social",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Crear Nueva Proyección Social
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* ============================================================ */}
        {/* Sección 1: Información General                                */}
        {/* ============================================================ */}
        <SectionHeader
          title="Información General"
          isOpen={openSections.general}
          onToggle={() => toggleSection("general")}
        />
        {openSections.general && (
          <div className="p-6 space-y-6 border-t border-gray-200">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ej: Brigada de salud rural"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Descripción breve del proyecto..."
              />
            </div>

            {/* Líneas de acción (multi-select) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Líneas de acción
                {lineasAccionIds.length > 0 && (
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    ({lineasAccionIds.length} seleccionada{lineasAccionIds.length === 1 ? "" : "s"})
                  </span>
                )}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Selecciona una o más líneas que apliquen al proyecto.
              </p>
              <div className="border border-gray-300 rounded-lg p-3 bg-white space-y-2 max-h-48 overflow-y-auto">
                {lineasAccion.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    No hay líneas de acción configuradas.
                  </p>
                ) : (
                  lineasAccion.map((l) => {
                    const checked = lineasAccionIds.includes(l.id_linea_accion);
                    return (
                      <label
                        key={l.id_linea_accion}
                        className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setLineasAccionIds((prev) =>
                              e.target.checked
                                ? [...prev, l.id_linea_accion]
                                : prev.filter((id) => id !== l.id_linea_accion),
                            );
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{l.nombre}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Facultad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facultad
              </label>
              <select
                value={idFacultad}
                onChange={(e) => setIdFacultad(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="">Selecciona una facultad...</option>
                {facultades.map((f) => (
                  <option key={f.id_facultad} value={f.id_facultad}>
                    {f.nombre_facultad}
                  </option>
                ))}
              </select>
            </div>

            {/* Programa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programa académico
              </label>
              <select
                value={idPrograma}
                onChange={(e) => setIdPrograma(e.target.value)}
                disabled={!idFacultad}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="">
                  {idFacultad
                    ? "Selecciona un programa..."
                    : "Primero selecciona una facultad"}
                </option>
                {programas.map((p) => (
                  <option key={p.id_programa} value={p.id_programa}>
                    {p.nombre_programa}
                  </option>
                ))}
              </select>
            </div>

            {/* Semestre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semestre
              </label>
              <input
                type="text"
                value={semestre}
                onChange={(e) => setSemestre(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ej: 2026-1"
              />
            </div>

            {/* Personas Impactadas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad de personas impactadas *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Este valor inicia en 0 y se actualizará cuando el proyecto avance.
              </p>
              <input
                type="number"
                min={0}
                value={personasImpactadas}
                readOnly
                disabled
                aria-readonly="true"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Estudiantes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estudiantes * (Selecciona 1 o más)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Asignados ({assignedStudents.length})
                    </span>
                  </div>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                    {assignedStudents.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No hay estudiantes asignados
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {assignedStudents.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.email}
                                {student.document
                                  ? ` - ${student.document}`
                                  : ""}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeStudent(student)}
                              className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              aria-label="Quitar estudiante"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Disponibles
                    </span>
                  </div>
                  <div className="mb-2">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Buscar por cédula, código o nombre..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                    {filteredAvailableStudents.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No se encontraron estudiantes
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filteredAvailableStudents.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.id} • {student.email}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => addStudent(student)}
                              className="ml-2 p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                              aria-label="Agregar estudiante"
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
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Docentes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Docentes * (Selecciona 1 o más)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Asignados ({assignedAdvisors.length})
                    </span>
                  </div>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                    {assignedAdvisors.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No hay docentes asignados
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {assignedAdvisors.map((advisor) => {
                          const isCurrent =
                            currentUser && advisor.id === currentUser.id;
                          return (
                            <div
                              key={advisor.id}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                isCurrent
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-white border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {advisor.name}{" "}
                                  {isCurrent && (
                                    <span className="text-xs text-blue-700">
                                      (Tú)
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {advisor.id} • {advisor.email}
                                </div>
                              </div>
                              {!isCurrent && (
                                <button
                                  type="button"
                                  onClick={() => removeAdvisor(advisor)}
                                  className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                  aria-label="Quitar docente"
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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
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

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Disponibles
                    </span>
                  </div>
                  <div className="mb-2">
                    <input
                      type="text"
                      value={advisorSearch}
                      onChange={(e) => setAdvisorSearch(e.target.value)}
                      placeholder="Buscar por cédula, código o nombre..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                    {filteredAvailableAdvisors.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No se encontraron docentes
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filteredAvailableAdvisors.map((advisor) => (
                          <div
                            key={advisor.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {advisor.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {advisor.id} • {advisor.email}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => addAdvisor(advisor)}
                              className="ml-2 p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                              aria-label="Agregar docente"
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
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* Sección 2: Plan de Acción — placeholder                       */}
        {/* ============================================================ */}
        <SectionHeader
          title="Plan de Acción"
          isOpen={openSections.plan}
          onToggle={() => toggleSection("plan")}
        />
        {openSections.plan && (
          <div className="p-6 border-t border-gray-200 text-sm text-gray-500 italic">
            Próximamente — define objetivos específicos, actividades, duración,
            responsables, metas e indicadores.
          </div>
        )}

        {/* ============================================================ */}
        {/* Sección 3: Presupuesto — placeholder                          */}
        {/* ============================================================ */}
        <SectionHeader
          title="Presupuesto"
          isOpen={openSections.presupuesto}
          onToggle={() => toggleSection("presupuesto")}
        />
        {openSections.presupuesto && (
          <div className="p-6 border-t border-gray-200 text-sm text-gray-500 italic">
            Próximamente — equipo humano, recursos (materiales, viáticos) y
            presupuesto total.
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:bg-primary-400"
          >
            {isSaving ? "Creando..." : "Crear Proyecto"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}

function SectionHeader({ title, isOpen, onToggle }: SectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      aria-expanded={isOpen}
    >
      <span className="text-lg font-semibold text-gray-800">{title}</span>
      {isOpen ? (
        <ChevronDown className="w-5 h-5 text-gray-600" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}

function matchesSearch(person: Person, search: string): boolean {
  const s = search.toLowerCase().trim();
  return (
    Boolean(person.document?.toLowerCase().includes(s)) ||
    person.id.toLowerCase().includes(s) ||
    person.name.toLowerCase().includes(s) ||
    person.email.toLowerCase().includes(s)
  );
}

export default function NewProjectPage() {
  return (
    <RoleProtectedRoute
      allowedRoles={["admin", "dean"]}
      redirectTo="/social-outreach/social-projects/admin"
    >
      <NewProjectPageContent />
    </RoleProtectedRoute>
  );
}
