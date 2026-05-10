"use client";

import { useEffect, useState } from "react";
import CountCharts from "@/modules/dashboard/components/CountCharts";
import UserCard from "@/modules/dashboard/components/UserCard";
import ImpactBarChart from "@/modules/dashboard/components/ImpactBarChart";
import FinanceChart from "@/modules/dashboard/components/FinanceChart";
import EventCalendar from "@/modules/events/components/EventCalendar";
import RoleProtectedRoute from "@/shared/components/layout/RoleProtectedRoute";
import { dashboardService } from "@/modules/dashboard/services/dashboard.service";

function SocialOutreachDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [socialStats, setSocialStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [data, social] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getSocialProjectionDashboard(),
        ]);
        setStats(data);
        setSocialStats(social);
      } catch (error) {
        console.error("Error loading stats:", error);
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
          <UserCard
            type="Total proyectos de proyección social"
            value={socialStats?.totalProjects ?? stats?.stats?.totalProjects ?? 0}
            href="/social-outreach/social-projects"
            bgColor="bg-[#0ea5e9]"
          />
          <UserCard
            type="Personas impactadas (total)"
            value={socialStats?.totalImpactadas ?? 0}
            href="/social-outreach/social-projects"
          />
          <UserCard
            type="Proyectos en curso"
            value={stats?.stats?.proyectosEnCurso ?? 0}
            href="/social-outreach/social-projects"
            bgColor="bg-[#0ea5e9]"
          />
          <UserCard
            type="Profesores/directores activos"
            value={stats?.stats?.profesoresActivos ?? 0}
            href="/list/teachers"
          />
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountCharts
              entregado={socialStats?.status?.finalizados ?? 0}
              sinEntregar={socialStats?.status?.sinEntregar ?? 0}
              total={socialStats?.status?.total ?? 0}
              porcentajeEntregado={socialStats?.status?.porcentajeFinalizado ?? 0}
              porcentajeSinEntregar={socialStats?.status?.porcentajeSinEntregar ?? 0}
              href="/social-outreach/social-projects"
              title="Finalizados"
              label1="Finalizado"
              label2="Sin entregar"
            />
          </div>
          {/* IMPACT BAR CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <ImpactBarChart
              data={socialStats?.weeklyImpact ?? []}
              href="/social-outreach/social-projects"
            />
          </div>
        </div>
        {/* BOTTOM CHARTS */}
        <div className="w-full h-[500px]">
          <FinanceChart data={stats?.monthlyChart ?? []} href="/social-outreach/social-projects" />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleProtectedRoute allowedRoles={["admin"]} redirectTo="/teacher">
      <SocialOutreachDashboard />
    </RoleProtectedRoute>
  );
}
