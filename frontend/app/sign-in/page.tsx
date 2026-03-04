'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/modules/auth';
import Swal from 'sweetalert2';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);

      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión correctamente',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Error al iniciar sesión',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EEF9FD' }}>
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md px-10 py-10">
        {/* Header: Logo + Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 flex-shrink-0">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Gestor Proyectos Grado</h1>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 mb-8">Inicia sesión con tu cuenta</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Usuario */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5">
              Usuario
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
              placeholder="Ingresa tu ID"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
              placeholder="Ingrese su contraseña"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
