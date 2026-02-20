/**
 * Navbar Component
 * Top navigation bar with user info and actions
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import searchImage from '@/public/search.png';
import messageImage from '@/public/message.png';
import announcementImage from '@/public/announcement.png';
import avatarImage from '@/public/avatar.png';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import Swal from 'sweetalert2';

export const Navbar = () => {
  const { user, logout } = useAuth();

  // States for dropdowns
  const [showMenu, setShowMenu] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  // Refs for click-outside handles
  const menuRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const announcementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setShowMessages(false);
      }
      if (announcementsRef.current && !announcementsRef.current.contains(event.target as Node)) {
        setShowAnnouncements(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
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

  return (
    <div className="flex items-center justify-between p-4 relative z-[100]">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image
          src={searchImage}
          alt="search image"
          width={14} height={14}
        />

        <input
          type="text"
          placeholder="Buscar..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full relative z-50">

        {/* Messages Dropdown */}
        <div className="relative" ref={messagesRef}>
          <div
            className={`bg-white rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-colors ${showMessages ? 'bg-primary-50 ring-2 ring-primary-100' : 'hover:bg-gray-50 ring-1 ring-gray-100'}`}
            onClick={() => {
              setShowMessages(!showMessages);
              setShowAnnouncements(false);
              setShowMenu(false);
            }}
          >
            <Image src={messageImage} alt="message image" width={20} height={20} className="opacity-70" />
          </div>

          {/* Dropdown Box for Messages */}
          {showMessages && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 z-50 border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-[15px] font-semibold text-gray-800">Mensajes</h3>
                <span className="text-[11px] font-medium text-primary-600 cursor-pointer hover:underline">Nuevo mensaje</span>
              </div>
              <div className="px-5 py-10 flex flex-col items-center justify-center text-center bg-white">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-[14px] font-medium text-gray-800">Bandeja de entrada vacía</p>
                <p className="text-[12px] text-gray-400 mt-1.5 leading-relaxed font-light">No tienes mensajes nuevos en<br />este momento.</p>
              </div>
            </div>
          )}
        </div>

        {/* Announcements Dropdown */}
        <div className="relative" ref={announcementsRef}>
          <div
            className={`bg-white rounded-full w-9 h-9 flex items-center justify-center cursor-pointer relative transition-colors ${showAnnouncements ? 'bg-primary-50 ring-2 ring-primary-100' : 'hover:bg-gray-50 ring-1 ring-gray-100'}`}
            onClick={() => {
              setShowAnnouncements(!showAnnouncements);
              setShowMessages(false);
              setShowMenu(false);
            }}
          >
            <Image src={announcementImage} alt="announcement image" width={20} height={20} className="opacity-70" />
            <div className="absolute -top-1.5 -right-1 w-5 h-5 flex items-center justify-center bg-amber-500 text-white rounded-full text-[10px] font-bold shadow-sm ring-2 ring-white">1</div>
          </div>

          {/* Dropdown Box for Announcements */}
          {showAnnouncements && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-0 z-50 border border-gray-100 overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-[15px] font-semibold text-gray-800">Notificaciones</h3>
                <span className="text-[11px] font-medium text-gray-400 cursor-pointer hover:text-gray-700 transition-colors">Marcar como leídas</span>
              </div>

              <div className="flex flex-col max-h-[320px] overflow-y-auto">
                {/* Unread notification item */}
                <div className="px-5 py-4 cursor-pointer border-l-[3px] border-amber-400 bg-amber-50/30 hover:bg-amber-50/60 transition-colors">
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <h4 className="text-[13px] font-medium text-gray-800 leading-snug">Actualización de Listados</h4>
                    <span className="text-[10px] font-medium text-amber-600 whitespace-nowrap bg-amber-100/50 px-1.5 py-0.5 rounded">Nuevo</span>
                  </div>
                  <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed font-light">Hemos implementado mejoras visuales en todas las tablas de proyectos. Ahora puedes gestionar...</p>
                  <span className="text-[10px] text-gray-400 mt-2 block font-light">Hace 2 horas</span>
                </div>

                {/* Read notification item (static example) */}
                <div className="px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer border-l-[3px] border-transparent border-t border-gray-50">
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="text-[13px] font-medium text-gray-700 leading-snug">Bienvenido al nuevo sistema</h4>
                  </div>
                  <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed font-light">Gracias por conectarte a la nueva plataforma de administración de proyectos de la Universidad Mayor...</p>
                  <span className="text-[10px] text-gray-400 mt-2 block font-light">Hace 3 días</span>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-gray-50 text-center bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors mt-auto">
                <span className="text-[12px] font-medium text-primary-600">Ver todas las notificaciones</span>
              </div>
            </div>
          )}
        </div>

        {/* User Info with Dropdown */}
        <div className="relative" ref={menuRef}>
          <div
            className="flex items-center gap-2 cursor-pointer rounded-full hover:bg-gray-50 py-1 px-2 -mr-2 transition-colors"
            onClick={() => {
              setShowMenu(!showMenu);
              setShowMessages(false);
              setShowAnnouncements(false);
            }}
          >
            <div className="flex flex-col">
              <span className="text-xs leading-3 font-medium text-gray-800">
                {user ? `${user.nombres} ${user.apellidos}` : 'Cargando...'}
              </span>
              <span className="text-[10px] text-gray-500 text-right mt-1 font-light">
                {user?.correo_electronico || 'Usuario'}
              </span>
            </div>
            <Image
              src={avatarImage}
              alt="Avatar image"
              width={34}
              height={34}
              className="rounded-full ring-2 ring-white shadow-sm"
            />
          </div>

          {/* Dropdown Menu User */}
          {showMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 z-50 border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Sesión Actual</p>
                <p className="text-[13px] font-medium text-gray-800 truncate">{user?.correo_electronico}</p>
                <p className="text-[12px] text-gray-500 capitalize mt-0.5">{(user as any)?.rol}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar;
