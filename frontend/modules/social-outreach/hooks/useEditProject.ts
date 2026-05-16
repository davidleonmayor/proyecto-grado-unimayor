"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";

import { socialProjectsService } from "@/modules/social-outreach/services/social-projects.service";
import { projectsService } from "@/modules/projects/services/projects.service";
import {
  catalogService,
  type Facultad,
  type Programa,
  type LineaAccion,
  type Estudiante,
} from "@/modules/social-outreach/services/catalog.service";
import type { Person } from "@/modules/social-outreach/components/PersonSelector";
import type { PlanAccionItem } from "@/modules/social-outreach/components/PlanAccionSection";

function matchesSearch(person: Person, search: string): boolean {
  const s = search.toLowerCase().trim();
  return (
    Boolean(person.document?.toLowerCase().includes(s)) ||
    person.id.toLowerCase().includes(s) ||
    person.name.toLowerCase().includes(s) ||
    person.email.toLowerCase().includes(s)
  );
}

export function useEditProject() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = useMemo(() => {
    const value = params?.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
  const [estado, setEstado] = useState("En proceso");
  const [personasImpactadas, setPersonasImpactadas] = useState(0);
  const [lineasAccionIds, setLineasAccionIds] = useState<string[]>([]);
  const [idFacultad, setIdFacultad] = useState("");
  const [idPrograma, setIdPrograma] = useState("");
  const [semestre, setSemestre] = useState("");
  const [idAsesor, setIdAsesor] = useState<string | null>(null);
  const [asesorSearch, setAsesorSearch] = useState("");

  // --- Ficha técnica text fields ---
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

  // --- Proponentes ---
  const [proponenteIds, setProponenteIds] = useState<string[]>([]);
  const [proponentesCandidatos, setProponentesCandidatos] = useState<Estudiante[]>([]);

  // --- Plan de acción ---
  const [planesAccion, setPlanesAccion] = useState<PlanAccionItem[]>([]);

  // --- Asesor search ---
  const [allDocentes, setAllDocentes] = useState<Person[]>([]);
  const [filteredDocentes, setFilteredDocentes] = useState<Person[]>([]);

  // --- Load data ---
  useEffect(() => {
    if (!projectId) return;
    loadInitialData(projectId);
  }, [projectId]);

  const loadInitialData = async (id: string) => {
    setIsLoading(true);
    try {
      const [studentsData, advisorsData, project, facultadesData, lineasData] = await Promise.all([
        projectsService.getAvailableStudents(),
        projectsService.getAvailableAdvisors(),
        socialProjectsService.getProjectById(id),
        catalogService.getFacultades(),
        catalogService.getLineasAccion(),
      ]);

      // Catalogs
      setFacultades(facultadesData);
      setLineasAccion(lineasData);
      setAllDocentes(advisorsData as Person[]);
      setFilteredDocentes(advisorsData as Person[]);

      // Basic fields
      setTitulo(project.titulo || "");
      setDescripcion(project.descripcion || "");
      setEstado(project.estado || "En proceso");
      setPersonasImpactadas(project.personas_impactadas || 0);
      setSemestre(project.semestre || "");
      setIdFacultad(project.id_facultad || "");
      setIdPrograma(project.id_programa || "");
      setIdAsesor(project.id_asesor || null);

      // Text fields
      setResumen(project.resumen || "");
      setPalabrasClave(project.palabras_clave || "");
      setIdentificacionProblematica(project.identificacion_problematica || "");
      setPropuestaSolucion(project.propuesta_solucion || "");
      setCaracterizacionPoblacion(project.caracterizacion_poblacion || "");
      setObjetivos(project.objetivos || "");
      setResultadosEsperados(project.resultados_esperados || "");
      setMetodologia(project.metodologia || "");
      setBibliografia(project.bibliografia || "");

      // Líneas de acción
      if (project.lineas_accion) {
        setLineasAccionIds(
          project.lineas_accion.map((la: any) => la.linea_accion?.id_linea_accion || la.id_linea_accion),
        );
      }

      // Proponentes
      if (project.proponentes) {
        setProponenteIds(project.proponentes.map((p: any) => p.id_persona));
      }

      // Planes de acción
      if (project.planes_accion) {
        setPlanesAccion(
          project.planes_accion.map((p: any) => ({
            objetivo_especifico: p.objetivo_especifico || "",
            actividades: p.actividades || "",
            duracion: p.duracion || "",
            responsables: p.responsables || "",
            meta: p.meta || "",
            indicador: p.indicador || "",
          })),
        );
      }

      // Integrantes → assigned/available
      const projectStudents = (project.integrantes || [])
        .filter((i: any) => i.rol === "Estudiante")
        .map((i: any) => ({
          id: i.id_persona,
          name: `${i.persona.nombres} ${i.persona.apellidos}`,
          email: i.persona.correo_electronico,
          document: i.persona.num_doc_identidad,
        }));

      const projectAdvisors = (project.integrantes || [])
        .filter((i: any) => i.rol === "Docente")
        .map((i: any) => ({
          id: i.id_persona,
          name: `${i.persona.nombres} ${i.persona.apellidos}`,
          email: i.persona.correo_electronico,
          document: i.persona.num_doc_identidad,
        }));

      setAssignedStudents(projectStudents);
      const availStudents = (studentsData as Person[]).filter(
        (s) => !projectStudents.some((ps: Person) => ps.id === s.id),
      );
      setAvailableStudents(availStudents);
      setFilteredAvailableStudents(availStudents);

      setAssignedAdvisors(projectAdvisors);
      const availAdvisors = (advisorsData as Person[]).filter(
        (a) => !projectAdvisors.some((pa: Person) => pa.id === a.id),
      );
      setAvailableAdvisors(availAdvisors);
      setFilteredAvailableAdvisors(availAdvisors);
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo cargar el proyecto", "error");
      router.push("/social-outreach/social-projects");
    } finally {
      setIsLoading(false);
    }
  };

  // Programas by faculty
  useEffect(() => {
    if (!idFacultad) {
      setProgramas([]);
      return;
    }
    let cancelled = false;
    catalogService.getProgramas(idFacultad).then((data) => {
      if (!cancelled) setProgramas(data);
    }).catch(() => { if (!cancelled) setProgramas([]); });
    return () => { cancelled = true; };
  }, [idFacultad]);

  // Proponentes candidates by faculty
  useEffect(() => {
    if (!idFacultad) {
      setProponentesCandidatos([]);
      return;
    }
    let cancelled = false;
    catalogService.getEstudiantes(idFacultad).then((data) => {
      if (!cancelled) setProponentesCandidatos(data);
    }).catch(() => { if (!cancelled) setProponentesCandidatos([]); });
    return () => { cancelled = true; };
  }, [idFacultad]);

  // Asesor search filter
  useEffect(() => {
    if (!asesorSearch.trim()) {
      setFilteredDocentes(allDocentes);
      return;
    }
    setFilteredDocentes(allDocentes.filter((d) => matchesSearch(d, asesorSearch)));
  }, [asesorSearch, allDocentes]);

  // Student/advisor search
  const filterStudents = useCallback(
    (term: string) => {
      if (!term.trim()) { setFilteredAvailableStudents(availableStudents); return; }
      setFilteredAvailableStudents(availableStudents.filter((s) => matchesSearch(s, term)));
    },
    [availableStudents],
  );
  const filterAdvisors = useCallback(
    (term: string) => {
      if (!term.trim()) { setFilteredAvailableAdvisors(availableAdvisors); return; }
      setFilteredAvailableAdvisors(availableAdvisors.filter((a) => matchesSearch(a, term)));
    },
    [availableAdvisors],
  );
  useEffect(() => { filterStudents(studentSearch); }, [studentSearch, filterStudents]);
  useEffect(() => { filterAdvisors(advisorSearch); }, [advisorSearch, filterAdvisors]);

  // Person handlers
  const addStudent = (s: Person) => {
    setAssignedStudents([...assignedStudents, s]);
    const avail = availableStudents.filter((x) => x.id !== s.id);
    setAvailableStudents(avail);
    setFilteredAvailableStudents(studentSearch.trim() ? avail.filter((x) => matchesSearch(x, studentSearch)) : avail);
  };
  const removeStudent = (s: Person) => {
    setProponenteIds((prev) => prev.filter((id) => id !== s.id));
    setAssignedStudents(assignedStudents.filter((x) => x.id !== s.id));
    const avail = [...availableStudents, s];
    setAvailableStudents(avail);
    setFilteredAvailableStudents(studentSearch.trim() ? avail.filter((x) => matchesSearch(x, studentSearch)) : avail);
  };
  const addAdvisor = (a: Person) => {
    setAssignedAdvisors([...assignedAdvisors, a]);
    const avail = availableAdvisors.filter((x) => x.id !== a.id);
    setAvailableAdvisors(avail);
    setFilteredAvailableAdvisors(advisorSearch.trim() ? avail.filter((x) => matchesSearch(x, advisorSearch)) : avail);
  };
  const removeAdvisor = (a: Person) => {
    setProponenteIds((prev) => prev.filter((id) => id !== a.id));
    setAssignedAdvisors(assignedAdvisors.filter((x) => x.id !== a.id));
    const avail = [...availableAdvisors, a];
    setAvailableAdvisors(avail);
    setFilteredAvailableAdvisors(advisorSearch.trim() ? avail.filter((x) => matchesSearch(x, advisorSearch)) : avail);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    if (!titulo.trim()) {
      Swal.fire("Error", "El título es obligatorio", "error");
      return;
    }

    setIsSaving(true);
    try {
      await socialProjectsService.updateProject(projectId, {
        titulo,
        descripcion: descripcion || null,
        personas_impactadas: personasImpactadas,
        estado,
        estudiantes: assignedStudents.map((s) => s.id),
        docentes: assignedAdvisors.map((a) => a.id),
        lineas_accion: lineasAccionIds,
        semestre: semestre || null,
        id_programa: idPrograma || null,
        id_asesor: idAsesor,
        id_facultad: idFacultad || null,
        proponentes: proponenteIds,
        resumen: resumen || null,
        palabras_clave: palabrasClave || null,
        identificacion_problematica: identificacionProblematica || null,
        propuesta_solucion: propuestaSolucion || null,
        caracterizacion_poblacion: caracterizacionPoblacion || null,
        objetivos: objetivos || null,
        resultados_esperados: resultadosEsperados || null,
        metodologia: metodologia || null,
        bibliografia: bibliografia || null,
        planes_accion: planesAccion.length > 0 ? planesAccion : [],
      });

      await Swal.fire("¡Actualizado!", "Proyecto actualizado correctamente", "success");
      router.push("/social-outreach/social-projects");
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo actualizar el proyecto", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading, isSaving, projectId,
    openSections, toggleSection,
    titulo, setTitulo,
    descripcion, setDescripcion,
    estado, setEstado,
    personasImpactadas, setPersonasImpactadas,
    lineasAccionIds, setLineasAccionIds,
    idFacultad, setIdFacultad,
    idPrograma, setIdPrograma,
    semestre, setSemestre,
    idAsesor, setIdAsesor,
    asesorSearch, setAsesorSearch,
    filteredDocentes,
    facultades, programas, lineasAccion,
    assignedStudents, filteredAvailableStudents,
    studentSearch, setStudentSearch,
    addStudent, removeStudent,
    assignedAdvisors, filteredAvailableAdvisors,
    advisorSearch, setAdvisorSearch,
    addAdvisor, removeAdvisor,
    proponenteIds, setProponenteIds,
    proponentesCandidatos,
    resumen, setResumen,
    palabrasClave, setPalabrasClave,
    identificacionProblematica, setIdentificacionProblematica,
    propuestaSolucion, setPropuestaSolucion,
    caracterizacionPoblacion, setCaracterizacionPoblacion,
    objetivos, setObjetivos,
    resultadosEsperados, setResultadosEsperados,
    metodologia, setMetodologia,
    bibliografia, setBibliografia,
    planesAccion, setPlanesAccion,
    handleSubmit, router,
  };
}
