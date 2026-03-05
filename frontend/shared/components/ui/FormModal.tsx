"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { JSX, useState } from "react";

import Swal from "sweetalert2";
// import TeacherForm from '@/modules/persons/components/TeacherForm';
// import StudentForm from '@/modules/persons/components/StudentForm';
import { eventsService } from '@/modules/events/services/events.service';
import { personsService } from '@/modules/persons/services/persons.service';

const TeacherForm = dynamic(() => import('@/modules/persons/components/TeacherForm'), {
    loading: () => <p>cargando...</p>,
});

const StudentForm = dynamic(() => import('@/modules/persons/components/StudentForm'), {
    loading: () => <p>cargando...</p>,
});

const EventForm = dynamic(() => import('@/modules/events/components/EventForm'), {
    loading: () => <p>cargando...</p>,
});

const forms: {
    [key: string]: (type: "create" | "update", data?: any) => JSX.Element;

} = {
    teacher: (type, data) => <TeacherForm type={type} data={data} />,
    student: (type, data) => <StudentForm type={type} data={data} />,
    event: (type, data) => <EventForm type={type} data={data} />,
};

const DeleteForm = ({ table, id, onClose }: { table: string; id: number | string | undefined; onClose: () => void }) => {
    const handleDelete = async () => {
        try {
            if (table === "event") {
                await eventsService.deleteEvent(String(id));
                Swal.fire('Éxito', 'Evento eliminado correctamente', 'success');
            } else if (table === "teacher" || table === "student") {
                await personsService.deletePerson(String(id));
                Swal.fire('Éxito', table === "teacher" ? 'Profesor eliminado correctamente' : 'Estudiante eliminado correctamente', 'success');
            } else {
                Swal.fire('Error', 'Función de eliminación no implementada para este tipo', 'error');
                return;
            }
            onClose();
            window.location.reload();
        } catch (error: any) {
            Swal.fire('Error', error.message || 'Error al eliminar', 'error');
        }
    };

    return (
        <div className="p-4 flex flex-col gap-4">
            <span className="text-center font-medium">
                Todos los datos se perderán. ¿Estás seguro que deseas eliminar este {table}?
            </span>
            <div className="flex gap-4 justify-center">
                <button
                    onClick={onClose}
                    className="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleDelete}
                    className="bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800"
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
};

const FormModal = ({ table, type, data, id, buttonText }:
    {
        table: "teacher" | "student" | "project" | "advisor" | "degreeOption" | "evaluation" | "document" | "career" | "event";
        type: "create" | "update" | "delete";
        data?: any;
        id?: number | string;
        buttonText?: string;
    }
) => {

    const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
    const bgColor = type === "create" ? "bg-secondary-500" : type === "update" ? "bg-secondary-400" : "bg-red-500";

    const [open, setOpen] = useState(false);

    const Form = () => {
        return type === "delete" && id ? (
            <DeleteForm table={table} id={id} onClose={() => setOpen(false)} />
        ) : (type === "create" || type === "update") ? (
            forms[table](type, data)
        ) : (
            "Formulario no disponible"
        );
    }

    return (
        <>
            {buttonText ? (
                <button className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${bgColor} hover:opacity-80 transition-all duration-200 shadow-sm`}
                    onClick={() => setOpen(true)}
                >
                    <Image src={`/${type}.png`} alt="" width={16} height={16} />
                    {buttonText}
                </button>
            ) : (
                <button className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:scale-105 transition-all duration-200 shadow-sm cursor-pointer`}
                    onClick={() => setOpen(true)}
                >
                    <Image src={`/${type}.png`} alt="" width={16} height={16} />
                </button>
            )}
            {open && (
                <div className="fixed inset-0 w-screen h-screen bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4 transition-opacity duration-300">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl relative w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all border border-gray-100">
                        <Form />
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-200 transition-colors duration-200 cursor-pointer shadow-sm group"
                            aria-label="Cerrar modal"
                        >
                            <Image
                                src="/close.png"
                                alt="close image"
                                width={12}
                                height={12}
                                className="opacity-60 group-hover:opacity-100 transition-opacity"
                            />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default FormModal;