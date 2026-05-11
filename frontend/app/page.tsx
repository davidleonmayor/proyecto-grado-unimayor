'use client'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { projectsService } from '@/modules/projects/services/projects.service';
import { dashboardService } from '@/modules/dashboard/services/dashboard.service';


export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isDeterminingRoute, setIsDeterminingRoute] = useState(true);

  useEffect(() => {
    if (loading) return;

    const determineRoute = async () => {
      if (!user) {
        router.push('/sign-in');
        setIsDeterminingRoute(false);
        return;
      }

      try {
        // Get user's projects to determine role
        const projects = await projectsService.getProjects();
        
        // Check if user has privileged roles
        const PRIVILEGED_ROLES = ['Director', 'Jurado', 'Coordinador de Carrera', 'Decano'];
        const hasPrivilegedRole = projects.some((project: any) =>
          PRIVILEGED_ROLES.includes(project.role)
        );

        // Check if user is a student only
        const isStudentOnly = projects.length > 0 && projects.every((project: any) =>
          project.role === 'Estudiante'
        );

        if (hasPrivilegedRole) {
          // Check if user is a dean first
          const isDean = projects.some((project: any) =>
            project.role === 'Decano'
          );
          
          const isCoordinator = projects.some((project: any) =>
            project.role === 'Coordinador de Carrera'
          );
          
          if (isDean) {
            router.push('/dean');
          } else if (isCoordinator) {
            router.push('/admin');
          } else {
            // For other privileged roles (Director, Jurado), use teacher dashboard
            router.push('/teacher');
          }
        } else if (isStudentOnly) {
          router.push('/student');
        } else {
          // If no clear role from projects, try to see if it's a teacher with no projects yet
          try {
            await dashboardService.getTeacherDashboardStats();
            router.push('/teacher');
          } catch {
            // Default to student dashboard
            router.push('/student');
          }
        }
      } catch (error) {
        console.error('Error determining route:', error);
        // Default fallback
        router.push('/teacher');
      } finally {
        setIsDeterminingRoute(false);
      }
    };

    determineRoute();
  }, [user, loading, router]);

  if (loading || isDeterminingRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return null;
}
