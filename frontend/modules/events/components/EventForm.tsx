"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import InputField from '@/shared/components/ui/InputField';

import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { eventsService } from '@/modules/events/services/events.service';
import { useEffect, useState } from "react";
import { projectsService } from '@/modules/projects/services/projects.service';
import { useUserRole } from '@/shared/hooks/useUserRole';

const CUID_REGEX = /^c[a-z0-9]{24}$/;

const schema = z
    .object({
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
            .min(1, { message: "La fecha de inicio es obligatoria" })
            .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Formato de fecha inválido (AAAA-MM-DD)" }),
        fecha_fin: z
            .string()
            .min(1, { message: "La fecha de fin es obligatoria" })
            .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Formato de fecha inválido (AAAA-MM-DD)" }),
        hora_inicio: z.string().optional(),
        hora_fin: z.string().optional(),
        prioridad: z.enum(["alta", "media", "baja"], {
            message: "Prioridad inválida",
        }),
        todo_el_dia: z.boolean().default(false),
        id_trabajo_grado: z
            .string()
            .optional()
            .refine((val) => !val || val === "" || CUID_REGEX.test(val), {
                message: "El proyecto seleccionado no es válido",
            }),
    })
    .refine(
        (data) => {
            if (!data.fecha_inicio || !data.fecha_fin) return true;
            return (
                new Date(data.fecha_fin).getTime() >=
                new Date(data.fecha_inicio).getTime()
            );
        },
        {
            message: "La fecha de fin debe ser mayor o igual a la fecha de inicio",
            path: ["fecha_fin"],
        },
    )
    .refine(
        (data) => {
            if (data.todo_el_dia) return true;
            if (!data.hora_inicio || !data.hora_fin) return true;
            if (data.fecha_inicio !== data.fecha_fin) return true;
            return data.hora_fin >= data.hora_inicio;
        },
        {
            message: "La hora de fin debe ser mayor o igual a la hora de inicio",
            path: ["hora_fin"],
        },
    );

const EventForm = ({ type, data }: { type: "create" | "update"; data?: any }) => {
    const router = useRouter();
    const { role } = useUserRole();

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

    const [projects, setProjects] = useState<any[]>([]);
    const [isCoordinator, setIsCoordinator] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                if (role === 'admin' || role === 'dean') {
                    const adminProjects = await projectsService.getAllProjects();
                    if (adminProjects.length > 0) {
                        setProjects(adminProjects);
                        setIsCoordinator(true);
                    }
                } else {
                    const allProjects = await projectsService.getProjects();
                    const coordinatorProjects = allProjects.filter((p: any) => p.role === 'Coordinador de Carrera');

                    if (coordinatorProjects.length > 0) {
                        setProjects(coordinatorProjects);
                        setIsCoordinator(true);
                    }
                }
            } catch (error) {
                console.error("Error al cargar proyectos:", error);
            }
        };

        if ((type === "create" || type === "update") && role) {
            fetchProjects();
        }
    }, [type, role]);

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
            id_trabajo_grado: data?.id_trabajo_grado || '',
        },
    });

    const todoElDia = watch('todo_el_dia');

    const buildPayload = (formData: any) => ({
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion?.trim() || null,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        hora_inicio: formData.todo_el_dia ? null : (formData.hora_inicio || null),
        hora_fin: formData.todo_el_dia ? null : (formData.hora_fin || null),
        prioridad: formData.prioridad,
        todo_el_dia: formData.todo_el_dia,
        id_trabajo_grado: formData.id_trabajo_grado?.trim() || null,
    });

    // Field label mapping for friendlier backend error messages
    const fieldLabels: Record<string, string> = {
        titulo: "Título",
        descripcion: "Descripción",
        fecha_inicio: "Fecha de inicio",
        fecha_fin: "Fecha de fin",
        hora_inicio: "Hora de inicio",
        hora_fin: "Hora de fin",
        prioridad: "Prioridad",
        todo_el_dia: "Todo el día",
        id_trabajo_grado: "Proyecto",
    };

    const formatBackendErrors = (errorData: any): string | null => {
        if (errorData && Array.isArray(errorData.errors)) {
            const lines = errorData.errors.map((err: any) => {
                const label = fieldLabels[err.path] ?? err.path ?? "Campo";
                const msg = (err.msg ?? "Valor inválido").replace(
                    new RegExp(`'?${err.path}'?`, "g"),
                    `'${label}'`,
                );
                return `• ${label}: ${msg}`;
            });
            return lines.join("\n");
        }
        return null;
    };

    // Update-specific submit: parses express-validator's { errors: [...] } shape
    const submitUpdate = async (payload: any) => {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("auth_token")
                : null;
        const response = await fetch(`${apiUrl}/api/events/${data.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const formatted = formatBackendErrors(errorData);
            if (formatted) throw new Error(formatted);
            throw new Error(
                errorData.error ||
                    errorData.message ||
                    "No se pudo actualizar el evento",
            );
        }

        return response.json().catch(() => ({}));
    };

    const onSubmit = handleSubmit(async (formData) => {
        try {
            const payload = buildPayload(formData);

            if (type === "create") {
                await eventsService.createEvent(payload);
                Swal.fire('Éxito', 'Evento creado correctamente', 'success');
            } else {
                await submitUpdate(payload);
                Swal.fire('Éxito', 'Evento actualizado correctamente', 'success');
            }

            // Close modal - the parent component will handle reloading
            // The modal will close automatically when the form unmounts
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        } catch (error: any) {
            await Swal.fire({
                icon: "error",
                title: "No se pudo guardar el evento",
                html: `<pre style="text-align:left;white-space:pre-wrap;font-family:inherit;font-size:13px;margin:0">${(error.message || "Error al guardar el evento").replace(/</g, "&lt;")}</pre>`,
                confirmButtonColor: "#d33",
            });
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

                {isCoordinator && (
                    <div className="flex flex-col gap-2 w-full md:w-2/3">
                        <label className="text-xs text-gray-500">Proyecto (Trabajo de Grado)</label>
                        <select
                            {...register("id_trabajo_grado")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        >
                            <option value="">-- Seleccionar proyecto --</option>
                            {projects.map((project) => (
                                <option key={project.id || project.id_trabajo_grado} value={project.id || project.id_trabajo_grado}>
                                    {project.title || project.titulo}
                                </option>
                            ))}
                        </select>
                        {errors.id_trabajo_grado && <p className="text-red-500 text-xs">{errors.id_trabajo_grado.message as string}</p>}
                    </div>
                )}
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

