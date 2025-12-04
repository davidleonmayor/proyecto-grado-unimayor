'use client';

import { useEffect, useState } from 'react';
import CountCharts from "@/app/components/CountCharts";
import UserCard from "@/app/components/UserCard";
import ProjectStatusChart from "@/app/components/ProjectStatusChart";
import FinanceChart from "@/app/components/FinanceChart";
import { EventCalendar } from "@/app/components/EventCalendar";
import api from "@/app/lib/api";

export default function TeacherPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getTeacherDashboardStats();
        setStats(data);
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

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="Proyectos asignados" value={stats?.stats?.totalProjects || 0} />
          <UserCard type="Proyectos en curso" value={stats?.stats?.proyectosEnCurso || 0} />
          <UserCard type="Proyectos finalizados" value={stats?.stats?.proyectosFinalizados || 0} />
          <UserCard type="Estudiantes asignados" value={stats?.stats?.estudiantesAsignados || 0} />
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
            />
          </div>
          {/* PROJECT STATUS CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <ProjectStatusChart data={stats?.weeklyChart || []} />
          </div>
        </div>
        {/* BOTTOM CHARTS */}
        <div className="w-full h-[500px]">
          <FinanceChart data={stats?.monthlyChart || []} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
      </div>
    </div>
  )
}
