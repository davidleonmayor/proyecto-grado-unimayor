'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../lib/api';
import ProjectHistory from '../../../components/ProjectHistory';
import Swal from 'sweetalert2';

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'history' | 'upload' | 'review'>('history');

    // Upload State
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Review State
    const [reviewComment, setReviewComment] = useState('');
    const [newStatus, setNewStatus] = useState('');

    const loadData = async () => {
        try {
            setIsLoading(true);
            const historyData = await api.getProjectHistory(projectId);
            setHistory(historyData);
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

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        try {
            setIsSubmitting(true);
            await api.createIteration(projectId, file, description);

            await Swal.fire('Éxito', 'Entrega subida correctamente', 'success');
            setFile(null);
            setDescription('');
            setActiveTab('history');
            loadData(); // Refresh history
        } catch (error) {
            Swal.fire('Error', error instanceof Error ? error.message : 'Error al subir entrega', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReview = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            await api.reviewIteration(projectId, reviewComment, newStatus || undefined);

            await Swal.fire('Éxito', 'Revisión registrada correctamente', 'success');
            setReviewComment('');
            setNewStatus('');
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
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'upload'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Nueva Entrega (Estudiante)
                </button>
                <button
                    onClick={() => setActiveTab('review')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'review'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Revisión (Director/Jurado)
                </button>
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

                {/* Upload Tab (Student) */}
                {activeTab === 'upload' && (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-lg font-semibold mb-4">Subir Nueva Entrega</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción / Comentarios
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={4}
                                    placeholder="Describe los cambios realizados en esta entrega..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Archivo del Proyecto (PDF, DOCX, ZIP)
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Subir un archivo</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                                            </label>
                                            <p className="pl-1">o arrastrar y soltar</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {file ? `Seleccionado: ${file.name}` : 'PDF, DOCX hasta 10MB'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !file}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {isSubmitting ? 'Subiendo...' : 'Enviar Entrega'}
                            </button>
                        </form>
                    </div>
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

                            {/* TODO: Fetch dynamic statuses from API */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cambiar Estado del Proyecto (Opcional)
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                                >
                                    <option value="">-- Mantener estado actual --</option>
                                    {/* These IDs should come from your DB/Seed */}
                                    <option value="clxyz6bvt0000kh0gao8tqvhz">En Revisión</option>
                                    <option value="clxyz6bvt0001kh0g3m4n5o6p">Aprobado</option>
                                    <option value="clxyz6bvt0002kh0g7q8r9s0t">Rechazado / Correcciones</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Selecciona un nuevo estado solo si deseas actualizar el estado general del proyecto.
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
