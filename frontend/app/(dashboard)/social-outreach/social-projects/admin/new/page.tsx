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

function CurrentUser({ currentUser }: { currentUser: Person }) {
  return (
    <div className="mb-3 border border-blue-200 bg-blue-50 rounded-lg p-3 flex items-center gap-3">
      <input
        type="checkbox"
        checked
        disabled
        className="h-4 w-4 text-blue-600 border-blue-300 rounded cursor-not-allowed"
      />
      <div>
        <div className="text-sm font-semibold text-blue-800">
          {currentUser.name} (Tú)
        </div>
        <div className="text-xs text-blue-700">
          {currentUser.document && `Cédula: ${currentUser.document} • `}
          Código: {currentUser.id} • {currentUser.email}
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Seleccionado automáticamente como participante. No se puede deseleccionar.
        </p>
      </div>
    </div>
  );
}

interface IAdvisorList {
  advisors: Person[];
  selectedAdvisors: string[];
  toggleAdvisor: (id: string) => void;
  currentUser: Person | null;
}

function AdvisorsList({
  advisors,
  selectedAdvisors,
  toggleAdvisor,
  currentUser,
}: IAdvisorList) {
  return (
    <div className="space-y-2">
      {advisors
        .filter((advisor) => advisor.id !== currentUser?.id)
        .map((advisor) => (
          <label
            key={advisor.id}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
              selectedAdvisors.includes(advisor.id)
                ? "bg-blue-100 border-2 border-blue-500"
                : "bg-white border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <input
              type="checkbox"
              checked={selectedAdvisors.includes(advisor.id)}
              onChange={() => toggleAdvisor(advisor.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3 flex-1">
              <div className="text-sm font-medium text-gray-900">
                {advisor.name}
              </div>
              <div className="text-xs text-gray-500">
                {advisor.document && `Cédula: ${advisor.document}`}
                {advisor.document && " • "}
                Código: {advisor.id} • {advisor.email}
              </div>
            </div>
          </label>
        ))}
    </div>
  );
}

function NewProjectPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Person | null>(null);
  const [students, setStudents] = useState<Person[]>([]);
  const [advisors, setAdvisors] = useState<Person[]>([]);
  const [allStudents, setAllStudents] = useState<Person[]>([]);
  const [allAdvisors, setAllAdvisors] = useState<Person[]>([]);

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Search filters
  const [studentSearch, setStudentSearch] = useState("");
  const [advisorSearch, setAdvisorSearch] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [advisorsData, userData] = await Promise.all([
        projectsService.getAvailableAdvisors(),
        authService.getCurrentUser(),
      ]);

      setAllAdvisors(advisorsData);
      setAdvisors(advisorsData);
      setAllStudents(await projectsService.getAvailableStudents());
      setStudents(await projectsService.getAvailableStudents());

      if (userData) {
        const mappedUser: Person = {
          id: userData.id_persona,
          name: `${userData.nombres} ${userData.apellidos}`,
          email: userData.correo_electronico,
          document: userData.num_doc_identidad,
        };
        setCurrentUser(mappedUser);
        setSelectedAdvisors([mappedUser.id]);
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo cargar los datos iniciales", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter students by search term (document, id, name, or email)
  const filterStudents = useCallback(
    (studentsList: Person[], searchTerm: string) => {
      if (!searchTerm.trim()) {
        setStudents(studentsList);
        return;
      }

      const search = searchTerm.toLowerCase().trim();
      const filtered = studentsList.filter((student) => {
        const documentMatch = student.document?.toLowerCase().includes(search);
        const idMatch = student.id.toLowerCase().includes(search);
        const nameMatch = student.name.toLowerCase().includes(search);
        const emailMatch = student.email.toLowerCase().includes(search);

        return documentMatch || idMatch || nameMatch || emailMatch;
      });

      setStudents(filtered);
    },
    [],
  );

  // Filter advisors by search term (document, id, name, or email)
  const filterAdvisors = useCallback(
    (advisorsList: Person[], searchTerm: string) => {
      if (!searchTerm.trim()) {
        setAdvisors(advisorsList);
        return;
      }

      const search = searchTerm.toLowerCase().trim();
      const filtered = advisorsList.filter((advisor) => {
        const documentMatch = advisor.document?.toLowerCase().includes(search);
        const idMatch = advisor.id.toLowerCase().includes(search);
        const nameMatch = advisor.name.toLowerCase().includes(search);
        const emailMatch = advisor.email.toLowerCase().includes(search);

        return documentMatch || idMatch || nameMatch || emailMatch;
      });

      setAdvisors(filtered);
    },
    [],
  );

  // Handle student search
  useEffect(() => {
    if (allStudents.length > 0) {
      filterStudents(allStudents, studentSearch);
    }
  }, [studentSearch, allStudents, filterStudents]);

  // Handle advisor search
  useEffect(() => {
    if (allAdvisors.length > 0) {
      filterAdvisors(allAdvisors, advisorSearch);
    }
  }, [advisorSearch, allAdvisors, filterAdvisors]);

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else if (selectedStudents.length < 2) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      Swal.fire(
        "Límite alcanzado",
        "Máximo 2 estudiantes permitidos",
        "warning",
      );
    }
  };

  const toggleAdvisor = (advisorId: string) => {
    // Creator is always selected and cannot be removed
    if (currentUser && advisorId === currentUser.id) return;

    if (selectedAdvisors.includes(advisorId)) {
      setSelectedAdvisors(selectedAdvisors.filter((id) => id !== advisorId));
    } else if (selectedAdvisors.length < 2) {
      setSelectedAdvisors([...selectedAdvisors, advisorId]);
    } else {
      Swal.fire("Límite alcanzado", "Máximo 2 docentes permitidos", "warning");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      Swal.fire("Error", "El título es obligatorio", "error");
      return;
    }

    if (selectedStudents.length < 1) {
      Swal.fire("Error", "Debe seleccionar al menos 1 estudiante", "error");
      return;
    }

    if (selectedAdvisors.length < 1) {
      Swal.fire("Error", "Debe seleccionar al menos 1 docente", "error");
      return;
    }

    try {
      await socialProjectsService.createProject({
        nombre,
        descripcion: descripcion || null,
        estudiantes: selectedStudents,
        docentes: selectedAdvisors,
      });

      await Swal.fire("¡Éxito!", "Proyecto de proyección social creado exitosamente", "success");
      router.push("/social-outreach/social-projects/admin");
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.message || "No se pudo crear el proyecto de proyección social",
        "error",
      );
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

        {/* Estudiantes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estudiantes * (Selecciona 1 o 2)
          </label>
          <div className="mb-3">
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Buscar por cédula, código o nombre..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
            {students.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                {studentSearch
                  ? `No se encontraron estudiantes que coincidan con "${studentSearch}"`
                  : "No hay estudiantes disponibles"}
              </p>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <label
                    key={student.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedStudents.includes(student.id)
                        ? "bg-primary-100 border-2 border-primary-500"
                        : "bg-white border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.document && `Cédula: ${student.document}`}
                        {student.document && " • "}
                        Código: {student.id} • {student.email}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Seleccionados: {selectedStudents.length}/2
            </p>
            {studentSearch && (
              <p className="text-xs text-gray-500">
                {students.length} resultado{students.length !== 1 ? "s" : ""}{" "}
                encontrado{students.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Docentes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Docentes * (Selecciona 1 o 2)
          </label>
          {currentUser && <CurrentUser {...{ currentUser }} />}
          <div className="mb-3">
            <input
              type="text"
              value={advisorSearch}
              onChange={(e) => setAdvisorSearch(e.target.value)}
              placeholder="Buscar por cédula, código o nombre..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
            {advisors.filter((a) => a.id !== currentUser?.id).length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                {advisorSearch
                  ? `No se encontraron docentes que coincidan con "${advisorSearch}"`
                  : "No hay docentes disponibles"}
              </p>
            ) : (
              <AdvisorsList
                {...{
                  advisors,
                  selectedAdvisors,
                  toggleAdvisor,
                  currentUser,
                }}
              />
            )}
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Seleccionados: {selectedAdvisors.length}/2
            </p>
            {advisorSearch && (
              <p className="text-xs text-gray-500">
                {advisors.length} resultado{advisors.length !== 1 ? "s" : ""}{" "}
                encontrado{advisors.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Crear Proyecto
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <RoleProtectedRoute allowedRoles={["admin", "dean"]} redirectTo="/social-outreach/social-projects/admin">
      <NewProjectPageContent />
    </RoleProtectedRoute>
  );
}