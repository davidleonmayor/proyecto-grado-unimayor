/**
 * Menu Component
 * Sidebar navigation menu with role-based visibility
 */

"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useUserRole } from '@/shared/hooks/useUserRole';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import Swal from 'sweetalert2';

interface MenuItem {
  icon: string;
  label: string;
  href?: string;
  visible: string[];
  action?: 'logout';
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuItems: MenuSection[] = [
  {
    title: "MENÚ",
    items: [
      {
        icon: "/home.png",
        label: "Inicio",
        href: "/",
        visible: ["admin", "teacher", "dean", "student"],
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
        href: "/projects",
        visible: ["admin", "teacher", "dean", "student"],
      },
      {
        icon: '/calendar.png',
        label: 'Eventos',
        href: '/list/events',
        visible: ['teacher', 'dean', 'admin'],
      },
      {
        icon: '/message.png',
        label: 'Anuncios',
        href: '/announcements',
        visible: ['admin', 'dean'],
      },
    ],
  },

  {
    title: 'PROYECCIÓN SOCIAL',
    items: [
      {
        icon: "/report.png",
        label: "Dashboard",
        href: "/social-outreach/dashboard",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/documents.png",
        label: "Proyectos",
        href: "/social-outreach/social-projects",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/calendar.png",
        label: "Extracción",
        href: "/social-outreach/extraction",
        visible: ["teacher", "admin"],
      },
      {
        icon: "/search.png",
        label: "Filtrar Proyecciones",
        href: "/social-outreach/filter",
        visible: ["teacher", "admin"],
      },
    ],
  },

  {
    title: 'CONFIGURACIÓN',
    items: [
      {
        icon: '/profile.png',
        label: 'Perfil',
        href: '/profile',
        visible: ['admin', 'teacher', 'dean', 'student'],
      },
      {
        icon: '/setting.png',
        label: 'Ajustes',
        href: '/settings',
        visible: ['admin', 'teacher', 'dean', 'student'],
      },
      {
        icon: '/logout.png',
        label: 'Cerrar Sesión',
        visible: ['admin', 'teacher', 'dean', 'student'],
        action: 'logout',
      },
    ],
  },
];

export const Menu = () => {
  const { role, loading } = useUserRole();
  const { logout } = useAuth();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0ea5e9',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      logout();
      await Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión exitosamente',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="mt-4 text-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  const currentRole = role || "student";

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((section) => {
        const hasVisibleItems = section.items.some((item) =>
          item.visible.includes(currentRole),
        );
        if (!hasVisibleItems) return null;

        return (
          <div className="flex flex-col gap-2" key={section.title}>
            <span className="hidden lg:block text-gray-400 font-light my-4">
              {section.title}
            </span>
            {section.items.map((item) => {
              if (item.visible.includes(currentRole)) {
                if (item.action === 'logout') {
                  return (
                    <button
                      key={item.label}
                      title={item.label}
                      onClick={handleLogout}
                      className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md px-4
                                                                         transition-all duration-300 ease-in-out
                                                                         hover:bg-hoverColor hover:text-white hover:font-semibold
                                                                         hover:scale-105 hover:shadow-lg w-full"
                    >
                      <Image
                        src={item.icon}
                        alt={item.label}
                        width={22}
                        height={22}
                        className="shrink-0"
                      />
                      <span className="hidden lg:block truncate">{item.label}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    href={item.href!}
                    key={item.label}
                    title={item.label}
                    className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md px-4
                                                                       transition-all duration-300 ease-in-out
                                                                       hover:bg-hoverColor hover:text-white hover:font-semibold
                                                                       hover:scale-105 hover:shadow-lg"
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={22}
                      height={22}
                      className="shrink-0"
                    />
                    <span className="hidden lg:block truncate">{item.label}</span>
                  </Link>
                );
              }
              return null;
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Menu;
