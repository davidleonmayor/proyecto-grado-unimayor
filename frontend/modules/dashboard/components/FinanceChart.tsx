"use client"

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import moreDarkImage from "@/public/moreDark.png";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';

const Legend = RechartsLegend as unknown as React.FC<any>;

interface FinanceChartProps {
  data?: Array<{
    name: string;
    aprobados: number;
    rechazados: number;
  }>;
  href?: string;
}

export default function FinanceChart({ data = [], href }: FinanceChartProps) {
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
    { name: 'Ene', aprobados: 0, rechazados: 0 },
    { name: 'Feb', aprobados: 0, rechazados: 0 },
    { name: 'Mar', aprobados: 0, rechazados: 0 },
    { name: 'Abr', aprobados: 0, rechazados: 0 },
    { name: 'May', aprobados: 0, rechazados: 0 },
    { name: 'Jun', aprobados: 0, rechazados: 0 },
    { name: 'Jul', aprobados: 0, rechazados: 0 },
    { name: 'Ago', aprobados: 0, rechazados: 0 },
    { name: 'Sep', aprobados: 0, rechazados: 0 },
    { name: 'Oct', aprobados: 0, rechazados: 0 },
    { name: 'Nov', aprobados: 0, rechazados: 0 },
    { name: 'Dic', aprobados: 0, rechazados: 0 },
  ];
  return (
    <div className="bg-white rounded-xl w-full h-full p-4 relative z-0">
      {/* TITLE */}
      <div className="flex justify-between items-center relative z-10">
        <h1 className="text-lg font-semibold">Gráfico</h1>

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
        <LineChart
          width={500}
          height={300}
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip />
          <Legend align="center" verticalAlign="top" wrapperStyle={{ paddingTop: '20px', paddingBottom: '40px' }} />
          <Line type="monotone" dataKey="aprobados" stroke="#0EA5E9" strokeWidth={5} />
          <Line type="monotone" dataKey="rechazados" stroke="#F44336" strokeWidth={5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
