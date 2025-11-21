import TableSearch from "@/app/components/TableSearch";
import Image from "next/image";
import filterImage from "@/public/filter.png";
import sortImage from "@/public/sort.png";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import { role, reportsData } from "@/app/lib/data";
import FormModal from "@/app/components/FormModal";
import FinanceChart from "@/app/components/FinanceChart";
import ProjectStatusChart from "@/app/components/ProjectStatusChart";
import PieChart from "@/app/components/PieChart";
import AreaChart from "@/app/components/AreaChart";
import CountCharts from "@/app/components/CountCharts";
import UserCard from "@/app/components/UserCard";

type Report = {
  id: number;
  titulo: string;
  tipo: string;
  fecha: string;
  generadoPor: string;
};

const columns = [
  { header: "Título", accesor: "titulo" },
  { header: "Tipo", accesor: "tipo", className: "hidden md:table-cell" },
  { header: "Fecha", accesor: "fecha", className: "hidden md:table-cell" },
  { header: "Generado por", accesor: "generadoPor", className: "hidden lg:table-cell" },
];

const ReportListPage = () => {
  const renderRow = (item: Report) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#dbdafe]"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
            <Image src={filterImage} alt="report" width={20} height={20} />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.titulo}</h3>
            <p className="text-xs text-gray-500">{item.tipo}</p>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell">
        <span className="px-2 py-1 bg-principal rounded-full text-xs font-semibold">
          {item.tipo}
        </span>
      </td>
      <td className="hidden md:table-cell">{item.fecha}</td>
      <td className="hidden lg:table-cell">{item.generadoPor}</td>
      <td>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-secondary hover:bg-hoverColor text-white rounded-lg text-xs font-semibold">
            Descargar
          </button>
          {role === "admin" && (
            <FormModal table="report" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const pieData = [
    { name: "Estadístico", value: 1, color: "#0EA5E9" },
    { name: "Análisis", value: 1, color: "#fcdf5d" },
    { name: "Operativo", value: 1, color: "#a2a1f0" },
  ];

  const areaData = [
    { name: "Ene", generados: 5, descargados: 3 },
    { name: "Feb", generados: 8, descargados: 6 },
    { name: "Mar", generados: 12, descargados: 10 },
    { name: "Abr", generados: 15, descargados: 12 },
    { name: "May", generados: 18, descargados: 15 },
    { name: "Jun", generados: 20, descargados: 18 },
  ];

  return (
    <div className="p-4 flex gap-4 flex-col">
      {/* USER CARDS */}
      <div className="flex gap-4 justify-between flex-wrap">
        <UserCard type="Total Reportes Generados" />
        <UserCard type="Reportes Este Mes" />
        <UserCard type="Descargas Totales" />
        <UserCard type="Reportes Pendientes" />
      </div>

      {/* CHARTS SECTION - ROW 1 */}
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 h-[400px]">
          <PieChart data={pieData} title="Tipos de Reportes" />
        </div>
        <div className="w-full lg:w-1/3 h-[400px]">
          <CountCharts />
        </div>
        <div className="w-full lg:w-1/3 h-[400px]">
          <AreaChart
            data={areaData}
            dataKeys={[
              { key: "generados", name: "Generados", color: "#0EA5E9" },
              { key: "descargados", name: "Descargados", color: "#10b981" },
            ]}
            title="Reportes por Mes"
          />
        </div>
      </div>

      {/* CHARTS SECTION - ROW 2 */}
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 h-[450px]">
          <ProjectStatusChart />
        </div>
        <div className="w-full lg:w-1/2 h-[450px]">
          <FinanceChart />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white p-4 rounded-md flex-1">
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Todos los reportes
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
              {(role === "admin" || role === "dean") && (
                <button className="px-4 py-2 bg-secondary hover:bg-hoverColor text-white rounded-lg text-sm font-semibold">
                  Generar Reporte
                </button>
              )}
            </div>
          </div>
        </div>
        <Table columns={columns} renderRow={renderRow} data={reportsData} />
        <Pagination />
      </div>
    </div>
  );
};

export default ReportListPage;

