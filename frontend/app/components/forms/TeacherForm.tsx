"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const schema = z.object({
    username: z
        .string()
        .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" })
        .max(20, { message: "El nombre de usuario no debe exceder los 20 caracteres" }),
    email: z
        .string()
        .email({ message: "Correo electrónico inválido" }),
    password: z
        .string()
        .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
        .max(100, { message: "La contraseña no debe exceder los 100 caracteres" }),
    role: z
        .enum(["Director de Proyecto", "Tutor", "Docente"], {
            message: "Rol inválido",
        }),
    firstName: z
        .string()
        .min(1, { message: "El nombre es obligatorio" })
        .max(50, { message: "El nombre no debe exceder los 50 caracteres" }),
    lastName: z
        .string()
        .min(1, { message: "El apellido es obligatorio" })
        .max(50, { message: "El apellido no debe exceder los 50 caracteres" }),
    phone: z
        .string()
        .min(7, { message: "El teléfono debe tener al menos 7 caracteres" })
        .max(15, { message: "El teléfono no debe exceder los 15 caracteres" }),
    sex: z
        .enum(["Masculino", "Femenino"], {
            message: "Sexo inválido",
        }),

});



const TeacherForm = ({ type, data }: { type: "create" | "update"; data?: any }) => {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = handleSubmit(data => {
        console.log(data);
    });

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">Crear nuevo profesor</h1>
            <span className="text-xs text-gray-400 font-medium">Informacion de Autentificacion</span>

            <div className="flex flex-col gap-2 w-full md:w-1/4">
                <label className="text-xs text-gray-500">Nombre de usuario</label>
                <input type="text"
                    {...register("username")}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                />

                {errors.username?.message && <p className="text-xs text-red-400">{errors.username?.message.toString()}</p>}
            </div>

            <span className="text-xs text-gray-400 font-medium">
                Informacion Personal
            </span>

            <button className="bg-blue-400 text-white p-2 rounded-md">
                {type === "create" ? "Create" : "Update"}
            </button>
        </form>
    );
};

export default TeacherForm;