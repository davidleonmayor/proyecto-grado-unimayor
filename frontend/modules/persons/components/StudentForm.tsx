"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { InputField } from "@/shared/components/ui/InputField";
import Image from "next/image";
import uploadImage from "@/public/upload.png";

const schema = z.object({
  username: z
    .string()
    .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" })
    .max(20, { message: "El nombre de usuario no debe exceder los 20 caracteres" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(100, { message: "La contraseña no debe exceder los 100 caracteres" }),
  role: z.enum(["Estudiante"], {
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
  sex: z.enum(["Masculino", "Femenino"], {
    message: "Sexo inválido",
  }),
  img: z.instanceof(File, { message: "Debe ser un archivo" }),
});

const StudentForm = ({ type, data }: { type: "create" | "update"; data?: any }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      // TODO: Implement API call to create/update student
      console.log('Student form data:', data);
      alert('La creación de estudiantes está en desarrollo. Por favor, contacte al administrador.');
    } catch (error: any) {
      console.error('Error submitting student form:', error);
      alert('Error al guardar: ' + (error.message || 'Error desconocido'));
    }
  });

  return (
    <form className="flex flex-col gap-6 sm:gap-8 max-w-full" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Crear nuevo estudiante" : "Actualizar estudiante"}
      </h1>

      {/* AUTH INFO */}
      <span className="text-xs text-gray-400 font-medium">Información de Autenticación</span>

      <div className="flex justify-between gap-4 flex-wrap">
        <InputField
          label="Nombre de usuario"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors.username}
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
          label="Contraseña"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors.password}
        />
      </div>

      {/* PERSONAL INFO */}
      <span className="text-xs text-gray-400 font-medium">Información Personal</span>

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

        {/* ROLE */}
        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
          <label className="text-xs text-gray-500">Rol</label>
          <input
            type="text"
            readOnly
            value="Estudiante"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* UPLOAD IMAGE */}
        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
          <label className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer" htmlFor="img">
            <Image src={uploadImage} alt="subir imagen" width={28} height={28} />
            <span>Subir Foto</span>
          </label>
          <input
            type="file"
            id="img"
            accept="image/*"
            {...register("img")}
            className="hidden"
          />
          {errors.img && <p className="text-red-500 text-xs">{errors.img.message as string}</p>}
        </div>
      </div>

      {/* BUTTON */}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Crear" : "Actualizar"}
      </button>
    </form>
  );
};

export default StudentForm;
