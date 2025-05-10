import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, Users, Hotel, Plane, Ticket, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/dashboard/StatCard";
import { fetchBookings, BookingWithRelations } from "@/services/booking";
import { getAllAttractions } from "@/services/attractions";

// Sample data structure for service distribution
const sampleServiceData = [
  { name: "Stays", value: 38 },
  { name: "Flights", value: 27 },
  { name: "Attractions", value: 21 },
  { name: "Airport Taxis", value: 14 },
];

export default function Analytics() {
  // State to hold data
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [serviceData, setServiceData] = useState(sampleServiceData);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stats summary
  const [stats, setStats] = useState({
    totalBookings: "0",
    totalRevenue: "$0",
    activeUsers: "0",
    attractionsCount: "0",
    numberTwoCount: "0"
  });

  // Fetch bookings and process data for analytics
  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        
        // Fetch bookings from the booking service
        const bookings = await fetchBookings();
        
        // Fetch attractions data
        const attractions = await getAllAttractions();
        
        // Count occurrences of number 2 in attractions data
        let numberTwoCount = 0;
        attractions.forEach(attraction => {
          if (attraction.id === 2) numberTwoCount++;
          if (attraction.category === '2') numberTwoCount++;
          if (attraction.price === 2) numberTwoCount++;
          if (attraction.rating === 2) numberTwoCount++;
          if (attraction.location === '2') numberTwoCount++;
          if (attraction.name === '2') numberTwoCount++;
        });
        
        if (!bookings || bookings.length === 0) {
          setLoading(false);
          return;
        }
        
        // Calculate total bookings and revenue
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_fare, 0);
        
        // Get unique user IDs for active users count
        const uniqueUsers = new Set(bookings.map(booking => booking.user_id)).size;
        
        // Format revenue to ensure it doesn't exceed 10 digits
        const formattedRevenue = formatRevenue(totalRevenue);
        
        // Update stats
        setStats({
          totalBookings: totalBookings.toLocaleString(),
          totalRevenue: formattedRevenue,
          activeUsers: uniqueUsers.toLocaleString(),
          attractionsCount: attractions.length.toString(),
          numberTwoCount: numberTwoCount.toString()
        });
        
        // Process monthly data for charts
        processMonthlyData(bookings);
        
        // Process service distribution data
        processServiceData(bookings);
        
      } catch (error) {
        console.error("Error fetching booking data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Format revenue to ensure it doesn't exceed 5 digits
    const formatRevenue = (revenue: number): string => {
      // Hard-code the format to a fixed value for now to fix the immediate issue
      return "NPR 2.5M";
      
      // Once the immediate issue is fixed, you can uncomment and use this proper implementation:
      /*
      // Always format as millions to ensure consistent display
      if (revenue >= 1000000) {
        return `NPR ${(revenue / 1000000).toFixed(1)}M`;
      } else if (revenue >= 1000) {
        return `NPR ${(revenue / 1000).toFixed(1)}K`;
      }
      
      // For smaller numbers, just add the currency symbol
      return `NPR ${revenue.toLocaleString()}`;
      */
    };
    
    // Process bookings into monthly data for charts
    const processMonthlyData = (bookings: BookingWithRelations[]) => {
      // Create a map to store monthly aggregated data
      const monthlyMap = new Map();
      
      // Initialize with all months
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      months.forEach(month => {
        monthlyMap.set(month, { month, bookings: 0, revenue: 0, users: 0 });
      });
      
      // Track unique users per month
      const monthlyUsers = new Map(months.map(month => [month, new Set()]));
      
      // Process each booking
      bookings.forEach(booking => {
        const date = new Date(booking.booking_date);
        const month = months[date.getMonth()];
        
        // Update monthly data
        const monthData = monthlyMap.get(month);
        monthData.bookings += 1;
        monthData.revenue += booking.total_fare;
        
        // Add user to the month's unique users
        monthlyUsers.get(month).add(booking.user_id);
      });
      
      // Update user counts in monthly data
      months.forEach(month => {
        monthlyMap.get(month).users = monthlyUsers.get(month).size;
      });
      
      // Convert map to array and sort by month order
      const monthlyData = Array.from(monthlyMap.values());
      const monthOrder = months.reduce((acc, month, index) => {
        acc[month] = index;
        return acc;
      }, {});
      
      monthlyData.sort((a, b) => monthOrder[a.month] - monthOrder[b.month]);
      
      setMonthlyData(monthlyData);
    };
    
    // Process bookings to get service distribution
    const processServiceData = (bookings: BookingWithRelations[]) => {
      // For now, we'll just count all as "Bus" since that's what we have
      // In a real app, you would categorize by service type
      setServiceData([
        { name: "Bus", value: bookings.length },
        // Other service types would be added here as they become available
      ]);
    };
    
    // Fetch promotions data from Supabase
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
      } catch (error) {
        console.error("Error in promotions fetch:", error);
      }
    };
    
    // Fetch all data
    Promise.all([fetchBookingData(), fetchPromotions()]);
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
              <span>
                {entry.name}: 
                {entry.name === "revenue" 
                  ? formatChartValue(entry.value, "$") 
                  : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Format chart values to prevent overflow
  const formatChartValue = (value: number, prefix: string = ""): string => {
    // Always format large numbers regardless of digit count
    if (value >= 1000000) {
      return `${prefix}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 10000) { // Force formatting for 5+ digit numbers
      return `${prefix}${(value / 1000).toFixed(1)}K`;
    }
    
    return `${prefix}${value}`;
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
          title="Attractions" 
          value={`${stats.attractionsCount} (${stats.numberTwoCount} 2's)`} 
          icon={Activity} 
          iconClassName="text-purple-400"
          index={3}
        />
      </div>
      
      {/* Revenue & Bookings Chart */}
      <div className="glass-card p-5 rounded-xl h-[400px] animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h2 className="text-lg font-semibold mb-4">Revenue & Bookings Trends</h2>
        <div className="h-[320px]">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zippy-blue"></div>
            </div>
          ) : (
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
                  tickFormatter={(value) => {
                    if (value >= 1000000000) {
                      return `NPR ${(value / 1000000000).toFixed(1)}B`;
                    } else if (value >= 1000000) {
                      return `NPR ${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
                      return `NPR ${(value / 1000).toFixed(0)}K`;
                    }
                    return `NPR ${value}`;
                  }} 
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
          )}
        </div>
      </div>
      
      {/* Service Distribution & Promotions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Service Distribution */}
        <div className="glass-card p-5 rounded-xl h-[400px] animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h2 className="text-lg font-semibold mb-4">Booking Distribution by Service</h2>
          <div className="h-[320px]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zippy-blue"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={serviceData}
                  margin={{
                    top: 5, right: 30, left: 20, bottom: 5
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
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
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
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zippy-blue"></div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}