'use client';

import Image from 'next/image';
import moreDarkImage from '@/public/moreDark.png';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend as RechartsLegend,
  Tooltip,
} from 'recharts';

const Legend = RechartsLegend as unknown as React.FC<any>;

interface PieChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
}

const COLORS = ['#0EA5E9', '#F44336', '#fcdf5d', '#a2a1f0', '#10b981', '#f59e0b'];

export default function PieChart({ data, title }: PieChartProps) {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">{title}</h1>
        <Image src={moreDarkImage} alt="more dark image" width={20} height={20} />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend align="center" verticalAlign="bottom" />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

