'use client';

import React, { useState, useMemo } from 'react';
import TableSearch from "@/app/components/TableSearch";
import Image from "next/image";
import filterImage from "@/public/filter.png";
import sortImage from "@/public/sort.png";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import viewImage from "@/public/view.png";
import uploadImage from "@/public/upload.png";
import { documentsData, seguimientoTGData, trabajoGradoData, actoresData, personasData } from "@/app/lib/data";
import { useAuth } from "@/app/contexts/AuthContext";
import FormModal from "@/app/components/FormModal";
import AreaChart from "@/app/components/AreaChart";

type DocumentItem = {
  id: number;
  nombre: string;
  tipo: string;
  estado: string;
  fecha: string;
  estudiante: string;
  tamaño: string;
  formato: string;
};

const columns = [
  { header: "Nombre", accesor: "nombre" },
  { header: "Tipo", accesor: "tipo", className: "hidden md:table-cell" },
  { header: "Estudiante", accesor: "estudiante", className: "hidden md:table-cell" },
  { header: "Estado", accesor: "estado", className: "hidden md:table-cell" },
  { header: "Tamaño", accesor: "tamaño", className: "hidden lg:table-cell" },
];

const DocumentListPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredDocuments = useMemo(() => {
    let docs = documentsData;
    
    if (role === 'student') {
      const estudiante = personasData.find(p => 
        p.CORREO_ELECTRONICO.toLowerCase() === user?.email?.toLowerCase()
      );
      if (estudiante) {
        const trabajosEstudiante = trabajoGradoData.filter(tg => 
          actoresData.some(a => 
            a.ID_PERSONA === estudiante.ID_PERSONA && 
            a.ID_TRABAJO_GRADO === tg.ID_TRABAJO_GRADO &&
            a.ID_TIPO_ROL === 4
          )
        );
        const seguimientosEstudiante = seguimientoTGData.filter(s =>
          trabajosEstudiante.some(tg => tg.ID_TRABAJO_GRADO === s.ID_TRABAJO_GRADO)
        );
        docs = documentsData.filter(d => 
          seguimientosEstudiante.some(s => s.ID_SEGUIMIENTO === d.id)
        );
      } else {
        docs = [];
      }
    }

    if (searchTerm) {
      docs = docs.filter(d => 
        d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.estudiante.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterTipo) {
      docs = docs.filter(d => d.tipo === filterTipo);
    }
    if (filterEstado) {
      docs = docs.filter(d => d.estado === filterEstado);
    }

    return docs;
  }, [role, user?.email, searchTerm, filterTipo, filterEstado]);

  const handleView = (doc: DocumentItem) => {
    alert(`Visualizando: ${doc.nombre}`);
  };

  const handleDownload = (doc: DocumentItem) => {
    const link = window.document.createElement('a');
    link.href = '#';
    link.download = `${doc.nombre}.${doc.formato.toLowerCase()}`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    alert(`Descargando: ${doc.nombre}`);
  };

  const tiposUnicos = Array.from(new Set(documentsData.map(d => d.tipo)));
  const estadosUnicos = Array.from(new Set(documentsData.map(d => d.estado)));

  const renderRow = (item: DocumentItem) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#dbdafe]"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-principal rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold">{item.formato}</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.nombre}</h3>
            <p className="text-xs text-gray-500">{item.fecha}</p>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.tipo}</td>
      <td className="hidden md:table-cell">{item.estudiante}</td>
      <td className="hidden md:table-cell">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            item.estado === "Aprobado"
              ? "bg-green-100 text-green-800"
              : item.estado === "En revisión"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {item.estado}
        </span>
      </td>
      <td className="hidden lg:table-cell">{item.tamaño}</td>
      <td>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(item)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-pastelBlue hover:bg-blue-300 transition-all"
            title="Ver documento"
          >
            <Image src={viewImage} alt="ver" width={16} height={16} />
          </button>
          <button
            onClick={() => handleDownload(item)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-pastelGreen hover:bg-green-300 transition-all"
            title="Descargar documento"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15.577l-3.539-3.538.708-.719L11.5 14.35V3h1v11.35l2.331-2.03.708.719L12 15.577zm-6.5 4.423h13v-1h-13v1z" fill="currentColor"/>
            </svg>
          </button>
          {role === "admin" && (
            <FormModal table="document" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const areaData = [
    { name: "Ene", documentos: 12, aprobados: 8 },
    { name: "Feb", documentos: 19, aprobados: 15 },
    { name: "Mar", documentos: 15, aprobados: 12 },
    { name: "Abr", documentos: 22, aprobados: 18 },
    { name: "May", documentos: 18, aprobados: 16 },
    { name: "Jun", documentos: 25, aprobados: 22 },
  ];

  return (
    <div className="p-4 flex gap-4 flex-col">
      {role !== 'student' && (
        <div className="w-full h-[400px]">
          <AreaChart
            data={areaData}
            dataKeys={[
              { key: "documentos", name: "Total Documentos", color: "#0EA5E9" },
              { key: "aprobados", name: "Aprobados", color: "#10b981" },
            ]}
            title="Documentos por Mes"
          />
        </div>
      )}

      <div className="bg-white p-4 rounded-md flex-1">
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            {role === 'student' ? 'Mis Documentos' : 'Todos los documentos'}
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full md:w-64"
              />
            </div>
            <div className="flex items-center gap-4 self-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-principal hover:bg-principalDark cursor-pointer"
                title="Filtros"
              >
                <Image src={filterImage} alt="" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-principal hover:bg-principalDark cursor-pointer">
                <Image src={sortImage} alt="" width={14} height={14} />
              </button>
              <FormModal table="document" type="create" />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex gap-4 flex-wrap">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Tipo de Documento</label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-48"
              >
                <option value="">Todos los tipos</option>
                {tiposUnicos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Estado</label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-48"
              >
                <option value="">Todos los estados</option>
                {estadosUnicos.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
            {(filterTipo || filterEstado) && (
              <button
                onClick={() => {
                  setFilterTipo('');
                  setFilterEstado('');
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-white rounded-lg text-sm font-semibold self-end"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        )}

        <Table columns={columns} renderRow={renderRow} data={filteredDocuments} />
        <Pagination />
      </div>
    </div>
  );
};

export default DocumentListPage;
