'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '../lib/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = () => {
            if (!isAuthenticated()) {
                // Store the intended destination
                const returnUrl = encodeURIComponent(pathname);
                router.push(`/sign-in?returnUrl=${returnUrl}`);
            } else {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router, pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
