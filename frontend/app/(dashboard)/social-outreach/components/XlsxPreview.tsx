"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Download, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import type {
  GridChange,
  GridColumn,
} from "./HandsontableGrid";
import type { ExtractedData, Modalidad } from "../types";

const HandsontableGrid = dynamic(() => import("./HandsontableGrid"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
      Cargando hoja de cálculo...
    </div>
  ),
});

const XlsxIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className={className}
  >
    <path
      fill="#ECEFF1"
      d="M39 16v24c0 2.2-1.8 4-4 4H13c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4h14l12 12z"
    />
    <path fill="#CFD8DC" d="M39 16l-12-2v-10z" />
    <path fill="#B0BEC5" d="M27 4v12h12z" />
    <path fill="#4CAF50" d="M6 24h22v11H6z" />
    <path
      fill="#FFF"
      d="M9 33.5l2-3.5-2-3.5h1.5l1.2 2.5 1.2-2.5H14l-2 3.5 2 3.5h-1.5L11.2 31 10 33.5z"
    />
    <path fill="#FFF" d="M14.5 26.5h1.5v6H19v1.5h-4.5z" />
    <path
      fill="#FFF"
      d="M20.5 27.5h3v1h-1.5c-1 0-1.5.5-1.5 1.5v1c0 1 .5 1.5 1.5 1.5h3v-1.5h-3v-1h1.5c1 0 1.5-.5 1.5-1.5v-1c0-1-.5-1.5-1.5-1.5h-3z"
    />
    <path
      fill="#FFF"
      d="M24 33.5l2-3.5-2-3.5h1.5l1.2 2.5 1.2-2.5H29l-2 3.5 2 3.5h-1.5l-1.3-2.5-1.2 2.5z"
    />
    <path fill="#90A4AE" d="M13 15h14v2H13zM13 19h14v2H13z" />
    <path fill="#CFD8DC" d="M29 25h8v2h-8zM29 29h8v2h-8z" />
  </svg>
);

type XlsxPreviewProps = {
  extractedData: ExtractedData[];
  updateField: (
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
  ) => void;
  updateLineaAccion: (
    dataId: string,
    linea:
      | "educacion"
      | "convivenciaCultura"
      | "medioAmbiente"
      | "emprendimiento"
      | "servicioSocial",
    checked: boolean,
  ) => void;
  updateModalidad: (
    dataId: string,
    campo: keyof Modalidad,
    checked: boolean,
  ) => void;
  updateConvenio: (dataId: string, value: "si" | "no" | "") => void;
  updateEstudiante: (
    dataId: string,
    index: number,
    field: "nombre" | "codigo" | "cedula",
    value: string,
  ) => void;
  addEstudianteBaseData: (
    dataId: string,
    baseData: { nombre: string; codigo: string; cedula: string },
  ) => void;
  addManualProject: () => string;
  removeAllFiles: () => void;
  exportToXLSX: () => void;
  saveToDatabase: () => Promise<void>;
  isSavingToDb: boolean;
  isProcessing: boolean;
};

type FlatRow = {
  projectId: string;
  titulo: string;
  descripcion: string;
  edu: boolean;
  conv: boolean;
  med: boolean;
  emp: boolean;
  serv: boolean;
  modProjInv: boolean;
  modTrabGrado: boolean;
  modPracProf: boolean;
  modCliAula: boolean;
  modProjSocial: boolean;
  modOtro: boolean;
  convenioSi: boolean;
  convenioNo: boolean;
  profesor: string;
  tipoContratacion: string;
  emailProfesor: string;
  descripcionPoblacion: string;
  rangoEdades: string;
  beneficiariosDirectos: string;
  lugarOrganizacion: string;
  fechaInicio: string;
  valor: string;
  observaciones: string;
  studentIndex: number;
  nombre: string;
  codigo: string;
  cedula: string;
  isFirstStudent: boolean;
};

const TEXT_FIELDS = new Set<keyof FlatRow>([
  "titulo",
  "descripcion",
  "profesor",
  "tipoContratacion",
  "emailProfesor",
  "descripcionPoblacion",
  "rangoEdades",
  "beneficiariosDirectos",
  "lugarOrganizacion",
  "fechaInicio",
  "valor",
  "observaciones",
]);

const LINEA_MAP = {
  edu: "educacion",
  conv: "convivenciaCultura",
  med: "medioAmbiente",
  emp: "emprendimiento",
  serv: "servicioSocial",
} as const;

const MODALIDAD_MAP: Record<string, keyof Modalidad> = {
  modProjInv: "proyectoInvestigacion",
  modTrabGrado: "trabajoGrado",
  modPracProf: "practicaProfesional",
  modCliAula: "clinicaAula",
  modProjSocial: "proyectoSocial",
  modOtro: "otro",
};

const COLUMNS: GridColumn[] = [
  { key: "titulo", title: "TÍTULO", type: "text", width: 220 },
  { key: "descripcion", title: "DESCRIPCIÓN", type: "text", width: 260 },
  { key: "edu", title: "EDU", type: "checkbox", width: 60 },
  { key: "conv", title: "CONV", type: "checkbox", width: 60 },
  { key: "med", title: "MED AMB", type: "checkbox", width: 75 },
  { key: "emp", title: "EMP", type: "checkbox", width: 60 },
  { key: "serv", title: "SERV SOC", type: "checkbox", width: 75 },
  { key: "nombre", title: "ESTUDIANTE", type: "text", width: 200 },
  { key: "codigo", title: "CÓDIGO", type: "text", width: 110 },
  { key: "cedula", title: "CÉDULA", type: "text", width: 120 },
  { key: "modProjInv", title: "PROY INV", type: "checkbox", width: 75 },
  { key: "modTrabGrado", title: "TRAB GRA", type: "checkbox", width: 75 },
  { key: "modPracProf", title: "PRAC PRO", type: "checkbox", width: 75 },
  { key: "modCliAula", title: "CLIN AULA", type: "checkbox", width: 80 },
  { key: "modProjSocial", title: "PROY SOC", type: "checkbox", width: 75 },
  { key: "modOtro", title: "OTRO", type: "checkbox", width: 60 },
  { key: "convenioSi", title: "CONV SÍ", type: "checkbox", width: 75 },
  { key: "convenioNo", title: "CONV NO", type: "checkbox", width: 75 },
  { key: "profesor", title: "PROFESOR", type: "text", width: 200 },
  { key: "tipoContratacion", title: "TIPO CONT.", type: "text", width: 130 },
  { key: "emailProfesor", title: "EMAIL PROF.", type: "text", width: 200 },
  {
    key: "descripcionPoblacion",
    title: "DESC. POBLACIÓN",
    type: "text",
    width: 220,
  },
  { key: "rangoEdades", title: "RANGO EDADES", type: "text", width: 120 },
  {
    key: "beneficiariosDirectos",
    title: "BENEFICIARIOS",
    type: "text",
    width: 120,
  },
  { key: "lugarOrganizacion", title: "LUGAR/ORG.", type: "text", width: 180 },
  { key: "fechaInicio", title: "FECHA INICIO", type: "text", width: 120 },
  { key: "valor", title: "VALOR", type: "text", width: 120 },
  { key: "observaciones", title: "OBSERVACIONES", type: "text", width: 220 },
];

export const XlsxPreview = ({
  extractedData,
  updateField,
  updateLineaAccion,
  updateModalidad,
  updateConvenio,
  updateEstudiante,
  addEstudianteBaseData,
  addManualProject,
  removeAllFiles,
  exportToXLSX,
  saveToDatabase,
  isSavingToDb,
  isProcessing,
}: XlsxPreviewProps) => {
  const [customRows, setCustomRows] = useState("1");

  const data = useMemo<FlatRow[]>(() => {
    const flat: FlatRow[] = [];
    extractedData.forEach((project) => {
      const estudiantes =
        project.estudiantes.length > 0
          ? project.estudiantes
          : [{ nombre: "", codigo: "", cedula: "" }];

      estudiantes.forEach((est, sIndex) => {
        flat.push({
          projectId: project.id,
          titulo: project.titulo,
          descripcion: project.descripcion,
          edu: project.lineasAccion.educacion,
          conv: project.lineasAccion.convivenciaCultura,
          med: project.lineasAccion.medioAmbiente,
          emp: project.lineasAccion.emprendimiento,
          serv: project.lineasAccion.servicioSocial,
          modProjInv: project.modalidad.proyectoInvestigacion,
          modTrabGrado: project.modalidad.trabajoGrado,
          modPracProf: project.modalidad.practicaProfesional,
          modCliAula: project.modalidad.clinicaAula,
          modProjSocial: project.modalidad.proyectoSocial,
          modOtro: project.modalidad.otro,
          convenioSi: project.convenio === "si",
          convenioNo: project.convenio === "no",
          profesor: project.profesor,
          tipoContratacion: project.tipoContratacion,
          emailProfesor: project.emailProfesor,
          descripcionPoblacion: project.descripcionPoblacion,
          rangoEdades: project.rangoEdades,
          beneficiariosDirectos: project.beneficiariosDirectos,
          lugarOrganizacion: project.lugarOrganizacion,
          fechaInicio: project.fechaInicio,
          valor: project.valor,
          observaciones: project.observaciones,
          studentIndex: sIndex,
          nombre: est.nombre,
          codigo: est.codigo,
          cedula: est.cedula,
          isFirstStudent: sIndex === 0,
        });
      });
    });
    return flat;
  }, [extractedData]);

  const handleCellChange = useCallback(
    ({ rowIndex, key, newValue }: GridChange) => {
      const row = data[rowIndex];
      if (!row || !row.projectId) return;
      const k = key as keyof FlatRow;

      if (TEXT_FIELDS.has(k)) {
        updateField(
          row.projectId,
          k as Parameters<typeof updateField>[1],
          String(newValue ?? ""),
        );
        return;
      }

      if (k in LINEA_MAP) {
        updateLineaAccion(
          row.projectId,
          LINEA_MAP[k as keyof typeof LINEA_MAP],
          Boolean(newValue),
        );
        return;
      }

      if (k in MODALIDAD_MAP) {
        updateModalidad(row.projectId, MODALIDAD_MAP[k], Boolean(newValue));
        return;
      }

      if (k === "convenioSi") {
        updateConvenio(row.projectId, newValue ? "si" : "");
        return;
      }
      if (k === "convenioNo") {
        updateConvenio(row.projectId, newValue ? "no" : "");
        return;
      }

      if (k === "nombre" || k === "codigo" || k === "cedula") {
        updateEstudiante(
          row.projectId,
          row.studentIndex,
          k,
          String(newValue ?? ""),
        );
      }
    },
    [
      data,
      updateField,
      updateLineaAccion,
      updateModalidad,
      updateConvenio,
      updateEstudiante,
    ],
  );

  const addRows = useCallback(
    (count: number) => {
      if (count <= 0) return;
      const lastValidRow = [...data]
        .reverse()
        .find((r) => r.projectId !== "");
      const targetId =
        lastValidRow?.projectId ?? addManualProject();
      for (let i = 0; i < count; i++) {
        addEstudianteBaseData(targetId, {
          nombre: "",
          codigo: "",
          cedula: "",
        });
      }
    },
    [data, addEstudianteBaseData, addManualProject],
  );

  const rowClassName = useCallback(
    (_rowIndex: number, row: Record<string, unknown>) => {
      const r = row as unknown as FlatRow;
      return r.isFirstStudent && r.projectId
        ? "ht-row-first-student"
        : undefined;
    },
    [],
  );

  return (
    <Card className="flex h-full w-full flex-col rounded-none border-0 bg-background shadow-none">
      <CardHeader className="flex flex-shrink-0 flex-row items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <XlsxIcon className="h-6 w-6 text-[#107c41]" />
            Hoja de cálculo interactiva
          </CardTitle>
          <Badge
            variant="outline"
            className="ml-2 font-mono text-xs text-muted-foreground"
          >
            .xlsx
          </Badge>
        </div>
        <div className="flex gap-2">
          {extractedData.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeAllFiles}
              className="text-muted-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Limpiar todos
            </Button>
          )}
          <Button
            size="sm"
            onClick={exportToXLSX}
            disabled={
              extractedData.length === 0 || isSavingToDb || isProcessing
            }
            className="bg-[#107c41] text-white hover:bg-[#0c5a2f]"
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar XLSX
          </Button>
          <Button
            size="sm"
            onClick={saveToDatabase}
            disabled={
              extractedData.length === 0 || isSavingToDb || isProcessing
            }
            className="bg-[#0f6cbd] text-white hover:bg-[#0b4f8a]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSavingToDb ? "Guardando..." : "Guardar en DB"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        {extractedData.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-muted/10 p-8 text-center">
            <XlsxIcon className="mb-4 h-16 w-16 text-muted-foreground/30 drop-shadow-sm" />
            <p className="text-sm font-medium text-muted-foreground">
              Vista previa del archivo Excel
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Carga archivos PDF para ver los datos extraídos
            </p>
            <p className="mt-3 text-xs text-muted-foreground/70">
              o empieza a llenar manualmente
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addManualProject()}
              className="mt-3"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear fila manual
            </Button>
          </div>
        ) : (
          <>
            <div className="relative min-h-0 w-full flex-1 overflow-hidden">
              <HandsontableGrid
                data={data}
                columns={COLUMNS}
                onCellChange={handleCellChange}
                rowClassName={rowClassName}
                rowHeights={36}
              />
            </div>
            <div className="flex flex-shrink-0 items-center gap-4 border-t border-border bg-background px-3 py-2 text-sm font-medium">
              <button
                type="button"
                onClick={() => addRows(1)}
                className="text-[#107c41] hover:underline"
              >
                Agregar 1 estudiante
              </button>
              <span className="text-muted-foreground/30">|</span>
              <button
                type="button"
                onClick={() => addRows(10)}
                className="text-[#107c41] hover:underline"
              >
                Agregar 10 estudiantes
              </button>
              <span className="text-muted-foreground/30">|</span>
              <div className="flex items-center gap-2">
                <span className="font-normal text-muted-foreground">
                  Agregar
                </span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customRows}
                  onChange={(e) => setCustomRows(e.target.value)}
                  className="h-7 w-16 rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#107c41]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const num = parseInt(customRows) || 1;
                    if (num > 0) addRows(num);
                  }}
                  className="text-[#107c41] hover:underline"
                >
                  estudiantes
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
