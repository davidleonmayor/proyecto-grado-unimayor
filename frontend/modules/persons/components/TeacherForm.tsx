"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import InputField from '@/shared/components/ui/InputField';



import { personsService } from "../services/persons.service";
import Swal from "sweetalert2";

const TeacherForm = ({ type, data, onSuccess }: { type: "create" | "update"; data?: any; onSuccess?: () => void }) => {

    const schema = z.object({
        username: type === "create" ? z.string().min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" }).max(20) : z.string().optional().or(z.literal('')),
        document: z.string().min(5, { message: "El documento debe tener al menos 5 caracteres" }).max(20),
        email: z.string().email({ message: "Correo electrónico inválido" }),
        password: type === "create" ? z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).max(100) : z.string().optional().or(z.literal('')),
        role: z.enum(["Director de Proyecto", "Tutor", "Docente", "Profesor", "Director", "Asesor", "Asesor Externo"], { message: "Rol inválido" }).optional(),
        firstName: z.string().min(1, { message: "El nombre es obligatorio" }).max(50),
        lastName: z.string().min(1, { message: "El apellido es obligatorio" }).max(50),
        phone: z.string().min(7, { message: "El teléfono debe tener al menos 7 caracteres" }).max(15),
        sex: z.enum(["Masculino", "Femenino"], { message: "Sexo inválido" }).optional().or(z.literal(''))
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = handleSubmit(async (formData) => {
        try {
            if (type === "create") {
                await personsService.createTeacher(formData);
                Swal.fire('Éxito', 'Profesor creado exitosamente', 'success');
            } else {
                await personsService.updatePerson(data.id, formData);
                Swal.fire('Éxito', 'Profesor actualizado exitosamente', 'success');
            }
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Error submitting teacher form:', error);
            Swal.fire('Error', 'Error al guardar: ' + (error.message || 'Error desconocido'), 'error');
        }
    });

    return (
        <form className="flex flex-col gap-6 sm:gap-8 max-w-full" onSubmit={onSubmit}>
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    {type === "create" ? "Crear nuevo profesor" : "Actualizar profesor"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Complete los campos a continuación para {type === "create" ? "registrar" : "actualizar"} la información.
                </p>
            </div>

            {/* AUTH INFO */}
            <h2 className="mt-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-l-4 border-principal pl-2">Información de Autenticación</h2>

            <div className="flex justify-between gap-4 flex-wrap">

                <InputField
                    label="Nombre de usuario"
                    name="username"
                    defaultValue={data?.username}
                    register={register}
                    error={errors.username}
                />
                <InputField
                    label="Identificación"
                    name="document"
                    defaultValue={data?.document}
                    register={register}
                    error={errors.document}
                />
                <InputField
                    label="Email"
                    name="email"
                    type="email"
                    defaultValue={data?.email}
                    register={register}
                    error={errors.email}
                />
                <InputField
                    label="Contrasenia"
                    name="password"
                    type="password"
                    defaultValue={data?.password}
                    register={register}
                    error={errors.password}
                />

            </div>

            {/* PERSONAL INFO */}
            <h2 className="mt-4 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-l-4 border-principal pl-2">Información Personal</h2>

            <div className="flex justify-between gap-4 flex-wrap">
                <InputField
                    label="Nombre"
                    name="firstName"
                    defaultValue={data?.firstName}
                    register={register}
                    error={errors.firstName}
                />
                <InputField
                    label="Apellido"
                    name="lastName"
                    defaultValue={data?.lastName}
                    register={register}
                    error={errors.lastName}
                />
                <InputField
                    label="Teléfono"
                    name="phone"
                    defaultValue={data?.phone}
                    register={register}
                    error={errors.phone}
                />

                {/* SELECT SEX */}
                <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
                    <label className="text-xs text-gray-500">Sexo</label>
                    <select
                        {...register("sex")}
                        defaultValue={data?.sex}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full "
                    >
                        <option value="">Seleccionar</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                    </select>
                    {errors.sex && <p className="text-red-500 text-xs">{errors.sex.message as string}</p>}
                </div>

                {/* SELECT ROLE */}
                <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
                    <label className="text-xs text-gray-500">Rol</label>
                    <select
                        {...register("role")}
                        defaultValue={data?.rol}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full "
                    >
                        <option value="">Seleccionar</option>
                        <option value="Director de Proyecto">Director de Proyecto</option>
                        <option value="Profesor">Profesor</option>
                        <option value="Director">Director</option>
                        <option value="Asesor">Asesor</option>
                        <option value="Asesor Externo">Asesor Externo</option>
                    </select>
                    {errors.role && <p className="text-red-500 text-xs">{errors.role.message as string}</p>}
                </div>

            </div>

            {/* BUTTON */}
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                <button className={`font-semibold py-2.5 px-8 rounded-lg shadow-sm transition-all duration-200 w-full md:w-auto bg-secondary-500 text-white hover:bg-secondary-600`}>
                    {type === "create" ? "Crear Profesor" : "Actualizar Profesor"}
                </button>
            </div>
        </form>
    );
};

export default TeacherForm;