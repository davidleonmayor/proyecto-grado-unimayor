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
import { role, studentsData } from "@/app/lib/data";

type Student = {
  id: number;
  nombre: string;
  email: string;
  photo: string;
  carrera: string;
  opcionGrado: string;
  estado: string;
};

const columns = [
  { header: "Info", accesor: "info" },
  { header: "Carrera", accesor: "carrera", className: "hidden md:table-cell" },
  { header: "Opción de Grado", accesor: "opcionGrado", className: "hidden md:table-cell" },
  { header: "Estado", accesor: "estado", className: "hidden md:table-cell" },
];

const StudentListPage = () => {
  const renderRow = (item: Student) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#dbdafe]"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.photo}
          alt={item.nombre}
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.nombre}</h3>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.carrera}</td>
      <td className="hidden md:table-cell">{item.opcionGrado}</td>
      <td className="hidden md:table-cell">{item.estado}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#EAFBFD]">
              <Image src={viewImage} alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#EEEFFB]">
              <Image src={deleteImage} alt="" width={16} height={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold ">
          Todos los estudiantes
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-principal">
              <Image src={filterImage} alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-principal">
              <Image src={sortImage} alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-principal">
              <Image src={plusImage} alt="" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={studentsData} />
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default StudentListPage;
