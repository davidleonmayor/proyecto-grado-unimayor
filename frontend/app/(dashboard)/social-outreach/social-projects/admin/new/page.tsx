"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Swal from "sweetalert2";
import RoleProtectedRoute from "@/shared/components/layout/RoleProtectedRoute";
import { socialProjectsService } from "@/modules/social-outreach/services/social-projects.service";
import { projectsService } from "@/modules/projects/services/projects.service";
import { authService } from "@/modules/auth/services/auth.service";

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

  // Two-column lists
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

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [personasImpactadas] = useState<number>(0);

  const [studentSearch, setStudentSearch] = useState("");
  const [advisorSearch, setAdvisorSearch] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [studentsData, advisorsData, userData] = await Promise.all([
        projectsService.getAvailableStudents(),
        projectsService.getAvailableAdvisors(),
        authService.getCurrentUser(),
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
    } catch (error) {
      Swal.fire("Error", "No se pudo cargar los datos iniciales", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
    // Creator (currentUser) cannot be removed
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

    if (!nombre.trim()) {
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
        nombre,
        descripcion: descripcion || null,
        personas_impactadas: personasImpactadas,
        estudiantes: assignedStudents.map((s) => s.id),
        docentes: assignedAdvisors.map((a) => a.id),
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
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6"
      >
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título de la proyección *
          </label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ej: Sistema de gestión académica"
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
            {/* Assigned Students */}
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
                            {student.document ? ` - ${student.document}` : ""}
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

            {/* Available Students */}
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
            {/* Assigned Advisors */}
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

            {/* Available Advisors */}
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

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-4 border-t">
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
