'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { authService } from '@/modules/auth/services/auth.service';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const router = useRouter();
    const params = useParams();
    const token = params.token as string;

    const handlePasswordChange = (value: string) => {
        setPassword(value);

        // Calculate password strength
        let strength = 0;
        if (value.length >= 8) strength++;
        if (/[a-z]/.test(value)) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/[0-9]/.test(value)) strength++;
        if (/[@$!%*?&]/.test(value)) strength++;
        setPasswordStrength(strength);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden',
                confirmButtonColor: '#0ea5e9'
            });
            return;
        }

        if (passwordStrength < 4) {
            await Swal.fire({
                icon: 'error',
                title: 'Contraseña insuficiente',
                text: 'Asegúrate de cumplir con todos los requisitos de seguridad.',
                confirmButtonColor: '#0ea5e9'
            });
            return;
        }

        setIsLoading(true);

        try {
            await authService.resetPassword(token, password);

            await Swal.fire({
                icon: 'success',
                title: '¡Todo listo!',
                text: 'Tu contraseña ha sido restablecida exitosamente. Redirigiendo...',
                timer: 2500,
                showConfirmButton: false,
            });

            setTimeout(() => {
                router.push('/sign-in');
            }, 2500);
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error instanceof Error ? error.message : 'No pudimos restablecer tu contraseña.',
                confirmButtonColor: '#0ea5e9'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F8FAFC]">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-md px-6 relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 sm:p-10">
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-100 mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nueva Contraseña</h1>
                        <p className="text-sm text-gray-500 mt-2">Define una contraseña segura para proteger tu cuenta.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                                required
                                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 outline-none placeholder:text-gray-300"
                                placeholder="••••••••"
                            />
                            {password && (
                                <div className="mt-2 px-1">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Seguridad</span>
                                        <span className={`text-[10px] font-bold uppercase ${passwordStrength <= 2 ? 'text-rose-500' : passwordStrength === 3 ? 'text-amber-500' : 'text-blue-500'}`}>
                                            {passwordStrength <= 2 ? 'Baja' : passwordStrength === 3 ? 'Media' : 'Alta'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${passwordStrength <= 2 ? 'bg-rose-500' : passwordStrength === 3 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 outline-none placeholder:text-gray-300"
                                placeholder="••••••••"
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-tight ml-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Las contraseñas no coinciden
                                </p>
                            )}
                        </div>

                        {/* Checklist */}
                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Requisitos</p>
                            <ul className="grid grid-cols-1 gap-2">
                                {[
                                    { label: '8+ Caracteres', check: password.length >= 8 },
                                    { label: 'Mayúscula', check: /[A-Z]/.test(password) },
                                    { label: 'Número', check: /[0-9]/.test(password) },
                                    { label: 'Símbolo', check: /[@$!%*?&]/.test(password) }
                                ].map((req, i) => (
                                    <li key={i} className={`flex items-center gap-2 text-[11px] transition-colors ${req.check ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${req.check ? 'bg-emerald-100 border-emerald-200' : 'bg-white border-gray-200'}`}>
                                            {req.check && <svg className="w-2.5 h-2.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                                        </div>
                                        {req.label}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || password !== confirmPassword || passwordStrength < 4}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-blue-100 hover:shadow-xl hover:shadow-blue-200 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-sm active:scale-95 flex items-center justify-center gap-3 mt-4"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Restablecer Acceso'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            href="/sign-in"
                            className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
                        >
                            Cancelar y volver
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
