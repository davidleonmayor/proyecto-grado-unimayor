import Image from "next/image";
import profileImage from "@/public/profile.png";
import mailImage from "@/public/mail.png";
import phoneImage from "@/public/phone.png";
import { role, teachersData } from "@/app/lib/data";
import UserCard from "@/app/components/UserCard";
import PieChart from "@/app/components/PieChart";

export default function ProfilePage() {
  // Simulando datos del usuario actual basado en el rol
  const currentUser = teachersData[0] || {
    nombre: "Usuario Actual",
    email: "usuario@unimayor.edu.co",
    telefono: "3001234567",
    rol: role === "admin" ? "Administrador" : role === "teacher" ? "Profesor" : role === "dean" ? "Decano" : "Estudiante",
    carrera: "Ingeniería Informática",
    img: "https://images.pexels.com/photos/2888150/pexels-photo-2888150.jpeg?auto=compress&cs=tinysrgb&w=1200",
  };

  const pieData = [
    { name: "Proyectos Dirigidos", value: 12, color: "#0EA5E9" },
    { name: "Proyectos en Revisión", value: 5, color: "#fcdf5d" },
    { name: "Proyectos Finalizados", value: 8, color: "#10b981" },
  ];

  return (
    <div className="p-4 flex gap-4 flex-col">
      {/* PROFILE HEADER */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <Image
              src={currentUser.img}
              alt={currentUser.nombre}
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
            <button className="absolute bottom-0 right-0 bg-secondary p-2 rounded-full">
              <Image src={profileImage} alt="edit" width={16} height={16} />
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">{currentUser.nombre}</h1>
            <p className="text-gray-600 mb-4">{currentUser.rol}</p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Image src={mailImage} alt="email" width={20} height={20} />
                <span className="text-sm text-gray-600">{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src={phoneImage} alt="phone" width={20} height={20} />
                <span className="text-sm text-gray-600">{currentUser.telefono}</span>
              </div>
            </div>
            {currentUser.carrera && (
              <div className="mt-4">
                <span className="px-3 py-1 bg-principal rounded-full text-sm font-semibold">
                  {currentUser.carrera}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="flex gap-4 justify-between flex-wrap">
        <UserCard type="Proyectos Dirigidos" />
        <UserCard type="Estudiantes Asignados" />
        <UserCard type="Validaciones Realizadas" />
        <UserCard type="Reportes Generados" />
      </div>

      {/* CHARTS SECTION */}
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 h-[400px]">
          <PieChart data={pieData} title="Actividad de Proyectos" />
        </div>
        <div className="w-full lg:w-1/2 h-[400px]">
          <div className="bg-white rounded-xl w-full h-full p-4">
            <h2 className="text-lg font-semibold mb-4">Información Adicional</h2>
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-principal rounded-lg">
                <h3 className="font-semibold mb-2">Biografía</h3>
                <p className="text-sm text-gray-700">
                  Profesional con experiencia en gestión de proyectos de grado y dirección académica.
                  Especializado en metodologías de investigación y desarrollo de software.
                </p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-2 text-white">Áreas de Especialización</h3>
                <ul className="text-sm text-white space-y-1">
                  <li>• Desarrollo de Software</li>
                  <li>• Metodologías Ágiles</li>
                  <li>• Investigación Aplicada</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY SECTION */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          {[
            { action: "Validó documento", target: "María Torres", date: "2025-01-15" },
            { action: "Revisó propuesta", target: "David Castillo", date: "2025-01-14" },
            { action: "Generó reporte", target: "Reporte Mensual", date: "2025-01-13" },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-semibold">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.target}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

