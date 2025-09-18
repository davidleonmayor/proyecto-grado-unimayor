import UserCard from "@/app/components/UserCard";

export default function AdminPage() {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="Total proyectos grado registrados"/>
          <UserCard type="Proyectos en curso"/>
          <UserCard type="Proyectos finalizados"/>
          <UserCard type="Profesores/directores activos"/>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3">r</div>
    </div>
  )
}
