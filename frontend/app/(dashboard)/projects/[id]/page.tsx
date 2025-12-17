'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../lib/api';
import ProjectHistory from '../../../components/ProjectHistory';
import Swal from 'sweetalert2';

// Privileged roles that can make reviews
const PRIVILEGED_ROLES = ['Director', 'Jurado', 'Coordinador de Carrera', 'Decano'];

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPrivileged, setIsPrivileged] = useState(false);
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
            const historyData = await api.getProjectHistory(projectId);
            setHistory(historyData);
            
            // Check if user has privileged role
            try {
                const projects = await api.getProjects();
                const hasPrivilegedRole = projects.some((project: any) =>
                    PRIVILEGED_ROLES.includes(project.role)
                );
                setIsPrivileged(hasPrivilegedRole);
            } catch (err) {
                console.error('Error checking user role:', err);
                setIsPrivileged(false);
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
                const statusesData = await api.getStatuses();
                setStatuses(statusesData);
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
            await api.reviewIteration(
                projectId, 
                reviewComment, 
                isInfoGeneral ? undefined : (newStatus || undefined), 
                reviewNumeroResolucion || undefined, 
                reviewFile || undefined,
                isInfoGeneral ? 'Información General' : undefined
            );

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
                        Revisión (Director/Jurado)
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
                        <h2 className="text-lg font-semibold mb-4">Registrar Revisión</h2>
                        <form onSubmit={handleReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comentarios y Observaciones
                                </label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    rows={6}
                                    placeholder="Escribe tus observaciones detalladas aquí..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número de Resolución (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={reviewNumeroResolucion}
                                    onChange={(e) => setReviewNumeroResolucion(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Ej: RES-2024-001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subir Documento (Opcional)
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setReviewFile(file);
                                    }}
                                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                />
                                {reviewFile && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        Archivo seleccionado: {reviewFile.name}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Puedes subir un documento relacionado con la revisión (PDF, Word, Excel). Tamaño máximo 10MB.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cambiar Estado del Proyecto (Opcional)
                                </label>
                                {loadingStatuses ? (
                                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                                        Cargando estados...
                                    </div>
                                ) : (
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                    >
                                        <option value="">-- Mantener estado actual --</option>
                                        <option value="INFO_GENERAL">Información General</option>
                                        {statuses.map((status) => (
                                            <option key={status.id_estado_tg} value={status.id_estado_tg}>
                                                {status.nombre_estado}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Selecciona un nuevo estado para actualizar el estado del proyecto, o "Información General" para registrar cambios administrativos (ej: estudiante abandona, cambio de director, etc.) sin cambiar el estado.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {isSubmitting ? 'Guardando...' : 'Registrar Revisión'}
                            </button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}
