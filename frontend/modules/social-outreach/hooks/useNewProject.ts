"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

export function useNewProject() {
  const router = useRouter();
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
  const [lineasAccionIds, setLineasAccionIds] = useState<string[]>([]);
  const [idFacultad, setIdFacultad] = useState("");
  const [idPrograma, setIdPrograma] = useState("");
  const [semestre, setSemestre] = useState("");
  const [personasImpactadas] = useState<number>(0);
  const [fechaPresentacion, setFechaPresentacion] = useState("");
  const [fechaFinalizacion, setFechaFinalizacion] = useState("");

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

  // --- Plan de acción ---
  const [planesAccion, setPlanesAccion] = useState<PlanAccionItem[]>([]);

  // --- Presupuesto equipo humano ---
  const [presupuestoEquipo, setPresupuestoEquipo] = useState<PresupuestoEquipoItem[]>([]);

  // --- Presupuesto recursos ---
  const [presupuestoRecursos, setPresupuestoRecursos] = useState<PresupuestoRecursoItem[]>([]);

  // --- Catálogos ---
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [lineasAccion, setLineasAccion] = useState<LineaAccion[]>([]);

  // --- Proponentes (estudiantes de la facultad seleccionada) ---
  const [assignedProponentes, setAssignedProponentes] = useState<Person[]>([]);
  const [availableProponentes, setAvailableProponentes] = useState<Person[]>([]);
  const [filteredAvailableProponentes, setFilteredAvailableProponentes] = useState<Person[]>([]);
  const [proponenteSearch, setProponenteSearch] = useState("");

  // --- Asesor (docente asesor del proyecto) ---
  const [idAsesor, setIdAsesor] = useState<string | null>(null);
  const [asesorSearch, setAsesorSearch] = useState("");
  const [allDocentes, setAllDocentes] = useState<Person[]>([]);
  const [filteredDocentes, setFilteredDocentes] = useState<Person[]>([]);

  // --- Data loading ---
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [advisorsData, facultadesData, lineasData] =
        await Promise.all([
          projectsService.getAvailableAdvisors(),
          catalogService.getFacultades(),
          catalogService.getLineasAccion(),
        ]);

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

  // Carga estudiantes candidatos a proponentes cuando cambia la facultad o programa
  useEffect(() => {
    if (!idFacultad || !idPrograma) {
      setAvailableProponentes([]);
      setFilteredAvailableProponentes([]);
      setAssignedProponentes([]);
      setProponenteSearch("");
      return;
    }
    let cancelled = false;
    catalogService
      .getEstudiantes(idFacultad, idPrograma)
      .then((data) => {
        if (cancelled) return;
        const mapped: Person[] = data.map((e) => ({
          id: e.id,
          name: e.name,
          email: e.email,
          document: e.document,
        }));
        setAvailableProponentes(mapped);
        setFilteredAvailableProponentes(mapped);
        setAssignedProponentes([]);
        setProponenteSearch("");
      })
      .catch(() => {
        if (!cancelled) {
          setAvailableProponentes([]);
          setFilteredAvailableProponentes([]);
        }
      });
    return () => { cancelled = true; };
  }, [idFacultad, idPrograma]);

  // --- Filtro de búsqueda de proponentes ---
  const filterProponentes = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredAvailableProponentes(availableProponentes);
        return;
      }
      setFilteredAvailableProponentes(availableProponentes.filter((p) => matchesSearch(p, searchTerm)));
    },
    [availableProponentes],
  );

  useEffect(() => { filterProponentes(proponenteSearch); }, [proponenteSearch, filterProponentes]);

  useEffect(() => {
    if (!asesorSearch.trim()) {
      setFilteredDocentes(allDocentes);
      return;
    }
    setFilteredDocentes(allDocentes.filter((d) => matchesSearch(d, asesorSearch)));
  }, [asesorSearch, allDocentes]);

  // --- Handlers de proponentes ---
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

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      await socialProjectsService.createProject({
        titulo,
        descripcion: descripcion || null,
        personas_impactadas: personasImpactadas,
        estudiantes: assignedProponentes.map((p) => p.id),
        docentes: idAsesor ? [idAsesor] : [],
        lineas_accion: lineasAccionIds,
        semestre: semestre || null,
        id_programa: idPrograma || null,
        fecha_de_presentacion: fechaPresentacion || undefined,
        fecha_finalizacion: fechaFinalizacion || null,
        id_asesor: idAsesor,
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
        planes_accion: planesAccion.length > 0 ? planesAccion : undefined,
        presupuesto_equipo: presupuestoEquipo.length > 0
          ? presupuestoEquipo.map((item) => ({
              nombre: item.nombre || undefined,
              cargo: item.cargo || undefined,
              funcion: item.funcion || undefined,
              tipo_vinculacion: item.tipo_vinculacion || undefined,
              salario: item.salario || undefined,
            }))
          : undefined,
        presupuesto_recursos: presupuestoRecursos.length > 0
          ? presupuestoRecursos.map((item) => ({
              tipo_recurso: item.tipo_recurso || undefined,
              valor_unitario: item.valor_unitario || undefined,
              cantidad: item.cantidad || undefined,
              valor_total: item.valor_total || undefined,
            }))
          : undefined,
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
    fechaPresentacion, setFechaPresentacion,
    fechaFinalizacion, setFechaFinalizacion,
    // Catalogs
    facultades,
    programas,
    lineasAccion,
    // Asesor
    idAsesor, setIdAsesor,
    asesorSearch, setAsesorSearch,
    allDocentes,
    filteredDocentes,
    // Proponentes
    assignedProponentes,
    filteredAvailableProponentes,
    proponenteSearch, setProponenteSearch,
    addProponente,
    removeProponente,
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
    // Plan de acción
    planesAccion, setPlanesAccion,
    presupuestoEquipo, setPresupuestoEquipo,
    presupuestoRecursos, setPresupuestoRecursos,
    // Actions
    handleSubmit,
    router,
  };
}
