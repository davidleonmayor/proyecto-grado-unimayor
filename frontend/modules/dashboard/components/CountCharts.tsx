'use client';

import { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';
import checkImage from "@/public/check.png";
import moreDarkImage from "@/public/moreDark.png";

{/*Chatgpt helps me with this fck sht*/ }
import {
  RadialBarChart as RechartsRadialBarChart,
  RadialBar as RechartsRadialBar,
  Legend as RechartsLegend,
  ResponsiveContainer,
} from 'recharts';
import type { RadialBarProps, LegendProps } from 'recharts';

{/*Chatgpt helps me with this fck sht too*/ }
const RadialBarChart = RechartsRadialBarChart as unknown as React.FC<any>;
const RadialBar = RechartsRadialBar as unknown as React.FC<RadialBarProps>;
const Legend = RechartsLegend as unknown as React.FC<any>;

interface CountChartsProps {
  entregado: number;
  sinEntregar: number;
  total: number;
  porcentajeEntregado: number;
  porcentajeSinEntregar: number;
  href?: string;
}

export default function CountCharts({
  entregado = 0,
  sinEntregar = 0,
  total = 0,
  porcentajeEntregado = 0,
  porcentajeSinEntregar = 0,
  href
}: CountChartsProps) {
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO').format(num);
  };

  const data = total > 0 ? [
    {
      name: 'Total',
      count: 100,
      fill: 'white',
    },
    {
      name: 'Sin entregar',
      count: porcentajeSinEntregar,
      fill: '#a2a1f0',
    },
    {
      name: 'Entregado',
      count: porcentajeEntregado,
      fill: '#fcdf5d',
    },
  ] : [
    {
      name: 'Total',
      count: 100,
      fill: 'white',
    },
  ];
  return (
    <div className="bg-white rounded-xl w-full h-full p-4 relative z-0">
      {/* TITLE */}
      <div className="flex justify-between items-center relative z-10">
        <h1 className="text-lg font-semibold">Estudiantes</h1>

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

      {/* CHARTS */}
      <div className="relative w-full h-[75%] -z-10">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={32}
            data={data}
          >
            <RadialBar
              background
              dataKey="count"
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <Image
          src={checkImage}
          alt='image'
          width={100}
          height={100}
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        />
      </div>

      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-principal rounded-full" />
          <h1 className="font-bold">{formatNumber(entregado)}</h1>
          <h2 className="text-xs text-gray-500">Entregado ({porcentajeEntregado}%)</h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-tertiary rounded-full" />
          <h1 className="font-bold">{formatNumber(sinEntregar)}</h1>
          <h2 className="text-xs text-gray-500">Sin entregar ({porcentajeSinEntregar}%)</h2>
        </div>
      </div>
    </div>
  );
}