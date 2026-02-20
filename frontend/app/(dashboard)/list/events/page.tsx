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
}

const columns = [
  { header: "Evento", accessor: "title" },
  { header: "Fecha", accessor: "fecha", className: "hidden md:table-cell" },
  { header: "Hora inicio", accessor: "horaInicio", className: "hidden md:table-cell" },
  { header: "Hora fin", accessor: "horaFin", className: "hidden md:table-cell" },
  { header: "Prioridad", accessor: "prioridad", className: "hidden md:table-cell" },
  { header: "Días restantes", accessor: "daysRemaining", className: "hidden md:table-cell" },
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
      const response = await eventsService.getEvents({ page: currentPage, limit: 10 });
      const eventsData = response.events;

      // Apply client-side filters and sorting
      let filtered = [...eventsData];

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(event =>
          event.title.toLowerCase().includes(search) ||
          (event.description && event.description.toLowerCase().includes(search))
        );
      }

      // Priority filter
      if (filterPriority !== 'all') {
        filtered = filtered.filter(event => event.prioridad === filterPriority);
      }

      // Date filter
      if (filterDate === 'past') {
        filtered = filtered.filter(event => event.daysRemaining < 0);
      } else if (filterDate === 'today') {
        filtered = filtered.filter(event => event.daysRemaining === 0);
      } else if (filterDate === 'future') {
        filtered = filtered.filter(event => event.daysRemaining > 0);
      }

      // Sorting
      if (sortBy === 'priority') {
        const priorityOrder = { 'alta': 0, 'media': 1, 'baja': 2 };
        filtered.sort((a, b) => {
          const aPriority = priorityOrder[a.prioridad as keyof typeof priorityOrder] ?? 3;
          const bPriority = priorityOrder[b.prioridad as keyof typeof priorityOrder] ?? 3;
          if (aPriority !== bPriority) return aPriority - bPriority;
          return a.daysRemaining - b.daysRemaining;
        });
      } else if (sortBy === 'date-asc') {
        filtered.sort((a, b) => {
          const aDate = new Date(a.start).getTime();
          const bDate = new Date(b.start).getTime();
          return aDate - bDate;
        });
      } else if (sortBy === 'date-desc') {
        filtered.sort((a, b) => {
          const aDate = new Date(a.start).getTime();
          const bDate = new Date(b.start).getTime();
          return bDate - aDate;
        });
      } else if (sortBy === 'days-asc') {
        filtered.sort((a, b) => a.daysRemaining - b.daysRemaining);
      } else if (sortBy === 'days-desc') {
        filtered.sort((a, b) => b.daysRemaining - a.daysRemaining);
      }

      setEvents(filtered);
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

  const getPriorityColor = (prioridad: string, daysRemaining: number) => {
    if (daysRemaining < 0) return 'bg-gray-100 text-gray-700';
    if (prioridad === 'alta') {
      if (daysRemaining <= 1) return 'bg-red-100 text-red-700';
      if (daysRemaining <= 3) return 'bg-orange-100 text-orange-700';
      return 'bg-red-50 text-red-600';
    }
    if (prioridad === 'media') {
      if (daysRemaining <= 1) return 'bg-orange-100 text-orange-700';
      if (daysRemaining <= 7) return 'bg-yellow-100 text-yellow-700';
      return 'bg-blue-100 text-blue-700';
    }
    // baja
    if (daysRemaining <= 1) return 'bg-yellow-100 text-yellow-700';
    if (daysRemaining <= 7) return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  const renderRow = (item: Event) => {
    const startDate = new Date(item.start);
    const endDate = new Date(item.end);

    return (
      <tr
        key={item.id}
        className={`border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#dbdafe] border-l-4 ${item.borderColor}`}
      >
        <td className="p-4">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-xs text-gray-500">
            {item.allDay ? "Todo el día" : "Evento programado"}
          </p>
          {item.description && (
            <p className="text-xs text-gray-400 mt-1">{item.description}</p>
          )}
        </td>
        <td className="hidden md:table-cell">
          {startDate.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </td>
        <td className="hidden md:table-cell">
          {item.horaInicio || (startDate.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          }))}
        </td>
        <td className="hidden md:table-cell">
          {item.horaFin || (endDate.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          }))}
        </td>
        <td className="hidden md:table-cell">
          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(item.prioridad, item.daysRemaining)}`}>
            {item.prioridad}
          </span>
        </td>
        <td className="hidden md:table-cell">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.prioridad, item.daysRemaining)}`}>
            {getDaysText(item.daysRemaining)}
          </span>
        </td>
        <td>
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
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold ">
          Todos los eventos
        </h1>
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">Prioridad</label>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="all">Todas</option>
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                      <select
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="all">Todas</option>
                        <option value="past">Pasados</option>
                        <option value="today">Hoy</option>
                        <option value="future">Futuros</option>
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        setFilterPriority('all');
                        setFilterDate('all');
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
                        setSortBy('priority');
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${sortBy === 'priority' ? 'bg-primary-50 text-primary-700' : ''}`}
                    >
                      Por prioridad
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('date-asc');
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${sortBy === 'date-asc' ? 'bg-primary-50 text-primary-700' : ''}`}
                    >
                      Fecha (más antiguos)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('date-desc');
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${sortBy === 'date-desc' ? 'bg-primary-50 text-primary-700' : ''}`}
                    >
                      Fecha (más recientes)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('days-asc');
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${sortBy === 'days-asc' ? 'bg-primary-50 text-primary-700' : ''}`}
                    >
                      Días restantes (menos)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('days-desc');
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${sortBy === 'days-desc' ? 'bg-primary-50 text-primary-700' : ''}`}
                    >
                      Días restantes (más)
                    </button>
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
          <Table columns={columns} renderRow={renderRow} data={events} />
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
