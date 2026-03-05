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

        // Validate passwords match
        if (password !== confirmPassword) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden',
            });
            return;
        }

        // Validate password strength
        if (passwordStrength < 4) {
            await Swal.fire({
                icon: 'error',
                title: 'Contraseña débil',
                text: 'La contraseña debe contener al menos 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales',
            });
            return;
        }

        setIsLoading(true);

        try {
            await authService.resetPassword(token, password);

            await Swal.fire({
                icon: 'success',
                title: '¡Contraseña Restablecida!',
                text: 'Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión.',
                timer: 2000,
                showConfirmButton: false,
            });

            setTimeout(() => {
                router.push('/sign-in');
            }, 2000);
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al restablecer contraseña',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength === 3) return 'bg-yellow-500';
        if (passwordStrength === 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 2) return 'Débil';
        if (passwordStrength === 3) return 'Media';
        if (passwordStrength === 4) return 'Buena';
        return 'Excelente';
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

                <p className="text-sm text-gray-500 mb-8">Ingresa tu nueva contraseña</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5">
                            Nueva Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                            placeholder="••••••••"
                        />
                        {password && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-gray-600">Fortaleza:</span>
                                    <span className={`text-[10px] font-semibold ${passwordStrength <= 2 ? 'text-red-500' : passwordStrength === 3 ? 'text-yellow-500' : passwordStrength === 4 ? 'text-blue-500' : 'text-green-500'}`}>
                                        {getPasswordStrengthText()}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-600 mb-1.5">
                            Confirmar Contraseña
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                            placeholder="••••••••"
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden</p>
                        )}
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-[11px] font-semibold text-gray-600 mb-2">La contraseña debe contener:</p>
                        <ul className="text-[11px] text-gray-500 space-y-1">
                            <li className={password.length >= 8 ? 'text-green-600 font-medium' : ''}>
                                ✓ Al menos 8 caracteres
                            </li>
                            <li className={/[a-z]/.test(password) ? 'text-green-600 font-medium' : ''}>
                                ✓ Una letra minúscula
                            </li>
                            <li className={/[A-Z]/.test(password) ? 'text-green-600 font-medium' : ''}>
                                ✓ Una letra mayúscula
                            </li>
                            <li className={/[0-9]/.test(password) ? 'text-green-600 font-medium' : ''}>
                                ✓ Un número
                            </li>
                            <li className={/[@$!%*?&]/.test(password) ? 'text-green-600 font-medium' : ''}>
                                ✓ Un carácter especial (@$!%*?&)
                            </li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || password !== confirmPassword || passwordStrength < 4}
                        className="w-full bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Restableciendo...
                            </span>
                        ) : (
                            'Restablecer Contraseña'
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        <Link
                            href="/sign-in"
                            className="text-gray-500 hover:text-gray-700 hover:underline transition-colors inline-flex items-center"
                        >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver al inicio de sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
