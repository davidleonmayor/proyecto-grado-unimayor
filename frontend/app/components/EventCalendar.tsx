"use client"
import Image from 'next/image';
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moreDarkImage from '@/public/moreDark.png';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];


{/*TEMPORARY*/ }
const events = [
    {
        id: 1,
        title: "Evento 1",
        time: "12:00 PM - 2:00 PM",
        description: "Descripción del evento 1"
    },
    {
        id: 2,
        title: "Evento 2",
        time: "12:00 PM - 2:00 PM",
        description: "Descripción del evento 2"
    },
    {
        id: 3,
        title: "Evento 3",
        time: "12:00 PM - 2:00 PM",
        description: "Descripción del evento 3"
    },
]

export const EventCalendar = () => {

    const [value, onChange] = useState<Value>(new Date());

    return (
        <div className='bg-white p-4 rounded-md'>
            <Calendar onChange={onChange} value={value} />
            <div className="flex items-center justify-between">
                <h1 className='text-xl font-semibold my-4'>Eventos</h1>
                <Image src={moreDarkImage} alt='' width={20} height={20}/>
            </div>
            <div className="flex flex-col gap-4">
                {events.map((event) => (
                    <div key={event.id} className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-approved even:border-t-primary">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-gray-300 text-xs">{event.time}</p>
                        <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
