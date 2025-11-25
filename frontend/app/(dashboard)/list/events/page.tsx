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
import { calendarEvents } from "@/app/lib/data";
import FormModal from "@/app/components/FormModal";
import RoleProtectedRoute from "@/app/components/RoleProtectedRoute";
import { useUserRole } from "@/app/hooks/useUserRole";

const columns = [
  { header: "Evento", accesor: "title" },
  { header: "Fecha", accesor: "fecha", className: "hidden md:table-cell" },
  { header: "Hora inicio", accesor: "horaInicio", className: "hidden md:table-cell" },
  { header: "Hora fin", accesor: "horaFin", className: "hidden md:table-cell" },
];

const EventListPageContent = () => {
  const { role } = useUserRole();

  const renderRow = (item: any) => {
    const startDate = new Date(item.start);
    const endDate = new Date(item.end);

    return (
      <tr
        key={item.title}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#dbdafe]"
      >
        <td className="p-4">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-xs text-gray-500">
            {item.allDay ? "Todo el día" : "Evento programado"}
          </p>
        </td>
        <td className="hidden md:table-cell">
          {startDate.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </td>
        <td className="hidden md:table-cell">
          {startDate.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>
        <td className="hidden md:table-cell">
          {endDate.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>
        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal table="event" type="update" data={item} />
                <FormModal table="event" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold ">
          Todos los eventos
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
            {role === "admin" && (
              <FormModal table="event" type="create" />
            )}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={calendarEvents} />
      <Pagination />
    </div>
  );
};

const EventListPage = () => {
  return (
    <RoleProtectedRoute allowedRoles={['admin', 'teacher', 'dean']}>
      <EventListPageContent />
    </RoleProtectedRoute>
  );
};

export default EventListPage;
