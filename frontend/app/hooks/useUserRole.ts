'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '../lib/api';

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
                const projects = await api.getProjects();

                const PRIVILEGED_ROLES = ['Director', 'Jurado', 'Coordinador de Carrera', 'Decano'];
                const hasPrivilegedRole = projects.some((project: any) =>
                    PRIVILEGED_ROLES.includes(project.role)
                );

                const isStudentOnly = projects.length > 0 && projects.every((project: any) =>
                    project.role === 'Estudiante'
                );

                if (hasPrivilegedRole) {
                    const isDean = projects.some((project: any) =>
                        project.role === 'Decano'
                    );
                    const isCoordinator = projects.some((project: any) =>
                        project.role === 'Coordinador de Carrera'
                    );

                    if (isDean) {
                        setRole('dean');
                    } else if (isCoordinator) {
                        setRole('admin');
                    } else {
                        // For 'Director' or 'Jurado', they are just teachers
                        setRole('teacher');
                    }
                } else if (isStudentOnly) {
                    // Valid student check
                    setRole('student');
                } else {
                    // If no clear role from projects (e.g., a teacher with no projects assigned yet),
                    // try to access the teacher dashboard stats to determine if they are a teacher.
                    try {
                        await api.getTeacherDashboardStats();
                        setRole('teacher');
                    } catch {
                        // If that fails, default to student
                        setRole('student');
                    }
                }
            } catch (error) {
                console.error('Error determining role:', error);
                // On error, default to student role for authenticated users
                setRole('student');
            } finally {
                setLoading(false);
            }
        };

        determineRole();
    }, [user, authLoading]);

    return { role, loading: loading || authLoading };
};

