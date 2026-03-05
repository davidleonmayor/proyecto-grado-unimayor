'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import Swal from 'sweetalert2';

import { Suspense } from 'react';

function ConfirmAccountContent() {
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

                <p className="text-sm text-gray-500 mb-8">Ingresa el código de 6 dígitos que recibiste</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Token Input */}
                    <div>
                        <label htmlFor="token" className="block text-xs font-medium text-gray-600 mb-1.5">
                            Código de Confirmación
                        </label>
                        <input
                            id="token"
                            type="text"
                            value={token}
                            onChange={handleTokenChange}
                            required
                            maxLength={6}
                            className="w-full px-4 py-2.5 text-center text-xl font-bold tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none uppercase"
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
                        className="w-full bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                    <p className="text-xs text-gray-500">
                        ¿No recibiste el código?{' '}
                        <Link
                            href="/forgot-password"
                            className="text-blue-500 font-semibold hover:text-blue-600 hover:underline transition-colors"
                        >
                            Solicitar nuevo código
                        </Link>
                    </p>
                    <p className="text-xs text-gray-500">
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
    );
}

export default function ConfirmAccount() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Cargando...</div>}>
            <ConfirmAccountContent />
        </Suspense>
    );
}
