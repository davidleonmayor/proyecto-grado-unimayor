import TableSearch from "@/app/components/TableSearch";
import Image from "next/image";
import filterImage from "@/public/filter.png";
import sortImage from "@/public/sort.png";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import { role, resultsData } from "@/app/lib/data";
import FormModal from "@/app/components/FormModal";
import FinanceChart from "@/app/components/FinanceChart";
import PieChart from "@/app/components/PieChart";
import UserCard from "@/app/components/UserCard";

type Result = {
  id: number;
  estudiante: string;
  proyecto: string;
  nota: number;
  estado: string;
  fecha: string;
  jurado1: string;
  jurado2: string;
};

const columns = [
  { header: "Estudiante", accesor: "estudiante" },
  { header: "Proyecto", accesor: "proyecto", className: "hidden md:table-cell" },
  { header: "Nota", accesor: "nota", className: "hidden md:table-cell" },
  { header: "Estado", accesor: "estado", className: "hidden md:table-cell" },
  { header: "Fecha", accesor: "fecha", className: "hidden lg:table-cell" },
];

const ResultListPage = () => {
  const renderRow = (item: Result) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#dbdafe]"
    >
      <td className="p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.estudiante}</h3>
          <p className="text-xs text-gray-500">{item.jurado1} / {item.jurado2}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.proyecto}</td>
      <td className="hidden md:table-cell">
        <span
          className={`px-3 py-1 rounded-full text-sm font-bold ${
            item.nota >= 4.5
              ? "bg-green-100 text-green-800"
              : item.nota >= 3.5
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.nota.toFixed(1)}
        </span>
      </td>
      <td className="hidden md:table-cell">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            item.estado === "Aprobado"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.estado}
        </span>
      </td>
      <td className="hidden lg:table-cell">{item.fecha}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="result" type="update" data={item} />
              <FormModal table="result" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const pieData = [
    {
      name: "Aprobado",
      value: resultsData.filter((r) => r.estado === "Aprobado").length,
      color: "#0EA5E9",
    },
    {
      name: "Reprobado",
      value: resultsData.filter((r) => r.estado === "Reprobado").length,
      color: "#F44336",
    },
  ];

  const averageNote = resultsData.reduce((acc, r) => acc + r.nota, 0) / resultsData.length;

  return (
    <div className="p-4 flex gap-4 flex-col">
      {/* USER CARDS */}
      <div className="flex gap-4 justify-between flex-wrap">
        <UserCard type="Total Resultados" />
        <UserCard type="Aprobados" />
        <UserCard type="Reprobados" />
        <UserCard type="Promedio General" />
      </div>

      {/* CHARTS SECTION */}
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 h-[450px]">
          <PieChart data={pieData} title="Resultados por Estado" />
        </div>
        <div className="w-full lg:w-1/2 h-[450px]">
          <FinanceChart />
        </div>
      </div>

      {/* STATISTICS CARD */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Estadísticas Generales</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-principal rounded-lg">
            <p className="text-sm text-gray-600">Promedio General</p>
            <p className="text-2xl font-bold">{averageNote.toFixed(1)}</p>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <p className="text-sm text-white">Nota Máxima</p>
            <p className="text-2xl font-bold text-white">
              {Math.max(...resultsData.map((r) => r.nota)).toFixed(1)}
            </p>
          </div>
          <div className="text-center p-4 bg-tertiary rounded-lg">
            <p className="text-sm">Nota Mínima</p>
            <p className="text-2xl font-bold">
              {Math.min(...resultsData.map((r) => r.nota)).toFixed(1)}
            </p>
          </div>
          <div className="text-center p-4 bg-pastelGreen rounded-lg">
            <p className="text-sm">Tasa de Aprobación</p>
            <p className="text-2xl font-bold">
              {((resultsData.filter((r) => r.estado === "Aprobado").length / resultsData.length) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white p-4 rounded-md flex-1">
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Todos los resultados
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
              {role === "admin" && <FormModal table="result" type="create" />}
            </div>
          </div>
        </div>
        <Table columns={columns} renderRow={renderRow} data={resultsData} />
        <Pagination />
      </div>
    </div>
  );
};

export default ResultListPage;

