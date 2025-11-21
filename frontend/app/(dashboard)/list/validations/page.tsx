import TableSearch from "@/app/components/TableSearch";
import Image from "next/image";
import filterImage from "@/public/filter.png";
import sortImage from "@/public/sort.png";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import { role, validationsData } from "@/app/lib/data";
import FormModal from "@/app/components/FormModal";
import PieChart from "@/app/components/PieChart";
import ProjectStatusChart from "@/app/components/ProjectStatusChart";

type Validation = {
  id: number;
  estudiante: string;
  documento: string;
  validador: string;
  estado: string;
  fecha: string;
  observaciones: string;
};

const columns = [
  { header: "Estudiante", accesor: "estudiante" },
  { header: "Documento", accesor: "documento", className: "hidden md:table-cell" },
  { header: "Validador", accesor: "validador", className: "hidden md:table-cell" },
  { header: "Estado", accesor: "estado", className: "hidden md:table-cell" },
  { header: "Fecha", accesor: "fecha", className: "hidden lg:table-cell" },
];

const ValidationListPage = () => {
  const renderRow = (item: Validation) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#dbdafe]"
    >
      <td className="p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.estudiante}</h3>
          <p className="text-xs text-gray-500">{item.observaciones}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.documento}</td>
      <td className="hidden md:table-cell">{item.validador}</td>
      <td className="hidden md:table-cell">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            item.estado === "Aprobado"
              ? "bg-green-100 text-green-800"
              : item.estado === "En revisión"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.estado}
        </span>
      </td>
      <td className="hidden lg:table-cell">{item.fecha}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" || role === "teacher" || role === "dean" ? (
            <>
              <FormModal table="validation" type="update" data={item} />
              <FormModal table="validation" type="delete" id={item.id} />
            </>
          ) : null}
        </div>
      </td>
    </tr>
  );

  const pieData = [
    {
      name: "Aprobado",
      value: validationsData.filter((v) => v.estado === "Aprobado").length,
      color: "#0EA5E9",
    },
    {
      name: "En revisión",
      value: validationsData.filter((v) => v.estado === "En revisión").length,
      color: "#fcdf5d",
    },
    {
      name: "Rechazado",
      value: validationsData.filter((v) => v.estado === "Rechazado").length,
      color: "#F44336",
    },
  ];

  return (
    <div className="p-4 flex gap-4 flex-col">
      {/* CHARTS SECTION */}
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 h-[450px]">
          <PieChart data={pieData} title="Estado de Validaciones" />
        </div>
        <div className="w-full lg:w-1/2 h-[450px]">
          <ProjectStatusChart />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white p-4 rounded-md flex-1">
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Todas las validaciones
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
              {(role === "admin" || role === "teacher" || role === "dean") && (
                <FormModal table="validation" type="create" />
              )}
            </div>
          </div>
        </div>
        <Table columns={columns} renderRow={renderRow} data={validationsData} />
        <Pagination />
      </div>
    </div>
  );
};

export default ValidationListPage;

