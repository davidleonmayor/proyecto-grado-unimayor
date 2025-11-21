'use client';

import { useState } from 'react';
import Image from "next/image";
import settingImage from "@/public/setting.png";
import UserCard from "@/app/components/UserCard";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'es',
    timezone: 'America/Bogota',
  });

  return (
    <div className="p-4 flex gap-4 flex-col">
      {/* HEADER */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center gap-4">
          <Image src={settingImage} alt="settings" width={32} height={32} />
          <div>
            <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
            <p className="text-gray-600">Gestiona las preferencias y configuraciones de la plataforma</p>
          </div>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="flex gap-4 justify-between flex-wrap">
        <UserCard type="Usuarios Activos" />
        <UserCard type="Configuraciones Aplicadas" />
        <UserCard type="Cambios Recientes" />
        <UserCard type="Backups Realizados" />
      </div>

      {/* SETTINGS SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* NOTIFICATIONS */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Notificaciones</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">Notificaciones por Email</p>
                <p className="text-sm text-gray-500">Recibe actualizaciones por correo electrónico</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-principal rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">Notificaciones Push</p>
                <p className="text-sm text-gray-500">Recibe notificaciones en tiempo real</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-principal rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">Notificaciones SMS</p>
                <p className="text-sm text-gray-500">Recibe alertas por mensaje de texto</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-principal rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* PREFERENCES */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Preferencias</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block font-semibold mb-2">Tema</label>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-principal"
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block font-semibold mb-2">Idioma</label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-principal"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block font-semibold mb-2">Zona Horaria</label>
              <select
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-principal"
              >
                <option value="America/Bogota">Bogotá (GMT-5)</option>
                <option value="America/New_York">New York (GMT-5)</option>
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SYSTEM SETTINGS */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Configuración del Sistema</h2>
          <div className="space-y-4">
            <div className="p-4 bg-principal rounded-lg">
              <h3 className="font-semibold mb-2">Versión del Sistema</h3>
              <p className="text-sm">v1.0.0</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <h3 className="font-semibold mb-2 text-white">Última Actualización</h3>
              <p className="text-sm text-white">2025-01-15</p>
            </div>
            <div className="p-4 bg-tertiary rounded-lg">
              <h3 className="font-semibold mb-2">Estado del Servidor</h3>
              <p className="text-sm">Operativo</p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Acciones</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-secondary hover:bg-hoverColor text-white rounded-lg font-semibold transition-all">
              Guardar Cambios
            </button>
            <button className="w-full px-4 py-3 bg-principal hover:bg-principalDark rounded-lg font-semibold transition-all">
              Restaurar Valores por Defecto
            </button>
            <button className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all">
              Exportar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

