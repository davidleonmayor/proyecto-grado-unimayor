'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';

interface Project {
    id: string;
    title: string;
    status: string;
    role: string;
    modality: string;
    lastUpdate: string;
}

// Privileged roles that can access admin panel
const PRIVILEGED_ROLES = ['Director', 'Jurado', 'Coordinador de Carrera', 'Decano'];

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPrivileged, setIsPrivileged] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await api.getProjects();
                setProjects(data);

                // Check if user has any privileged role
                const hasPrivilegedRole = data.some((project: Project) =>
                    PRIVILEGED_ROLES.includes(project.role)
                );
                setIsPrivileged(hasPrivilegedRole);
            } catch (err) {
                setError('Error al cargar proyectos');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Mis Proyectos</h1>

                {/* Admin button - Only visible for privileged users */}
                {isPrivileged && (
                    <div className="flex l-0 gap-3">
                    <Link
                    href="/dashboard/projects/admin/new"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Proyecto
                </Link>
                {/* TODO: implement that feature */}
                <Link
                    href="/dashboard/projects/admin/new"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Cargar Múltiples Proyectos
                </Link>
                    <Link
                        href="/dashboard/projects/admin"
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Administrar Proyectos
                    </Link>
                    </div>

                )}
            </div>

            {projects.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    No tienes proyectos asignados actualmente.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/dashboard/projects/${project.id}`}
                            className="block group"
                        >
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'Aprobado' ? 'bg-green-100 text-green-800' :
                                            project.status === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {project.status}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(project.lastUpdate).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {project.title}
                                </h3>

                                <div className="mt-auto space-y-2 pt-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Modalidad:</span>
                                        {project.modality}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="font-medium mr-2">Mi Rol:</span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">{project.role}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
