/**
 * Menu Component
 * Sidebar navigation menu with role-based visibility
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useUserRole } from '@/shared/hooks/useUserRole';

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  visible: string[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuItems: MenuSection[] = [
  {
    title: 'MENÚ',
    items: [
      {
        icon: '/home.png',
        label: 'Inicio',
        href: '/',
        visible: ['admin', 'teacher', 'dean', 'student'],
      },
      {
        icon: '/teacher.png',
        label: 'Profesores',
        href: '/list/teachers',
        visible: ['admin', 'dean'],
      },
      {
        icon: '/student.png',
        label: 'Estudiantes',
        href: '/list/students',
        visible: ['admin', 'teacher', 'dean'],
      },
      {
        icon: '/project.png',
        label: 'Proyectos de Grado',
        href: '/dashboard/projects',
        visible: ['admin', 'teacher', 'dean', 'student'],
      },
      {
        icon: '/calendar.png',
        label: 'Eventos',
        href: '/list/events',
        visible: ['teacher', 'dean', 'admin'],
      },
    ],
  },

  {
    title: 'PROYECCIÓN SOCIAL',
    items: [
      {
        icon: '/calendar.png',
        label: 'Primer .xslx',
        href: '/social-outreach',
        visible: ['teacher', 'dean', 'admin'],
      },
    ],
  },

  {
    title: 'CONFIGURACIÓN',
    items: [],
  },
];

export const Menu = () => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="mt-4 text-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  const currentRole = role || 'student';

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>
          {section.items.map((item) => {
            if (item.visible.includes(currentRole)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md px-4
                                                                     transition-all duration-300 ease-in-out
                                                                     hover:bg-hoverColor hover:text-white hover:font-semibold
                                                                     hover:scale-105 hover:shadow-lg"
                >
                  <Image
                    src={item.icon}
                    alt={section.title}
                    width={20}
                    height={20}
                  />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
