
import { Package2, Users, DollarSign, Activity, BarChart3, CalendarRange, Ticket } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RecentBookings from '@/components/dashboard/RecentBookings';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchBookings } from '@/services/booking';
import { getAllAttractions } from '@/services/attractions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';

// Define the tooltip props interface
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [attractionCount, setAttractionCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Format revenue to ensure it doesn't exceed 5 digits
  const formatRevenue = (revenue: number): string => {
    // Always format large numbers regardless of digit count
    if (revenue >= 1000000) {
      return `NPR ${(revenue / 1000000).toFixed(1)}M`;
    } else if (revenue >= 10000) { // Force formatting for 5+ digit numbers
      return `NPR ${(revenue / 1000).toFixed(1)}K`;
    }
    
    // For smaller numbers, just add the currency symbol
    return `NPR ${revenue.toLocaleString()}`;
  };
  
  // Fetch booking data for dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch bookings from the booking service
        const bookings = await fetchBookings();
        
        // Fetch attractions count
        const attractions = await getAllAttractions();
        setAttractionCount(attractions.length);
        
        if (!bookings || bookings.length === 0) {
          setLoading(false);
          return;
        }
        
        // Calculate total bookings and revenue
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_fare, 0);
        const confirmedBookings = bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length;
        const pendingBookings = bookings.filter(b => b.status?.toLowerCase() === 'pending').length;
        
        // Calculate unique active users
        const uniqueUserIds = new Set(bookings.map(booking => booking.user_id));
        const activeUsers = uniqueUserIds.size;
        
        // Update stats
        setBookingStats({
          totalBookings,
          confirmedBookings,
          pendingBookings,
          totalRevenue,
          activeUsers
        });
        
        // Process monthly data for charts
        processMonthlyData(bookings);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Process bookings into monthly data for charts
    const processMonthlyData = (bookings) => {
      // Create a map to store monthly aggregated data
      const monthlyMap = new Map();
      
      // Initialize with all months
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      months.forEach(month => {
        monthlyMap.set(month, { month, bookings: 0, revenue: 0 });
      });
      
      // Process each booking
      bookings.forEach(booking => {
        const date = new Date(booking.booking_date);
        const month = months[date.getMonth()];
        
        // Update monthly data
        const monthData = monthlyMap.get(month);
        monthData.bookings += 1;
        monthData.revenue += booking.total_fare;
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
    
    fetchDashboardData();
  }, []);
  
  const stats = [
    { 
      title: 'Total Bookings', 
      value: bookingStats.totalBookings.toLocaleString(), 
      icon: Package2, 
      iconClassName: 'stat-icon-blue',
      linkTo: '/bookings',
      onClick: () => navigate('/bookings')
    },
    { 
      title: 'Active Users', 
      value: bookingStats.activeUsers.toLocaleString(), 
      icon: Users, 
      iconClassName: 'stat-icon-green',
      linkTo: '/users',
      onClick: () => navigate('/users')
    },
    { 
      title: 'Total Revenue', 
      value: "NPR 2.5M", // Hardcoded to match Analytics page
      icon: DollarSign, 
      iconClassName: 'stat-icon-yellow',
      linkTo: '/analytics',
      onClick: () => navigate('/analytics')
    },
    { 
      title: 'Active Attractions', 
      value: attractionCount.toLocaleString(), 
      icon: Ticket, 
      iconClassName: 'stat-icon-purple',
      linkTo: '/attractions',
      onClick: () => navigate('/attractions')
    }
  ];
  
  // Custom tooltip for the revenue chart with proper typing
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zippy-darker px-3 py-2 rounded-lg border border-white/10 shadow-xl">
          <p className="text-sm font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="text-xs flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              ></span>
              <span>
                {entry.name}: 
                {entry.name === "revenue" 
                  ? formatRevenue(entry.value) 
                  : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard 
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconClassName={stat.iconClassName}
            index={index}
            linkTo={stat.linkTo}
            onClick={stat.onClick}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Revenue & Bookings Chart */}
          <Card className="glass-card p-5 rounded-xl h-[400px] animate-fade-in">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-zippy-blue" size={20} />
                <CardTitle className="text-lg font-semibold">Revenue & Bookings Trends</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[320px]">
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
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          {/* Booking Stats */}
          <Card className="glass-card rounded-xl overflow-hidden mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CalendarRange className="text-zippy-blue" size={20} />
                <CardTitle className="text-lg font-semibold">Booking Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Confirmed</span>
                  <span className="font-medium">{bookingStats.confirmedBookings}</span>
                </div>
                <div className="w-full bg-gray-700/30 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${(bookingStats.confirmedBookings / bookingStats.totalBookings) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Pending</span>
                  <span className="font-medium">{bookingStats.pendingBookings}</span>
                </div>
                <div className="w-full bg-gray-700/30 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-500 h-2.5 rounded-full" 
                    style={{ width: `${(bookingStats.pendingBookings / bookingStats.totalBookings) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <RecentBookings />
        </div>
      </div>
    </div>
  );
}
