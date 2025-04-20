import { useEffect, useState } from "react";
import { AreaChart, BarChart, Bus, DollarSign, MapPin, Route, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart as RechartsBarChart,
  Bar
} from "recharts";
import { fetchRoutes, fetchBuses, fetchSchedules, fetchBookings } from "@/services/api";
import { useRealtime } from "@/hooks/useRealtime";
import { Database } from "@/integrations/supabase/types";
import { Route as RouteType } from "@/services/api/routes";
import { ScheduleWithRelations } from "@/services/api/schedules";
import { BookingWithRelations } from "@/services/api/bookings";
import { Bus as BusType } from "@/services/api/buses";

interface RevenueDataPoint {
  name: string;
  revenue: number;
}

interface PassengersDataPoint {
  name: string;
  passengers: number;
}

interface RoutePerformance {
  name: string;
  revenue: number;
  passengers: number;
}

type RouteData = Database['public']['Tables']['routes']['Row'];
type BusData = Database['public']['Tables']['buses']['Row'];
type ScheduleData = Database['public']['Tables']['schedules']['Row'] & {
  routes?: RouteData;
  buses?: BusData;
};
type BookingData = Database['public']['Tables']['bookings']['Row'] & {
  schedules?: ScheduleData;
};

const Dashboard = () => {
  const { data: routes } = useRealtime<RouteType>('routes', [], ['*'], fetchRoutes);
  const { data: buses } = useRealtime<BusType>('buses', [], ['*'], fetchBuses);
  const { data: schedules } = useRealtime<ScheduleWithRelations>('schedules', [], ['*'], fetchSchedules);
  const { data: bookings } = useRealtime<BookingWithRelations>('bookings', [], ['*'], fetchBookings);

  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      const revenueByMonth = bookings.reduce<Record<string, number>>((acc, booking) => {
        const date = new Date(booking.created_at);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()];
        
        if (!acc[month]) {
          acc[month] = 0;
        }
        
        acc[month] += Number(booking.total_fare);
        return acc;
      }, {});

      const chartData = Object.entries(revenueByMonth).map(([name, revenue]) => ({
        name,
        revenue: Math.round(revenue)
      }));

      setRevenueData(chartData.length > 0 ? chartData : [
        { name: "Jan", revenue: 4000 },
        { name: "Feb", revenue: 3000 },
        { name: "Mar", revenue: 5000 },
        { name: "Apr", revenue: 4500 },
        { name: "May", revenue: 6000 },
        { name: "Jun", revenue: 5500 },
        { name: "Jul", revenue: 7000 },
      ]);
    } else {
      setRevenueData([
        { name: "Jan", revenue: 4000 },
        { name: "Feb", revenue: 3000 },
        { name: "Mar", revenue: 5000 },
        { name: "Apr", revenue: 4500 },
        { name: "May", revenue: 6000 },
        { name: "Jun", revenue: 5500 },
        { name: "Jul", revenue: 7000 },
      ]);
    }
  }, [bookings]);

  const [passengersData, setPassengersData] = useState<PassengersDataPoint[]>([]);
  
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      const passengersByDay = bookings.reduce<Record<string, number>>((acc, booking) => {
        const date = new Date(booking.created_at);
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const day = dayNames[date.getDay()];
        
        if (!acc[day]) {
          acc[day] = 0;
        }
        
        acc[day] += booking.seat_numbers?.length || 1;
        return acc;
      }, {});

      const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const chartData = dayOrder.map(day => ({
        name: day,
        passengers: passengersByDay[day] || 0
      }));

      setPassengersData(chartData);
    } else {
      setPassengersData([
        { name: "Mon", passengers: 240 },
        { name: "Tue", passengers: 300 },
        { name: "Wed", passengers: 280 },
        { name: "Thu", passengers: 320 },
        { name: "Fri", passengers: 400 },
        { name: "Sat", passengers: 450 },
        { name: "Sun", passengers: 380 },
      ]);
    }
  }, [bookings]);

  const [routePerformance, setRoutePerformance] = useState<RoutePerformance[]>([]);
  
  useEffect(() => {
    if (routes && schedules && bookings && schedules.length > 0 && bookings.length > 0) {
      const performanceByRoute: Record<string, RoutePerformance> = {};
      
      bookings.forEach(booking => {
        if (!booking.schedules) return;
        if (!booking.schedules.routes) return;
        
        const routeId = booking.schedules.route_id;
        const route = booking.schedules.routes;
        
        if (!performanceByRoute[routeId]) {
          performanceByRoute[routeId] = {
            name: `${route.origin}-${route.destination}`,
            revenue: 0,
            passengers: 0
          };
        }
        
        performanceByRoute[routeId].revenue += Number(booking.total_fare);
        performanceByRoute[routeId].passengers += booking.seat_numbers?.length || 1;
      });

      let performanceData = Object.values(performanceByRoute)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      performanceData = performanceData.map(item => ({
        ...item,
        revenue: Math.round(item.revenue)
      }));

      setRoutePerformance(performanceData.length > 0 ? performanceData : [
        { name: "Delhi-Mumbai", revenue: 8500, passengers: 320 },
        { name: "Bangalore-Chennai", revenue: 6200, passengers: 250 },
        { name: "Kolkata-Hyderabad", revenue: 5100, passengers: 180 },
        { name: "Pune-Goa", revenue: 7800, passengers: 290 },
        { name: "Jaipur-Delhi", revenue: 4900, passengers: 210 },
      ]);
    } else {
      setRoutePerformance([
        { name: "Delhi-Mumbai", revenue: 8500, passengers: 320 },
        { name: "Bangalore-Chennai", revenue: 6200, passengers: 250 },
        { name: "Kolkata-Hyderabad", revenue: 5100, passengers: 180 },
        { name: "Pune-Goa", revenue: 7800, passengers: 290 },
        { name: "Jaipur-Delhi", revenue: 4900, passengers: 210 },
      ]);
    }
  }, [routes, schedules, bookings]);

  const totalRevenue = bookings?.reduce((sum, booking) => sum + Number(booking.total_fare), 0) || 45231.89;
  
  const generateActivityItems = () => {
    const activities = [];
    
    if (bookings) {
      bookings.slice(0, 2).forEach(booking => {
        activities.push({
          type: 'booking',
          title: 'User booking completed',
          time: Math.floor((new Date().getTime() - new Date(booking.created_at).getTime()) / (60 * 1000)),
          icon: <Users className="h-4 w-4 text-zippy-purple" />
        });
      });
    }
    
    if (buses) {
      buses.slice(0, 2).forEach(bus => {
        activities.push({
          type: 'bus',
          title: `Bus ${bus.registration_number} scheduled maintenance`,
          time: Math.floor(Math.random() * 60),
          icon: <Bus className="h-4 w-4 text-zippy-purple" />
        });
      });
    }
    
    if (routes) {
      routes.slice(0, 1).forEach(route => {
        activities.push({
          type: 'route',
          title: `New route added: ${route.origin}-${route.destination}`,
          time: Math.floor(Math.random() * 60),
          icon: <Route className="h-4 w-4 text-zippy-purple" />
        });
      });
    }
    
    return activities
      .sort((a, b) => a.time - b.time)
      .slice(0, 5);
  };
  
  const activityItems = generateActivityItems();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NPR {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.filter(r => r.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              {routes.length > 0 ? `${routes.length} total routes` : 'No routes found'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fleet Size</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buses.filter(b => b.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              {buses.length > 0 ? `${buses.length} total buses` : 'No buses found'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Passengers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings?.reduce((total, booking) => total + (booking.seat_numbers?.length || 1), 0) || 12234}
            </div>
            <p className="text-xs text-muted-foreground">
              +10.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="bg-zippy-darkGray border-zippy-gray md:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1E1E1E", borderColor: "#333" }} 
                  formatter={(value) => [`NPR ${value}`, "Revenue"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray md:col-span-3">
          <CardHeader>
            <CardTitle>Passenger Traffic</CardTitle>
            <CardDescription>Daily passenger count for this week</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={passengersData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1E1E1E", borderColor: "#333" }} 
                />
                <Legend />
                <Bar dataKey="passengers" fill="#9B87F5" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-zippy-darkGray border-zippy-gray col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Routes</CardTitle>
            <CardDescription>Revenue and passenger numbers by route</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routePerformance.map((route, i) => (
                <div key={i} className="flex items-center justify-between border-b border-zippy-gray pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-zippy-gray p-2 rounded-full">
                      <MapPin className="h-4 w-4 text-zippy-purple" />
                    </div>
                    <div>
                      <div className="font-medium">{route.name}</div>
                      <div className="text-sm text-muted-foreground">{route.passengers} passengers</div>
                    </div>
                  </div>
                  <div className="font-medium">NPR {route.revenue}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityItems.length > 0 ? (
                activityItems.map((activity, i) => (
                  <div key={i} className="flex items-start space-x-3 border-b border-zippy-gray pb-4">
                    <div className="bg-zippy-gray p-2 rounded-full mt-0.5">
                      {activity.icon}
                    </div>
                    <div>
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.time} minutes ago
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 border-b border-zippy-gray pb-4">
                    <div className="bg-zippy-gray p-2 rounded-full mt-0.5">
                      {i % 3 === 0 ? (
                        <Bus className="h-4 w-4 text-zippy-purple" />
                      ) : i % 3 === 1 ? (
                        <Route className="h-4 w-4 text-zippy-purple" />
                      ) : (
                        <Users className="h-4 w-4 text-zippy-purple" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {i % 3 === 0
                          ? "Bus BUS-104 scheduled maintenance"
                          : i % 3 === 1
                          ? "New route added: Delhi-Chandigarh"
                          : "User booking completed"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 60)} minutes ago
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
