"use client";

import { useEffect, useState } from "react";
import CountCharts from "@/modules/dashboard/components/CountCharts";
import UserCard from "@/modules/dashboard/components/UserCard";
import ProjectStatusChart from "@/modules/dashboard/components/ProjectStatusChart";
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
        const [mainData, socialData] = await Promise.allSettled([
          dashboardService.getDashboardStats(),
          dashboardService.getSocialProjectionDashboard(),
        ]);
        if (mainData.status === "fulfilled") setStats(mainData.value);
        if (socialData.status === "fulfilled") setSocialStats(socialData.value);
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

        {/* ── ROW 1: Proyectos de Grado (igual que inicio) ── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Proyectos de Grado
          </h2>
          <div className="flex gap-4 justify-between flex-wrap">
            <UserCard
              type="Total proyectos grado registrados"
              value={stats?.stats?.totalProjects ?? 0}
              href="/projects"
              bgColor="bg-[#0ea5e9]"
            />
            <UserCard
              type="Proyectos en curso"
              value={stats?.stats?.proyectosEnCurso ?? 0}
              href="/projects"
            />
            <UserCard
              type="Proyectos finalizados"
              value={stats?.stats?.proyectosFinalizados ?? 0}
              href="/projects"
              bgColor="bg-[#0ea5e9]"
            />
            <UserCard
              type="Profesores/directores activos"
              value={stats?.stats?.profesoresActivos ?? 0}
              href="/list/teachers"
            />
          </div>
        </div>

        {/* ── ROW 2: Proyección Social ── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Proyección Social
          </h2>
          <div className="flex gap-4 justify-between flex-wrap">
            <UserCard
              type="Proyectos de proyección social"
              value={socialStats?.totalProjects ?? 0}
              href="/social-outreach/social-projects"
              bgColor="bg-[#0ea5e9]"
            />
            <UserCard
              type="Personas impactadas (total)"
              value={socialStats?.totalImpactadas ?? 0}
              href="/social-outreach/social-projects"
            />
          </div>
        </div>

        {/* ── MIDDLE CHARTS ── */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Donut: estudiantes con/sin entrega */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountCharts
              entregado={stats?.students?.entregado ?? 0}
              sinEntregar={stats?.students?.sinEntregar ?? 0}
              total={stats?.students?.total ?? 0}
              porcentajeEntregado={stats?.students?.porcentajeEntregado ?? 0}
              porcentajeSinEntregar={stats?.students?.porcentajeSinEntregar ?? 0}
              href="/list/students"
            />
          </div>
          {/* Barras: proyectos aprobados/rechazados por semana */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <ProjectStatusChart
              data={stats?.weeklyChart ?? []}
              href="/projects"
            />
          </div>
        </div>

        {/* ── IMPACT CHART ── */}
        <div className="h-[400px]">
          <ImpactBarChart
            data={socialStats?.weeklyImpact ?? []}
            href="/social-outreach/social-projects"
          />
        </div>

        {/* ── BOTTOM CHART: evolución mensual ── */}
        <div className="w-full h-[500px]">
          <FinanceChart
            data={stats?.monthlyChart ?? []}
            href="/projects"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
      </div>
    </div>
  );
}

export default function SocialOutreachPage() {
  return (
    <RoleProtectedRoute allowedRoles={["admin"]} redirectTo="/teacher">
      <SocialOutreachDashboard />
    </RoleProtectedRoute>
  );
}
