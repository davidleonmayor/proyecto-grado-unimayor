"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import { socialProjectsService } from "@/modules/social-outreach/services/social-projects.service";
import { projectsService } from "@/modules/projects/services/projects.service";
import { authService } from "@/modules/auth/services/auth.service";
import {
  catalogService,
  type Facultad,
  type Programa,
  type LineaAccion,
  type Estudiante,
} from "@/modules/social-outreach/services/catalog.service";
import type { Person } from "@/modules/social-outreach/components/PersonSelector";

function matchesSearch(person: Person, search: string): boolean {
  const s = search.toLowerCase().trim();
  return (
    Boolean(person.document?.toLowerCase().includes(s)) ||
    person.id.toLowerCase().includes(s) ||
    person.name.toLowerCase().includes(s) ||
    person.email.toLowerCase().includes(s)
  );
}

export function useNewProject() {
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

  // --- Información General ---
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [lineasAccionIds, setLineasAccionIds] = useState<string[]>([]);
  const [idFacultad, setIdFacultad] = useState("");
  const [idPrograma, setIdPrograma] = useState("");
  const [semestre, setSemestre] = useState("");
  const [personasImpactadas] = useState<number>(0);

  // --- Campos de texto de la Ficha Técnica ---
  const [resumen, setResumen] = useState("");
  const [palabrasClave, setPalabrasClave] = useState("");
  const [identificacionProblematica, setIdentificacionProblematica] = useState("");
  const [propuestaSolucion, setPropuestaSolucion] = useState("");
  const [caracterizacionPoblacion, setCaracterizacionPoblacion] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [resultadosEsperados, setResultadosEsperados] = useState("");
  const [metodologia, setMetodologia] = useState("");
  const [bibliografia, setBibliografia] = useState("");

  // --- Catálogos ---
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [lineasAccion, setLineasAccion] = useState<LineaAccion[]>([]);

  // --- Personas ---
  const [assignedStudents, setAssignedStudents] = useState<Person[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Person[]>([]);
  const [filteredAvailableStudents, setFilteredAvailableStudents] = useState<Person[]>([]);
  const [assignedAdvisors, setAssignedAdvisors] = useState<Person[]>([]);
  const [availableAdvisors, setAvailableAdvisors] = useState<Person[]>([]);
  const [filteredAvailableAdvisors, setFilteredAvailableAdvisors] = useState<Person[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [advisorSearch, setAdvisorSearch] = useState("");

  // --- Asesor (docente asesor del proyecto) ---
  const [idAsesor, setIdAsesor] = useState<string | null>(null);
  const [asesorSearch, setAsesorSearch] = useState("");
  const [allDocentes, setAllDocentes] = useState<Person[]>([]);
  const [filteredDocentes, setFilteredDocentes] = useState<Person[]>([]);

  // --- Proponentes ---
  const [proponenteIds, setProponenteIds] = useState<string[]>([]);
  const [proponentesCandidatos, setProponentesCandidatos] = useState<Estudiante[]>([]);

  // --- Data loading ---
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

        const fromList = advisorsData.find((a: Person) => a.id === mappedUser.id);
        initialAssignedAdvisors = [fromList ?? mappedUser];
        initialAvailableAdvisors = advisorsData.filter((a: Person) => a.id !== mappedUser.id);
      }

      setAvailableStudents(studentsData);
      setFilteredAvailableStudents(studentsData);
      setAssignedAdvisors(initialAssignedAdvisors);
      setAvailableAdvisors(initialAvailableAdvisors);
      setFilteredAvailableAdvisors(initialAvailableAdvisors);
      setAllDocentes(advisorsData as Person[]);
      setFilteredDocentes(advisorsData as Person[]);
      setFacultades(facultadesData);
      setLineasAccion(lineasData);
    } catch {
      Swal.fire("Error", "No se pudo cargar los datos iniciales", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Carga programas cuando cambia la facultad
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
        setIdPrograma((current) =>
          data.some((p) => p.id_programa === current) ? current : "",
        );
      })
      .catch(() => {
        if (!cancelled) setProgramas([]);
      });
    return () => { cancelled = true; };
  }, [idFacultad]);

  // Carga estudiantes candidatos a proponentes cuando cambia la facultad
  useEffect(() => {
    if (!idFacultad) {
      setProponentesCandidatos([]);
      setProponenteIds([]);
      return;
    }
    let cancelled = false;
    catalogService
      .getEstudiantes(idFacultad)
      .then((data) => {
        if (cancelled) return;
        setProponentesCandidatos(data);
      })
      .catch(() => {
        if (!cancelled) setProponentesCandidatos([]);
      });
    return () => { cancelled = true; };
  }, [idFacultad]);

  // --- Filtros de búsqueda ---
  const filterStudents = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredAvailableStudents(availableStudents);
        return;
      }
      setFilteredAvailableStudents(availableStudents.filter((s) => matchesSearch(s, searchTerm)));
    },
    [availableStudents],
  );

  const filterAdvisors = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredAvailableAdvisors(availableAdvisors);
        return;
      }
      setFilteredAvailableAdvisors(availableAdvisors.filter((a) => matchesSearch(a, searchTerm)));
    },
    [availableAdvisors],
  );

  useEffect(() => { filterStudents(studentSearch); }, [studentSearch, filterStudents]);
  useEffect(() => { filterAdvisors(advisorSearch); }, [advisorSearch, filterAdvisors]);

  useEffect(() => {
    if (!asesorSearch.trim()) {
      setFilteredDocentes(allDocentes);
      return;
    }
    setFilteredDocentes(allDocentes.filter((d) => matchesSearch(d, asesorSearch)));
  }, [asesorSearch, allDocentes]);

  // --- Handlers de personas ---
  const addStudent = (student: Person) => {
    setAssignedStudents([...assignedStudents, student]);
    const newAvailable = availableStudents.filter((s) => s.id !== student.id);
    setAvailableStudents(newAvailable);
    setFilteredAvailableStudents(
      studentSearch.trim() ? newAvailable.filter((s) => matchesSearch(s, studentSearch)) : newAvailable,
    );
  };

  const removeStudent = (student: Person) => {
    setProponenteIds((prev) => prev.filter((id) => id !== student.id));
    setAssignedStudents(assignedStudents.filter((s) => s.id !== student.id));
    const newAvailable = [...availableStudents, student];
    setAvailableStudents(newAvailable);
    setFilteredAvailableStudents(
      studentSearch.trim() ? newAvailable.filter((s) => matchesSearch(s, studentSearch)) : newAvailable,
    );
  };

  const addAdvisor = (advisor: Person) => {
    setAssignedAdvisors([...assignedAdvisors, advisor]);
    const newAvailable = availableAdvisors.filter((a) => a.id !== advisor.id);
    setAvailableAdvisors(newAvailable);
    setFilteredAvailableAdvisors(
      advisorSearch.trim() ? newAvailable.filter((a) => matchesSearch(a, advisorSearch)) : newAvailable,
    );
  };

  const removeAdvisor = (advisor: Person) => {
    if (currentUser && advisor.id === currentUser.id) return;
    setProponenteIds((prev) => prev.filter((id) => id !== advisor.id));
    setAssignedAdvisors(assignedAdvisors.filter((a) => a.id !== advisor.id));
    const newAvailable = [...availableAdvisors, advisor];
    setAvailableAdvisors(newAvailable);
    setFilteredAvailableAdvisors(
      advisorSearch.trim() ? newAvailable.filter((a) => matchesSearch(a, advisorSearch)) : newAvailable,
    );
  };

  // --- Submit ---
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
        id_asesor: idAsesor,
        proponentes: proponenteIds.length > 0 ? proponenteIds : undefined,
        resumen: resumen || null,
        palabras_clave: palabrasClave || null,
        identificacion_problematica: identificacionProblematica || null,
        propuesta_solucion: propuestaSolucion || null,
        caracterizacion_poblacion: caracterizacionPoblacion || null,
        objetivos: objetivos || null,
        resultados_esperados: resultadosEsperados || null,
        metodologia: metodologia || null,
        bibliografia: bibliografia || null,
      });

      await Swal.fire("¡Éxito!", "Proyecto de proyección social creado exitosamente", "success");
      router.push("/social-outreach/social-projects/admin");
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo crear el proyecto", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    // State
    isLoading,
    isSaving,
    currentUser,
    openSections,
    toggleSection,
    // General info
    titulo, setTitulo,
    descripcion, setDescripcion,
    lineasAccionIds, setLineasAccionIds,
    idFacultad, setIdFacultad,
    idPrograma, setIdPrograma,
    semestre, setSemestre,
    personasImpactadas,
    // Catalogs
    facultades,
    programas,
    lineasAccion,
    // Students
    assignedStudents,
    filteredAvailableStudents,
    studentSearch, setStudentSearch,
    addStudent,
    removeStudent,
    // Advisors
    assignedAdvisors,
    filteredAvailableAdvisors,
    advisorSearch, setAdvisorSearch,
    addAdvisor,
    removeAdvisor,
    // Asesor
    idAsesor, setIdAsesor,
    asesorSearch, setAsesorSearch,
    filteredDocentes,
    // Proponentes
    proponenteIds, setProponenteIds,
    proponentesCandidatos,
    // Ficha técnica text fields
    resumen, setResumen,
    palabrasClave, setPalabrasClave,
    identificacionProblematica, setIdentificacionProblematica,
    propuestaSolucion, setPropuestaSolucion,
    caracterizacionPoblacion, setCaracterizacionPoblacion,
    objetivos, setObjetivos,
    resultadosEsperados, setResultadosEsperados,
    metodologia, setMetodologia,
    bibliografia, setBibliografia,
    // Actions
    handleSubmit,
    router,
  };
}
