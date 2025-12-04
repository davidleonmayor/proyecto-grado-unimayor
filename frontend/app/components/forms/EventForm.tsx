"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import InputField from "../InputField";
import api from "@/app/lib/api";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const schema = z.object({
    titulo: z
        .string()
        .min(1, { message: "El título es obligatorio" })
        .max(200, { message: "El título no debe exceder los 200 caracteres" }),
    descripcion: z
        .string()
        .max(1000, { message: "La descripción no debe exceder los 1000 caracteres" })
        .optional(),
    fecha_inicio: z
        .string()
        .min(1, { message: "La fecha de inicio es obligatoria" }),
    fecha_fin: z
        .string()
        .min(1, { message: "La fecha de fin es obligatoria" }),
    hora_inicio: z
        .string()
        .optional(),
    hora_fin: z
        .string()
        .optional(),
    prioridad: z
        .enum(["alta", "media", "baja"], {
            message: "Prioridad inválida",
        }),
    todo_el_dia: z
        .boolean()
        .default(false),
});

const EventForm = ({ type, data }: { type: "create" | "update"; data?: any }) => {
    const router = useRouter();
    
    // Format date for input (YYYY-MM-DD)
    const formatDateForInput = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Format time for input (HH:MM)
    const formatTimeForInput = (timeString?: string) => {
        if (!timeString) return '';
        return timeString.substring(0, 5); // Get HH:MM from HH:MM:SS or HH:MM
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            titulo: data?.title || '',
            descripcion: data?.description || '',
            fecha_inicio: formatDateForInput(data?.start),
            fecha_fin: formatDateForInput(data?.end),
            hora_inicio: formatTimeForInput(data?.horaInicio),
            hora_fin: formatTimeForInput(data?.horaFin),
            prioridad: data?.prioridad || 'media',
            todo_el_dia: data?.allDay || false,
        },
    });

    const todoElDia = watch('todo_el_dia');

    const onSubmit = handleSubmit(async (formData) => {
        try {
            if (type === "create") {
                await api.createEvent({
                    titulo: formData.titulo,
                    descripcion: formData.descripcion || null,
                    fecha_inicio: formData.fecha_inicio,
                    fecha_fin: formData.fecha_fin,
                    hora_inicio: formData.todo_el_dia ? null : (formData.hora_inicio || null),
                    hora_fin: formData.todo_el_dia ? null : (formData.hora_fin || null),
                    prioridad: formData.prioridad,
                    todo_el_dia: formData.todo_el_dia,
                });
                Swal.fire('Éxito', 'Evento creado correctamente', 'success');
            } else {
                await api.updateEvent(data.id, {
                    titulo: formData.titulo,
                    descripcion: formData.descripcion || null,
                    fecha_inicio: formData.fecha_inicio,
                    fecha_fin: formData.fecha_fin,
                    hora_inicio: formData.todo_el_dia ? null : (formData.hora_inicio || null),
                    hora_fin: formData.todo_el_dia ? null : (formData.hora_fin || null),
                    prioridad: formData.prioridad,
                    todo_el_dia: formData.todo_el_dia,
                });
                Swal.fire('Éxito', 'Evento actualizado correctamente', 'success');
            }
            
            // Close modal - the parent component will handle reloading
            // The modal will close automatically when the form unmounts
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        } catch (error: any) {
            Swal.fire('Error', error.message || 'Error al guardar el evento', 'error');
        }
    });

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Crear nuevo evento" : "Actualizar evento"}
            </h1>

            {/* BASIC INFO */}
            <span className="text-xs text-gray-400 font-medium">Información del Evento</span>

            <div className="flex flex-col gap-4">
                <InputField
                    label="Título *"
                    name="titulo"
                    register={register}
                    error={errors.titulo}
                />

                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500">Descripción</label>
                    <textarea
                        {...register("descripcion")}
                        rows={3}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        placeholder="Descripción del evento (opcional)"
                    />
                    {errors.descripcion && <p className="text-red-500 text-xs">{errors.descripcion.message as string}</p>}
                </div>

                <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <label className="text-xs text-gray-500">Fecha de inicio *</label>
                        <input
                            type="date"
                            {...register("fecha_inicio")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        />
                        {errors.fecha_inicio && <p className="text-red-500 text-xs">{errors.fecha_inicio.message as string}</p>}
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <label className="text-xs text-gray-500">Fecha de fin *</label>
                        <input
                            type="date"
                            {...register("fecha_fin")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        />
                        {errors.fecha_fin && <p className="text-red-500 text-xs">{errors.fecha_fin.message as string}</p>}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            {...register("todo_el_dia")}
                            className="w-4 h-4"
                        />
                        <span className="text-xs text-gray-500">Todo el día</span>
                    </label>
                </div>

                {!todoElDia && (
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex flex-col gap-2 w-full md:w-1/2">
                            <label className="text-xs text-gray-500">Hora de inicio</label>
                            <input
                                type="time"
                                {...register("hora_inicio")}
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                            />
                            {errors.hora_inicio && <p className="text-red-500 text-xs">{errors.hora_inicio.message as string}</p>}
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-1/2">
                            <label className="text-xs text-gray-500">Hora de fin</label>
                            <input
                                type="time"
                                {...register("hora_fin")}
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                            />
                            {errors.hora_fin && <p className="text-red-500 text-xs">{errors.hora_fin.message as string}</p>}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2 w-full md:w-1/3">
                    <label className="text-xs text-gray-500">Prioridad *</label>
                    <select
                        {...register("prioridad")}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                    >
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                    </select>
                    {errors.prioridad && <p className="text-red-500 text-xs">{errors.prioridad.message as string}</p>}
                </div>
            </div>

            {/* BUTTON */}
            <button 
                type="submit"
                className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-700"
            >
                {type === "create" ? "Crear" : "Actualizar"}
            </button>
        </form>
    );
};

export default EventForm;

