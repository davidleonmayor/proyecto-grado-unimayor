"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { JSX, useState } from "react";
import api from "@/app/lib/api";
import Swal from "sweetalert2";
// import TeacherForm from "./forms/TeacherForm";
// import StudentForm from "./forms/StudentForm";

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
    loading: () => <p>cargando...</p>,
});

const StudentForm = dynamic(() => import("./forms/StudentForm"), {
    loading: () => <p>cargando...</p>,
});

const EventForm = dynamic(() => import("./forms/EventForm"), {
    loading: () => <p>cargando...</p>,
});

const forms:{[key: string]:(type:"create"|"update", data?:any)=> JSX.Element;

} = {
    teacher: (type, data) => <TeacherForm type={type} data={data} />,
    student: (type, data) => <StudentForm type={type} data={data} />,
    event: (type, data) => <EventForm type={type} data={data} />,
};

const DeleteForm = ({ table, id, onClose }: { table: string; id: number | string | undefined; onClose: () => void }) => {
    const handleDelete = async () => {
        try {
            if (table === "event") {
                await api.deleteEvent(String(id));
                Swal.fire('Éxito', 'Evento eliminado correctamente', 'success');
            } else if (table === "teacher" || table === "student") {
                // TODO: Implement delete person endpoint
                Swal.fire('Info', 'La eliminación de personas está en desarrollo. Por favor, contacte al administrador.', 'info');
                return;
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

const FormModal = ({ table, type, data, id }:
    {
        table: "teacher" | "student" | "project" | "advisor" | "degreeOption" | "evaluation" | "document" | "career" | "event";
        type: "create" | "update" | "delete";
        data?: any;
        id?: number | string;
    }
) => {

    const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
    const bgColor = type === "create" ? "bg-principal" : type === "update" ? "bg-pastelBlue" : "bg-pastelRed";

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
            <button className={`${size} flex items-center justify-center rounded-full ${bgColor} cursor-pointer`}
                onClick={() => setOpen(true)}
            >
                <Image src={`/${type}.png`} alt="" width={16} height={16} />
            </button>
            {open && (
                <div className="fixed inset-0 w-screen h-screen bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-4 sm:p-6 rounded-md relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <Form />
                        <div className="absolute top-4 right-4 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setOpen(false)}>
                            <Image src="/close.png" alt="close image" width={14} height={14} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FormModal;