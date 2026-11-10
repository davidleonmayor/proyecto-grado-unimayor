'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

import RoleProtectedRoute from '@/shared/components/layout/RoleProtectedRoute';
import { socialProjectsService } from '@/modules/social-outreach/services/social-projects.service';
import { useSocialProjectsFilter } from '@/shared/hooks/useSocialProjectsFilter';

interface SocialProject {
    id_proyecto_social: string;
    titulo: string;
    descripcion: string | null;
    personas_impactadas: number;
    fecha_de_presentacion: string;
    estado: string;
}

function AdminProjectsPageContent() {
    const router = useRouter();
    const [projects, setProjects] = useState<SocialProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const {
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        filteredProjects,
        isAnyFilterActive,
        clearFilters,
    } = useSocialProjectsFilter(projects);

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

    const handleRowClick = (id: string) => {
        router.push(`/social-outreach/social-projects/admin/edit/${id}`);
    };

    const handleDelete = async (e: React.MouseEvent, project: SocialProject) => {
        e.stopPropagation();
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            html: `Se eliminará el proyecto de proyección social:<br/><strong>${project.titulo}</strong>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                setDeletingId(project.id_proyecto_social);
                await socialProjectsService.deleteProject(project.id_proyecto_social);
                await Swal.fire('Eliminado', 'Proyecto de proyección social eliminado exitosamente', 'success');
                loadProjects();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el proyecto de proyección social', 'error');
            } finally {
                setDeletingId(null);
            }
        }
    };

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

            {/* Filter and Search Bar Panel */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.015)] p-4 md:p-5 mb-6 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Text Search Input */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar proyecto..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 focus:bg-white focus:border-secondary-400 rounded-lg text-xs outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 focus:bg-white focus:border-secondary-400 rounded-lg text-xs outline-none transition-all text-gray-600 appearance-none cursor-pointer"
                        >
                            <option value="all">Todos los Estados</option>
                            <option value="Finalizado">Finalizado</option>
                            <option value="En proceso">En proceso</option>
                        </select>
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>
                </div>

                {/* Clear Filter Toolbar details */}
                <div className="flex items-center justify-between text-xs text-gray-400 font-light border-t border-gray-50 pt-3 mt-1">
                    <span>
                        Mostrando <strong className="font-semibold text-gray-600">{filteredProjects.length}</strong> de <strong className="font-semibold text-gray-600">{projects.length}</strong> proyectos registrados.
                    </span>
                    {isAnyFilterActive && (
                        <button
                            onClick={clearFilters}
                            className="text-secondary-500 hover:text-secondary-600 font-semibold flex items-center gap-1 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Limpiar Filtros
                        </button>
                    )}
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    No hay proyectos de proyección social registrados.
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    No se encontraron proyectos que coincidan con los filtros aplicados.
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProjects.map((project) => (
                                    <tr
                                        key={project.id_proyecto_social}
                                        onClick={() => handleRowClick(project.id_proyecto_social)}
                                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-5 align-top">
                                            <div className="font-medium text-gray-900 line-clamp-2 leading-relaxed mb-1 pr-4">
                                                {project.titulo}
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
                                            {new Date(project.fecha_de_presentacion).toLocaleDateString('es-CO', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-5 align-top whitespace-nowrap">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-gray-700 font-medium">
                                                    {project.personas_impactadas?.toLocaleString() || 0} personas
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDelete(e, project)}
                                                    disabled={deletingId === project.id_proyecto_social}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Eliminar proyecto de proyección social"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
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
