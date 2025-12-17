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
                    // Check if user is a dean first
                    const isDean = projects.some((project: any) =>
                        project.role === 'Decano'
                    );
                    
                    if (isDean) {
                        setRole('dean');
                    } else {
                        // For other privileged roles (Director, Jurado, Coordinador), check if they have admin access
                        // Admin access is determined by being able to access getDashboardStats
                        try {
                            await api.getDashboardStats();
                            setRole('admin');
                        } catch {
                            // If can't access admin stats, they are a teacher/director
                            setRole('teacher');
                        }
                    }
                } else if (isStudentOnly || projects.length === 0) {
                    // If student only or no projects (likely a student), assign student role
                    setRole('student');
                } else {
                    // Default to student if user is authenticated but has no clear role
                    setRole('student');
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

