'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';
import CountCharts from "./components/CountCharts";
import UserCard from "./components/UserCard";
import ProjectStatusChart from "./components/ProjectStatusChart";
import FinanceChart from "./components/FinanceChart";
import { EventCalendar } from "./components/EventCalendar";
import Announcement from "./components/Announcement";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/register');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'teacher') {
        router.push('/teacher');
      } else if (user.role === 'dean') {
        router.push('/dean');
      } else if (user.role === 'student') {
        router.push('/student');
      }
    }
  }, [user, router]);

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="Total proyectos grado registrados" />
          <UserCard type="Proyectos en curso" />
          <UserCard type="Proyectos finalizados" />
          <UserCard type="Profesores/directores activos" />
        </div>
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountCharts />
          </div>
          <div className="w-full lg:w-2/3 h-[450px]">
            <ProjectStatusChart />
          </div>
        </div>
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcement />
      </div>
    </div>
  );
}
