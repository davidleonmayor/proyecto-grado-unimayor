'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import RoleProtectedRoute from '@/shared/components/layout/RoleProtectedRoute';
import { socialProjectsService } from '@/modules/social-outreach/services/social-projects.service';

interface SocialProject {
    id_proyecto_social: string;
    nombre: string;
    descripcion: string | null;
    personas_impactadas: number;
    fecha_registro: string;
    estado: string;
}

function AdminProjectsPageContent() {
    const [projects, setProjects] = useState<SocialProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProjects = async () => {
        try {
            setIsLoading(true);
            const data = await socialProjectsService.getAllProjects();
            setProjects(data?.items || []);
            setError(null);
        } catch (err: any) {
            if (err.message && err.message.includes('403')) {
                setError('No tienes permisos para acceder a esta sección');
            } else {
                setError('Error al cargar proyectos de proyección social');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Administración de Proyectos de Proyección Social</h1>
                <Link
                    href="/social-outreach/social-projects"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver a Proyecciones
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    No hay proyectos de proyección social registrados.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-indigo-50/30 border-b border-gray-100">
                                    <th className="px-6 py-5 text-left font-medium text-gray-500 uppercase tracking-widest text-[10px]">
                                        Proyecto de Proyección Social
                                    </th>
                                    <th className="px-6 py-5 text-left font-medium text-gray-500 uppercase tracking-widest text-[10px]">
                                        Estado
                                    </th>
                                    <th className="px-6 py-5 text-left font-medium text-gray-500 uppercase tracking-widest text-[10px]">
                                        Fecha de Registro
                                    </th>
                                    <th className="px-6 py-5 text-left font-medium text-gray-500 uppercase tracking-widest text-[10px]">
                                        Impacto
                                    </th>
                                    <th className="px-6 py-5 text-right font-medium text-gray-500 uppercase tracking-widest text-[10px]">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {projects.map((project) => (
                                    <tr key={project.id_proyecto_social} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 align-top">
                                            <div className="font-medium text-gray-900 line-clamp-2 leading-relaxed mb-1 pr-4">
                                                {project.nombre}
                                            </div>
                                            {project.descripcion && (
                                                <div className="text-[13px] text-gray-400 line-clamp-2 font-light leading-snug">{project.descripcion}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap align-top">
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${project.estado === 'Finalizado' ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                                                <span className={`text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border ${project.estado === 'Finalizado' ? 'text-emerald-700 border-emerald-200' : 'text-amber-700 border-amber-200'}`}>
                                                    {project.estado}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-top whitespace-nowrap text-gray-600 font-light">
                                            {new Date(project.fecha_registro).toLocaleDateString('es-CO', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-5 align-top text-gray-700 font-medium whitespace-nowrap">
                                            {project.personas_impactadas?.toLocaleString() || 0} personas
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right align-top">
                                            <div className="flex justify-end items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/social-outreach/social-projects/admin/edit/${project.id_proyecto_social}`}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Editar proyecto de proyección social"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminProjectsPage() {
    return (
        <RoleProtectedRoute allowedRoles={['admin', 'dean']} redirectTo="/social-outreach/social-projects">
            <AdminProjectsPageContent />
        </RoleProtectedRoute>
    );
}
