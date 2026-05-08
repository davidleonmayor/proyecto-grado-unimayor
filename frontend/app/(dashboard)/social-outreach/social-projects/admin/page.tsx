'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Swal from 'sweetalert2';
import RoleProtectedRoute from '@/shared/components/layout/RoleProtectedRoute';
import BulkUploadProjects from '@/modules/projects/components/BulkUploadProjects';
import { projectsService } from '@/modules/projects/services/projects.service';
interface Project {
    id: string;
    title: string;
    summary: string;
    status: string;
    modality: string;
    program: string;
    faculty: string;
    company: string | null;
    startDate: string;
    endDate: string | null;
    lastUpdate: string;
    actors: Array<{ name: string; role: string }>;
}

function AdminProjectsPageContent() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProjects = async () => {
        try {
            setIsLoading(true);
            const data = await projectsService.getAllProjects();
            setProjects(data);
            setError(null);
        } catch (err: any) {
            if (err.message.includes('403')) {
                setError('No tienes permisos para acceder a esta sección');
            } else {
                setError('Error al cargar proyectos');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleDelete = async (projectId: string, projectTitle: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            html: `Se eliminará el proyecto:<br/><strong>${projectTitle}</strong>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await projectsService.deleteProject(projectId);
                await Swal.fire('Eliminado', 'Proyecto eliminado exitosamente', 'success');
                loadProjects(); // Refresh list
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el proyecto', 'error');
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
                <h1 className="text-2xl font-bold text-gray-800">Administración de Proyectos</h1>
            </div>

            <div className="mb-6">
                <BulkUploadProjects onSuccessfulImport={loadProjects} />
            </div>

            {projects.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    No hay proyectos registrados.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-indigo-50/30 border-b border-gray-100">
                                    <th className="px-6 py-5 text-left font-medium text-gray-500 uppercase tracking-widest text-[10px]">
                                        Proyecto
                                    </th>
                                    <th className="px-6 py-5 text-left font-medium text-gray-500 uppercase tracking-widest text-[10px]">
                                        Estado
                                    </th>
                                    <th className="px-6 py-5 text-left font-medium text-gray-500 uppercase tracking-widest text-[10px]">
                                        Programa Académico
                                    </th>
                                    <th className="px-6 py-5 text-left font-medium text-gray-500 uppercase tracking-widest text-[10px]">
                                        Detalles
                                    </th>
                                    <th className="px-6 py-5 text-right font-medium text-gray-500 uppercase tracking-widest text-[10px]">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 align-top">
                                            <div className="font-medium text-gray-900 line-clamp-2 leading-relaxed mb-1 pr-4">
                                                {project.title}
                                            </div>
                                            {project.summary && (
                                                <div className="text-[13px] text-gray-400 line-clamp-2 font-light leading-snug">{project.summary}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap align-top">
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'Aprobado' ? 'bg-emerald-500' :
                                                    project.status === 'Rechazado' ? 'bg-rose-500' :
                                                        'bg-amber-400'
                                                    }`}></span>
                                                <span className={`text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border ${project.status === 'Aprobado' ? 'text-emerald-700 border-emerald-200' :
                                                    project.status === 'Rechazado' ? 'text-rose-700 border-rose-200' :
                                                        'text-amber-700 border-amber-200'
                                                    }`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-top">
                                            <div className="text-[13px] text-gray-800 font-medium mb-1">{project.program}</div>
                                            <div className="text-[12px] text-gray-400 font-light">{project.faculty}</div>
                                        </td>
                                        <td className="px-6 py-5 align-top">
                                            <div className="flex flex-col gap-1.5 mt-0.5">
                                                <div className="flex items-center text-[12px]">
                                                    <span className="text-gray-400 w-16">Modalidad:</span>
                                                    <span className="text-gray-700 font-medium">{project.modality}</span>
                                                </div>
                                                <div className="flex items-center text-[12px]">
                                                    <span className="text-gray-400 w-16">Actores:</span>
                                                    <span className="text-gray-700">{project.actors.length} personas</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right align-top">
                                            <div className="flex justify-end items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/projects/admin/edit/${project.id}`}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Editar proyecto"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(project.id, project.title)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Eliminar proyecto"
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
        <RoleProtectedRoute allowedRoles={['admin', 'dean']} redirectTo="/projects">
            <AdminProjectsPageContent />
        </RoleProtectedRoute>
    );
}
