'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import Swal from 'sweetalert2';

export default function ConfirmAccount() {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { confirmAccount } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Pre-fill token from URL if available
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (token.length !== 6) {
            await Swal.fire({
                icon: 'error',
                title: 'Token Inválido',
                text: 'El token debe tener 6 caracteres',
            });
            return;
        }

        setIsLoading(true);

        try {
            await confirmAccount(token.toUpperCase());

            await Swal.fire({
                icon: 'success',
                title: '¡Cuenta Confirmada!',
                text: 'Tu cuenta ha sido confirmada exitosamente. Ahora puedes iniciar sesión.',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al confirmar cuenta',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        setToken(value);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-full mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-extrabold text-primary-600 mb-2">
                        Confirmar Cuenta
                    </h1>
                    <p className="text-gray-600">Ingresa el código de 6 dígitos que recibiste</p>
                </div>

                {/* Confirmation Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Token Input */}
                        <div>
                            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                Código de Confirmación
                            </label>
                            <input
                                id="token"
                                type="text"
                                value={token}
                                onChange={handleTokenChange}
                                required
                                maxLength={6}
                                className="w-full px-4 py-4 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none uppercase"
                                placeholder="XXXXXX"
                            />
                            <p className="mt-2 text-xs text-gray-500 text-center">
                                {token.length}/6 caracteres
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || token.length !== 6}
                            className="w-full bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Confirmando...
                                </span>
                            ) : (
                                'Confirmar Cuenta'
                            )}
                        </button>
                    </form>

                    {/* Help Text */}
                    <div className="mt-6 text-center space-y-3">
                        <p className="text-sm text-gray-600">
                            ¿No recibiste el código?{' '}
                            <Link
                                href="/forgot-password"
                                className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
                            >
                                Solicitar nuevo código
                            </Link>
                        </p>
                        <p className="text-sm text-gray-600">
                            <Link
                                href="/sign-in"
                                className="text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                            >
                                ← Volver al inicio de sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
