/**
 * useUserRole Hook
 * Determines user role based on their projects
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { projectsService } from '@/modules/projects/services/projects.service';

export type UserRole = 'student' | 'teacher' | 'admin' | 'dean' | null;

export const useUserRole = (): { role: UserRole; loading: boolean } => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const determineRole = async () => {
      if (authLoading) return;

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const projects = await projectsService.getProjects();

        const PRIVILEGED_ROLES = [
          'Director',
          'Jurado',
          'Coordinador de Carrera',
          'Decano',
        ];
        const hasPrivilegedRole = projects.some((project: any) =>
          PRIVILEGED_ROLES.includes(project.role)
        );

        const isStudentOnly =
          projects.length > 0 &&
          projects.every((project: any) => project.role === 'Estudiante');

        if (hasPrivilegedRole) {
          const isDean = projects.some(
            (project: any) => project.role === 'Decano'
          );

          if (isDean) {
            setRole('dean');
          } else {
            try {
              await projectsService.getDashboardStats();
              setRole('admin');
            } catch {
              setRole('teacher');
            }
          }
        } else if (isStudentOnly || projects.length === 0) {
          setRole('student');
        } else {
          setRole('student');
        }
      } catch (error) {
        console.error('Error determining role:', error);
        setRole('student');
      } finally {
        setLoading(false);
      }
    };

    determineRole();
  }, [user, authLoading]);

  return { role, loading: loading || authLoading };
};
