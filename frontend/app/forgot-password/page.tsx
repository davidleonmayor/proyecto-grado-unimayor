'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
                title: '¡Solicitud Enviada!',
                html: `
                    <div class="text-left space-y-3">
                        ${token
                        ? `<p class="text-gray-600">Se ha generado un código de recuperación para tu cuenta.</p>
                               <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                                  <p class="text-[10px] uppercase tracking-widest text-blue-500 font-bold mb-1">Tu Código</p>
                                  <p class="text-3xl font-black text-blue-700 tracking-[0.2em] font-mono">${token}</p>
                               </div>
                               <p class="text-xs text-gray-400 italic text-center">Usa este token para restablecer tu contraseña inmediatamente.</p>`
                        : `<p class="text-gray-600">Hemos enviado un correo electrónico con las instrucciones necesarias para recuperar el acceso a tu cuenta.</p>`
                    }
                    </div>
                `,
                confirmButtonText: token ? 'Restablecer ahora' : 'Entendido',
                confirmButtonColor: '#0ea5e9',
            }).then((result) => {
                if (result.isConfirmed && token) {
                    router.push(`/reset-password/${token}`);
                }
            });
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error de Solicitud',
                text: error instanceof Error ? error.message : 'No pudimos procesar tu solicitud en este momento.',
                confirmButtonColor: '#0ea5e9'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#EBF5FB]">
            <div className="bg-white rounded-xl shadow-md p-10 w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Image
                        src="/logo.svg"
                        alt="Logo Unimayor"
                        width={48}
                        height={48}
                        className="rounded"
                    />
                    <h1 className="text-xl font-bold text-gray-800">Gestor Proyectos Grado</h1>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                    Ingresa tu correo para recuperar tu cuenta
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-colors"
                            placeholder="tuemail@unimayor.edu.co"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                    >
                        {isLoading ? 'Enviando...' : 'Enviar Código de Recuperación'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    ¿Recordaste tu contraseña?{' '}
                    <Link href="/sign-in" className="text-[#0ea5e9] hover:text-[#0284c7] font-medium transition-colors">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
