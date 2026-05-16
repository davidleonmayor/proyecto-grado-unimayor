"use client";

import RoleProtectedRoute from "@/shared/components/layout/RoleProtectedRoute";
import { useNewProject } from "@/modules/social-outreach/hooks/useNewProject";
import SectionHeader from "@/modules/social-outreach/components/SectionHeader";
import PersonSelector from "@/modules/social-outreach/components/PersonSelector";
import CheckboxGroup from "@/modules/social-outreach/components/CheckboxGroup";
import TextAreaField from "@/modules/social-outreach/components/TextAreaField";

const NewProjectPageContent = () => {
  const {
    isLoading,
    isSaving,
    currentUser,
    openSections,
    toggleSection,
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    lineasAccionIds,
    setLineasAccionIds,
    idFacultad,
    setIdFacultad,
    idPrograma,
    setIdPrograma,
    semestre,
    setSemestre,
    idAsesor,
    setIdAsesor,
    asesorSearch,
    setAsesorSearch,
    filteredDocentes,
    personasImpactadas,
    facultades,
    programas,
    lineasAccion,
    assignedStudents,
    filteredAvailableStudents,
    studentSearch,
    setStudentSearch,
    addStudent,
    removeStudent,
    assignedAdvisors,
    filteredAvailableAdvisors,
    advisorSearch,
    setAdvisorSearch,
    addAdvisor,
    removeAdvisor,
    proponenteIds,
    setProponenteIds,
    proponentesCandidatos,
    resumen,
    setResumen,
    palabrasClave,
    setPalabrasClave,
    identificacionProblematica,
    setIdentificacionProblematica,
    propuestaSolucion,
    setPropuestaSolucion,
    caracterizacionPoblacion,
    setCaracterizacionPoblacion,
    objetivos,
    setObjetivos,
    resultadosEsperados,
    setResultadosEsperados,
    metodologia,
    setMetodologia,
    bibliografia,
    setBibliografia,
    handleSubmit,
    router,
  } = useNewProject();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Crear Proyecto de Proyección Social
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

            {/* Líneas de acción */}
            <CheckboxGroup
              label="Líneas de acción"
              description="Selecciona una o más líneas que apliquen al proyecto."
              items={lineasAccion.map((l) => ({
                id: l.id_linea_accion,
                label: l.nombre,
              }))}
              selectedIds={lineasAccionIds}
              onChange={setLineasAccionIds}
              emptyMessage="No hay líneas de acción configuradas."
            />

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

            {/* Proponentes (estudiantes de la facultad seleccionada) */}
            <div>
              <CheckboxGroup
                label="Proponentes"
                description={
                  idFacultad
                    ? "Selecciona los estudiantes que serán proponentes del proyecto."
                    : "Selecciona una facultad para ver los estudiantes disponibles como proponentes."
                }
                items={proponentesCandidatos.map((p) => ({
                  id: p.id,
                  label: p.name,
                  sublabel: p.email,
                }))}
                selectedIds={proponenteIds}
                onChange={setProponenteIds}
                emptyMessage={
                  idFacultad
                    ? "No se encontraron estudiantes en esta facultad."
                    : "Selecciona una facultad primero."
                }
              />
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

            {/* Docente Asesor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Docente Asesor
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Busca y selecciona el docente que será asesor del proyecto.
              </p>
              {idAsesor && (
                <div className="flex items-center justify-between p-3 mb-2 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {filteredDocentes.find((d) => d.id === idAsesor)?.name ||
                        [...(assignedAdvisors || [])].find(
                          (a) => a.id === idAsesor,
                        )?.name ||
                        "Asesor seleccionado"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {filteredDocentes.find((d) => d.id === idAsesor)?.email ||
                        ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdAsesor(null)}
                    className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    aria-label="Quitar asesor"
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
              )}
              <input
                type="text"
                value={asesorSearch}
                onChange={(e) => setAsesorSearch(e.target.value)}
                placeholder="Buscar docente por nombre, email o documento..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              {asesorSearch.trim() && !idAsesor && (
                <div className="mt-2 border border-gray-300 rounded-lg max-h-48 overflow-y-auto bg-white">
                  {filteredDocentes.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-3">
                      No se encontraron docentes
                    </p>
                  ) : (
                    filteredDocentes.slice(0, 10).map((docente) => (
                      <button
                        key={docente.id}
                        type="button"
                        onClick={() => {
                          setIdAsesor(docente.id);
                          setAsesorSearch("");
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {docente.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {docente.email}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <TextAreaField
              label="Resumen"
              value={resumen}
              onChange={setResumen}
              maxLength={200}
              rows={3}
              placeholder="Describa brevemente el propósito y alcance del proyecto..."
              description="Síntesis del proyecto en máximo 200 caracteres."
            />

            <TextAreaField
              label="Palabras clave"
              value={palabrasClave}
              onChange={setPalabrasClave}
              maxLength={100}
              rows={2}
              placeholder="Ej: medio ambiente, reciclaje, educación ambiental"
              description="Términos clave separados por comas."
            />

            <TextAreaField
              label="Identificación de la problemática"
              value={identificacionProblematica}
              onChange={setIdentificacionProblematica}
              maxLength={1000}
              rows={5}
              placeholder="Describa la problemática que aborda el proyecto..."
              description="Contexto y justificación del problema identificado."
            />

            <TextAreaField
              label="Propuesta de solución"
              value={propuestaSolucion}
              onChange={setPropuestaSolucion}
              maxLength={700}
              rows={4}
              placeholder="Describa la propuesta para atender la problemática..."
              description="Cómo el proyecto aborda el problema identificado."
            />

            <TextAreaField
              label="Caracterización de la población beneficiaria"
              value={caracterizacionPoblacion}
              onChange={setCaracterizacionPoblacion}
              maxLength={900}
              rows={4}
              placeholder="Describa la población a la que va dirigido el proyecto..."
              description="Perfil demográfico y social de los beneficiarios."
            />

            <TextAreaField
              label="Objetivos"
              value={objetivos}
              onChange={setObjetivos}
              maxLength={900}
              rows={5}
              placeholder="Objetivo general y específicos del proyecto..."
              description="Incluya el objetivo general y los objetivos específicos."
            />

            <TextAreaField
              label="Resultados esperados"
              value={resultadosEsperados}
              onChange={setResultadosEsperados}
              maxLength={700}
              rows={4}
              placeholder="Describa los resultados que se esperan alcanzar..."
              description="Productos, cambios o beneficios esperados."
            />

            <TextAreaField
              label="Metodología"
              value={metodologia}
              onChange={setMetodologia}
              maxLength={1000}
              rows={5}
              placeholder="Describa el enfoque metodológico y las actividades..."
              description="Enfoque, técnicas y estrategias de intervención."
            />

            <TextAreaField
              label="Bibliografía"
              value={bibliografia}
              onChange={setBibliografia}
              maxLength={600}
              rows={3}
              placeholder="Referencias bibliográficas de soporte..."
              description="Fuentes consultadas en formato libre."
            />

            {/* Personas Impactadas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad de personas impactadas *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Este valor inicia en 0 y se actualizará cuando el proyecto
                avance.
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
            <PersonSelector
              label="Estudiantes * (Selecciona 1 o más)"
              assigned={assignedStudents}
              available={filteredAvailableStudents}
              search={studentSearch}
              onSearchChange={setStudentSearch}
              onAdd={addStudent}
              onRemove={removeStudent}
            />

            {/* Docentes */}
            <PersonSelector
              label="Docentes * (Selecciona 1 o más)"
              assigned={assignedAdvisors}
              available={filteredAvailableAdvisors}
              search={advisorSearch}
              onSearchChange={setAdvisorSearch}
              onAdd={addAdvisor}
              onRemove={removeAdvisor}
              protectedIds={currentUser ? [currentUser.id] : []}
            />
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
};

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
