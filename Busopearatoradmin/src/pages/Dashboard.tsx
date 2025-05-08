import React, { useEffect, useState } from 'react';
import { ChevronRight, DollarSign, MapPin, Route as RouteIcon, Users, Bus, ArrowUp, Calendar, Clock, UserPlus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { fetchRoutes } from '@/services/api/routes';
import { fetchSchedules } from '@/services/api/schedules';
import { fetchDashboardStats } from '@/services/analytics';
import { formatDistanceToNow } from 'date-fns';

// Define types for our data
type RoutePerformance = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  bookings: number;
  revenue: number;
  growth: number;
  occupancy: number;
  target: number;
  color: string;
};

type ActivityItem = {
  id: string;
  event: string;
  time: string;
  timestamp: Date;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [topRoutes, setTopRoutes] = useState<RoutePerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get current date and time
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Function to fetch top routes by combining routes and schedules data
  const fetchTopRoutes = async () => {
    try {
      // Fetch routes and schedules
      const routes = await fetchRoutes();
      const schedules = await fetchSchedules();
      
      // Process data to calculate performance metrics
      const routePerformance: Record<string, RoutePerformance> = {};
      
      // Initialize route performance data
      routes.forEach(route => {
        routePerformance[route.id] = {
          id: route.id,
          name: route.name,
          origin: route.origin,
          destination: route.destination,
          bookings: 0,
          revenue: 0,
          growth: Math.floor(Math.random() * 15), // Placeholder until we have historical data
          occupancy: 0,
          target: 70 + Math.floor(Math.random() * 15), // Random target between 70-85%
          color: getRandomColor(),
        };
      });
      
      // Calculate bookings and revenue from schedules
      schedules.forEach(schedule => {
        // Use consistent property naming and add proper type checking
        const routeId = schedule.routeId || schedule.route_id;
        if (routeId && routePerformance[routeId]) {
          routePerformance[routeId].bookings += Math.floor(Math.random() * 50); // Placeholder
          
          // Safely access fare and available seats with consistent property naming
          const fare = schedule.fare || 0;
          const availableSeats = schedule.availableSeats || 0;
          routePerformance[routeId].revenue += fare * availableSeats;
          
          // Calculate occupancy (random for now)
          // Safely access capacity with consistent property naming
          const bus = schedule.bus;
          const totalSeats = (bus && bus.capacity) ? bus.capacity : 40;
          const bookedSeats = totalSeats - availableSeats;
          const occupancyRate = (bookedSeats / totalSeats) * 100;
          
          // Update with weighted average
          const currentOccupancy = routePerformance[routeId].occupancy;
          routePerformance[routeId].occupancy = currentOccupancy > 0 
            ? Math.round((currentOccupancy + occupancyRate) / 2) 
            : Math.round(occupancyRate);
        }
      });
      
      // Convert to array and sort by revenue
      const sortedRoutes = Object.values(routePerformance)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3); // Get top 3
      
      setTopRoutes(sortedRoutes);
    } catch (error) {
      console.error("Error fetching top routes:", error);
      setTopRoutes([]);
    }
  };

  // Function to fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      // This would ideally come from an activity log table
      // For now, we'll simulate with recent changes from various tables
      
      const now = new Date();
      const activities: ActivityItem[] = [
        {
          id: '1',
          event: 'New booking on Delhi-Mumbai route',
          time: formatDistanceToNow(new Date(now.getTime() - 15 * 60000), { addSuffix: true }),
          timestamp: new Date(now.getTime() - 15 * 60000)
        },
        {
          id: '2',
          event: 'Bus #B-1234 completed trip',
          time: formatDistanceToNow(new Date(now.getTime() - 45 * 60000), { addSuffix: true }),
          timestamp: new Date(now.getTime() - 45 * 60000)
        },
        {
          id: '3',
          event: 'Schedule updated for Bangalore-Chennai',
          time: formatDistanceToNow(new Date(now.getTime() - 2 * 60 * 60000), { addSuffix: true }),
          timestamp: new Date(now.getTime() - 2 * 60 * 60000)
        },
        {
          id: '4',
          event: 'New route added: Jaipur-Udaipur',
          time: formatDistanceToNow(new Date(now.getTime() - 3 * 60 * 60000), { addSuffix: true }),
          timestamp: new Date(now.getTime() - 3 * 60 * 60000)
        },
        {
          id: '5',
          event: 'Price adjustment on 3 routes',
          time: formatDistanceToNow(new Date(now.getTime() - 5 * 60 * 60000), { addSuffix: true }),
          timestamp: new Date(now.getTime() - 5 * 60 * 60000)
        }
      ];
      
      setRecentActivity(activities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      setRecentActivity([]);
    }
  };

  // Function to get a random color for route visualization
  const getRandomColor = () => {
    const colors = ['purple', 'blue', 'green', 'amber', 'red', 'indigo'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Load all data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch all required data
        await Promise.all([
          fetchTopRoutes(),
          fetchRecentActivity()
        ]);
        
        // Set loaded state to trigger animations
        setLoaded(true);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
    
    // Set up polling for real-time updates (every 30 seconds)
    const pollingInterval = setInterval(() => {
      fetchTopRoutes();
      fetchRecentActivity();
    }, 30000);
    
    return () => clearInterval(pollingInterval);
  }, []);

  // Quick actions
  const quickActions = [{
    title: 'Add New Route',
    path: '/routes/add',
    icon: <RouteIcon className="h-5 w-5" />
  }, {
    title: 'View Bookings',
    path: '/bookings',
    icon: <DollarSign className="h-5 w-5" />
  }, {
    title: 'Add Bus',
    path: '/buses/add',
    icon: <Bus className="h-5 w-5" />
  }, {
    title: 'Add Driver',
    path: '/drivers/add',
    icon: <UserPlus className="h-5 w-5" />
  }, {
    title: 'Schedule',
    path: '/schedule',
    icon: <Calendar className="h-5 w-5" />
  }, {
    title: 'Analytics',
    path: '/analytics',
    icon: <ChevronRight className="h-5 w-5" />
  }];

  return <div className="py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Animated Header with Golden Stroke */}
        <div className={`mb-8 transform transition-all duration-500 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{
        transitionDelay: '100ms'
      }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mt-2 text-lg text-muted-foreground">
                {currentDate} — Your operations at a glance
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-2 bg-zippy-darkGray rounded-lg p-3 border border-zippy-gray">
                <Clock className="h-5 w-5 text-zippy-purple" />
                <span id="live-time" className="text-lg font-medium">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Sections Below */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Access Section */}
            <Card className={`border-zippy-gray bg-zippy-darkGray animate-fadeSlideUp`} style={{
            animationDelay: '400ms'
          }}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 gold-stroke">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => <Button key={index} variant="outline" className="bg-zippy-gray border-zippy-lightGray h-auto py-4 flex flex-col items-center justify-center card-hover" onClick={() => navigate(action.path)}>
                      <div className="bg-zippy-purple text-white rounded-full p-2 mb-2">
                        {action.icon}
                      </div>
                      <span>{action.title}</span>
                    </Button>)}
                </div>
              </CardContent>
            </Card>

            {/* Routes Section with Dynamic Data */}
            <Card className={`border-zippy-gray bg-zippy-darkGray animate-fadeSlideUp`} style={{
            animationDelay: '500ms'
          }}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 gold-stroke">Routes</h2>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zippy-purple"></div>
                    </div>
                  ) : topRoutes.length > 0 ? (
                    topRoutes.map((route, index) => (
                      <div key={route.id} className="p-4 bg-zippy-gray rounded-lg border border-zippy-lightGray card-hover">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className={`bg-${route.color}-500 rounded-full p-2.5`}>
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium">{route.origin} - {route.destination}</h3>
                              <p className="text-sm text-muted-foreground">{route.bookings} bookings this week</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">₹{route.revenue.toLocaleString()}</p>
                            <p className="text-sm text-green-500 flex items-center justify-end">
                              <ArrowUp className="h-3 w-3 mr-1" />
                              {route.growth}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-zippy-lightGray rounded-full h-2.5">
                            <div className={`bg-${route.color}-500 h-2.5 rounded-full`} style={{
                              width: `${route.occupancy}%`
                            }}></div>
                          </div>
                          <div className="flex justify-between mt-1 text-xs">
                            <span>Occupancy: {route.occupancy}%</span>
                            <span>Target: {route.target}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      No routes found. Add routes to see performance data.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Recent Activity Feed - Dynamic */}
            <Card className={`border-zippy-gray bg-zippy-darkGray animate-fadeSlideUp h-full`} style={{
            animationDelay: '600ms'
          }}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 gold-stroke">Recent Activity</h2>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zippy-purple"></div>
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map(activity => (
                      <div key={activity.id} className="p-3 bg-zippy-gray rounded-lg border border-zippy-lightGray card-hover">
                        <p className="font-medium">{activity.event}</p>
                        <p className="text-sm text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      No recent activity found.
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-zippy-gray border-zippy-lightGray" onClick={() => navigate('/activity')}>
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default Dashboard;