'use client';

import TableSearch from "@/app/components/TableSearch";
import Image from "next/image";
import filterImage from "@/public/filter.png";
import sortImage from "@/public/sort.png";
import plusImage from "@/public/plus.png";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import Link from "next/link";
import viewImage from "@/public/view.png";
import deleteImage from "@/public/delete.png";
import { degreeOptionsData } from "@/app/lib/data";
import { useAuth } from "@/app/contexts/AuthContext";
import FormModal from "@/app/components/FormModal";

type DegreeOption = {
  id: number;
  nombre: string;
  descripcion: string;
  requisitos: string[];
};

const columns = [
  { header: "Nombre", accesor: "nombre" },
  { header: "Descripción", accesor: "descripcion", className: "hidden md:table-cell" },
  { header: "Requisitos", accesor: "requisitos", className: "hidden md:table-cell" },
];

const DegreeOptionsListPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';
  
  const renderRow = (item: DegreeOption) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#dbdafe]"
    >
      <td className="p-4 font-semibold">{item.nombre}</td>
      <td className="hidden md:table-cell">{item.descripcion}</td>
      <td className="hidden md:table-cell">
        <ul className="list-disc list-inside">
          {item.requisitos.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <>
              <FormModal table="degreeOption" type="update" data={item} />
              <FormModal table="degreeOption" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Opciones de Grado
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
            {role === 'admin' && (
              <FormModal table="degreeOption" type="create" />
            )}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={degreeOptionsData} />
      <Pagination />
    </div>
  );
};

export default DegreeOptionsListPage;
