"use client";

import { Pie, PieChart, ResponsiveContainer } from 'recharts';
import moreDarkImage from "@/public/moreDark.png"
import Image from 'next/image';

const data = [
    { name: 'Aprovados', value: 92, fill: "#C3EBFA" },
    { name: 'En revision', value: 8, fill: "#FAE27C" },
];

const Performance = () => {
    return (
        <div className='bg-white p-4 rounded-md h-80 relative'>
            <div className="flex items-center justify-between">
                <h1>Rendimiento</h1>
                <Image 
                    src={moreDarkImage} 
                    alt="" 
                    width={16} 
                    height={16} 
                />
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        dataKey="value"
                        startAngle={180}
                        endAngle={0}
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <h1 className='text-3xl font-bold'>9.2</h1>
            </div>
            <h2 className="font-semibold absolute bottom-16 left-0 right-0 m-auto text-center">
                Aprobados - 92% | En revisión - 8%
            </h2>
        </div>
    );
}

export default Performance;