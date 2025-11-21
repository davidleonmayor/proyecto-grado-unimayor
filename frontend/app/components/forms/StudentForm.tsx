"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import InputField from "../InputField";
import Image from "next/image";
import uploadImage from "@/public/upload.png";
import { tipoDocumentoData, programaAcademicoData } from "@/app/lib/data";

const schema = z.object({
  NOMBRES: z
    .string()
    .min(1, { message: "El nombre es obligatorio" })
    .max(100, { message: "El nombre no debe exceder los 100 caracteres" }),
  APELLIDOS: z
    .string()
    .min(1, { message: "El apellido es obligatorio" })
    .max(100, { message: "El apellido no debe exceder los 100 caracteres" }),
  ID_TIPO_DOC_IDENTIDAD: z
    .number()
    .min(1, { message: "Debe seleccionar un tipo de documento" }),
  NUM_DOC_IDENTIDAD: z
    .string()
    .min(5, { message: "El número de documento es obligatorio" })
    .max(50, { message: "El número de documento no debe exceder los 50 caracteres" }),
  NUMERO_CELULAR: z
    .string()
    .max(20, { message: "El número de celular no debe exceder los 20 caracteres" })
    .optional()
    .or(z.literal("")),
  CORREO_ELECTRONICO: z.string().email({ message: "Correo electrónico inválido" }),
  PASSWORD: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(60, { message: "La contraseña no debe exceder los 60 caracteres" }),
  ID_PROGRAMA_ACADEMICO: z
    .number()
    .min(1, { message: "Debe seleccionar un programa académico" }),
  img: z.instanceof(File).optional().or(z.literal("")),
});

const StudentForm = ({ type, data }: { type: "create" | "update"; data?: any }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Crear nuevo estudiante" : "Actualizar estudiante"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">Información Personal</span>

      <div className="flex justify-between gap-4 flex-wrap">
        <InputField
          label="Nombres"
          name="NOMBRES"
          defaultValue={data?.NOMBRES || data?.nombres}
          register={register}
          error={errors.NOMBRES}
        />
        <InputField
          label="Apellidos"
          name="APELLIDOS"
          defaultValue={data?.APELLIDOS || data?.apellidos}
          register={register}
          error={errors.APELLIDOS}
        />
        
        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
          <label className="text-xs text-gray-500">Tipo de Documento</label>
          <select
            {...register("ID_TIPO_DOC_IDENTIDAD", { valueAsNumber: true })}
            defaultValue={data?.ID_TIPO_DOC_IDENTIDAD || data?.id_tipo_doc_identidad}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Seleccionar</option>
            {tipoDocumentoData.map((doc) => (
              <option key={doc.ID_TIPO_DOCUMENTO} value={doc.ID_TIPO_DOCUMENTO}>
                {doc.DOCUMENTO}
              </option>
            ))}
          </select>
          {errors.ID_TIPO_DOC_IDENTIDAD && (
            <p className="text-red-500 text-xs">{errors.ID_TIPO_DOC_IDENTIDAD.message as string}</p>
          )}
        </div>

        <InputField
          label="Número de Documento"
          name="NUM_DOC_IDENTIDAD"
          defaultValue={data?.NUM_DOC_IDENTIDAD || data?.num_doc_identidad}
          register={register}
          error={errors.NUM_DOC_IDENTIDAD}
        />
        <InputField
          label="Número de Celular"
          name="NUMERO_CELULAR"
          defaultValue={data?.NUMERO_CELULAR || data?.numero_celular}
          register={register}
          error={errors.NUMERO_CELULAR}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">Información Académica y Autenticación</span>

      <div className="flex justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-2 w-full md:w-1/3 justify-center">
          <label className="text-xs text-gray-500">Programa Académico</label>
          <select
            {...register("ID_PROGRAMA_ACADEMICO", { valueAsNumber: true })}
            defaultValue={data?.ID_PROGRAMA_ACADEMICO || data?.id_programa_academico}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Seleccionar</option>
            {programaAcademicoData.map((programa) => (
              <option key={programa.ID_PROGRAMA} value={programa.ID_PROGRAMA}>
                {programa.NOMBRE_PROGRAMA}
              </option>
            ))}
          </select>
          {errors.ID_PROGRAMA_ACADEMICO && (
            <p className="text-red-500 text-xs">{errors.ID_PROGRAMA_ACADEMICO.message as string}</p>
          )}
        </div>

        <InputField
          label="Correo Electrónico"
          name="CORREO_ELECTRONICO"
          type="email"
          defaultValue={data?.CORREO_ELECTRONICO || data?.correo_electronico}
          register={register}
          error={errors.CORREO_ELECTRONICO}
        />
        <InputField
          label="Contraseña"
          name="PASSWORD"
          type="password"
          defaultValue={data?.PASSWORD || data?.password}
          register={register}
          error={errors.PASSWORD}
        />

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

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Crear" : "Actualizar"}
      </button>
    </form>
  );
};

export default StudentForm;
