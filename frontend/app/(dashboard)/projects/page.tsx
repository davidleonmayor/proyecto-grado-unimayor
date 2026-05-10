'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { projectsService } from '@/modules/projects/services/projects.service';
import type { Project } from '@/modules/projects/types';
import { useUserRole } from '@/shared/hooks/useUserRole';

export default function ProjectsPage() {
    const { role, loading: roleLoading } = useUserRole();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isCoordinator = role === 'admin' || role === 'dean';

    useEffect(() => {
        const fetchProjects = async () => {
            if (roleLoading) return;
            try {
                let data;
                if (isCoordinator) {
                    data = await projectsService.getAllProjects();
                } else {
                    data = await projectsService.getProjects();
                }
                setProjects(data);
            } catch (err) {
                setError('Error al cargar proyectos');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [role, roleLoading, isCoordinator]);

    if (isLoading || roleLoading) {
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
                {isCoordinator && (
                    <div className="flex l-0 gap-3">
                        <Link
                            href="/projects/admin/new"
                            className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 text-sm shadow-sm"
                        >
                            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Proyecto
                        </Link>
                        {/* TODO: implement that functionality */}
                        <Link
                            href="/projects/bulk-upload"
                            className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 text-sm shadow-sm"
                        >
                            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Cargar Múltiples Proyectos
                        </Link>
                        <Link
                            href="/projects/admin"
                            className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 text-sm shadow-sm"
                        >
                            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Administrar Proyectos
                        </Link>
                    </div>

                )}
            </div>

            {projects.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-400 font-light">
                    No tienes proyectos asignados actualmente.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => {
                        const isAprobado = project.status === 'Aprobado';
                        const isRechazado = project.status === 'Rechazado';

                        return (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="block group"
                            >
                                <div className="bg-white rounded-xl border border-gray-100 hover:border-primary-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                                    {/* Decorative Top Accent */}
                                    <div className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-300 ${
                                        isAprobado ? 'bg-emerald-500' : 
                                        isRechazado ? 'bg-rose-500' : 
                                        'bg-amber-400 group-hover:bg-primary-500'
                                    }`} />

                                    <div className="flex justify-between items-center mb-5">
                                        <div className="flex items-center gap-2">
                                            {/* Status Indicator */}
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase border ${
                                                isAprobado ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' :
                                                isRechazado ? 'bg-rose-50/50 border-rose-100 text-rose-700' :
                                                'bg-amber-50/50 border-amber-100 text-amber-700'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    isAprobado ? 'bg-emerald-500 animate-pulse' : 
                                                    isRechazado ? 'bg-rose-500' : 
                                                    'bg-amber-400'
                                                }`}></span>
                                                {project.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 text-gray-400 text-xs font-light">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>
                                                {new Date(project.lastUpdate).toLocaleDateString('es-CO', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-[17px] leading-snug font-bold text-gray-800 mb-6 group-hover:text-primary-600 transition-colors line-clamp-2">
                                        {project.title}
                                    </h3>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center gap-1.5 font-light">
                                                <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                                Modalidad
                                            </span>
                                            <span className="text-gray-700 font-semibold bg-gray-50/50 px-2 py-0.5 rounded border border-gray-100">{project.modality}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center gap-1.5 font-light">
                                                <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Mi Rol
                                            </span>
                                            <span className="text-gray-700 font-semibold bg-gray-50/50 px-2 py-0.5 rounded border border-gray-100">{project.role || 'Coordinador/Observador'}</span>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <span className="text-xs font-semibold text-primary-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                                                Detalles
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
