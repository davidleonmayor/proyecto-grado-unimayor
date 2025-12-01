'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
    const router = useRouter();

    // Common links available to all users
    const links = [
        { href: '/', label: 'Inicio', icon: '🏠' },
        { href: '/projects', label: 'Proyectos de Grado', icon: '📝' },
        { href: '/student', label: 'Panel de Estudiante', icon: '🎓' },
        { href: '/teacher', label: 'Panel de Profesor', icon: '📚' },
        { href: '/admin', label: 'Panel de Administración', icon: '📊' },
        { href: '/list/students', label: 'Estudiantes', icon: '👨‍🎓' },
        { href: '/list/teachers', label: 'Profesores', icon: '👨‍🏫' },
        { href: '/list/events', label: 'Eventos', icon: '📅' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                {/* 404 Number */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-primary-600 animate-pulse">
                        404
                    </h1>
                </div>

                {/* Message */}
                <div className="mb-12 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Página no encontrada
                    </h2>
                    <p className="text-lg text-gray-600 max-w-md mx-auto">
                        Lo sentimos, la página que estás buscando no existe o ha sido movida.
                    </p>
                </div>

                {/* Illustration */}
                <div className="mb-12 flex justify-center">
                    <div className="relative">
                        <svg
                            className="w-64 h-64 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl">🔍</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-4">
                    <p className="text-sm font-semibold text-gray-700 mb-4">
                        ¿A dónde quieres ir?
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group relative bg-white rounded-lg p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 hover:border-primary-500"
                            >
                                <div className="flex items-center justify-center sm:justify-start gap-3">
                                    <span className="text-2xl group-hover:scale-110 transition-transform">
                                        {link.icon}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                                        {link.label}
                                    </span>
                                </div>
                                <div className="absolute inset-0 rounded-lg bg-primary-500/0 group-hover:bg-primary-500/5 transition-all duration-300"></div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Volver atrás
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-primary-200 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-2xl animate-pulse delay-1000"></div>
            </div>
        </div>
    );
}

