'use client';

import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment'
import 'moment/locale/es'; // Import Spanish locale
import { useState, useEffect } from 'react';
import { eventsService } from '@/modules/events/services/events.service';

// Set moment to Spanish
moment.locale('es');
const localizer = momentLocalizer(moment)

interface BigCalendarProps {
    initialEvents?: any[];
}

const PASTEL_COLORS = ['#93c5fd', '#fde047', '#c4b5fd', '#f9a8d4', '#86efac', '#fdba74', '#fca5a5'];

const BigCalendar = ({ initialEvents }: BigCalendarProps) => {
    const [view, setView] = useState<View>(Views.WORK_WEEK);
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                // If initialEvents are provided, use them; otherwise fetch all for current user
                const sourceEvents = initialEvents || (await eventsService.getEvents({ limit: 100 })).events;
                
                const formattedEvents = sourceEvents.map((event: any, index: number) => {
                    const startDate = new Date(event.start || event.fecha_inicio || new Date());
                    if (event.horaInicio || event.hora_inicio) {
                        const [hours, minutes] = (event.horaInicio || event.hora_inicio).split(':');
                        startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
                    } else {
                        startDate.setHours(8, 0, 0); // default to 8 AM
                    }

                    const endDate = new Date(event.end || event.fecha_fin || startDate);
                    if (event.horaFin || event.hora_fin) {
                        const [hours, minutes] = (event.horaFin || event.hora_fin).split(':');
                        endDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
                    } else if (event.horaInicio || event.hora_inicio) {
                        endDate.setHours(startDate.getHours() + 1, startDate.getMinutes(), 0);
                    } else {
                        endDate.setHours(9, 0, 0); // default 1 hour
                    }

                    // Assign a consistent pastel color based on the event's title or index
                    // This creates the colorful effect seen in the design
                    const hash = event.title ? event.title.length + index : index;
                    const bgColor = PASTEL_COLORS[hash % PASTEL_COLORS.length];

                    return {
                        title: event.title || event.titulo,
                        allDay: event.allDay || false,
                        start: startDate,
                        end: endDate,
                        bgColor: bgColor
                    };
                });
                setEvents(formattedEvents);
            } catch (error) {
                console.error('Error loading events for calendar:', error);
            }
        };

        loadEvents();
    }, [initialEvents]);
    
    const handleOnChangeView = (selectedView: View) => {
        setView(selectedView);
    };

    const eventStyleGetter = (event: any) => {
        const backgroundColor = event.bgColor || '#93c5fd';
        const style = {
            backgroundColor,
            borderRadius: '5px',
            opacity: 0.9,
            color: '#1f2937', // text-gray-800 for better contrast on pastel
            border: 'none',
            display: 'block'
        };
        return {
            style: style
        };
    };

    return (
        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={['work_week', 'day']}
            view={view}
            style={{ height: "98%", minHeight: "600px" }}
            onView={handleOnChangeView}
            min={new Date(0, 0, 0, 7, 0, 0)} // Start at 7 AM
            max={new Date(0, 0, 0, 19, 0, 0)} // End at 7 PM
            eventPropGetter={eventStyleGetter}
            messages={{
                next: "Sig",
                previous: "Ant",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                work_week: "Semana",
                allDay: "Todo el día"
            }}
        />
    )
}

export default BigCalendar;