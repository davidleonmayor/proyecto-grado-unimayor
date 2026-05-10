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

    // Filter states
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [modalityFilter, setModalityFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');

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
                setProjects(data || []);
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

    // Extract dynamic unique modalities, roles and statuses for filters
    const uniqueModalities = Array.from(new Set(projects.map(p => p.modality).filter(Boolean)));
    const uniqueRoles = Array.from(new Set(projects.map(p => p.role || 'Coordinador/Observador').filter(Boolean)));
    const uniqueStatuses = Array.from(new Set(projects.map(p => p.status).filter(Boolean)));

    // Filtering logic
    const filteredProjects = projects.filter((project) => {
        const matchesSearch = 
            project.title.toLowerCase().includes(search.toLowerCase()) ||
            project.modality.toLowerCase().includes(search.toLowerCase());
        
        const projectRoleStr = project.role || 'Coordinador/Observador';
        
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        const matchesModality = modalityFilter === 'all' || project.modality === modalityFilter;
        const matchesRole = roleFilter === 'all' || projectRoleStr === roleFilter;

        return matchesSearch && matchesStatus && matchesModality && matchesRole;
    });

    const isAnyFilterActive = search !== '' || statusFilter !== 'all' || modalityFilter !== 'all' || roleFilter !== 'all';

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setModalityFilter('all');
        setRoleFilter('all');
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Mis Proyectos de Grado</h1>
                    <p className="text-xs text-gray-400 font-light mt-0.5">Busca, filtra y haz seguimiento de los trabajos de grado de la facultad.</p>
                </div>

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

            {/* Filter and Search Bar Panel */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.015)] p-4 md:p-5 mb-6 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
                            {uniqueStatuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>

                    {/* Modality Dropdown */}
                    <div className="relative">
                        <select
                            value={modalityFilter}
                            onChange={(e) => setModalityFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 focus:bg-white focus:border-secondary-400 rounded-lg text-xs outline-none transition-all text-gray-600 appearance-none cursor-pointer"
                        >
                            <option value="all">Todas las Modalidades</option>
                            {uniqueModalities.map((mod) => (
                                <option key={mod} value={mod}>{mod}</option>
                            ))}
                        </select>
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>

                    {/* Role Dropdown */}
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 focus:bg-white focus:border-secondary-400 rounded-lg text-xs outline-none transition-all text-gray-600 appearance-none cursor-pointer"
                        >
                            <option value="all">Todos los Roles</option>
                            {uniqueRoles.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
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
                            onClick={handleClearFilters}
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-400 font-light">
                    No tienes proyectos asignados actualmente.
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-12 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-700">Sin resultados</h3>
                    <p className="text-xs text-gray-400 font-light mt-1 mb-4">No se encontraron proyectos de grado que coincidan con los criterios de búsqueda.</p>
                    <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-slate-50 border border-gray-100 hover:border-gray-200 text-gray-600 font-semibold text-xs rounded-lg transition-all"
                    >
                        Restaurar búsqueda
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => {
                        const isAprobado = project.status === 'Aprobado';
                        const isRechazado = project.status === 'Rechazado';
                        const isFinalizado = project.status === 'Finalizado' || project.status === 'finalizado' || project.status === 'Terminado' || project.status === 'terminado';

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
                                        isRechazado || isFinalizado ? 'bg-rose-500' : 
                                        'bg-amber-400 group-hover:bg-primary-500'
                                    }`} />

                                    <div className="flex justify-between items-center mb-5">
                                        <div className="flex items-center gap-2">
                                            {/* Status Indicator */}
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase border ${
                                                isAprobado ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' :
                                                isRechazado || isFinalizado ? 'bg-rose-50/50 border-rose-100 text-rose-700' :
                                                'bg-amber-50/50 border-amber-100 text-amber-700'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    isAprobado ? 'bg-emerald-500 animate-pulse' : 
                                                    isRechazado || isFinalizado ? 'bg-rose-500' : 
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
