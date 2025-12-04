"use client"
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moreDarkImage from '@/public/moreDark.png';
import api from '@/app/lib/api';

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
}

export const EventCalendar = () => {
    const router = useRouter();
    const [value, onChange] = useState<Value>(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadEvents();
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
            const response = await api.getEvents(1, 50);
            const eventsData = response.events;
            // Events are already sorted by the backend, but ensure proper sorting for display
            const sortedEvents = eventsData.sort((a: Event, b: Event) => {
                const priorityOrder = { 'alta': 0, 'media': 1, 'baja': 2 };
                const priorityDiff = (priorityOrder[a.prioridad as keyof typeof priorityOrder] || 3) - 
                                    (priorityOrder[b.prioridad as keyof typeof priorityOrder] || 3);
                if (priorityDiff !== 0) return priorityDiff;
                
                // Future events first, then past events
                if (a.daysRemaining >= 0 && b.daysRemaining >= 0) {
                    return a.daysRemaining - b.daysRemaining;
                } else if (a.daysRemaining < 0 && b.daysRemaining < 0) {
                    return b.daysRemaining - a.daysRemaining; // Most recent past events first
                } else {
                    return a.daysRemaining >= 0 ? -1 : 1;
                }
            });
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
        <div className='bg-white p-4 rounded-md'>
            <Calendar onChange={onChange} value={value} />
            <div className="flex items-center justify-between">
                <h1 className='text-xl font-semibold my-4'>Eventos</h1>
                <Image src={moreDarkImage} alt='' width={20} height={20}/>
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
                        className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
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
                                </div>
                                <div className="ml-2 text-right">
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                                        event.color === 'red' ? 'bg-red-100 text-red-700' :
                                        event.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                                        event.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                        event.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                        event.color === 'green' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {getDaysText(event.daysRemaining)}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-1 capitalize">{event.prioridad}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
