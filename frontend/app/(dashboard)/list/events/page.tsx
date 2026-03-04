'use client';

import { useEffect, useState } from 'react';
import TableSearch from '@/shared/components/ui/TableSearch';
import Image from "next/image";
import filterImage from "@/public/filter.png";
import sortImage from "@/public/sort.png";
import plusImage from "@/public/plus.png";
import Pagination from '@/shared/components/ui/Pagination';
import LegacyTable from "@/shared/components/ui/LegacyTable";
import Link from "next/link";
import viewImage from "@/public/view.png";
import FormModal from '@/shared/components/ui/FormModal';
import RoleProtectedRoute from '@/shared/components/layout/RoleProtectedRoute';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { projectsService } from '@/modules/projects/services/projects.service';
import { eventsService } from '@/modules/events/services/events.service';


interface Event {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  horaInicio?: string;
  horaFin?: string;
  prioridad: string;
  allDay: boolean;
  daysRemaining: number;
  color: string;
  borderColor: string;
  proyectoTitulo?: string | null;
}

const columns = [
  { header: "Evento", accessor: "title" },
  { header: "Fecha", accessor: "fecha" },
  { header: "Hora inicio", accessor: "horaInicio" },
  { header: "Hora fin", accessor: "horaFin" },
  { header: "Prioridad", accessor: "prioridad" },
  { header: "Estado", accessor: "daysRemaining" },
];

const EventListPageContent = () => {
  const { role } = useUserRole();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    loadEvents();
    checkIfCoordinator();
  }, [currentPage]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [searchTerm, filterPriority, filterDate, sortBy]);

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

  const checkIfCoordinator = async () => {
    try {
      const projects = await projectsService.getProjects();
      const hasCoordinatorRole = projects.some((project: any) =>
        project.role === 'Coordinador de Carrera'
      );
      setIsCoordinator(hasCoordinatorRole);
    } catch (error) {
      console.error('Error checking coordinator role:', error);
      setIsCoordinator(false);
    }
  };

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventsService.getEvents({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        priority: filterPriority,
        status: filterDate,
      });
      const eventsData = response.events;

      // Apply client-side sorting only (filters are handled server-side)
      let sorted = [...eventsData];

      // Sorting
      if (sortBy === 'priority') {
        const priorityOrder = { 'alta': 0, 'media': 1, 'baja': 2 };
        sorted.sort((a, b) => {
          const aPriority = priorityOrder[a.prioridad as keyof typeof priorityOrder] ?? 3;
          const bPriority = priorityOrder[b.prioridad as keyof typeof priorityOrder] ?? 3;
          if (aPriority !== bPriority) return aPriority - bPriority;
          return a.daysRemaining - b.daysRemaining;
        });
      } else if (sortBy === 'date-asc') {
        sorted.sort((a, b) => {
          const aDate = new Date(a.start).getTime();
          const bDate = new Date(b.start).getTime();
          return aDate - bDate;
        });
      } else if (sortBy === 'date-desc') {
        sorted.sort((a, b) => {
          const aDate = new Date(a.start).getTime();
          const bDate = new Date(b.start).getTime();
          return bDate - aDate;
        });
      } else if (sortBy === 'days-asc') {
        sorted.sort((a, b) => a.daysRemaining - b.daysRemaining);
      } else if (sortBy === 'days-desc') {
        sorted.sort((a, b) => b.daysRemaining - a.daysRemaining);
      }

      setEvents(sorted);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reload events when filters change
  useEffect(() => {
    if (currentPage === 1) {
      loadEvents();
    } else {
      setCurrentPage(1);
    }
  }, [searchTerm, filterPriority, filterDate, sortBy]);

  const getDaysText = (days: number) => {
    if (days < 0) return 'Vencido';
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    return `${days} días`;
  };

  const getPriorityBadge = (prioridad: string) => {
    const styles: Record<string, string> = {
      alta: 'bg-red-50 text-red-700 border border-red-200',
      media: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      baja: 'bg-green-50 text-green-700 border border-green-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[prioridad] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
        {prioridad}
      </span>
    );
  };

  const getDaysRemainingBadge = (days: number) => {
    let style = 'bg-gray-50 text-gray-600 border border-gray-200';
    if (days < 0) {
      style = 'bg-gray-100 text-gray-500 border border-gray-200';
    } else if (days === 0) {
      style = 'bg-orange-50 text-orange-700 border border-orange-200';
    } else if (days <= 3) {
      style = 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    } else if (days <= 7) {
      style = 'bg-blue-50 text-blue-600 border border-blue-200';
    } else {
      style = 'bg-green-50 text-green-600 border border-green-200';
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
        {getDaysText(days)}
      </span>
    );
  };

  // Count active filters
  const activeFilterCount = [
    filterPriority !== 'all' ? 1 : 0,
    filterDate !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const renderRow = (item: Event) => {
    const startDate = new Date(item.start);
    const endDate = new Date(item.end);

    return (
      <tr
        key={item.id}
        className={`border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#dbdafe] transition-colors duration-150 border-l-4 ${item.borderColor}`}
      >
        <td className="p-4">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-xs text-gray-500">
            {item.allDay ? "Todo el día" : "Evento programado"}
          </p>
          {item.description && (
            <p className="text-xs text-gray-400 mt-1">{item.description}</p>
          )}
          {item.proyectoTitulo && (
            <p className="text-xs text-indigo-500 mt-1">
              Proyecto: {item.proyectoTitulo}
            </p>
          )}
        </td>
        <td className="p-4">
          {startDate.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </td>
        <td className="p-4">
          {item.horaInicio || (startDate.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          }))}
        </td>
        <td className="p-4">
          {item.horaFin || (endDate.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          }))}
        </td>
        <td className="p-4">
          {getPriorityBadge(item.prioridad)}
        </td>
        <td className="p-4">
          {getDaysRemainingBadge(item.daysRemaining)}
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            {isCoordinator && (
              <>
                <FormModal table="event" type="update" data={item} />
                <FormModal table="event" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold ">
          Todos los eventos
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch onSearch={setSearchTerm} />
          <div className="flex items-center gap-3 self-end relative">
            {/* Filter Button */}
            <div className="relative filter-menu-container">
              <button
                onClick={() => {
                  setShowFilterMenu(!showFilterMenu);
                  setShowSortMenu(false);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-full bg-principal hover:brightness-95 transition-all duration-200 ${showFilterMenu ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}
                title="Filtrar"
              >
                <Image src={filterImage} alt="Filtrar" width={14} height={14} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-600">Filtros</p>
                  </div>
                  <div className="p-3 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Prioridad</label>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="all">Todas</option>
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Estado</label>
                      <select
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="past">Vencidos</option>
                        <option value="today">Hoy</option>
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        setFilterPriority('all');
                        setFilterDate('all');
                        setShowFilterMenu(false);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
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
                className={`w-8 h-8 flex items-center justify-center rounded-full bg-principal hover:brightness-95 transition-all duration-200 ${showSortMenu ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}
                title="Ordenar"
              >
                <Image src={sortImage} alt="Ordenar" width={14} height={14} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-600">Ordenar por</p>
                  </div>
                  <div className="p-1.5">
                    {[
                      { key: 'priority', label: 'Prioridad' },
                      { key: 'date-asc', label: 'Fecha (más antiguos)' },
                      { key: 'date-desc', label: 'Fecha (más recientes)' },
                      { key: 'days-asc', label: 'Días restantes (menos)' },
                      { key: 'days-desc', label: 'Días restantes (más)' },
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() => {
                          setSortBy(option.key);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors duration-150 ${sortBy === option.key
                          ? 'bg-gray-100 text-gray-900 font-semibold'
                          : 'hover:bg-gray-50 text-gray-700'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isCoordinator && (
              <FormModal table="event" type="create" />
            )}
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron eventos que coincidan con la búsqueda' : 'No hay eventos disponibles'}
          </p>
        </div>
      ) : (
        <>
          <LegacyTable columns={columns} renderRow={renderRow} data={events} />
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

const EventListPage = () => {
  return (
    <RoleProtectedRoute allowedRoles={['admin', 'teacher', 'dean']}>
      <EventListPageContent />
    </RoleProtectedRoute>
  );
};

export default EventListPage;
