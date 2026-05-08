'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import RoleProtectedRoute from '@/shared/components/layout/RoleProtectedRoute';
import { projectsService } from '@/modules/projects/services/projects.service';
import { socialProjectsService } from '@/modules/social-outreach/services/social-projects.service';

interface Person {
    id: string;
    name: string;
    email: string;
    document?: string;
}

interface SocialProjectDetail {
    id_proyecto_social: string;
    nombre: string;
    descripcion?: string | null;
    fecha_registro: string;
    id_persona_registra?: string | null;
}

const mergePeopleLists = (base: Person[], required: Person[]) => {
    const merged = new Map<string, Person>();
    base.forEach(person => merged.set(person.id, person));
    required.forEach(person => {
        if (!merged.has(person.id)) {
            merged.set(person.id, person);
        }
    });
    return Array.from(merged.values());
};

function EditSocialProjectPageContent() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const projectId = useMemo(() => {
        const value = params?.id;
        return Array.isArray(value) ? value[0] : value;
    }, [params]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Available lists (shared with regular projects)
    const [allStudents, setAllStudents] = useState<Person[]>([]);
    const [allAdvisors, setAllAdvisors] = useState<Person[]>([]);

    // Separate assigned and available lists
    const [assignedStudents, setAssignedStudents] = useState<Person[]>([]);
    const [availableStudents, setAvailableStudents] = useState<Person[]>([]);
    const [assignedAdvisors, setAssignedAdvisors] = useState<Person[]>([]);
    const [availableAdvisors, setAvailableAdvisors] = useState<Person[]>([]);

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');

    // Search filters
    const [studentSearch, setStudentSearch] = useState('');
    const [advisorSearch, setAdvisorSearch] = useState('');
    const [filteredAvailableStudents, setFilteredAvailableStudents] = useState<Person[]>([]);
    const [filteredAvailableAdvisors, setFilteredAvailableAdvisors] = useState<Person[]>([]);

    useEffect(() => {
        if (!projectId) return;
        loadInitialData(projectId);
    }, [projectId]);

    const loadInitialData = async (id: string) => {
        setIsLoading(true);
        try {
            const [studentsData, advisorsData, project]: [Person[], Person[], SocialProjectDetail] = await Promise.all([
                projectsService.getAvailableStudents(),
                projectsService.getAvailableAdvisors(),
                socialProjectsService.getProjectById(id)
            ]);

            // For now, since Social Projects don't have assigned students/advisors in DB,
            // we initialize them as empty. If they were supported, we would get them from 'project'.
            const projectStudents: Person[] = []; 
            const projectAdvisors: Person[] = [];

            setAllStudents(studentsData);
            setAllAdvisors(advisorsData);

            // Separate assigned and available
            setAssignedStudents(projectStudents);
            const availableStudentsList = studentsData.filter(s => !projectStudents.some(ps => ps.id === s.id));
            setAvailableStudents(availableStudentsList);
            setFilteredAvailableStudents(availableStudentsList);

            setAssignedAdvisors(projectAdvisors);
            const availableAdvisorsList = advisorsData.filter(a => !projectAdvisors.some(pa => pa.id === a.id));
            setAvailableAdvisors(availableAdvisorsList);
            setFilteredAvailableAdvisors(availableAdvisorsList);

            setNombre(project.nombre);
            setDescripcion(project.descripcion || '');
        } catch (error: any) {
            Swal.fire('Error', error.message || 'No se pudo cargar el proyecto', 'error');
            router.push('/social-outreach/social-projects');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter students by search term
    const filterStudents = useCallback((searchTerm: string) => {
        if (!searchTerm.trim()) {
            setFilteredAvailableStudents(availableStudents);
            return;
        }

        const search = searchTerm.toLowerCase().trim();
        const filtered = availableStudents.filter(student => {
            const documentMatch = student.document?.toLowerCase().includes(search);
            const idMatch = student.id.toLowerCase().includes(search);
            const nameMatch = student.name.toLowerCase().includes(search);
            const emailMatch = student.email.toLowerCase().includes(search);

            return documentMatch || idMatch || nameMatch || emailMatch;
        });

        setFilteredAvailableStudents(filtered);
    }, [availableStudents]);

    // Filter advisors by search term
    const filterAdvisors = useCallback((searchTerm: string) => {
        if (!searchTerm.trim()) {
            setFilteredAvailableAdvisors(availableAdvisors);
            return;
        }

        const search = searchTerm.toLowerCase().trim();
        const filtered = availableAdvisors.filter(advisor => {
            const documentMatch = advisor.document?.toLowerCase().includes(search);
            const idMatch = advisor.id.toLowerCase().includes(search);
            const nameMatch = advisor.name.toLowerCase().includes(search);
            const emailMatch = advisor.email.toLowerCase().includes(search);

            return documentMatch || idMatch || nameMatch || emailMatch;
        });

        setFilteredAvailableAdvisors(filtered);
    }, [availableAdvisors]);

    // Handle student search
    useEffect(() => {
        filterStudents(studentSearch);
    }, [studentSearch, filterStudents]);

    // Handle advisor search
    useEffect(() => {
        filterAdvisors(advisorSearch);
    }, [advisorSearch, filterAdvisors]);

    // Update filtered lists when available lists change
    useEffect(() => {
        if (!studentSearch.trim()) {
            setFilteredAvailableStudents(availableStudents);
        } else {
            filterStudents(studentSearch);
        }
    }, [availableStudents, studentSearch, filterStudents]);

    useEffect(() => {
        if (!advisorSearch.trim()) {
            setFilteredAvailableAdvisors(availableAdvisors);
        } else {
            filterAdvisors(advisorSearch);
        }
    }, [availableAdvisors, advisorSearch, filterAdvisors]);

    // Move student from available to assigned
    const addStudent = (student: Person) => {
        if (assignedStudents.length >= 2) {
            Swal.fire('Límite alcanzado', 'Máximo 2 estudiantes permitidos', 'warning');
            return;
        }
        setAssignedStudents([...assignedStudents, student]);
        const newAvailable = availableStudents.filter(s => s.id !== student.id);
        setAvailableStudents(newAvailable);
        if (!studentSearch.trim()) {
            setFilteredAvailableStudents(newAvailable);
        } else {
            filterStudents(studentSearch);
        }
    };

    const removeStudent = (student: Person) => {
        setAssignedStudents(assignedStudents.filter(s => s.id !== student.id));
        const newAvailable = [...availableStudents, student];
        setAvailableStudents(newAvailable);
        if (!studentSearch.trim()) {
            setFilteredAvailableStudents(newAvailable);
        } else {
            filterStudents(studentSearch);
        }
    };

    const addAdvisor = (advisor: Person) => {
        if (assignedAdvisors.length >= 2) {
            Swal.fire('Límite alcanzado', 'Máximo 2 asesores permitidos', 'warning');
            return;
        }
        setAssignedAdvisors([...assignedAdvisors, advisor]);
        const newAvailable = availableAdvisors.filter(a => a.id !== advisor.id);
        setAvailableAdvisors(newAvailable);
        if (!advisorSearch.trim()) {
            setFilteredAvailableAdvisors(newAvailable);
        } else {
            filterAdvisors(advisorSearch);
        }
    };

    const removeAdvisor = (advisor: Person) => {
        setAssignedAdvisors(assignedAdvisors.filter(a => a.id !== advisor.id));
        const newAvailable = [...availableAdvisors, advisor];
        setAvailableAdvisors(newAvailable);
        if (!advisorSearch.trim()) {
            setFilteredAvailableAdvisors(newAvailable);
        } else {
            filterAdvisors(advisorSearch);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;

        setIsSaving(true);
        try {
            await socialProjectsService.updateProject(projectId, {
                nombre,
                descripcion,
                // Students and advisors are kept in state but not currently saved in backend
                // until the backend is updated to support relations for social projection.
                students: assignedStudents.map(s => s.id),
                advisors: assignedAdvisors.map(a => a.id)
            });

            await Swal.fire('¡Actualizado!', 'Proyecto de proyección social actualizado correctamente', 'success');
            router.push('/social-outreach/social-projects');
        } catch (error: any) {
            Swal.fire('Error', error.message || 'No se pudo actualizar el proyecto', 'error');
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Proyecto de Proyección Social</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Proyecto *
                    </label>
                    <input
                        type="text"
                        required
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ej: Programa de alfabetización digital"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                    </label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Descripción detallada del proyecto..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estudiantes (Máximo 2)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Assigned Students */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Asignados ({assignedStudents.length}/2)</span>
                            </div>
                            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                                {assignedStudents.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">No hay estudiantes asignados</p>
                                ) : (
                                    <div className="space-y-2">
                                        {assignedStudents.map(student => (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                                            >
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                    <div className="text-xs text-gray-500">{student.email}{student.document ? ` - ${student.document}` : ''}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeStudent(student)}
                                                    className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                                <span className="text-sm font-medium text-gray-700">Disponibles</span>
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
                                    <p className="text-gray-500 text-sm text-center py-4">No se encontraron estudiantes</p>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredAvailableStudents.map(student => (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                                            >
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                    <div className="text-xs text-gray-500">{student.id} • {student.email}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => addStudent(student)}
                                                    className="ml-2 p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Docentes / Asesores (Máximo 2)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Assigned Advisors */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Asignados ({assignedAdvisors.length}/2)</span>
                            </div>
                            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                                {assignedAdvisors.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">No hay docentes asignados</p>
                                ) : (
                                    <div className="space-y-2">
                                        {assignedAdvisors.map(advisor => (
                                            <div
                                                key={advisor.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                                            >
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">{advisor.name}</div>
                                                    <div className="text-xs text-gray-500">{advisor.id} • {advisor.email}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAdvisor(advisor)}
                                                    className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Available Advisors */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Disponibles</span>
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
                                    <p className="text-gray-500 text-sm text-center py-4">No se encontraron docentes</p>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredAvailableAdvisors.map(advisor => (
                                            <div
                                                key={advisor.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                                            >
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">{advisor.name}</div>
                                                    <div className="text-xs text-gray-500">{advisor.id} • {advisor.email}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => addAdvisor(advisor)}
                                                    className="ml-2 p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
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
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function EditSocialProjectPage() {
    return (
        <RoleProtectedRoute allowedRoles={['admin', 'dean']} redirectTo="/social-outreach/social-projects">
            <EditSocialProjectPageContent />
        </RoleProtectedRoute>
    );
}
