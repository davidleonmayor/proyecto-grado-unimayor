"use client"

import Image from "next/image";
import moreDarkImage from "@/public/moreDark.png";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';

const Legend = RechartsLegend as unknown as React.FC<any>;

const data = [
    {
        name: 'Ene',
        aprobados: 4000,
        rechazados: 2400,
    },
    {
        name: 'Feb',
        aprobados: 3000,
        rechazados: 1398,
    },
    {
        name: 'Mar',
        aprobados: 2000,
        rechazados: 9800,
    },
    {
        name: 'Abr',
        aprobados: 2780,
        rechazados: 3908,
    },
    {
        name: 'May',
        aprobados: 1890,
        rechazados: 4800,
    },
    {
        name: 'Jun',
        aprobados: 2390,
        rechazados: 3800,
    },
    {
        name: 'Jul',
        aprobados: 3490,
        rechazados: 4300,
    },
    {
        name: 'Ago',
        aprobados: 3490,
        rechazados: 4300,
    },
    {
        name: 'Sep',
        aprobados: 3490,
        rechazados: 4300,
    },
    {
        name: 'Oct',
        aprobados: 3490,
        rechazados: 4300,
    },
    {
        name: 'Nov',
        aprobados: 3490,
        rechazados: 4300,
    },
    {
        name: 'Dic',
        aprobados: 3490,
        rechazados: 4300,
    },
];

export default function FinanceChart() {
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
                    data={data}
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
