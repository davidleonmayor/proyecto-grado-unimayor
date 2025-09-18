import CountCharts from "@/app/components/CountCharts";
import UserCard from "@/app/components/UserCard";

export default function AdminPage() {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-col">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="Total proyectos grado registrados"/>
          <UserCard type="Proyectos en curso"/>
          <UserCard type="Proyectos finalizados"/>
          <UserCard type="Profesores/directores activos"/>
        </div>
      </div>
      {/* MIDDLE CHARTS */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* COUNT CHART */}
        <div className="w-full lg:w-1/3 h-[450px]">
          <CountCharts />
        </div>
        {/* ATTENDANCE CHART */}
        <div className="w-full lg:w-2/3 h-[450px]">
        
        </div>
      </div>
      {/* BOTTOM CHARTS */}
      <div className=""></div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3">r</div>
    </div>
  )
}
