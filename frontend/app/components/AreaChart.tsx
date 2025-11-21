'use client';

import Image from 'next/image';
import moreDarkImage from '@/public/moreDark.png';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
} from 'recharts';

const Legend = RechartsLegend as unknown as React.FC<any>;

interface AreaChartProps {
  data: any[];
  dataKeys: { key: string; name: string; color: string }[];
  title: string;
}

export default function AreaChart({ data, dataKeys, title }: AreaChartProps) {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">{title}</h1>
        <Image src={moreDarkImage} alt="more dark image" width={20} height={20} />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <RechartsAreaChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip />
          <Legend align="center" verticalAlign="top" wrapperStyle={{ paddingTop: '20px', paddingBottom: '40px' }} />
          {dataKeys.map((item) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              stackId="1"
              stroke={item.color}
              fill={item.color}
              fillOpacity={0.6}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

