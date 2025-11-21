'use client';

import Image from 'next/image';
import checkImage from "@/public/check.png";
import {
  RadialBarChart as RechartsRadialBarChart,
  RadialBar as RechartsRadialBar,
  Legend as RechartsLegend,
  ResponsiveContainer,
} from 'recharts';
import type { RadialBarProps, LegendProps } from 'recharts';
import moreDarkImage from "@/public/moreDark.png";

const RadialBarChart = RechartsRadialBarChart as unknown as React.FC<any>;
const RadialBar = RechartsRadialBar as unknown as React.FC<RadialBarProps>;
const Legend = RechartsLegend as unknown as React.FC<any>;


const data = [
  {
    name: 'Total',
    count: 100,
    fill: 'white',
  },
  {
    name: 'Sin entregar',
    count: 45,
    fill: '#a2a1f0',
  },
  {
    name: 'Entregado',
    count: 55,
    fill: '#fcdf5d',
  },
];


export default function CountCharts() {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Estudiantes</h1>
        <Image src={moreDarkImage} alt="more dark image" width={20} height={20} />
      </div>

      <div className="relative w-full h-[75%]">
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

      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-principal rounded-full" />
          <h1 className="font-bold">1,234</h1>
          <h2 className="text-xs text-gray-500">Entregado (55%)</h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-tertiary rounded-full" />
          <h1 className="font-bold">1,234</h1>
          <h2 className="text-xs text-gray-500">Sin entregar (45%)</h2>
        </div>
      </div>
    </div>
  );
}