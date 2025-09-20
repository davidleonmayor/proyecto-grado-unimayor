import Image from "next/image";
import Link from "next/link";
import { role } from "../lib/data";

const menuItems = [
  {
    title: "MENÚ",
    items: [
      {
        icon: "/home.png",
        label: "Inicio",
        href: "/",
        visible: ["admin", "teacher", "dean"],
      },
      {
        icon: "/teacher.png",
        label: "Profesores",
        href: "/list/teachers",
        visible: ["admin", "dean"],
      },
      {
        icon: "/student.png",
        label: "Estudiantes",
        href: "/list/students",
        visible: ["admin", "teacher", "dean"],
      },
      {
        icon: "/project.png",
        label: "Proyectos de Grado",
        href: "/list/projects",
        visible: ["admin", "teacher", "dean"],
      },
      {
        icon: "/assignment.png",
        label: "Propuestas",
        href: "/list/proposals",
        visible: ["student", "teacher", "dean", "admin"],
      },
      {
        icon: "/documents.png",
        label: "Documentos",
        href: "/list/documents",
        visible: ["student", "teacher", "dean", "admin"],
      },
      {
        icon: "/validation.png",
        label: "Validaciones",
        href: "/list/validations",
        visible: ["teacher", "dean", "admin"],
      },
      {
        icon: "/result.png",
        label: "Resultados",
        href: "/list/results",
        visible: ["student", "teacher", "dean", "admin"],
      },
      {
        icon: "/calendar.png",
        label: "Eventos",
        href: "/list/events",
        visible: ["student", "teacher", "dean", "admin"],
      },
      {
        icon: "/report.png",
        label: "Reportes",
        href: "/list/reports",
        visible: ["dean", "admin"],
      },
    ],
  },
  {
    title: "CONFIGURACIÓN",
    items: [
      {
        icon: "/profile.png",
        label: "Perfil",
        href: "/profile",
        visible: ["admin", "teacher", "dean", "student"],
      },
      {
        icon: "/setting.png",
        label: "Ajustes",
        href: "/settings",
        visible: ["admin"],
      },
      {
        icon: "/logout.png",
        label: "Cerrar sesión",
        href: "/logout",
        visible: ["admin", "teacher", "dean", "student"],
      },
    ],
  },
];



export default function Menu() {
  return (
    <div className="mt-4 text-sm">
      {menuItems.map(i => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">{i.title}</span>
          {i.items.map(item => {
            if (item.visible.includes(role)) {
              return (
                (
                  <Link href={item.href} key={item.label} className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md px-4 
                                                                     transition-all duration-300 ease-in-out
                                                                     hover:bg-hoverColor hover:text-white hover:font-semibold 
                                                                     hover:scale-105 hover:shadow-lg">
                    <Image src={item.icon} alt={i.title} width={20} height={20} />
                    <span className="hidden lg:block">{item.label}</span>
                  </Link>
                )
              )
            }
          })}
        </div>
      ))}
    </div>
  )
}
