'use client';

import React from 'react';
import TableSearch from "@/app/components/TableSearch";
import Image from "next/image";
import filterImage from "@/public/filter.png";
import sortImage from "@/public/sort.png";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import Link from "next/link";
import viewImage from "@/public/view.png";
import { proposalsData, seguimientoTGData, trabajoGradoData, actoresData, personasData, estadoTGData } from "@/app/lib/data";
import { useAuth } from "@/app/contexts/AuthContext";
import FormModal from "@/app/components/FormModal";
import PieChart from "@/app/components/PieChart";
import CountCharts from "@/app/components/CountCharts";

type Proposal = {
  id: number;
  estudiante: string;
  titulo: string;
  tipo: string;
  estado: string;
  fecha: string;
  director: string;
  carrera: string;
};

const columns = [
  { header: "Estudiante", accesor: "estudiante" },
  { header: "Título", accesor: "titulo", className: "hidden md:table-cell" },
  { header: "Tipo", accesor: "tipo", className: "hidden md:table-cell" },
  { header: "Estado", accesor: "estado", className: "hidden md:table-cell" },
  { header: "Fecha", accesor: "fecha", className: "hidden lg:table-cell" },
];

const ProposalListPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';
  
  const filteredProposals = React.useMemo(() => {
    if (role === 'student') {
      return proposalsData.filter((p) => 
        p.estudiante.toLowerCase().includes(user?.name?.toLowerCase() || '')
      );
    }
    return proposalsData;
  }, [role, user?.name]);

  const studentProposal = filteredProposals.length > 0 ? filteredProposals[0] : null;
  const seguimientos = React.useMemo(() => {
    if (!studentProposal || role !== 'student') return [];
    
    const trabajo = trabajoGradoData.find(tg => tg.ID_TRABAJO_GRADO === studentProposal.id);
    if (!trabajo) return [];
    
    return seguimientoTGData
      .filter(s => s.ID_TRABAJO_GRADO === trabajo.ID_TRABAJO_GRADO)
      .map(s => {
        const actor = actoresData.find(a => a.ID_ACTOR === s.ID_ACTOR);
        const persona = personasData.find(p => p.ID_PERSONA === actor?.ID_PERSONA);
        const estadoAnterior = estadoTGData.find(e => e.ID_ESTADO_TG === s.ID_ESTADO_ANTERIOR);
        const estadoNuevo = estadoTGData.find(e => e.ID_ESTADO_TG === s.ID_ESTADO_NUEVO);
        
        return {
          id: s.ID_SEGUIMIENTO,
          fecha: s.FECHA_REGISTRO.toLocaleDateString('es-CO'),
          accion: s.ID_ACCION,
          resumen: s.RESUMEN,
          validador: persona ? `${persona.NOMBRES} ${persona.APELLIDOS}` : 'N/A',
          estadoAnterior: estadoAnterior?.NOMBRE_ESTADO || 'N/A',
          estadoNuevo: estadoNuevo?.NOMBRE_ESTADO || 'N/A',
          calificacion: s.CALIFICACION,
        };
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [studentProposal, role]);
  
  const renderRow = (item: Proposal) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#dbdafe]"
    >
      <td className="p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.estudiante}</h3>
          <p className="text-xs text-gray-500">{item.carrera}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.titulo}</td>
      <td className="hidden md:table-cell">{item.tipo}</td>
      <td className="hidden md:table-cell">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            item.estado === "Aprobado"
              ? "bg-green-100 text-green-800"
              : item.estado === "En revisión"
              ? "bg-yellow-100 text-yellow-800"
              : item.estado === "Rechazado"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {item.estado}
        </span>
      </td>
      <td className="hidden lg:table-cell">{item.fecha}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/proposals/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-pastelBlue">
              <Image src={viewImage} alt="" width={16} height={16} />
            </button>
          </Link>
          {role !== "student" && role === "admin" && (
            <>
              <FormModal table="proposal" type="update" data={item} />
              <FormModal table="proposal" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const pieData = [
    { name: "Aprobado", value: proposalsData.filter((p) => p.estado === "Aprobado").length, color: "#0EA5E9" },
    { name: "En revisión", value: proposalsData.filter((p) => p.estado === "En revisión").length, color: "#fcdf5d" },
    { name: "Pendiente", value: proposalsData.filter((p) => p.estado === "Pendiente").length, color: "#a2a1f0" },
    { name: "Rechazado", value: proposalsData.filter((p) => p.estado === "Rechazado").length, color: "#F44336" },
  ];

  if (role === 'student') {
    return (
      <div className="p-4 flex gap-4 flex-col">
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Mi Propuesta de Grado</h1>
            {filteredProposals.length === 0 && (
              <FormModal table="proposal" type="create" />
            )}
          </div>
          
          {filteredProposals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Aún no has subido una propuesta de grado.</p>
              <p className="text-sm text-gray-500">Haz clic en el botón de arriba para subir tu propuesta.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map((prop) => (
                <div key={prop.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-lg font-semibold">{prop.titulo}</h2>
                      <p className="text-sm text-gray-600">{prop.tipo} - {prop.carrera}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        prop.estado === "Aprobado"
                          ? "bg-green-100 text-green-800"
                          : prop.estado === "En revisión"
                          ? "bg-yellow-100 text-yellow-800"
                          : prop.estado === "Rechazado"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {prop.estado}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Director: {prop.director}</p>
                    <p>Fecha de inicio: {prop.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {studentProposal && seguimientos.length > 0 && (
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Seguimiento de mi Propuesta</h2>
            <div className="space-y-4">
              {seguimientos.map((seg) => (
                <div key={seg.id} className="border-l-4 border-secondary pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{seg.resumen || 'Seguimiento'}</p>
                      <p className="text-sm text-gray-600">
                        {seg.estadoAnterior !== 'N/A' && seg.estadoNuevo !== 'N/A' && (
                          <span>{seg.estadoAnterior} → {seg.estadoNuevo}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Validado por: {seg.validador} - {seg.fecha}
                      </p>
                      {seg.calificacion && (
                        <p className="text-sm font-semibold text-secondary mt-1">
                          Calificación: {Number(seg.calificacion).toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {studentProposal && seguimientos.length === 0 && (
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Seguimiento</h2>
            <p className="text-gray-600">Aún no hay seguimientos registrados para tu propuesta.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 flex gap-4 flex-col">
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 h-[400px]">
          <PieChart data={pieData} title="Estado de Propuestas" />
        </div>
        <div className="w-full lg:w-1/3 h-[400px]">
          <CountCharts />
        </div>
        <div className="w-full lg:w-1/3 h-[400px]">
          <div className="bg-white rounded-xl w-full h-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg font-semibold">Resumen</h1>
              <Image src={filterImage} alt="" width={20} height={20} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-3 bg-principal rounded-lg">
                <span className="text-sm font-semibold">Total Propuestas</span>
                <span className="text-xl font-bold">{proposalsData.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="text-sm font-semibold text-white">Aprobadas</span>
                <span className="text-xl font-bold text-white">
                  {proposalsData.filter((p) => p.estado === "Aprobado").length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-tertiary rounded-lg">
                <span className="text-sm font-semibold">En Revisión</span>
                <span className="text-xl font-bold">
                  {proposalsData.filter((p) => p.estado === "En revisión").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-md flex-1">
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Todas las propuestas
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-principal hover:bg-principalDark cursor-pointer">
                <Image src={filterImage} alt="" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-principal hover:bg-principalDark cursor-pointer">
                <Image src={sortImage} alt="" width={14} height={14} />
              </button>
              {role === "admin" && <FormModal table="proposal" type="create" />}
            </div>
          </div>
        </div>
        <Table columns={columns} renderRow={renderRow} data={filteredProposals} />
        <Pagination />
      </div>
    </div>
  );
};

export default ProposalListPage;
