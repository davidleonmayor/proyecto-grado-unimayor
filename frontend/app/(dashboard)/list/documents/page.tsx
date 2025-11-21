import TableSearch from "@/app/components/TableSearch";
import Image from "next/image";
import filterImage from "@/public/filter.png";
import sortImage from "@/public/sort.png";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import Link from "next/link";
import viewImage from "@/public/view.png";
import uploadImage from "@/public/upload.png";
import { role, documentsData } from "@/app/lib/data";
import FormModal from "@/app/components/FormModal";
import AreaChart from "@/app/components/AreaChart";

type Document = {
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
  const renderRow = (item: Document) => (
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
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-pastelBlue">
            <Image src={viewImage} alt="" width={16} height={16} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-pastelGreen">
            <Image src={uploadImage} alt="" width={16} height={16} />
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
      {/* CHART SECTION */}
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

      {/* TABLE SECTION */}
      <div className="bg-white p-4 rounded-md flex-1">
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Todos los documentos
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
              <button className="px-4 py-2 bg-secondary hover:bg-hoverColor text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                <Image src={uploadImage} alt="" width={16} height={16} />
                <span className="hidden md:inline">Subir Documento</span>
              </button>
            </div>
          </div>
        </div>
        <Table columns={columns} renderRow={renderRow} data={documentsData} />
        <Pagination />
      </div>
    </div>
  );
};

export default DocumentListPage;

