/**
 * useAuth Hook
 * Main authentication hook for managing user state
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { TokenManager } from '@/shared/lib/auth/token-manager';
import type { User, RegisterData, LoginCredentials } from '../types';

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

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (TokenManager.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          TokenManager.removeToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const determineDashboardRoute = async (): Promise<string> => {
    try {
      // Import dynamically to avoid circular dependencies
      const { projectsService } = await import('@/modules/projects/services/projects.service');
      const projects = await projectsService.getProjects();
      
      const PRIVILEGED_ROLES = ['Director', 'Jurado', 'Coordinador de Carrera', 'Decano'];
      const hasPrivilegedRole = projects.some((project: any) =>
        PRIVILEGED_ROLES.includes(project.role)
      );

      const isStudentOnly = projects.every((project: any) =>
        project.role === 'Estudiante'
      );

      if (hasPrivilegedRole) {
        try {
          await projectsService.getDashboardStats();
          return '/admin';
        } catch {
          return '/teacher';
        }
      } else if (isStudentOnly) {
        return '/student';
      } else {
        return '/teacher';
      }
    } catch (error) {
      return '/teacher';
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = await authService.login({ email, password });
      TokenManager.setToken(token);

      const userData = await authService.getCurrentUser();
      setUser(userData);

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

  const register = useCallback(async (data: RegisterData): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar usuario';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmAccount = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.confirmAccount(token);
      router.push('/sign-in');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al confirmar cuenta';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    TokenManager.removeToken();
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
    isAuth: TokenManager.isAuthenticated(),
  };
};
