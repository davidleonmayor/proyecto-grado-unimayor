'use client'
import Image from 'next/image';
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

const data = [
  {
    name: 'Semana 1',
    aprobado: 60,
    rechazado: 40,
  },
  {
    name: 'Semana 2',
    aprobado: 70,
    rechazado: 30,
  },
  {
    name: 'Semana 3',
    aprobado: 20,
    rechazado: 50,
  },
  {
    name: 'Semana 4',
    aprobado: 31,
    rechazado: 42,
  }
];

export default function ProjectStatusChart() {
  return (
    <div className='bg-white rounded-lg p-4 h-full'>
      <div className="flex justify-between items-center">
        <h1 className='text-lg font-semibold'>Resumen Proyectos por Semana</h1>
        <Image src={moreDarkImage} alt='' width={20} height={20} />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          width={500}
          height={300}
          data={data}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
          <XAxis dataKey="name"axisLine={false}  tickLine={false} />
          <YAxis axisLine={false}/>
          <Tooltip contentStyle={{borderRadius: "10px", borderColor: "lightgray"}} />
          <Legend align="left" verticalAlign="top" wrapperStyle={{ paddingTop: '20px', paddingBottom: '40px' }} />
          <Bar 
            dataKey="aprobado" 
            fill="#0EA5E9" 
            activeBar={<Rectangle fill="pink" stroke="blue" />} 
            legendType="circle"
            radius={[10,10,0,0]}
            />
          <Bar 
            dataKey="rechazado" 
            fill="#F44336" 
            activeBar={<Rectangle fill="gold" stroke="purple" />} 
            legendType="circle"
            radius={[10,10,0,0]}
            />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
