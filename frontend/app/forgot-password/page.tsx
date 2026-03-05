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
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EEF9FD' }}>
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md px-10 py-10">
                {/* Header: Logo + Title */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 flex-shrink-0">
                        <img
                            src="/logo.svg"
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-lg font-bold text-gray-900">Gestor Proyectos Grado</h1>
                </div>

                <p className="text-sm text-gray-500 mb-8">Ingresa tu correo para recuperar tu cuenta</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                            placeholder="tu@email.com"
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
                                Enviando...
                            </span>
                        ) : (
                            'Enviar Código de Recuperación'
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        ¿Recordaste tu contraseña?{' '}
                        <Link
                            href="/sign-in"
                            className="text-blue-500 font-semibold hover:text-blue-600 hover:underline transition-colors"
                        >
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
