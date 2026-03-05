"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import z from "zod";
import { InputField } from "@/shared/components/ui/InputField";
import { personsService } from "../services/persons.service";
import { projectsService } from "@/modules/projects/services/projects.service";
import Swal from "sweetalert2";


const StudentForm = ({ type, data, onSuccess }: { type: "create" | "update"; data?: any; onSuccess?: () => void }) => {
  const [programs, setPrograms] = useState<Array<{ id: string; name: string; faculty: string }>>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  const schema = z.object({
    username: type === "create" ? z.string().min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" }).max(20) : z.string().optional().or(z.literal('')),
    email: z.string().email({ message: "Correo electrónico inválido" }),
    document: z.string().min(5, { message: "El documento debe tener al menos 5 caracteres" }).max(20),
    codigoInstitucional: z.string().min(3, { message: "El código institucional es obligatorio" }).max(20),
    password: type === "create" ? z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).max(100) : z.string().optional().or(z.literal('')),
    role: z.enum(["Estudiante"], { message: "Rol inválido" }).optional(),
    firstName: z.string().min(1, { message: "El nombre es obligatorio" }).max(50),
    lastName: z.string().min(1, { message: "El apellido es obligatorio" }).max(50),
    phone: z.string().min(7, { message: "El teléfono debe tener al menos 7 caracteres" }).max(15),
    sex: z.enum(["Masculino", "Femenino"], { message: "Sexo inválido" }).optional().or(z.literal('')),
    programId: z.string().min(1, { message: "Debe seleccionar un programa académico" }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const formData = await projectsService.getFormData();
      setPrograms(formData.programs || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const onSubmit = handleSubmit(async (formData) => {
    try {
      if (type === "create") {
        await personsService.createStudent(formData);
        Swal.fire('Éxito', 'Estudiante creado exitosamente', 'success');
      } else {
        await personsService.updatePerson(data.id, formData);
        Swal.fire('Éxito', 'Estudiante actualizado exitosamente', 'success');
      }
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error submitting student form:', error);
      Swal.fire('Error', 'Error al guardar: ' + (error.message || 'Error desconocido'), 'error');
    }
  });

  return (
    <form className="flex flex-col gap-6 sm:gap-8 max-w-full" onSubmit={onSubmit}>
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {type === "create" ? "Crear nuevo estudiante" : "Actualizar estudiante"}
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
          label="Código Institucional"
          name="codigoInstitucional"
          defaultValue={data?.codigoInstitucional}
          register={register}
          error={errors.codigoInstitucional}
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
      </div>

      {/* ACADEMIC INFO */}
      <h2 className="mt-4 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-l-4 border-principal pl-2">Información Académica</h2>

      <div className="flex justify-between gap-4 flex-wrap">
        {/* PROGRAM */}
        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
          <label className="text-xs text-gray-500">Programa Académico</label>
          <select
            {...register("programId")}
            defaultValue={data?.programaId || ""}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Seleccionar programa</option>
            {loadingPrograms ? (
              <option disabled>Cargando programas...</option>
            ) : (
              programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))
            )}
          </select>
          {errors.programId && <p className="text-red-500 text-xs">{errors.programId.message as string}</p>}
        </div>

        {/* ROLE */}
        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
          <label className="text-xs text-gray-500">Rol</label>
          <input
            type="text"
            readOnly
            defaultValue="Estudiante"
            {...register("role")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>

      {/* BUTTON */}
      <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
        <button className={`font-semibold py-2.5 px-8 rounded-lg shadow-sm transition-all duration-200 w-full md:w-auto bg-secondary-500 text-white hover:bg-secondary-600`}>
          {type === "create" ? "Crear Estudiante" : "Actualizar Estudiante"}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
