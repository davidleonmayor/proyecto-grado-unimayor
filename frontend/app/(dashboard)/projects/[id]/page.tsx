'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import ProjectHistory from '@/modules/projects/components/ProjectHistory';
import Swal from 'sweetalert2';
import { projectsService } from '@/modules/projects/services/projects.service';
import { useUserRole } from '@/shared/hooks/useUserRole';

// Privileged roles that can make reviews
const PRIVILEGED_ROLES = ['Director', 'Jurado', 'Coordinador de Carrera', 'Decano'];

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasProjectRole, setHasProjectRole] = useState(false);
    const { role } = useUserRole();
    const isPrivileged = hasProjectRole || role === 'admin' || role === 'dean';

    const [activeTab, setActiveTab] = useState<'history' | 'review'>('history');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Review State
    const [reviewComment, setReviewComment] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [reviewNumeroResolucion, setReviewNumeroResolucion] = useState('');
    const [reviewFile, setReviewFile] = useState<File | null>(null);
    const [statuses, setStatuses] = useState<Array<{ id_estado_tg: string; nombre_estado: string }>>([]);
    const [loadingStatuses, setLoadingStatuses] = useState(false);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const historyData = await projectsService.getProjectHistory(projectId);
            setHistory(historyData);

            // Check if user has privileged role
            try {
                const projects = await projectsService.getProjects();
                const hasPrivilegedRole = projects.some((project: any) =>
                    PRIVILEGED_ROLES.includes(project.role)
                );
                setHasProjectRole(hasPrivilegedRole);
            } catch (err) {
                console.error('Error checking user role:', err);
                setHasProjectRole(false);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo cargar el historial', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            loadData();
        }
    }, [projectId]);

    // Redirect to history tab if user tries to access review tab without privileges
    useEffect(() => {
        if (activeTab === 'review' && !isPrivileged && !isLoading) {
            setActiveTab('history');
        }
    }, [activeTab, isPrivileged, isLoading]);

    useEffect(() => {
        const loadStatuses = async () => {
            try {
                setLoadingStatuses(true);
                const statusesData = await projectsService.getStatuses();
                const filteredStatuses = statusesData.filter(
                    s => s.nombre_estado.trim().toLowerCase() !== 'en curso'
                );
                setStatuses(filteredStatuses);
            } catch (error) {
                console.error('Error loading statuses:', error);
                // Don't show error to user, just log it
            } finally {
                setLoadingStatuses(false);
            }
        };

        loadStatuses();
    }, []);

    const handleReview = async (e: React.FormEvent) => {
        e.preventDefault();

        // Additional security check
        if (!isPrivileged) {
            Swal.fire('Error', 'No tienes permisos para realizar revisiones', 'error');
            setActiveTab('history');
            return;
        }

        try {
            setIsSubmitting(true);
            // Check if "Información General" is selected (special value)
            const isInfoGeneral = newStatus === 'INFO_GENERAL';

            await projectsService.reviewIteration(projectId, {
                description: reviewComment,
                newStatusId: isInfoGeneral ? undefined : (newStatus || undefined),
                numero_resolucion: reviewNumeroResolucion || undefined,
                file: reviewFile || undefined,
                actionType: isInfoGeneral ? 'Información General' : undefined
            });

            await Swal.fire('Éxito', 'Revisión registrada correctamente', 'success');
            setReviewComment('');
            setNewStatus('');
            setReviewNumeroResolucion('');
            setReviewFile(null);
            setActiveTab('history');
            loadData(); // Refresh history
        } catch (error) {
            Swal.fire('Error', error instanceof Error ? error.message : 'Error al registrar revisión', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Detalle del Proyecto</h1>
                <button
                    onClick={() => loadData()}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'history'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Historial de Iteraciones
                </button>
                {isPrivileged && (
                    <button
                        onClick={() => setActiveTab('review')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'review'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Registrar Revisión
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">

                {/* History Tab */}
                {activeTab === 'history' && (
                    isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <ProjectHistory history={history} />
                    )
                )}

                {/* Review Tab (Privileged) */}
                {activeTab === 'review' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Registrar Revisión</h2>
                            <p className="text-sm text-gray-500 mt-1">Completa el formulario para registrar una iteración o cambiar el estado del proyecto.</p>
                        </div>

                        <form onSubmit={handleReview} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comentarios y Observaciones *
                                </label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                    rows={5}
                                    placeholder="Escribe tus observaciones aquí..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Número de Resolución
                                    </label>
                                    <input
                                        type="text"
                                        value={reviewNumeroResolucion}
                                        onChange={(e) => setReviewNumeroResolucion(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                        placeholder="Opcional"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cambiar Estado del Proyecto
                                    </label>
                                    {loadingStatuses ? (
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 text-sm">
                                            Cargando estados...
                                        </div>
                                    ) : (
                                        <select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                        >
                                            <option value="">-- Mantener estado --</option>
                                            <option value="INFO_GENERAL">Información General</option>
                                            {statuses.map((status) => (
                                                <option key={status.id_estado_tg} value={status.id_estado_tg}>
                                                    {status.nombre_estado}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        "Información General" registra el cambio sin afectar el estado actual.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Documento Adjunto
                                </label>
                                <div className={`relative group border-2 border-dashed rounded-lg p-6 text-center transition-all ${reviewFile ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:border-gray-400 bg-white'}`}>
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setReviewFile(file);
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    />
                                    {!reviewFile ? (
                                        <div className="space-y-2 pointer-events-none">
                                            <svg className="mx-auto h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            <div className="text-sm font-medium text-gray-700">Seleccionar o arrastrar archivo</div>
                                            <div className="text-xs text-gray-400">PDF, DOC, EXCEL (Opcional)</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 pointer-events-none">
                                            <svg className="mx-auto h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div className="text-sm font-medium text-gray-900 truncate px-2">{reviewFile.name}</div>
                                            <div className="text-xs text-gray-500">{(reviewFile.size / 1024 / 1024).toFixed(2)} MB</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-2.5 px-4 border border-transparent rounded text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-200 disabled:text-gray-500 transition-colors"
                                >
                                    {isSubmitting ? 'Guardando...' : 'Registrar Revisión'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}
