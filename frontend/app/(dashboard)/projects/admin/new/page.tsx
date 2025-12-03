'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import Swal from 'sweetalert2';

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

export default function NewProjectPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<FormData | null>(null);
    const [students, setStudents] = useState<Person[]>([]);
    const [advisors, setAdvisors] = useState<Person[]>([]);
    const [allStudents, setAllStudents] = useState<Person[]>([]);
    const [allAdvisors, setAllAdvisors] = useState<Person[]>([]);

    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);

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

    useEffect(() => {
        loadFormData();
    }, []);

    useEffect(() => {
        // When programId changes, reload students filtered by program
        if (programId) {
            loadStudentsByProgram(programId);
        } else {
            // If no program selected, load all available students
            loadAllStudents();
            setStudentSearch(''); // Clear search when program changes
        }
    }, [programId]);

    const loadFormData = async () => {
        try {
            const [form, advisorsData] = await Promise.all([
                api.getFormData(),
                api.getAvailableAdvisors()
            ]);

            setFormData(form);
            setAllAdvisors(advisorsData);
            setAdvisors(advisorsData);
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar los datos del formulario', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAllStudents = async () => {
        try {
            const studentsData = await api.getAvailableStudents();
            setAllStudents(studentsData);
            setStudents(studentsData);
        } catch (error) {
            console.error('Error loading students:', error);
        }
    };

    const loadStudentsByProgram = async (programId: string) => {
        try {
            const studentsData = await api.getAvailableStudents(programId);
            setAllStudents(studentsData);
            // Apply search filter if exists
            filterStudents(studentsData, studentSearch);
            // Clear selected students when program changes
            setSelectedStudents([]);
        } catch (error) {
            console.error('Error loading students by program:', error);
            Swal.fire('Error', 'No se pudieron cargar los estudiantes del programa', 'error');
        }
    };

    // Filter students by search term (document, id, name, or email)
    const filterStudents = useCallback((studentsList: Person[], searchTerm: string) => {
        if (!searchTerm.trim()) {
            setStudents(studentsList);
            return;
        }

        const search = searchTerm.toLowerCase().trim();
        const filtered = studentsList.filter(student => {
            const documentMatch = student.document?.toLowerCase().includes(search);
            const idMatch = student.id.toLowerCase().includes(search);
            const nameMatch = student.name.toLowerCase().includes(search);
            const emailMatch = student.email.toLowerCase().includes(search);
            
            return documentMatch || idMatch || nameMatch || emailMatch;
        });
        
        setStudents(filtered);
    }, []);

    // Filter advisors by search term (document, id, name, or email)
    const filterAdvisors = useCallback((advisorsList: Person[], searchTerm: string) => {
        if (!searchTerm.trim()) {
            setAdvisors(advisorsList);
            return;
        }

        const search = searchTerm.toLowerCase().trim();
        const filtered = advisorsList.filter(advisor => {
            const documentMatch = advisor.document?.toLowerCase().includes(search);
            const idMatch = advisor.id.toLowerCase().includes(search);
            const nameMatch = advisor.name.toLowerCase().includes(search);
            const emailMatch = advisor.email.toLowerCase().includes(search);
            
            return documentMatch || idMatch || nameMatch || emailMatch;
        });
        
        setAdvisors(filtered);
    }, []);

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
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else if (selectedStudents.length < 2) {
            setSelectedStudents([...selectedStudents, studentId]);
        } else {
            Swal.fire('Límite alcanzado', 'Máximo 2 estudiantes permitidos', 'warning');
        }
    };

    const toggleAdvisor = (advisorId: string) => {
        if (selectedAdvisors.includes(advisorId)) {
            setSelectedAdvisors(selectedAdvisors.filter(id => id !== advisorId));
        } else if (selectedAdvisors.length < 2) {
            setSelectedAdvisors([...selectedAdvisors, advisorId]);
        } else {
            Swal.fire('Límite alcanzado', 'Máximo 2 asesores permitidos', 'warning');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedStudents.length < 1) {
            Swal.fire('Error', 'Debe seleccionar al menos 1 estudiante', 'error');
            return;
        }

        try {
            await api.createProject({
                title,
                summary,
                objectives,
                modalityId,
                statusId,
                programId,
                companyId: companyId || null,
                startDate,
                endDate: endDate || null,
                students: selectedStudents,
                advisors: selectedAdvisors
            });

            await Swal.fire('¡Éxito!', 'Proyecto creado exitosamente', 'success');
            router.push('/dashboard/projects/admin');
        } catch (error: any) {
            Swal.fire('Error', error.message || 'No se pudo crear el proyecto', 'error');
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Proyecto de Grado</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                {/* Título */}
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

                {/* Resumen */}
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

                {/* Objetivos */}
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

                {/* Modalidad y Estado */}
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

                {/* Programa y Empresa */}
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
                        <select
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Ninguna</option>
                            {formData?.companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Fechas */}
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

                {/* Estudiantes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estudiantes * (Selecciona 1 o 2)
                    </label>
                    {!programId && (
                        <p className="text-xs text-amber-600 mb-2">
                            ⚠️ Selecciona un programa académico para ver los estudiantes asociados
                        </p>
                    )}
                    {programId && (
                        <div className="mb-3">
                            <input
                                type="text"
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                placeholder="Buscar por cédula, código o nombre..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                        </div>
                    )}
                    <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                        {!programId ? (
                            <p className="text-gray-500 text-sm text-center py-4">
                                Por favor selecciona un programa académico primero
                            </p>
                        ) : students.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">
                                {studentSearch 
                                    ? `No se encontraron estudiantes que coincidan con "${studentSearch}"`
                                    : 'No hay estudiantes disponibles para este programa'
                                }
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {students.map(student => (
                                    <label
                                        key={student.id}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedStudents.includes(student.id)
                                                ? 'bg-primary-100 border-2 border-primary-500'
                                                : 'bg-white border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={() => toggleStudent(student.id)}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {student.document && `Cédula: ${student.document}`}
                                                {student.document && ' • '}
                                                Código: {student.id} • {student.email}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">Seleccionados: {selectedStudents.length}/2</p>
                        {programId && studentSearch && (
                            <p className="text-xs text-gray-500">
                                {students.length} resultado{students.length !== 1 ? 's' : ''} encontrado{students.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>

                {/* Asesores */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asesores/Directores (Máximo 2, opcional)
                    </label>
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
                        {advisors.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">
                                {advisorSearch 
                                    ? `No se encontraron asesores que coincidan con "${advisorSearch}"`
                                    : 'No hay asesores disponibles'
                                }
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {advisors.map(advisor => (
                                    <label
                                        key={advisor.id}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedAdvisors.includes(advisor.id)
                                                ? 'bg-blue-100 border-2 border-blue-500'
                                                : 'bg-white border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAdvisors.includes(advisor.id)}
                                            onChange={() => toggleAdvisor(advisor.id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="text-sm font-medium text-gray-900">{advisor.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {advisor.document && `Cédula: ${advisor.document}`}
                                                {advisor.document && ' • '}
                                                Código: {advisor.id} • {advisor.email}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">Seleccionados: {selectedAdvisors.length}/2</p>
                        {advisorSearch && (
                            <p className="text-xs text-gray-500">
                                {advisors.length} resultado{advisors.length !== 1 ? 's' : ''} encontrado{advisors.length !== 1 ? 's' : ''}
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
