'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import RoleProtectedRoute from '../../../../../components/RoleProtectedRoute';
import api from '../../../../../lib/api';

interface FormData {
    modalities: Array<{ id: string; name: string }>;
    statuses: Array<{ id: string; name: string }>;
    programs: Array<{ id: string; name: string; faculty: string }>;
    companies: Array<{ id: string; name: string }>;
}

interface Person {
    id: string;
    name: string;
    email: string;
    document?: string;
}

interface ProjectDetail {
    id: string;
    title: string;
    summary?: string;
    objectives?: string;
    modalityId: string;
    statusId: string;
    programId: string;
    companyId?: string | null;
    startDate: string;
    endDate?: string | null;
    students: Person[];
    advisors: Person[];
}

const formatDate = (value?: string | null) => {
    if (!value) return '';
    return value.split('T')[0];
};

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

function EditProjectPageContent() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const projectId = useMemo(() => {
        const value = params?.id;
        return Array.isArray(value) ? value[0] : value;
    }, [params]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<FormData | null>(null);
    const [allStudents, setAllStudents] = useState<Person[]>([]);
    const [allAdvisors, setAllAdvisors] = useState<Person[]>([]);
    const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
    const [allCompanies, setAllCompanies] = useState<Array<{ id: string; name: string }>>([]);

    // Separate assigned and available lists
    const [assignedStudents, setAssignedStudents] = useState<Person[]>([]);
    const [availableStudents, setAvailableStudents] = useState<Person[]>([]);
    const [assignedAdvisors, setAssignedAdvisors] = useState<Person[]>([]);
    const [availableAdvisors, setAvailableAdvisors] = useState<Person[]>([]);

    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [objectives, setObjectives] = useState('');
    const [modalityId, setModalityId] = useState('');
    const [statusId, setStatusId] = useState('');
    const [programId, setProgramId] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Search filters
    const [studentSearch, setStudentSearch] = useState('');
    const [advisorSearch, setAdvisorSearch] = useState('');
    const [companySearch, setCompanySearch] = useState('');
    const [filteredAvailableStudents, setFilteredAvailableStudents] = useState<Person[]>([]);
    const [filteredAvailableAdvisors, setFilteredAvailableAdvisors] = useState<Person[]>([]);

    useEffect(() => {
        if (!projectId) return;
        loadInitialData(projectId);
    }, [projectId]);

    const loadInitialData = async (id: string) => {
        setIsLoading(true);
        try {
            const [form, studentsData, advisorsData, project]: [FormData, Person[], Person[], ProjectDetail] = await Promise.all([
                api.getFormData(),
                api.getAvailableStudents(),
                api.getAvailableAdvisors(),
                api.getProjectById(id)
            ]);

            setFormData(form);
            
            // Set all available people
            const mergedStudents = mergePeopleLists(studentsData, project.students);
            const mergedAdvisors = mergePeopleLists(advisorsData, project.advisors);
            setAllStudents(mergedStudents);
            setAllAdvisors(mergedAdvisors);
            setAllCompanies(form.companies || []);
            setCompanies(form.companies || []);

            // Separate assigned and available
            setAssignedStudents(project.students);
            const availableStudentsList = mergedStudents.filter(s => !project.students.some(ps => ps.id === s.id));
            setAvailableStudents(availableStudentsList);
            setFilteredAvailableStudents(availableStudentsList);
            
            setAssignedAdvisors(project.advisors);
            const availableAdvisorsList = mergedAdvisors.filter(a => !project.advisors.some(pa => pa.id === a.id));
            setAvailableAdvisors(availableAdvisorsList);
            setFilteredAvailableAdvisors(availableAdvisorsList);

            setTitle(project.title);
            setSummary(project.summary || '');
            setObjectives(project.objectives || '');
            setModalityId(project.modalityId);
            setStatusId(project.statusId);
            setProgramId(project.programId);
            setCompanyId(project.companyId || '');
            setStartDate(formatDate(project.startDate));
            setEndDate(formatDate(project.endDate));
        } catch (error: any) {
            Swal.fire('Error', error.message || 'No se pudo cargar el proyecto', 'error');
            router.push('/dashboard/projects/admin');
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

    // Filter companies by search term
    const filterCompanies = useCallback((searchTerm: string) => {
        if (!searchTerm.trim()) {
            setCompanies(allCompanies);
            return;
        }

        const search = searchTerm.toLowerCase().trim();
        const filtered = allCompanies.filter(company => {
            const idMatch = company.id.toLowerCase().includes(search);
            const nameMatch = company.name.toLowerCase().includes(search);
            
            return idMatch || nameMatch;
        });
        
        setCompanies(filtered);
    }, [allCompanies]);

    // Handle student search
    useEffect(() => {
        filterStudents(studentSearch);
    }, [studentSearch, filterStudents]);

    // Handle advisor search
    useEffect(() => {
        filterAdvisors(advisorSearch);
    }, [advisorSearch, filterAdvisors]);

    // Handle company search
    useEffect(() => {
        filterCompanies(companySearch);
    }, [companySearch, filterCompanies]);

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
        // Update filtered list
        if (!studentSearch.trim()) {
            setFilteredAvailableStudents(newAvailable);
        } else {
            filterStudents(studentSearch);
        }
    };

    // Move student from assigned to available
    const removeStudent = (student: Person) => {
        if (assignedStudents.length <= 1) {
            Swal.fire('Error', 'Debe mantener al menos 1 estudiante asignado', 'warning');
            return;
        }
        setAssignedStudents(assignedStudents.filter(s => s.id !== student.id));
        const newAvailable = [...availableStudents, student];
        setAvailableStudents(newAvailable);
        // Update filtered list
        if (!studentSearch.trim()) {
            setFilteredAvailableStudents(newAvailable);
        } else {
            filterStudents(studentSearch);
        }
    };

    // Move advisor from available to assigned
    const addAdvisor = (advisor: Person) => {
        if (assignedAdvisors.length >= 2) {
            Swal.fire('Límite alcanzado', 'Máximo 2 asesores permitidos', 'warning');
            return;
        }
        setAssignedAdvisors([...assignedAdvisors, advisor]);
        const newAvailable = availableAdvisors.filter(a => a.id !== advisor.id);
        setAvailableAdvisors(newAvailable);
        // Update filtered list
        if (!advisorSearch.trim()) {
            setFilteredAvailableAdvisors(newAvailable);
        } else {
            filterAdvisors(advisorSearch);
        }
    };

    // Move advisor from assigned to available
    const removeAdvisor = (advisor: Person) => {
        setAssignedAdvisors(assignedAdvisors.filter(a => a.id !== advisor.id));
        const newAvailable = [...availableAdvisors, advisor];
        setAvailableAdvisors(newAvailable);
        // Update filtered list
        if (!advisorSearch.trim()) {
            setFilteredAvailableAdvisors(newAvailable);
        } else {
            filterAdvisors(advisorSearch);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;

        if (assignedStudents.length < 1) {
            Swal.fire('Error', 'Debe mantener al menos 1 estudiante asignado', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await api.updateProject(projectId, {
                title,
                summary,
                objectives,
                modalityId,
                statusId,
                programId,
                companyId: companyId || null,
                startDate,
                endDate: endDate || null,
                students: assignedStudents.map(s => s.id),
                advisors: assignedAdvisors.map(a => a.id)
            });

            await Swal.fire('¡Actualizado!', 'Proyecto actualizado correctamente', 'success');
            router.push('/dashboard/projects/admin');
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Proyecto de Grado</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título del Proyecto *
                    </label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ej: Sistema de gestión académica"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resumen
                    </label>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Descripción breve del proyecto..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Objetivos del Proyecto
                    </label>
                    <textarea
                        value={objectives}
                        onChange={(e) => setObjectives(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Describe los objetivos principales del proyecto..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Modalidad *
                        </label>
                        <select
                            required
                            value={modalityId}
                            onChange={(e) => setModalityId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Seleccionar...</option>
                            {formData?.modalities.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado *
                        </label>
                        <select
                            required
                            value={statusId}
                            onChange={(e) => setStatusId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Seleccionar...</option>
                            {formData?.statuses.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Programa Académico *
                        </label>
                        <select
                            required
                            value={programId}
                            onChange={(e) => setProgramId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Seleccionar...</option>
                            {formData?.programs.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - {p.faculty}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Empresa (Opcional)
                        </label>
                        <div className="mb-3">
                            <input
                                type="text"
                                value={companySearch}
                                onChange={(e) => setCompanySearch(e.target.value)}
                                placeholder="Buscar por nombre o ID..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                        </div>
                        <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                            {companies.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">
                                    {companySearch 
                                        ? `No se encontraron empresas que coincidan con "${companySearch}"`
                                        : 'No hay empresas disponibles'
                                    }
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    <label
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${companyId === ''
                                                ? 'bg-primary-100 border-2 border-primary-500'
                                                : 'bg-white border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="company"
                                            checked={companyId === ''}
                                            onChange={() => setCompanyId('')}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="text-sm font-medium text-gray-900">Ninguna</div>
                                        </div>
                                    </label>
                                    {companies.map(company => (
                                        <label
                                            key={company.id}
                                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${companyId === company.id
                                                    ? 'bg-primary-100 border-2 border-primary-500'
                                                    : 'bg-white border border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="company"
                                                checked={companyId === company.id}
                                                onChange={() => setCompanyId(company.id)}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                            />
                                            <div className="ml-3 flex-1">
                                                <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    ID: {company.id}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        {companySearch && (
                            <p className="text-xs text-gray-500 mt-1">
                                {companies.length} resultado{companies.length !== 1 ? 's' : ''} encontrado{companies.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Inicio *
                        </label>
                        <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Estimada de Fin
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estudiantes * (Máximo 2, mínimo 1)
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
                                                    title="Quitar estudiante"
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
                                    <p className="text-gray-500 text-sm text-center py-4">
                                        {studentSearch 
                                            ? `No se encontraron estudiantes que coincidan con "${studentSearch}"`
                                            : 'No hay estudiantes disponibles'
                                        }
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredAvailableStudents.map(student => (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                                            >
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {student.document && `Cédula: ${student.document}`}
                                                        {student.document && ' • '}
                                                        Código: {student.id} • {student.email}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => addStudent(student)}
                                                    className="ml-2 p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                                    title="Agregar estudiante"
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
                        Asesores (Máximo 2, opcional)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Assigned Advisors */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Asignados ({assignedAdvisors.length}/2)</span>
                            </div>
                            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                                {assignedAdvisors.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">No hay asesores asignados</p>
                                ) : (
                                    <div className="space-y-2">
                                        {assignedAdvisors.map(advisor => (
                                            <div
                                                key={advisor.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                                            >
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">{advisor.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {advisor.document && `Cédula: ${advisor.document}`}
                                                        {advisor.document && ' • '}
                                                        Código: {advisor.id} • {advisor.email}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAdvisor(advisor)}
                                                    className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                    title="Quitar asesor"
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
                                    <p className="text-gray-500 text-sm text-center py-4">
                                        {advisorSearch 
                                            ? `No se encontraron asesores que coincidan con "${advisorSearch}"`
                                            : 'No hay asesores disponibles'
                                        }
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredAvailableAdvisors.map(advisor => (
                                            <div
                                                key={advisor.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                                            >
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">{advisor.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {advisor.document && `Cédula: ${advisor.document}`}
                                                        {advisor.document && ' • '}
                                                        Código: {advisor.id} • {advisor.email}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => addAdvisor(advisor)}
                                                    className="ml-2 p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                                    title="Agregar asesor"
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

export default function EditProjectPage() {
    return (
        <RoleProtectedRoute allowedRoles={['admin']} redirectTo="/dashboard/projects">
            <EditProjectPageContent />
        </RoleProtectedRoute>
    );
}

