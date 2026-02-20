'use client';

import { useEffect, useState } from 'react';
import CountCharts from '@/modules/dashboard/components/CountCharts';
import UserCard from '@/modules/dashboard/components/UserCard';
import ProjectStatusChart from '@/modules/dashboard/components/ProjectStatusChart';
import FinanceChart from '@/modules/dashboard/components/FinanceChart';
import EventCalendar from '@/modules/events/components/EventCalendar';
import RoleProtectedRoute from '@/shared/components/layout/RoleProtectedRoute';
import { dashboardService } from '@/modules/dashboard/services/dashboard.service';


function DeanPageContent() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Dean can use either admin stats or teacher stats depending on their role
        // Try admin first, fallback to teacher
        try {
          const data = await dashboardService.getDashboardStats();
          setStats(data);
        } catch (error) {
          // If not admin, try teacher dashboard
          const data = await dashboardService.getTeacherDashboardStats();
          setStats(data);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Check if it's admin stats or teacher stats
  const isAdminStats = stats?.stats?.profesoresActivos !== undefined;

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          {isAdminStats ? (
            <>
              <UserCard type="Total proyectos grado registrados" value={stats?.stats?.totalProjects || 0} href="/dashboard/projects" />
              <UserCard type="Proyectos en curso" value={stats?.stats?.proyectosEnCurso || 0} href="/dashboard/projects" />
              <UserCard type="Proyectos finalizados" value={stats?.stats?.proyectosFinalizados || 0} href="/dashboard/projects" />
              <UserCard type="Profesores/directores activos" value={stats?.stats?.profesoresActivos || 0} href="/list/teachers" />
            </>
          ) : (
            <>
              <UserCard type="Proyectos asignados" value={stats?.stats?.totalProjects || 0} href="/dashboard/projects" />
              <UserCard type="Proyectos en curso" value={stats?.stats?.proyectosEnCurso || 0} href="/dashboard/projects" />
              <UserCard type="Proyectos finalizados" value={stats?.stats?.proyectosFinalizados || 0} href="/dashboard/projects" />
              <UserCard type="Estudiantes asignados" value={stats?.stats?.estudiantesAsignados || 0} href="/list/students" />
            </>
          )}
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountCharts
              entregado={stats?.students?.entregado || 0}
              sinEntregar={stats?.students?.sinEntregar || 0}
              total={stats?.students?.total || 0}
              porcentajeEntregado={stats?.students?.porcentajeEntregado || 0}
              porcentajeSinEntregar={stats?.students?.porcentajeSinEntregar || 0}
              href="/list/students"
            />
          </div>
          {/* PROJECT STATUS CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <ProjectStatusChart data={stats?.weeklyChart || []} href="/dashboard/projects" />
          </div>
        </div>
        {/* BOTTOM CHARTS */}
        <div className="w-full h-[500px]">
          <FinanceChart data={stats?.monthlyChart || []} href="/dashboard/projects" />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
      </div>
    </div>
  )
}

export default function DeanPage() {
  return (
    <RoleProtectedRoute allowedRoles={['dean', 'admin']} redirectTo="/teacher">
      <DeanPageContent />
    </RoleProtectedRoute>
  );
}
