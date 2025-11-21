"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import InputField from "../InputField";
import Image from "next/image";
import uploadImage from "@/public/upload.png";
import { opcionGradoData, programaAcademicoData } from "@/app/lib/data";

const schema = z.object({
  TITULO_TRABAJO: z
    .string()
    .min(10, { message: "El título debe tener al menos 10 caracteres" })
    .max(500, { message: "El título no debe exceder los 500 caracteres" }),
  RESUMEN: z
    .string()
    .min(50, { message: "El resumen debe tener al menos 50 caracteres" })
    .max(2000, { message: "El resumen no debe exceder los 2000 caracteres" }),
  ID_OPCION_GRADO: z
    .number()
    .min(1, { message: "Debe seleccionar una opción de grado" }),
  ID_PROGRAMA_ACADEMICO: z
    .number()
    .min(1, { message: "Debe seleccionar un programa académico" }),
  FECHA_INICIO: z.string().min(1, { message: "La fecha de inicio es obligatoria" }),
  FECHA_FIN_ESTIMA: z.string().optional(),
  documento: z.instanceof(File).optional().or(z.literal("")),
});

const ProposalForm = ({ type, data }: { type: "create" | "update"; data?: any }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((data) => {
    console.log("Propuesta enviada:", data);
    alert("Propuesta enviada correctamente");
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Subir Nueva Propuesta" : "Actualizar Propuesta"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">Información del Trabajo de Grado</span>

      <div className="flex flex-col gap-4">
        <InputField
          label="Título del Trabajo"
          name="TITULO_TRABAJO"
          defaultValue={data?.TITULO_TRABAJO || data?.titulo}
          register={register}
          error={errors.TITULO_TRABAJO}
          placeholder="Ej: Sistema de gestión de proyectos académicos"
        />

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Resumen</label>
          <textarea
            {...register("RESUMEN")}
            defaultValue={data?.RESUMEN || data?.resumen}
            rows={6}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            placeholder="Describe brevemente tu trabajo de grado..."
          />
          {errors.RESUMEN && (
            <p className="text-red-500 text-xs">{errors.RESUMEN.message as string}</p>
          )}
        </div>

        <div className="flex justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-2 w-full md:w-1/2 justify-center">
            <label className="text-xs text-gray-500">Opción de Grado</label>
            <select
              {...register("ID_OPCION_GRADO", { valueAsNumber: true })}
              defaultValue={data?.ID_OPCION_GRADO || data?.id_opcion_grado}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            >
              <option value="">Seleccionar</option>
              {opcionGradoData.map((opcion) => (
                <option key={opcion.ID_OPCION_GRADO} value={opcion.ID_OPCION_GRADO}>
                  {opcion.NOMBRE_OPCION_GRADO}
                </option>
              ))}
            </select>
            {errors.ID_OPCION_GRADO && (
              <p className="text-red-500 text-xs">{errors.ID_OPCION_GRADO.message as string}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full md:w-1/2 justify-center">
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
        </div>

        <div className="flex justify-between gap-4 flex-wrap">
          <InputField
            label="Fecha de Inicio"
            name="FECHA_INICIO"
            type="date"
            defaultValue={data?.FECHA_INICIO || data?.fecha_inicio}
            register={register}
            error={errors.FECHA_INICIO}
          />
          <InputField
            label="Fecha Estimada de Finalización (Opcional)"
            name="FECHA_FIN_ESTIMA"
            type="date"
            defaultValue={data?.FECHA_FIN_ESTIMA || data?.fecha_fin_estima}
            register={register}
            error={errors.FECHA_FIN_ESTIMA}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer" htmlFor="documento">
            <Image src={uploadImage} alt="subir documento" width={28} height={28} />
            <span>Subir Documento de Propuesta (PDF)</span>
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
        {type === "create" ? "Subir Propuesta" : "Actualizar Propuesta"}
      </button>
    </form>
  );
};

export default ProposalForm;

