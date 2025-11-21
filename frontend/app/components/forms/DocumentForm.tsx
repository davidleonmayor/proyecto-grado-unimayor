"use client";

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import InputField from "../InputField";
import Image from "next/image";
import uploadImage from "@/public/upload.png";
import { trabajoGradoData, personasData, actoresData } from "@/app/lib/data";
import { useAuth } from "@/app/contexts/AuthContext";

const schema = z.object({
  NOMBRE_DOCUMENTO: z
    .string()
    .min(5, { message: "El nombre del documento debe tener al menos 5 caracteres" })
    .max(200, { message: "El nombre no debe exceder los 200 caracteres" }),
  TIPO_DOCUMENTO: z
    .string()
    .min(1, { message: "Debe seleccionar un tipo de documento" }),
  RESUMEN: z
    .string()
    .max(1000, { message: "El resumen no debe exceder los 1000 caracteres" })
    .optional()
    .or(z.literal("")),
  ID_TRABAJO_GRADO: z
    .number()
    .min(1, { message: "Debe seleccionar un trabajo de grado" }),
  documento: z.instanceof(File, { message: "Debe seleccionar un archivo" }),
});

const DocumentForm = ({ type, data }: { type: "create" | "update"; data?: any }) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const trabajosEstudiante = React.useMemo(() => {
    if (role !== 'student') return trabajoGradoData;
    
    const estudiante = personasData.find(p => 
      p.CORREO_ELECTRONICO.toLowerCase() === user?.email?.toLowerCase()
    );
    if (!estudiante) return [];
    
    return trabajoGradoData.filter(tg => 
      actoresData.some(a => 
        a.ID_PERSONA === estudiante.ID_PERSONA && 
        a.ID_TRABAJO_GRADO === tg.ID_TRABAJO_GRADO &&
        a.ID_TIPO_ROL === 4
      )
    );
  }, [role, user?.email]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((formData) => {
    console.log("Documento enviado:", formData);
    alert("Documento subido correctamente");
  });

  const tiposDocumento = [
    "Propuesta",
    "Avance Parcial",
    "Informe Final",
    "Documento Administrativo",
    "Carta de Aceptación",
    "Otro",
  ];

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Subir Nuevo Documento" : "Actualizar Documento"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">Información del Documento</span>

      <div className="flex flex-col gap-4">
        <InputField
          label="Nombre del Documento"
          name="NOMBRE_DOCUMENTO"
          defaultValue={data?.NOMBRE_DOCUMENTO || data?.nombre}
          register={register}
          error={errors.NOMBRE_DOCUMENTO}
          placeholder="Ej: Propuesta de grado - Avances parciales"
        />

        <div className="flex justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-2 w-full md:w-1/2 justify-center">
            <label className="text-xs text-gray-500">Tipo de Documento</label>
            <select
              {...register("TIPO_DOCUMENTO")}
              defaultValue={data?.TIPO_DOCUMENTO || data?.tipo}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            >
              <option value="">Seleccionar</option>
              {tiposDocumento.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            {errors.TIPO_DOCUMENTO && (
              <p className="text-red-500 text-xs">{errors.TIPO_DOCUMENTO.message as string}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full md:w-1/2 justify-center">
            <label className="text-xs text-gray-500">Trabajo de Grado</label>
            <select
              {...register("ID_TRABAJO_GRADO", { valueAsNumber: true })}
              defaultValue={data?.ID_TRABAJO_GRADO || data?.id_trabajo_grado}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            >
              <option value="">Seleccionar</option>
              {trabajosEstudiante.map((trabajo) => (
                <option key={trabajo.ID_TRABAJO_GRADO} value={trabajo.ID_TRABAJO_GRADO}>
                  {trabajo.TITULO_TRABAJO}
                </option>
              ))}
            </select>
            {errors.ID_TRABAJO_GRADO && (
              <p className="text-red-500 text-xs">{errors.ID_TRABAJO_GRADO.message as string}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Resumen (Opcional)</label>
          <textarea
            {...register("RESUMEN")}
            defaultValue={data?.RESUMEN || data?.resumen}
            rows={4}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            placeholder="Descripción breve del documento..."
          />
          {errors.RESUMEN && (
            <p className="text-red-500 text-xs">{errors.RESUMEN.message as string}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer" htmlFor="documento">
            <Image src={uploadImage} alt="subir documento" width={28} height={28} />
            <span>Subir Documento (PDF, DOC, DOCX)</span>
          </label>
          <input
            type="file"
            id="documento"
            accept=".pdf,.doc,.docx"
            {...register("documento")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          />
          {errors.documento && (
            <p className="text-red-500 text-xs">{errors.documento.message as string}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="bg-secondary hover:bg-hoverColor text-white font-semibold py-2 px-4 rounded-md transition-all"
      >
        {type === "create" ? "Subir Documento" : "Actualizar Documento"}
      </button>
    </form>
  );
};

export default DocumentForm;

