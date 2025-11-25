"use client"

import Image from "next/image";
import moreDarkImage from "@/public/moreDark.png";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';

const Legend = RechartsLegend as unknown as React.FC<any>;

interface FinanceChartProps {
  data?: Array<{
    name: string;
    aprobados: number;
    rechazados: number;
  }>;
}

export default function FinanceChart({ data = [] }: FinanceChartProps) {
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
        <div className="bg-white rounded-xl w-full h-full p-4">
            {/* TITLE */}
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">Grafico</h1>
                <Image src={moreDarkImage} alt="more dark image" width={20} height={20} />
            </div>
            <ResponsiveContainer width="100%" height="90%">
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
                    <XAxis dataKey="name" axisLine={false}  tickLine={false} tickMargin={10}/>
                    <YAxis axisLine={false}  tickLine={false}/>
                    <Tooltip />
                    <Legend align="center" verticalAlign="top" wrapperStyle={{ paddingTop: '20px', paddingBottom: '40px' }} />
                    <Line type="monotone" dataKey="aprobados" stroke="#0EA5E9" strokeWidth={5} />
                    <Line type="monotone" dataKey="rechazados" stroke="#F44336" strokeWidth={5}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
