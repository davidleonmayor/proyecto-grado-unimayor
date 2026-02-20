'use client'

import { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';
import moreDarkImage from '@/public/moreDark.png';

{/* CHAT GPT HELPS ME WITH THESE ERRORS AGAIN */ }
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend as RechartsLegend,
  ResponsiveContainer
} from 'recharts';

{/* CHAT GPT HELPS ME WITH THIS ONE TOO */ }
const Legend = RechartsLegend as unknown as React.FC<any>;

interface ProjectStatusChartProps {
  data?: Array<{
    name: string;
    aprobado: number;
    rechazado: number;
  }>;
  href?: string;
}

export default function ProjectStatusChart({ data = [], href }: ProjectStatusChartProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Use provided data or default empty data
  const chartData = data.length > 0 ? data : [
    { name: 'Semana 1', aprobado: 0, rechazado: 0 },
    { name: 'Semana 2', aprobado: 0, rechazado: 0 },
    { name: 'Semana 3', aprobado: 0, rechazado: 0 },
    { name: 'Semana 4', aprobado: 0, rechazado: 0 }
  ];
  return (
    <div className='bg-white rounded-lg p-4 h-full relative z-0'>
      <div className="flex justify-between items-center relative z-10">
        <h1 className='text-lg font-semibold'>Resumen Proyectos por Semana</h1>

        {href ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hover:opacity-75 transition-opacity cursor-pointer border-none bg-transparent flex items-center justify-center p-1 rounded-full hover:bg-black/5"
            >
              <Image src={moreDarkImage} alt="more dark image" width={20} height={20} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 overflow-hidden">
                <Link
                  href={href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-principal transition-colors w-full text-left"
                  onClick={() => setMenuOpen(false)}
                >
                  Ver listado
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Image src={moreDarkImage} alt="more dark image" width={20} height={20} />
        )}

      </div>
      <ResponsiveContainer width="100%" height="90%" className="-z-10 relative">
        <BarChart
          width={500}
          height={300}
          data={chartData}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }} />
          <Legend align="left" verticalAlign="top" wrapperStyle={{ paddingTop: '20px', paddingBottom: '40px' }} />
          <Bar
            dataKey="aprobado"
            fill="#0EA5E9"
            activeBar={<Rectangle fill="pink" stroke="blue" />}
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="rechazado"
            fill="#F44336"
            activeBar={<Rectangle fill="gold" stroke="#FACD05" />}
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
