'use client'

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { careersData } from "@/app/lib/data";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";

interface FormValues {
  fecha: string;
  ciudad: string;
  programa: string;
  estudiantes: { nombre: string }[];
  estado: string;
  comentarios: string;
  firmante: string;
  destinatario: string;
}

export const MessageForm = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      fecha: "",
      ciudad: "Popayán",
      programa: "",
      estudiantes: [{ nombre: "" }],
      estado: "Aprobado",
      comentarios: "",
      firmante: "Ing. CLAUDIA PATRICIA MUÑOZ GUERRERO",
      destinatario: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "estudiantes",
  });

  const generarPdf = (data: FormValues) => {
    const doc = new jsPDF();

    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("FACULTAD DE INGENIERÍA", 105, 20, { align: "center" });
    doc.text("CONSEJO DE FACULTAD", 105, 30, { align: "center" });

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text("605.02.02", 105, 40, { align: "center" });
    doc.text("015-2016", 105, 50, { align: "center" });

    doc.text(`${data.ciudad}, ${data.fecha || "Fecha no especificada"}`, 20, 70);

    doc.text("Estudiantes:", 20, 90);
    data.estudiantes.forEach((est, i) => {
      doc.text(`- ${est.nombre}`, 30, 100 + i * 10);
    });

    doc.text(`Programa: ${data.programa || "N/A"}`, 20, 120 + data.estudiantes.length * 10);
    doc.text("Facultad de Ingeniería", 20, 130 + data.estudiantes.length * 10);

    doc.text("Cordial saludo,", 20, 150);

    doc.text(data.comentarios || "Sin comentarios", 20, 170, { maxWidth: 170 });

    doc.text("Atentamente,", 20, 200);
    doc.text(data.firmante || "Firma no especificada", 20, 210);
    doc.text("Presidente Consejo de Facultad", 20, 220);

    doc.save(`document-${Date.now()}.pdf`);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch("https://tempback-proyecto.onrender.com/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Correo enviado",
          text: result.message || "El informe fue enviado correctamente",
        });
        generarPdf(data);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.error || "No se pudo enviar el correo",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema de conexión con el servidor",
      });
    }
  };

  const programs = careersData;

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-2xl rounded-xl">
      <form className="space-y-3 text-sm" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block mb-1 font-semibold">Fecha del documento:</label>
          <input
            {...register("fecha", { required: "La fecha es obligatoria" })}
            type="date"
            className="w-full border rounded px-2 py-1"
          />
          {errors.fecha && <span className="text-red-500 text-xs">{errors.fecha.message}</span>}
        </div>

        <div>
          <label className="block mb-1 font-semibold">Ciudad:</label>
          <input
            {...register("ciudad", { required: "La ciudad es obligatoria" })}
            className="w-full border rounded px-2 py-1"
          />
          {errors.ciudad && <span className="text-red-500 text-xs">{errors.ciudad.message}</span>}
        </div>

        <div>
          <label className="block mb-1 font-semibold">Programa académico:</label>
          <select
            {...register("programa", { required: "El programa es obligatorio" })}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Seleccione un programa</option>
            {programs.map((program) => (
              <option key={program.codigo} value={program.nombre}>
                {program.nombre}
              </option>
            ))}
          </select>
          {errors.programa && <span className="text-red-500 text-xs">{errors.programa.message}</span>}
        </div>

        <div>
          <label className="block mb-1 font-semibold">Nombres de los estudiantes:</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex mb-1">
              <input
                {...register(`estudiantes.${index}.nombre` as const, {
                  required: "El nombre es obligatorio",
                })}
                placeholder="Nombre del estudiante"
                className="w-full border rounded px-2 py-1"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="ml-1 bg-red-500 text-white text-[10px] px-2 rounded cursor-pointer"
              >
                Remover
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ nombre: "" })}
            className="mt-1 text-[10px] bg-blue-500 text-white px-3 py-1 rounded cursor-pointer"
          >
            Agregar Estudiante
          </button>
          {errors.estudiantes && (
            <span className="text-red-500 text-xs">Todos los estudiantes deben tener nombre</span>
          )}
        </div>

        <div>
          <label className="block mb-1 font-semibold">Estado del proyecto:</label>
          <select
            {...register("estado", { required: "El estado es obligatorio" })}
            className="w-full border rounded px-2 py-1"
          >
            <option value="Aprobado">Aprobado</option>
            <option value="No aprobado">No aprobado</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Comentarios adicionales:</label>
          <textarea
            {...register("comentarios")}
            rows={10}
            placeholder="Opcional"
            className="w-full border rounded px-2 py-1 resize-none overflow-hidden"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Firmante:</label>
          <input
            {...register("firmante", { required: "El firmante es obligatorio" })}
            className="w-full border rounded px-2 py-1"
          />
          {errors.firmante && <span className="text-red-500 text-xs">{errors.firmante.message}</span>}
        </div>

        <div>
          <label className="block mb-1 font-semibold">Correo destinatario:</label>
          <input
            {...register("destinatario", {
              required: "El correo es obligatorio",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Correo inválido",
              },
            })}
            type="email"
            placeholder="correo@ejemplo.com"
            className="w-full border rounded px-2 py-1"
          />
          {errors.destinatario && (
            <span className="text-red-500 text-xs">{errors.destinatario.message}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white py-1.5 rounded font-bold cursor-pointer hover:bg-blue-600"
          >
            Generar y Enviar
          </button>
        </div>
      </form>
    </div>
  );
};
