'use client';

import { useEffect, useState } from 'react';
import TableSearch from '@/shared/components/ui/TableSearch';
import Image from "next/image";
import filterImage from "@/public/filter.png";
import sortImage from "@/public/sort.png";
import plusImage from "@/public/plus.png";
import Pagination from '@/shared/components/ui/Pagination';
import Table from '@/shared/components/ui/Table';
import Link from "next/link";
import viewImage from "@/public/view.png";
import deleteImage from "@/public/delete.png";
import FormModal from '@/shared/components/ui/FormModal';
import RoleProtectedRoute from '@/shared/components/layout/RoleProtectedRoute';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { projectsService } from '@/modules/projects/services/projects.service';
import { personsService } from '@/modules/persons/services/persons.service';


type Teacher = {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    rol: string;
    carrera: string;
    facultad?: string;
    facultadId?: string;
    documento: string;
}

const columns = [
    { header: "Info", accessor: "info" },
    { header: "Teléfono", accessor: "telefono", className: "hidden md:table-cell" },
    // { header: "ID", accessor: "id", className: "hidden md:table-cell" },
    { header: "Nombre", accessor: "nombre", className: "hidden md:table-cell" },
    { header: "Carrera", accessor: "carrera", className: "hidden md:table-cell" },
    // { header: "Email", accessor: "email", className: "hidden md:table-cell" },
    { header: "Rol", accessor: "rol", className: "hidden md:table-cell" },
]

const TeacherListPageContent = () => {
    const { role } = useUserRole();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterFaculty, setFilterFaculty] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [faculties, setFaculties] = useState<Array<{ id: string; name: string }>>([]);
    const [roles, setRoles] = useState<Array<string>>([]);

    useEffect(() => {
        loadTeachers();
        loadFaculties();
    }, [currentPage, searchTerm, filterRole, filterFaculty]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole, filterFaculty]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.filter-menu-container') && !target.closest('.sort-menu-container')) {
                setShowFilterMenu(false);
                setShowSortMenu(false);
            }
        };

        if (showFilterMenu || showSortMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showFilterMenu, showSortMenu]);

    const loadFaculties = async () => {
        try {
            const formData = await projectsService.getFormData();
            const uniqueFaculties = new Map<string, string>();
            formData.programs.forEach((p: any) => {
                if (p.faculty && !uniqueFaculties.has(p.faculty)) {
                    uniqueFaculties.set(p.faculty, p.faculty);
                }
            });
            setFaculties(Array.from(uniqueFaculties.entries()).map(([id, name]) => ({ id, name })));
        } catch (error) {
            console.error('Error loading faculties:', error);
        }
    };

    const loadTeachers = async () => {
        try {
            setIsLoading(true);
            const response = await personsService.getTeachers({
                page: currentPage,
                limit: 10,
                search: searchTerm || undefined,
                role: filterRole !== 'all' ? filterRole : undefined,
                faculty: filterFaculty !== 'all' ? filterFaculty : undefined
            });

            let sortedTeachers = [...response.teachers];

            // Apply sorting
            if (sortBy === 'name') {
                sortedTeachers.sort((a, b) => a.nombre.localeCompare(b.nombre));
            } else if (sortBy === 'email') {
                sortedTeachers.sort((a, b) => a.email.localeCompare(b.email));
            } else if (sortBy === 'role') {
                sortedTeachers.sort((a, b) => a.rol.localeCompare(b.rol));
            } else if (sortBy === 'faculty') {
                sortedTeachers.sort((a, b) => (a.facultad || '').localeCompare(b.facultad || ''));
            }

            setTeachers(sortedTeachers);
            setPagination(response.pagination);

            // Extract unique roles from loaded teachers (including allRoles)
            const uniqueRoles = new Set<string>();
            sortedTeachers.forEach(t => {
                uniqueRoles.add(t.rol);
                // Also add all roles if available
                if (t.allRoles && Array.isArray(t.allRoles)) {
                    t.allRoles.forEach((r: string) => uniqueRoles.add(r));
                }
            });
            setRoles(Array.from(uniqueRoles).sort());
        } catch (error) {
            console.error('Error loading teachers:', error);
            setTeachers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderRow = (item: Teacher) => (
        <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#dbdafe]">
            <td className="flex items-center gap-4 p-4 ">
                <div className="md:hidden xl:block relative w-10 h-10 rounded-full overflow-hidden bg-primary-200">
                    <Image
                        src="/avatar.png"
                        alt={item.nombre}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <h3 className="font-semibold ">{item.nombre}</h3>
                    <p className="text-xs text-gray-500">{item?.email}</p>
                </div>
            </td>
            <td className="hidden md:table-cell">{item.telefono}</td>
            <td className="hidden md:table-cell">{item.nombre}</td>
            <td className="hidden md:table-cell">{item.carrera}</td>
            <td className="hidden md:table-cell">{item.rol}</td>
            <td>
                <div className="flex items-center gap-2">
                    <Link href={`/list/teachers/${item.id}`}>
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#EAFBFD]">
                            <Image src={viewImage} alt="" width={16} height={16} />
                        </button>
                    </Link>
                    {role === 'admin' && (
                        <>
                            <FormModal table="teacher" type="update" data={item} />
                            <FormModal table="teacher" type="delete" id={item.id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold ">Todos los profesores</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch onSearch={setSearchTerm} />
                    <div className="flex items-center gap-4 self-end relative">
                        {/* Filter Button */}
                        <div className="relative filter-menu-container">
                            <button
                                onClick={() => {
                                    setShowFilterMenu(!showFilterMenu);
                                    setShowSortMenu(false);
                                }}
                                className={`w-8 h-8 flex items-center justify-center rounded-full bg-principal ${showFilterMenu ? 'ring-2 ring-primary-500' : ''}`}
                            >
                                <Image src={filterImage} alt="Filtrar" width={14} height={14} />
                            </button>
                            {showFilterMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="p-2">
                                        <div className="mb-2">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
                                            <select
                                                value={filterRole}
                                                onChange={(e) => setFilterRole(e.target.value)}
                                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                            >
                                                <option value="all">Todos</option>
                                                {roles.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Facultad</label>
                                            <select
                                                value={filterFaculty}
                                                onChange={(e) => setFilterFaculty(e.target.value)}
                                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                            >
                                                <option value="all">Todas</option>
                                                {faculties.map(f => (
                                                    <option key={f.id} value={f.id}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setFilterRole('all');
                                                setFilterFaculty('all');
                                                setShowFilterMenu(false);
                                            }}
                                            className="mt-2 w-full px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                                        >
                                            Limpiar filtros
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sort Button */}
                        <div className="relative sort-menu-container">
                            <button
                                onClick={() => {
                                    setShowSortMenu(!showSortMenu);
                                    setShowFilterMenu(false);
                                }}
                                className={`w-8 h-8 flex items-center justify-center rounded-full bg-principal ${showSortMenu ? 'ring-2 ring-primary-500' : ''}`}
                            >
                                <Image src={sortImage} alt="Ordenar" width={14} height={14} />
                            </button>
                            {showSortMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                setSortBy('name');
                                                setShowSortMenu(false);
                                            }}
                                            className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${sortBy === 'name' ? 'bg-primary-50 text-primary-700' : ''}`}
                                        >
                                            Por nombre
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSortBy('email');
                                                setShowSortMenu(false);
                                            }}
                                            className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${sortBy === 'email' ? 'bg-primary-50 text-primary-700' : ''}`}
                                        >
                                            Por email
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSortBy('role');
                                                setShowSortMenu(false);
                                            }}
                                            className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${sortBy === 'role' ? 'bg-primary-50 text-primary-700' : ''}`}
                                        >
                                            Por rol
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSortBy('faculty');
                                                setShowSortMenu(false);
                                            }}
                                            className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${sortBy === 'faculty' ? 'bg-primary-50 text-primary-700' : ''}`}
                                        >
                                            Por facultad
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {role === 'admin' && (
                            <FormModal table="teacher" type="create" />
                        )}
                    </div>
                </div>
            </div>
            {/* LIST */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
            ) : teachers.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        {searchTerm || filterRole !== 'all' || filterFaculty !== 'all'
                            ? 'No se encontraron profesores que coincidan con los filtros'
                            : 'No hay profesores disponibles'}
                    </p>
                </div>
            ) : (
                <>
                    <Table columns={columns} renderRow={renderRow} data={teachers} />
                    {pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={setCurrentPage}
                            hasNextPage={pagination.hasNextPage}
                            hasPrevPage={pagination.hasPrevPage}
                        />
                    )}
                </>
            )}
        </div>
    );
};

const TeacherListPage = () => {
    return (
        <RoleProtectedRoute allowedRoles={['admin', 'dean']}>
            <TeacherListPageContent />
        </RoleProtectedRoute>
    );
};

export default TeacherListPage;