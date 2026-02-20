'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Swal from 'sweetalert2';
import { authService } from '@/modules/auth/services/auth.service';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authService.forgotPassword(email);

            // Extract token from response if available
            const tokenMatch = response.match(/Token:\s*([A-Z0-9]{6})/);
            const token = tokenMatch ? tokenMatch[1] : '';

            await Swal.fire({
                icon: 'success',
                title: 'Solicitud Enviada',
                html: token
                    ? `<p>Se ha generado un código de recuperación.</p><p class="mt-2 font-bold">Token: ${token}</p><p class="mt-2 text-sm">Usa este token para restablecer tu contraseña.</p>`
                    : '<p>Se ha enviado un correo con instrucciones para restablecer tu contraseña.</p>',
                confirmButtonText: 'Ir a restablecer contraseña',
            }).then((result) => {
                if (result.isConfirmed && token) {
                    router.push(`/reset-password/${token}`);
                }
            });
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al solicitar recuperación de contraseña',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Logo Space */}
            <div className="hidden lg:flex lg:w-2/3 bg-secondary-500 relative overflow-hidden">
                {/* Decorative shapes */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                </div>
                
                {/* Content Container */}
                <div className="relative z-10 flex flex-col justify-between w-full p-12">
                    {/* Top Section */}
                    <div>
                        <div className="mb-8">
                        </div>
                    </div>


                    {/* Bottom Section */}
                    <div className="text-white">
                        <h2 className="text-3xl font-bold mb-2">Gestión de Proyectos</h2>
                        <p className="text-lg opacity-90">Universidad Mayor del Cauca</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Forgot Password Form */}
            <div className="w-full lg:w-1/3 bg-white flex flex-col">
                <div className="flex-1 flex flex-col justify-center px-8 py-12">
                    {/* Top Right - Sign In Link */}
                    <div className="text-right mb-8">
                        <p className="text-sm text-gray-600">
                            ¿Recordaste tu contraseña?{' '}
                            <Link
                                href="/sign-in"
                                className="text-secondary-600 font-semibold hover:text-secondary-700 hover:underline transition-colors"
                            >
                                Inicia sesión
                            </Link>
                        </p>
                    </div>

                    {/* Form Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Recuperar Contraseña
                        </h1>
                        <p className="text-gray-600">Ingresa tu correo electrónico para recuperar tu cuenta</p>
                    </div>

                    {/* Forgot Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all duration-200 outline-none"
                                placeholder="tu@email.com"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-secondary-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enviando...
                                </span>
                            ) : (
                                'Enviar Código de Recuperación'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        Todos los derechos reservados © Universidad Mayor del Cauca
                    </p>
                </div>
            </div>
        </div>
    );
}
