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
                customClass: {
                    container: 'rounded-3xl',
                    popup: 'rounded-2xl',
                    confirmButton: 'rounded-xl px-8 py-3'
                }
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
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F8FAFC]">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-md px-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 sm:p-10">
                    
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200 mb-6 group transition-transform hover:scale-110 duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">¿Olvidaste tu acceso?</h1>
                        <p className="text-sm text-gray-500 mt-2">No te preocupes, te ayudaremos a recuperar tu cuenta en pocos pasos.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">
                                Correo Electrónico
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 outline-none placeholder:text-gray-300"
                                    placeholder="nombre@universidad.edu.co"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-4 rounded-2xl hover:shadow-xl hover:shadow-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Enviar Código de Recuperación</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Actions */}
                    <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                        <Link
                            href="/sign-in"
                            className="group text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </div>

                {/* System Info */}
                <p className="text-center mt-8 text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">
                    UniMayor · Graduation Project Manager
                </p>
            </div>
        </div>
    );
}
