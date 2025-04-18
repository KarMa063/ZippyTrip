
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Sample data
const initialData = [
  {
    name: "Jan",
    stays: 4000,
    flights: 2900,
    attractions: 2000,
    taxis: 1000,
  },
  {
    name: "Feb",
    stays: 3000,
    flights: 2500,
    attractions: 1800,
    taxis: 1000,
  },
  {
    name: "Mar",
    stays: 5000,
    flights: 4200,
    attractions: 2500,
    taxis: 1200,
  },
  {
    name: "Apr",
    stays: 4500,
    flights: 3800,
    attractions: 2200,
    taxis: 1100,
  },
  {
    name: "May",
    stays: 6000,
    flights: 4900,
    attractions: 3000,
    taxis: 1500,
  },
  {
    name: "Jun",
    stays: 5500,
    flights: 4700,
    attractions: 2800,
    taxis: 1300,
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zippy-darker px-3 py-2 rounded-lg border border-white/10 shadow-xl">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-xs flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            ></span>
            <span>{entry.name}: ${entry.value}</span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export default function RevenueChart() {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    // Animation effect: gradually reveal data
    const timer = setTimeout(() => {
      setData(initialData);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="glass-card p-5 rounded-xl h-[400px] animate-fade-in" style={{ animationDelay: "200ms" }}>
      <h2 className="text-lg font-semibold mb-4">Revenue by Service</h2>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)' }} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.6)' }} 
              tickFormatter={(value) => value === 0 ? '0' : `${value}`} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="stays" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="flights" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="attractions" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="taxis" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
