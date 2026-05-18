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
} from "@/modules/social-outreach/services/catalog.service";
import type { Person } from "@/modules/social-outreach/components/PersonSelector";
import type { PlanAccionItem } from "@/modules/social-outreach/components/PlanAccionSection";
import type { PresupuestoEquipoItem } from "@/modules/social-outreach/components/PresupuestoEquipoSection";
import type { PresupuestoRecursoItem } from "@/modules/social-outreach/components/PresupuestoRecursosSection";

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
  const [fechaPresentacion, setFechaPresentacion] = useState("");
  const [fechaFinalizacion, setFechaFinalizacion] = useState("");
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

  // --- Proponentes (estudiantes de la facultad y programa seleccionados) ---
  const [assignedProponentes, setAssignedProponentes] = useState<Person[]>([]);
  const [availableProponentes, setAvailableProponentes] = useState<Person[]>([]);
  const [filteredAvailableProponentes, setFilteredAvailableProponentes] = useState<Person[]>([]);
  const [proponenteSearch, setProponenteSearch] = useState("");
  const [initialProponentesLoaded, setInitialProponentesLoaded] = useState(false);

  // --- Plan de acción ---
  const [planesAccion, setPlanesAccion] = useState<PlanAccionItem[]>([]);

  // --- Presupuesto equipo humano ---
  const [presupuestoEquipo, setPresupuestoEquipo] = useState<PresupuestoEquipoItem[]>([]);

  // --- Presupuesto recursos ---
  const [presupuestoRecursos, setPresupuestoRecursos] = useState<PresupuestoRecursoItem[]>([]);

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
      const [advisorsData, project, facultadesData, lineasData] = await Promise.all([
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
      setFechaPresentacion(project.fecha_de_presentacion ? new Date(project.fecha_de_presentacion).toISOString().slice(0, 10) : "");
      setFechaFinalizacion(project.fecha_finalizacion ? new Date(project.fecha_finalizacion).toISOString().slice(0, 10) : "");
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

      // Proponentes — pre-populate from project data
      if (project.proponentes) {
        const existingProponentes: Person[] = project.proponentes.map((p: any) => ({
          id: p.id_persona,
          name: p.persona ? `${p.persona.nombres} ${p.persona.apellidos}` : p.id_persona,
          email: p.persona?.correo_electronico || "",
          document: p.persona?.num_doc_identidad || "",
        }));
        setAssignedProponentes(existingProponentes);
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

      // Presupuesto equipo humano
      if (project.presupuesto_equipo) {
        setPresupuestoEquipo(
          project.presupuesto_equipo.map((item: any) => ({
            nombre: item.nombre || "",
            cargo: item.cargo || "",
            funcion: item.funcion || "",
            tipo_vinculacion: item.tipo_vinculacion || "",
            salario: item.salario ? Number(item.salario) : "",
          })),
        );
      }

      // Presupuesto recursos
      if (project.presupuesto_recursos) {
        setPresupuestoRecursos(
          project.presupuesto_recursos.map((item: any) => ({
            tipo_recurso: item.tipo_recurso || "",
            valor_unitario: item.valor_unitario ? Number(item.valor_unitario) : "",
            cantidad: item.cantidad ? Number(item.cantidad) : "",
            valor_total: item.valor_total ? Number(item.valor_total) : "",
          })),
        );
      }
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo cargar el proyecto", "error");
      router.push("/social-outreach/social-projects");
    } finally {
      setIsLoading(false);
      setInitialProponentesLoaded(true);
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

  // Proponentes candidates by faculty + program
  useEffect(() => {
    if (!idFacultad || !idPrograma || !initialProponentesLoaded) {
      if (initialProponentesLoaded && (!idFacultad || !idPrograma)) {
        setAvailableProponentes([]);
        setFilteredAvailableProponentes([]);
        setAssignedProponentes([]);
        setProponenteSearch("");
      }
      return;
    }
    let cancelled = false;
    catalogService.getEstudiantes(idFacultad, idPrograma).then((data) => {
      if (cancelled) return;
      const mapped: Person[] = data.map((e) => ({
        id: e.id,
        name: e.name,
        email: e.email,
        document: e.document,
      }));
      const assignedIds = new Set(assignedProponentes.map((p) => p.id));
      const available = mapped.filter((p) => !assignedIds.has(p.id));
      setAvailableProponentes(available);
      setFilteredAvailableProponentes(available);
    }).catch(() => {
      if (!cancelled) {
        setAvailableProponentes([]);
        setFilteredAvailableProponentes([]);
      }
    });
    return () => { cancelled = true; };
  }, [idFacultad, idPrograma, initialProponentesLoaded]);

  // Asesor search filter
  useEffect(() => {
    if (!asesorSearch.trim()) {
      setFilteredDocentes(allDocentes);
      return;
    }
    setFilteredDocentes(allDocentes.filter((d) => matchesSearch(d, asesorSearch)));
  }, [asesorSearch, allDocentes]);

  // Proponente search filter
  const filterProponentes = useCallback(
    (term: string) => {
      if (!term.trim()) { setFilteredAvailableProponentes(availableProponentes); return; }
      setFilteredAvailableProponentes(availableProponentes.filter((p) => matchesSearch(p, term)));
    },
    [availableProponentes],
  );
  useEffect(() => { filterProponentes(proponenteSearch); }, [proponenteSearch, filterProponentes]);

  // Proponente handlers
  const addProponente = (person: Person) => {
    setAssignedProponentes((prev) => [...prev, person]);
    const newAvailable = availableProponentes.filter((p) => p.id !== person.id);
    setAvailableProponentes(newAvailable);
    setFilteredAvailableProponentes(
      proponenteSearch.trim() ? newAvailable.filter((p) => matchesSearch(p, proponenteSearch)) : newAvailable,
    );
  };
  const removeProponente = (person: Person) => {
    setAssignedProponentes((prev) => prev.filter((p) => p.id !== person.id));
    const newAvailable = [...availableProponentes, person];
    setAvailableProponentes(newAvailable);
    setFilteredAvailableProponentes(
      proponenteSearch.trim() ? newAvailable.filter((p) => matchesSearch(p, proponenteSearch)) : newAvailable,
    );
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    if (!titulo.trim()) {
      Swal.fire("Error", "El título es obligatorio", "error");
      return;
    }
    if (assignedProponentes.length < 1) {
      Swal.fire("Error", "Debe seleccionar al menos 1 proponente", "error");
      return;
    }
    if (fechaFinalizacion && fechaPresentacion && fechaFinalizacion < fechaPresentacion) {
      Swal.fire("Error", "La fecha de finalización no puede ser anterior a la fecha de presentación", "error");
      return;
    }

    setIsSaving(true);
    try {
      await socialProjectsService.updateProject(projectId, {
        titulo,
        descripcion: descripcion || null,
        personas_impactadas: personasImpactadas,
        estado,
        fecha_de_presentacion: fechaPresentacion || undefined,
        fecha_finalizacion: fechaFinalizacion || null,
        estudiantes: assignedProponentes.map((p) => p.id),
        docentes: idAsesor ? [idAsesor] : [],
        lineas_accion: lineasAccionIds,
        semestre: semestre || null,
        id_programa: idPrograma || null,
        id_asesor: idAsesor,
        id_facultad: idFacultad || null,
        proponentes: assignedProponentes.map((p) => p.id),
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
        presupuesto_equipo: presupuestoEquipo.length > 0
          ? presupuestoEquipo.map((item) => ({
              nombre: item.nombre || undefined,
              cargo: item.cargo || undefined,
              funcion: item.funcion || undefined,
              tipo_vinculacion: item.tipo_vinculacion || undefined,
              salario: item.salario || undefined,
            }))
          : [],
        presupuesto_recursos: presupuestoRecursos.length > 0
          ? presupuestoRecursos.map((item) => ({
              tipo_recurso: item.tipo_recurso || undefined,
              valor_unitario: item.valor_unitario || undefined,
              cantidad: item.cantidad || undefined,
              valor_total: item.valor_total || undefined,
            }))
          : [],
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
    fechaPresentacion, setFechaPresentacion,
    fechaFinalizacion, setFechaFinalizacion,
    idAsesor, setIdAsesor,
    asesorSearch, setAsesorSearch,
    allDocentes,
    filteredDocentes,
    facultades, programas, lineasAccion,
    // Proponentes
    assignedProponentes,
    filteredAvailableProponentes,
    proponenteSearch, setProponenteSearch,
    addProponente, removeProponente,
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
    presupuestoEquipo, setPresupuestoEquipo,
    presupuestoRecursos, setPresupuestoRecursos,
    handleSubmit, router,
  };
}
