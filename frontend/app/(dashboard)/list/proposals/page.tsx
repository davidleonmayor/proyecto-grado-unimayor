import TableSearch from "@/app/components/TableSearch";
import Image from "next/image";
import filterImage from "@/public/filter.png";
import sortImage from "@/public/sort.png";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import Link from "next/link";
import viewImage from "@/public/view.png";
import { role, proposalsData } from "@/app/lib/data";
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
          {role === "admin" && (
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

  return (
    <div className="p-4 flex gap-4 flex-col">
      {/* CHARTS SECTION */}
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

      {/* TABLE SECTION */}
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
        <Table columns={columns} renderRow={renderRow} data={proposalsData} />
        <Pagination />
      </div>
    </div>
  );
};

export default ProposalListPage;

