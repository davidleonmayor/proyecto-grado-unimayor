'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
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

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const projectId = useMemo(() => {
        const value = params?.id;
        return Array.isArray(value) ? value[0] : value;
    }, [params]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<FormData | null>(null);
    const [students, setStudents] = useState<Person[]>([]);
    const [advisors, setAdvisors] = useState<Person[]>([]);

    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);

    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [modalityId, setModalityId] = useState('');
    const [statusId, setStatusId] = useState('');
    const [programId, setProgramId] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
            setStudents(mergePeopleLists(studentsData, project.students));
            setAdvisors(mergePeopleLists(advisorsData, project.advisors));

            setSelectedStudents(project.students.map(student => student.id));
            setSelectedAdvisors(project.advisors.map(advisor => advisor.id));

            setTitle(project.title);
            setSummary(project.summary || '');
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
        if (!projectId) return;

        if (selectedStudents.length < 1) {
            Swal.fire('Error', 'Debe mantener al menos 1 estudiante asignado', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await api.updateProject(projectId, {
                title,
                summary,
                modalityId,
                statusId,
                programId,
                companyId: companyId || null,
                startDate,
                endDate: endDate || null,
                students: selectedStudents,
                advisors: selectedAdvisors
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
                        <select
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Ninguna</option>
                            {formData?.companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
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
                        Estudiantes * (Selecciona 1 o 2)
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                        {students.length === 0 ? (
                            <p className="text-gray-500 text-sm">No hay estudiantes disponibles</p>
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
                                            <div className="text-xs text-gray-500">{student.email}{student.document ? ` - ${student.document}` : ''}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Seleccionados: {selectedStudents.length}/2</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asesores/Directores (Máximo 2, opcional)
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                        {advisors.length === 0 ? (
                            <p className="text-gray-500 text-sm">No hay asesores disponibles</p>
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
                                            <div className="text-xs text-gray-500">{advisor.email}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Seleccionados: {selectedAdvisors.length}/2</p>
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

