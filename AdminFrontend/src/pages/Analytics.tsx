
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, Users, Hotel, Plane, Ticket } from "lucide-react";
import { useState, useEffect } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/dashboard/StatCard";

// Sample data structure (we'll replace with real data from Supabase)
const sampleMonthlyData = [
  { month: "Jan", bookings: 120, revenue: 12400, users: 78 },
  { month: "Feb", bookings: 140, revenue: 15800, users: 92 },
  { month: "Mar", bookings: 180, revenue: 22600, users: 119 },
  { month: "Apr", bookings: 250, revenue: 32000, users: 145 },
  { month: "May", bookings: 310, revenue: 41200, users: 162 },
  { month: "Jun", bookings: 290, revenue: 39800, users: 158 },
  { month: "Jul", bookings: 320, revenue: 45600, users: 171 },
  { month: "Aug", bookings: 360, revenue: 52400, users: 184 },
  { month: "Sep", bookings: 310, revenue: 48600, users: 165 },
  { month: "Oct", bookings: 290, revenue: 46200, users: 152 },
  { month: "Nov", bookings: 320, revenue: 49800, users: 168 },
  { month: "Dec", bookings: 370, revenue: 58200, users: 196 },
];

const sampleServiceData = [
  { name: "Stays", value: 38 },
  { name: "Flights", value: 27 },
  { name: "Attractions", value: 21 },
  { name: "Airport Taxis", value: 14 },
];

export default function Analytics() {
  // State to hold data
  const [monthlyData, setMonthlyData] = useState(sampleMonthlyData);
  const [serviceData, setServiceData] = useState(sampleServiceData);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stats summary
  const [stats, setStats] = useState({
    totalBookings: "1,432",
    totalRevenue: "$428,400",
    activeUsers: "196",
    growthRate: "12.8%",
    isGrowthPositive: true
  });

  // Fetch promotions data from Supabase
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching promotions:", error);
          return;
        }
        
        setPromotions(data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error in promotions fetch:", error);
        setLoading(false);
      }
    };
    
    fetchPromotions();
  }, []);
  
  // Custom tooltip for the revenue chart
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
              <span>{entry.name}: {entry.name === "revenue" ? "$" : ""}{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <BarChart3 className="text-zippy-blue" size={24} />
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon={Ticket} 
          index={0}
        />
        <StatCard 
          title="Total Revenue" 
          value={stats.totalRevenue} 
          icon={TrendingUp} 
          iconClassName="text-green-400"
          index={1}
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers} 
          icon={Users} 
          iconClassName="text-blue-400"
          index={2}
        />
        <StatCard 
          title="Growth Rate" 
          value={stats.growthRate} 
          icon={stats.isGrowthPositive ? ArrowUpRight : ArrowDownRight} 
          iconClassName={stats.isGrowthPositive ? "text-green-400" : "text-red-400"}
          index={3}
        />
      </div>
      
      {/* Revenue & Bookings Chart */}
      <div className="glass-card p-5 rounded-xl h-[400px] animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h2 className="text-lg font-semibold mb-4">Revenue & Bookings Trends</h2>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)' }} />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                tickFormatter={(value) => `$${value}`} 
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.6)' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="#22c55e" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="bookings" 
                stroke="#3b82f6" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Service Distribution & Promotions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Service Distribution */}
        <div className="glass-card p-5 rounded-xl h-[400px] animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h2 className="text-lg font-semibold mb-4">Booking Distribution by Service</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={serviceData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.6)' }} 
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Active Promotions */}
        <div className="glass-card p-5 rounded-xl h-[400px] overflow-auto animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h2 className="text-lg font-semibold mb-4">Active Promotions</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zippy-blue"></div>
            </div>
          ) : promotions.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-gray-400">
              <Ticket size={48} strokeWidth={1} />
              <p className="mt-4">No active promotions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promo: any) => (
                <div key={promo.id} className="p-4 rounded-md bg-zippy-darker border border-white/5 hover:border-white/10 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zippy-blue/20 flex items-center justify-center text-zippy-blue">
                      <Ticket size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium">{promo.title}</h3>
                      <p className="text-sm text-gray-400">{promo.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm bg-zippy-blue/20 text-zippy-blue px-2 py-1 rounded">
                      {promo.discount}% OFF
                    </span>
                    <span className="text-xs text-gray-400">
                      Valid until {new Date(promo.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Users Growth */}
      <div className="glass-card p-5 rounded-xl h-[400px] animate-fade-in" style={{ animationDelay: "500ms" }}>
        <h2 className="text-lg font-semibold mb-4">User Growth Trends</h2>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)' }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.6)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#eab308"
                strokeWidth={2}
                dot={{ stroke: '#eab308', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
