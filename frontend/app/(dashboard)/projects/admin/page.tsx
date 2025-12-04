'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import Swal from 'sweetalert2';
import RoleProtectedRoute from '../../../components/RoleProtectedRoute';
import BulkUploadProjects from '../../../components/BulkUploadProjects';
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
            const data = await api.getAllProjects();
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
                await api.deleteProject(projectId);
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Título
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Programa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Modalidad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actores
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                            {project.title}
                                        </div>
                                        {project.summary && (
                                            <div className="text-xs text-gray-500 line-clamp-1">{project.summary}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'Aprobado' ? 'bg-green-100 text-green-800' :
                                                project.status === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{project.program}</div>
                                        <div className="text-xs text-gray-500">{project.faculty}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {project.modality}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {project.actors.length} {project.actors.length === 1 ? 'persona' : 'personas'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/dashboard/projects/admin/edit/${project.id}`}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(project.id, project.title)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function AdminProjectsPage() {
    return (
        <RoleProtectedRoute allowedRoles={['admin']} redirectTo="/dashboard/projects">
            <AdminProjectsPageContent />
        </RoleProtectedRoute>
    );
}
