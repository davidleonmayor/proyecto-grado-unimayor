"use client";

import { useCallback, useState } from "react";
import * as XLSX from "xlsx-js-style";
import {
  MAX_CODE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_ID_LENGTH,
  MAX_NAME_LENGTH,
  MAX_TITLE_LENGTH,
} from "../constants";
import type {
  ExtractedData,
  Estudiante,
  LineaAccion,
  Modalidad,
} from "../types";
import { sanitizeText } from "../utils";

const XLSX_EXPECTED_KEYS = ["titulo", "descripcion", "estudiante"] as const;

const parseBool = (value: unknown): boolean =>
  String(value ?? "")
    .trim()
    .toUpperCase() === "X";

export const parseXlsxBufferToExtractedData = (
  buffer: ArrayBuffer,
): ExtractedData[] => {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];

  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (rows.length === 0) return [];

  const firstKeys = Object.keys(rows[0]);
  const matchesSchema = XLSX_EXPECTED_KEYS.every((key) =>
    firstKeys.includes(key),
  );

  if (!matchesSchema) return [];

  const projects = new Map<string, ExtractedData>();
  for (const row of rows) {
    const titulo = sanitizeText(String(row.titulo ?? ""), MAX_TITLE_LENGTH);
    const descripcion = sanitizeText(
      String(row.descripcion ?? ""),
      MAX_DESCRIPTION_LENGTH,
    );
    const key = `${titulo}::${descripcion}`;

    if (!projects.has(key)) {
      projects.set(key, {
        id: crypto.randomUUID(),
        fileName: "",
        titulo,
        descripcion,
        lineasAccion: {
          educacion: parseBool(row.educacion),
          convivenciaCultura: parseBool(row.convivencia_cultura),
          medioAmbiente: parseBool(row.medio_ambiente),
          emprendimiento: parseBool(row.emprendimiento),
          servicioSocial: parseBool(row.servicio_social),
        },
        modalidad: {
          proyectoInvestigacion: false,
          trabajoGrado: false,
          practicaProfesional: false,
          clinicaAula: false,
          proyectoSocial: false,
          otro: false,
        },
        estudiantes: [],
        convenio: "",
        profesor: sanitizeText(String(row.profesor ?? ""), 100),
        tipoContratacion: sanitizeText(
          String(row.tipo_contratacion ?? ""),
          100,
        ),
        emailProfesor: sanitizeText(String(row.email_profesor ?? ""), 150),
        descripcionPoblacion: sanitizeText(
          String(row.descripcion_poblacion ?? ""),
          200,
        ),
        rangoEdades: sanitizeText(String(row.rango_edades ?? ""), 50),
        beneficiariosDirectos: sanitizeText(
          String(row.beneficiarios_directos ?? ""),
          50,
        ),
        lugarOrganizacion: sanitizeText(
          String(row.lugar_organizacion ?? ""),
          100,
        ),
        fechaInicio: sanitizeText(String(row.fecha_inicio ?? ""), 50),
        valor: sanitizeText(String(row.valor ?? ""), 50),
        observaciones: sanitizeText(String(row.observaciones ?? ""), 500),
      });
    }

    const nombre = sanitizeText(String(row.estudiante ?? ""), MAX_NAME_LENGTH);
    const codigo = sanitizeText(
      String(row.codigo ?? "").replace(/\D/g, ""),
      MAX_CODE_LENGTH,
    );
    const cedula = sanitizeText(
      String(row.cedula ?? "").replace(/\D/g, ""),
      MAX_ID_LENGTH,
    );
    if (nombre || codigo || cedula) {
      projects.get(key)!.estudiantes.push({ nombre, codigo, cedula });
    }
  }

  for (const p of projects.values()) {
    if (p.estudiantes.length === 0) {
      p.estudiantes.push({ nombre: "", codigo: "", cedula: "" });
    }
  }

  return Array.from(projects.values());
};

const buildXlsxFile = (data: ExtractedData[]): File => {
  const rows = data.flatMap((project) => {
    const estudiantes =
      project.estudiantes.length > 0
        ? project.estudiantes
        : [{ nombre: "", codigo: "", cedula: "" }];

    return estudiantes.map((est, index) => ({
      titulo: project.titulo,
      descripcion: project.descripcion,
      educacion: project.lineasAccion.educacion ? "X" : "",
      convivencia_cultura: project.lineasAccion.convivenciaCultura ? "X" : "",
      medio_ambiente: project.lineasAccion.medioAmbiente ? "X" : "",
      emprendimiento: project.lineasAccion.emprendimiento ? "X" : "",
      servicio_social: project.lineasAccion.servicioSocial ? "X" : "",
      estudiante: est.nombre,
      codigo: est.codigo,
      cedula: est.cedula,
      profesor: project.profesor,
      tipo_contratacion: project.tipoContratacion,
      email_profesor: project.emailProfesor,
      descripcion_poblacion: project.descripcionPoblacion,
      rango_edades: project.rangoEdades,
      beneficiarios_directos: project.beneficiariosDirectos,
      lugar_organizacion: project.lugarOrganizacion,
      fecha_inicio: project.fechaInicio,
      valor: project.valor,
      observaciones: project.observaciones,
      fila_estudiante: index + 1,
    }));
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Proyeccion Social");

  const arrayBuffer = XLSX.write(wb, {
    type: "array",
    bookType: "xlsx",
  }) as ArrayBuffer;

  return new File([arrayBuffer], "proyeccion_social.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

export const useFilterEditor = () => {
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);

  const loadFromBuffer = useCallback(
    (buffer: ArrayBuffer, fallback?: { nombre: string; descripcion: string | null }) => {
      const parsed = parseXlsxBufferToExtractedData(buffer);
      if (parsed.length === 0 && fallback) {
        const placeholder: ExtractedData = {
          id: crypto.randomUUID(),
          fileName: "",
          titulo: sanitizeText(fallback.nombre, MAX_TITLE_LENGTH),
          descripcion: sanitizeText(
            fallback.descripcion ?? "",
            MAX_DESCRIPTION_LENGTH,
          ),
          lineasAccion: {
            educacion: false,
            convivenciaCultura: false,
            medioAmbiente: false,
            emprendimiento: false,
            servicioSocial: false,
          },
          modalidad: {
            proyectoInvestigacion: false,
            trabajoGrado: false,
            practicaProfesional: false,
            clinicaAula: false,
            proyectoSocial: false,
            otro: false,
          },
          estudiantes: [{ nombre: "", codigo: "", cedula: "" }],
          convenio: "",
          profesor: "",
          tipoContratacion: "",
          emailProfesor: "",
          descripcionPoblacion: "",
          rangoEdades: "",
          beneficiariosDirectos: "",
          lugarOrganizacion: "",
          fechaInicio: "",
          valor: "",
          observaciones: "",
        };
        setExtractedData([placeholder]);
      } else {
        setExtractedData(parsed);
      }
    },
    [],
  );

  const clear = useCallback(() => {
    setExtractedData([]);
  }, []);

  const updateField = useCallback(
    (
      dataId: string,
      field:
        | "titulo"
        | "descripcion"
        | "profesor"
        | "tipoContratacion"
        | "emailProfesor"
        | "descripcionPoblacion"
        | "rangoEdades"
        | "beneficiariosDirectos"
        | "lugarOrganizacion"
        | "fechaInicio"
        | "valor"
        | "observaciones",
      value: string,
    ) => {
      setExtractedData((prev) =>
        prev.map((item) =>
          item.id === dataId ? { ...item, [field]: value } : item,
        ),
      );
    },
    [],
  );

  const updateLineaAccion = useCallback(
    (dataId: string, linea: keyof LineaAccion, checked: boolean) => {
      setExtractedData((prev) =>
        prev.map((item) =>
          item.id === dataId
            ? {
                ...item,
                lineasAccion: { ...item.lineasAccion, [linea]: checked },
              }
            : item,
        ),
      );
    },
    [],
  );

  const updateModalidad = useCallback(
    (dataId: string, campo: keyof Modalidad, checked: boolean) => {
      setExtractedData((prev) =>
        prev.map((item) =>
          item.id === dataId
            ? {
                ...item,
                modalidad: { ...item.modalidad, [campo]: checked },
              }
            : item,
        ),
      );
    },
    [],
  );

  const updateConvenio = useCallback(
    (dataId: string, value: "si" | "no" | "") => {
      setExtractedData((prev) =>
        prev.map((item) =>
          item.id === dataId ? { ...item, convenio: value } : item,
        ),
      );
    },
    [],
  );

  const updateEstudiante = useCallback(
    (
      dataId: string,
      estudianteIndex: number,
      field: keyof Estudiante,
      value: string,
    ) => {
      setExtractedData((prev) =>
        prev.map((item) =>
          item.id === dataId
            ? {
                ...item,
                estudiantes: item.estudiantes.map((est, idx) => {
                  if (idx !== estudianteIndex) return est;
                  const maxLength =
                    field === "nombre"
                      ? MAX_NAME_LENGTH
                      : field === "codigo"
                        ? MAX_CODE_LENGTH
                        : MAX_ID_LENGTH;
                  const sanitized =
                    field === "cedula" || field === "codigo"
                      ? sanitizeText(value.replace(/\D/g, ""), maxLength)
                      : sanitizeText(value, maxLength);
                  return { ...est, [field]: sanitized };
                }),
              }
            : item,
        ),
      );
    },
    [],
  );

  const addEstudianteBaseData = useCallback(
    (
      dataId: string,
      baseData: { nombre: string; codigo: string; cedula: string },
    ) => {
      setExtractedData((prev) =>
        prev.map((item) =>
          item.id === dataId
            ? {
                ...item,
                estudiantes: [
                  ...item.estudiantes,
                  {
                    nombre: sanitizeText(baseData.nombre, MAX_NAME_LENGTH),
                    codigo: sanitizeText(
                      baseData.codigo.replace(/\D/g, ""),
                      MAX_CODE_LENGTH,
                    ),
                    cedula: sanitizeText(
                      baseData.cedula.replace(/\D/g, ""),
                      MAX_ID_LENGTH,
                    ),
                  },
                ],
              }
            : item,
        ),
      );
    },
    [],
  );

  const addManualProject = useCallback((): string => {
    const id = crypto.randomUUID();
    const nuevo: ExtractedData = {
      id,
      fileName: "",
      titulo: "",
      descripcion: "",
      estudiantes: [{ nombre: "", codigo: "", cedula: "" }],
      lineasAccion: {
        educacion: false,
        convivenciaCultura: false,
        medioAmbiente: false,
        emprendimiento: false,
        servicioSocial: false,
      },
      modalidad: {
        proyectoInvestigacion: false,
        trabajoGrado: false,
        practicaProfesional: false,
        clinicaAula: false,
        proyectoSocial: false,
        otro: false,
      },
      convenio: "",
      profesor: "",
      tipoContratacion: "",
      emailProfesor: "",
      descripcionPoblacion: "",
      rangoEdades: "",
      beneficiariosDirectos: "",
      lugarOrganizacion: "",
      fechaInicio: "",
      valor: "",
      observaciones: "",
    };
    setExtractedData((prev) => [...prev, nuevo]);
    return id;
  }, []);

  const exportToXLSX = useCallback(() => {
    if (extractedData.length === 0) return;
    const file = buildXlsxFile(extractedData);
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [extractedData]);

  const buildFile = useCallback((): File | null => {
    if (extractedData.length === 0) return null;
    return buildXlsxFile(extractedData);
  }, [extractedData]);

  return {
    extractedData,
    loadFromBuffer,
    clear,
    updateField,
    updateLineaAccion,
    updateModalidad,
    updateConvenio,
    updateEstudiante,
    addEstudianteBaseData,
    addManualProject,
    exportToXLSX,
    buildFile,
  };
};
