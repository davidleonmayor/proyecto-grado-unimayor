'use client'

import { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';
import moreDarkImage from '@/public/moreDark.png';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const Legend = RechartsLegend as unknown as React.FC<any>;

interface ImpactBarChartProps {
  data?: Array<{
    name: string;
    personas_impactadas: number;
  }>;
  href?: string;
}

const COLORS = ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];

export default function ImpactBarChart({ data = [], href }: ImpactBarChartProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const chartData = data.length > 0 ? data : [
    { name: 'Semana 1', personas_impactadas: 0 },
    { name: 'Semana 2', personas_impactadas: 0 },
    { name: 'Semana 3', personas_impactadas: 0 },
    { name: 'Semana 4', personas_impactadas: 0 },
  ];

  const totalImpact = chartData.reduce((acc, d) => acc + d.personas_impactadas, 0);

  return (
    <div className='bg-white rounded-lg p-4 h-full relative z-0'>
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h1 className='text-lg font-semibold'>Impacto Por Semana</h1>
          {totalImpact > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="font-semibold text-sky-600">{totalImpact.toLocaleString()}</span> personas impactadas en 4 semanas
            </p>
          )}
        </div>

        {href ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hover:opacity-75 transition-opacity cursor-pointer border-none bg-transparent flex items-center justify-center p-1 rounded-full hover:bg-black/5"
            >
              <Image src={moreDarkImage} alt="more dark image" width={20} height={20} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 overflow-hidden">
                <Link
                  href={href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-principal transition-colors w-full text-left"
                  onClick={() => setMenuOpen(false)}
                >
                  Ver proyectos
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Image src={moreDarkImage} alt="more dark image" width={20} height={20} />
        )}
      </div>

      <ResponsiveContainer width="100%" height="85%" className="-z-10 relative">
        <BarChart
          data={chartData}
          barSize={36}
          margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            label={{ value: 'Personas', angle: -90, position: 'insideLeft', offset: 12, style: { fontSize: 11, fill: '#9ca3af' } }}
          />
          <Tooltip
            contentStyle={{ borderRadius: '10px', borderColor: '#e5e7eb', fontSize: 13 }}
            formatter={(value: number) => [`${value} personas`, 'Impactadas']}
            cursor={{ fill: '#f0f9ff' }}
          />
          <Bar
            dataKey="personas_impactadas"
            name="Personas impactadas"
            radius={[10, 10, 0, 0]}
            legendType="circle"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
