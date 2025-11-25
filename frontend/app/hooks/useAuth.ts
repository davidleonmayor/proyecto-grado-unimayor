'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { setToken, removeToken, isAuthenticated, getUserFromToken } from '../lib/auth';

interface User {
    id_persona: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    numero_celular: string;
    num_doc_identidad: string;
}

interface UseAuthReturn {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<string>;
    confirmAccount: (token: string) => Promise<void>;
    logout: () => void;
    isAuth: boolean;
}

interface RegisterData {
    names: string;
    lastNames: string;
    typeOfDentityDocument: string;
    idDocumentNumber: string;
    phoneNumber: string;
    email: string;
    password: string;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated()) {
                try {
                    const userData = await api.getCurrentUser();
                    setUser(userData);
                } catch (err) {
                    removeToken();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Helper function to determine dashboard route based on user role
    const determineDashboardRoute = async (): Promise<string> => {
        try {
            const projects = await api.getProjects();
            
            const PRIVILEGED_ROLES = ['Director', 'Jurado', 'Coordinador de Carrera', 'Decano'];
            const hasPrivilegedRole = projects.some((project: any) =>
                PRIVILEGED_ROLES.includes(project.role)
            );

            const isStudentOnly = projects.every((project: any) =>
                project.role === 'Estudiante'
            );

            if (hasPrivilegedRole) {
                // Try admin dashboard first
                try {
                    await api.getDashboardStats();
                    return '/admin';
                } catch {
                    // If not admin, use teacher dashboard
                    return '/teacher';
                }
            } else if (isStudentOnly) {
                return '/student';
            } else {
                // Default to teacher dashboard for other roles
                return '/teacher';
            }
        } catch (error) {
            // Default fallback
            return '/teacher';
        }
    };

    // Login function
    const login = useCallback(async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);

            const token = await api.login(email, password);
            setToken(token);

            // Get user data
            const userData = await api.getCurrentUser();
            setUser(userData);

            // Determine and redirect to appropriate dashboard
            const dashboardRoute = await determineDashboardRoute();
            router.push(dashboardRoute);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Register function
    const register = useCallback(async (data: RegisterData): Promise<string> => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.register(data);
            return response; // Returns message with token
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al registrar usuario';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Confirm account function
    const confirmAccount = useCallback(async (token: string) => {
        try {
            setLoading(true);
            setError(null);

            await api.confirmAccount(token);
            router.push('/sign-in');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al confirmar cuenta';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Logout function
    const logout = useCallback(() => {
        removeToken();
        setUser(null);
        router.push('/sign-in');
    }, [router]);

    return {
        user,
        loading,
        error,
        login,
        register,
        confirmAccount,
        logout,
        isAuth: isAuthenticated(),
    };
};
