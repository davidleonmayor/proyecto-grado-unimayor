"use client"
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moreDarkImage from '@/public/moreDark.png';
import { eventsService } from '@/modules/events/services/events.service';
import Link from 'next/link';


type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

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
    proyectoId?: string | null;
}

interface EventCalendarProps {
    initialEvents?: Event[];
    showEventsList?: boolean;
}

const EventCalendar = ({ initialEvents, showEventsList = true }: EventCalendarProps = {}) => {
    const router = useRouter();
    const [value, onChange] = useState<Value>(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const sortEvents = (eventsData: Event[]) => {
        return [...eventsData].sort((a: Event, b: Event) => {
            // 1. Primary sort: Upcoming (>=0) vs Expired (<0)
            const aIsUpcoming = a.daysRemaining >= 0;
            const bIsUpcoming = b.daysRemaining >= 0;
            
            if (aIsUpcoming && !bIsUpcoming) return -1;
            if (!aIsUpcoming && bIsUpcoming) return 1;

            // 2. Secondary sort: By days remaining (closest to today first)
            if (aIsUpcoming) {
                // Both are upcoming: smallest daysRemaining first
                if (a.daysRemaining !== b.daysRemaining) {
                    return a.daysRemaining - b.daysRemaining;
                }
            } else {
                // Both are expired: largest daysRemaining (closest to 0) first
                if (a.daysRemaining !== b.daysRemaining) {
                    return b.daysRemaining - a.daysRemaining;
                }
            }

            // 3. Tertiary sort: Priority
            const priorityOrder = { 'alta': 0, 'media': 1, 'baja': 2 };
            const aPriority = priorityOrder[a.prioridad as keyof typeof priorityOrder] || 3;
            const bPriority = priorityOrder[b.prioridad as keyof typeof priorityOrder] || 3;
            
            return aPriority - bPriority;
        });
    };

    useEffect(() => {
        if (!showEventsList) {
            setIsLoading(false);
            return;
        }
        if (initialEvents) {
            const sorted = sortEvents(initialEvents);
            setAllEvents(sorted);
            setEvents(sorted.slice(0, 5));
            setIsLoading(false);
        } else {
            loadEvents();
        }
    }, [initialEvents, showEventsList]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = allEvents.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setEvents(filtered.slice(0, 5));
        } else {
            setEvents(allEvents.slice(0, 5));
        }
    }, [searchTerm, allEvents]);

    const loadEvents = async () => {
        try {
            setIsLoading(true);
            // For calendar widget, get first page with limit of 50 to show more events
            const response = await eventsService.getEvents({ page: 1, limit: 50 });
            const eventsData = response.events;
            // Events are already sorted by the backend, but ensure proper sorting for display
            const sortedEvents = sortEvents(eventsData);
            setAllEvents(sortedEvents);
            setEvents(sortedEvents.slice(0, 5));
        } catch (error) {
            console.error('Error loading events:', error);
            setEvents([]);
            setAllEvents([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (event: Event) => {
        if (event.allDay) return "Todo el día";
        if (event.horaInicio && event.horaFin) {
            return `${event.horaInicio} - ${event.horaFin}`;
        }
        return "Horario no especificado";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getDaysText = (days: number) => {
        if (days < 0) return 'Vencido';
        if (days === 0) return 'Hoy';
        if (days === 1) return 'Mañana';
        return `En ${days} días`;
    };

    return (
        <div className='bg-white p-4 rounded-md relative z-0'>
            <Calendar onChange={onChange} value={value} />
            {showEventsList && (
                <>
                    <div className="flex items-center justify-between relative z-10">
                        <h1 className='text-xl font-semibold my-4'>Eventos</h1>
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="hover:opacity-75 transition-opacity cursor-pointer border-none bg-transparent flex items-center justify-center p-1 rounded-full hover:bg-black/5"
                            >
                                <Image src={moreDarkImage} alt="more dark image" width={20} height={20} />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 overflow-hidden">
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            router.push('/list/events');
                                        }}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-principal transition-colors w-full text-left"
                                    >
                                        Ver todos los eventos
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Barra de filtrado y botón si hay más de 5 eventos */}
                    {!isLoading && allEvents.length > 5 && (
                        <div className="mb-4 flex flex-col gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar eventos..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                            <button
                                onClick={() => router.push('/list/events')}
                                className="w-full px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm font-medium"
                            >
                                Ver todos los eventos ({allEvents.length})
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                    ) : events.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                            {searchTerm ? 'No se encontraron eventos que coincidan con la búsqueda' : 'No hay eventos disponibles'}
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className={`p-5 rounded-md border-2 border-gray-100 border-t-4 ${event.borderColor}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{event.title}</h3>
                                            <p className="text-gray-500 text-xs mt-1">
                                                {formatDate(event.start)} • {formatTime(event)}
                                            </p>
                                            {event.description && (
                                                <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
                                            )}
                                            {event.proyectoTitulo && event.proyectoId ? (
                                                <Link href={`/projects/${event.proyectoId}`} className="mt-2 flex flex-col text-xs text-gray-500 group cursor-pointer block w-fit">
                                                    <span className="font-semibold text-gray-600 group-hover:text-primary-600 transition-colors">Proyecto:</span>
                                                    <span className="text-primary-600 group-hover:text-primary-700 group-hover:underline transition-colors mt-0.5">
                                                        {event.proyectoTitulo}
                                                    </span>
                                                </Link>
                                            ) : event.proyectoTitulo ? (
                                                <div className="mt-2 flex flex-col text-xs text-gray-500">
                                                    <span className="font-semibold text-gray-600">Proyecto:</span>
                                                    <span className="mt-0.5 text-gray-600">{event.proyectoTitulo}</span>
                                                </div>
                                            ) : null}
                                        </div>
                                        <div className="ml-4 flex gap-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <p className="text-xs text-gray-400 mb-1">Prioridad</p>
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${event.color === 'red' ? 'bg-red-100 text-red-700' :
                                                event.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                                                    event.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                        event.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                            event.color === 'green' ? 'bg-green-100 text-green-700' :
                                                                'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {event.prioridad}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <p className="text-xs text-gray-400 mb-1">Dias restantes</p>
                                                <span className={`font-semibold mt-auto ${
                                                    event.daysRemaining > 0 ? 'text-lg text-gray-700' : 
                                                    event.daysRemaining === 0 ? 'text-lg text-orange-600' : 
                                                    'text-sm text-red-500'
                                                }`}>
                                                    {event.daysRemaining > 0 ? event.daysRemaining : (event.daysRemaining === 0 ? 'Hoy' : 'Vencido')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default EventCalendar;
