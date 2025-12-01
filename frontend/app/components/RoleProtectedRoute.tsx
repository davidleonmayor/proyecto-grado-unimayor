'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole, UserRole } from '../hooks/useUserRole';
import { isAuthenticated } from '../lib/auth';

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    redirectTo?: string;
}

export default function RoleProtectedRoute({ 
    children, 
    allowedRoles,
    redirectTo = '/'
}: RoleProtectedRouteProps) {
    const router = useRouter();
    const { role, loading } = useUserRole();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            if (loading) return;

            // First check authentication
            if (!isAuthenticated()) {
                router.push('/sign-in');
                return;
            }

            // Wait for role to be determined
            if (role === null && !loading) {
                // User has no role, deny access
                setIsChecking(false);
                return;
            }

            if (role && !allowedRoles.includes(role)) {
                // User doesn't have required role, redirect
                router.push(redirectTo);
                return;
            }

            setIsChecking(false);
        };

        checkAccess();
    }, [role, loading, allowedRoles, redirectTo, router]);

    if (loading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    if (!role || !allowedRoles.includes(role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
                        <p className="text-gray-600 mb-6">
                            No tienes permisos para acceder a esta página.
                        </p>
                        <button
                            onClick={() => router.push(redirectTo)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

