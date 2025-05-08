import React, { useEffect, useState } from 'react';
import { ChevronRight, DollarSign, MapPin, Route as RouteIcon, Users, Bus, ArrowUp, Calendar, Clock, UserPlus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { fetchRoutes } from '@/services/api/routes';
import { fetchSchedules } from '@/services/api/schedules';
import { fetchDashboardStats } from '@/services/analytics';
import { formatDistanceToNow, format, addDays, isSameDay } from 'date-fns';
import { query } from '@/integrations/neon/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// Define types for our data
type ScheduleItem = {
  id: string;
  routeName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  date: Date;
  busNumber: string;
  driverName: string;
  status: string;
  seatsAvailable: number;
  totalSeats: number;
};

type ActivityItem = {
  id: string;
  event: string;
  time: string;
  timestamp: Date;
  entity_type?: string;
  entity_id?: string;
  action?: string;
  user_id?: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [upcomingSchedules, setUpcomingSchedules] = useState<ScheduleItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [routes, setRoutes] = useState<any[]>([]);

  // Get current date and time
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Function to fetch upcoming schedules
  const fetchUpcomingSchedules = async () => {
    try {
      // Fetch schedules with related data using Neon
      const result = await query(`
        SELECT 
          s.id, 
          s.date, 
          s.departure_time, 
          s.arrival_time, 
          s.status, 
          s.available_seats,
          r.name as route_name, 
          r.origin, 
          r.destination,
          b.registration_number as bus_number, 
          b.capacity as total_seats,
          d.name as driver_name
        FROM 
          schedules s
        LEFT JOIN 
          routes r ON s.route_id = r.id
        LEFT JOIN 
          buses b ON s.bus_id = b.id
        LEFT JOIN 
          drivers d ON s.driver_id = d.id
        WHERE 
          s.date >= CURRENT_DATE
        ORDER BY 
          s.date ASC, s.departure_time ASC
        LIMIT 50
      `);
      
      // Transform database results into ScheduleItem format
      const schedulesWithDetails: ScheduleItem[] = result.rows.map(row => {
        // Create a date object from the schedule date
        const scheduleDate = new Date(row.date);
        
        return {
          id: row.id,
          routeName: row.route_name || 'Unknown Route',
          origin: row.origin || 'Unknown',
          destination: row.destination || 'Unknown',
          departureTime: row.departure_time || '',
          arrivalTime: row.arrival_time || '',
          date: scheduleDate,
          busNumber: row.bus_number || 'Not Assigned',
          driverName: row.driver_name || 'Not Assigned',
          status: row.status || 'scheduled',
          seatsAvailable: row.available_seats || 0,
          totalSeats: row.total_seats || 40
        };
      });
      
      setUpcomingSchedules(schedulesWithDetails);
    } catch (error) {
      console.error("Error fetching upcoming schedules:", error);
      setUpcomingSchedules([]);
    }
  };

  // Function to fetch routes
  const loadRoutes = async () => {
    try {
      const routesData = await fetchRoutes();
      setRoutes(routesData);
    } catch (error) {
      console.error("Error fetching routes:", error);
      setRoutes([]);
    }
  };

  // Function to fetch recent activity from database
  const fetchRecentActivity = async () => {
    try {
      // Fetch activity logs directly using Neon
      const result = await query(`
        SELECT 
          id, 
          action, 
          entity_type, 
          entity_id, 
          details, 
          user_id, 
          created_at 
        FROM 
          activity_logs 
        ORDER BY 
          created_at DESC 
        LIMIT 10
      `);
      
      if (result.rows && result.rows.length > 0) {
        // Transform database results into ActivityItem format
        const activities: ActivityItem[] = result.rows.map(row => {
          // Parse the details JSON if it exists
          const details = row.details ? JSON.parse(row.details) : {};
          
          // Create a human-readable event description based on the activity
          let eventText = '';
          
          switch (row.entity_type) {
            case 'booking':
              eventText = row.action === 'create' 
                ? `New booking ${details.route_name ? `on ${details.route_name} route` : ''}`
                : `Booking ${row.action}ed ${details.route_name ? `for ${details.route_name}` : ''}`;
              break;
            case 'route':
              eventText = row.action === 'create' 
                ? `New route added: ${details.name || details.origin + ' to ' + details.destination || ''}`
                : `Route ${details.name || ''} ${row.action}ed`;
              break;
            case 'bus':
              eventText = row.action === 'create'
                ? `New bus added: ${details.registration_number || ''}`
                : `Bus ${details.registration_number || ''} ${row.action}ed`;
              break;
            case 'schedule':
              eventText = row.action === 'create'
                ? `New schedule created ${details.route_name ? `for ${details.route_name}` : ''}`
                : `Schedule ${row.action}ed ${details.route_name ? `for ${details.route_name}` : ''}`;
              break;
            case 'driver':
              eventText = row.action === 'create'
                ? `New driver added: ${details.name || ''}`
                : `Driver ${details.name || ''} ${row.action}ed`;
              break;
            default:
              eventText = `${row.entity_type} ${row.action}ed`;
          }
          
          return {
            id: row.id,
            event: eventText,
            time: formatDistanceToNow(new Date(row.created_at), { addSuffix: true }),
            timestamp: new Date(row.created_at),
            entity_type: row.entity_type,
            entity_id: row.entity_id,
            action: row.action,
            user_id: row.user_id
          };
        });
        
        setRecentActivity(activities);
      } else {
        // If no activities found, set empty array
        setRecentActivity([]);
      }
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      
      // Fallback to static data if database query fails
      const now = new Date();
      const fallbackActivities: ActivityItem[] = [
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
      
      setRecentActivity(fallbackActivities);
    }
  };

  // Generate next 7 days for date selection
  const getNextSevenDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(new Date(), i));
    }
    return days;
  };

  // Filter schedules for the selected day
  const getSchedulesForSelectedDay = () => {
    return upcomingSchedules.filter(schedule => 
      isSameDay(schedule.date, selectedDay)
    );
  };

  // Load all data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch all required data
        await Promise.all([
          fetchUpcomingSchedules(),
          loadRoutes()
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
      fetchUpcomingSchedules();
      loadRoutes();
    }, 30000);
    
    // Update the live time display every second
    const timeInterval = setInterval(() => {
      const timeElement = document.getElementById('live-time');
      if (timeElement) {
        timeElement.textContent = new Date().toLocaleTimeString();
      }
    }, 1000);
    
    return () => {
      // Clean up intervals
      clearInterval(pollingInterval);
      clearInterval(timeInterval);
    };
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-500';
      case 'in-transit': return 'bg-amber-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get route status color
  const getRouteStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'suspended': return 'bg-red-500';
      case 'maintenance': return 'bg-amber-500';
      case 'new': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

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
            <Card className={`border-zippy-gray bg-zippy-darkGray animate-fadeSlideUp backdrop-blur-sm bg-opacity-80 shadow-lg`} style={{
            animationDelay: '400ms'
          }}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 gold-stroke">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => <Button key={index} variant="outline" className="bg-zippy-darkGray/70 border-zippy-gray/20 h-auto py-4 flex flex-col items-center justify-center hover:bg-zippy-gray/30 transition-all duration-300 shadow-md" onClick={() => navigate(action.path)}>
                      <div className="bg-zippy-purple text-white rounded-full p-2 mb-2 shadow-md">
                        {action.icon}
                      </div>
                      <span className="text-white">{action.title}</span>
                    </Button>)}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Schedules Section */}
            <Card className={`border-zippy-gray bg-zippy-darkGray animate-fadeSlideUp overflow-hidden backdrop-blur-sm bg-opacity-80 shadow-lg`} style={{
            animationDelay: '500ms'
          }}>
              <CardContent className="p-0">
                <div className="flex justify-between items-center p-6 border-b border-zippy-gray/30">
                  <h2 className="text-2xl font-bold gold-stroke">Upcoming Schedules</h2>
                  <Button variant="outline" className="bg-zippy-purple/10 border-zippy-purple/30 hover:bg-zippy-purple/20 transition-all duration-300 text-white" onClick={() => navigate('/schedule')}>
                    <span>View All</span>
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                
                {/* Date Selection - Improved UI */}
                <div className="flex bg-zippy-darkGray/50 p-2 overflow-x-auto no-scrollbar border-b border-zippy-gray/20">
                  {getNextSevenDays().map((day, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className={`${
                        isSameDay(day, selectedDay) 
                          ? 'bg-zippy-purple text-white' 
                          : 'hover:bg-zippy-gray/30 text-gray-300'
                      } flex-shrink-0 rounded-md transition-all duration-200 mx-1 px-4 h-[70px] w-[60px]`}
                      onClick={() => setSelectedDay(day)}
                    >
                      <div className="flex flex-col items-center py-1">
                        <span className="text-xs font-medium">{format(day, 'EEE')}</span>
                        <span className="text-xl font-bold my-0.5">{format(day, 'd')}</span>
                        <span className="text-xs">{format(day, 'MMM')}</span>
                      </div>
                    </Button>
                  ))}
                </div>
                
                {/* Schedules for Selected Day - Improved UI */}
                <div className="p-6 bg-gradient-to-b from-zippy-darkGray/70 to-zippy-darkGray/90">
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zippy-purple"></div>
                    </div>
                  ) : getSchedulesForSelectedDay().length > 0 ? (
                    <div className="space-y-3">
                      {getSchedulesForSelectedDay().map((schedule) => (
                        <div 
                          key={schedule.id}
                          className="bg-zippy-darkGray/70 rounded-lg cursor-pointer hover:bg-zippy-gray/30 transition-all duration-300 overflow-hidden flex backdrop-blur-sm border border-zippy-gray/20 shadow-md"
                          onClick={() => navigate(`/schedule?id=${schedule.id}`)}
                        >
                          {/* Status indicator */}
                          <div className={`w-1.5 ${getStatusColor(schedule.status)}`}></div>
                          
                          <div className="p-3 flex-1">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className={`${getStatusColor(schedule.status)} rounded-full p-2 shadow-md`}>
                                  <Bus className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-white">{schedule.routeName}</h3>
                                  <p className="text-sm text-gray-400 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1 inline" /> {schedule.origin} to {schedule.destination}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold flex items-center justify-end text-white">
                                  <Clock className="h-4 w-4 mr-1 text-zippy-purple" />
                                  {schedule.departureTime}
                                </p>
                                <p className="text-xs text-gray-400">{format(schedule.date, 'dd MMM yyyy')}</p>
                              </div>
                            </div>
                            <div className="mt-2 flex justify-between items-center text-sm">
                              <span className="text-gray-400">Bus: {schedule.busNumber}</span>
                              <Badge className={`${getStatusColor(schedule.status)} text-white px-2 py-0.5 text-xs rounded-md`}>
                                {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 px-4 bg-zippy-darkGray/40 rounded-lg border border-zippy-gray/20 backdrop-blur-sm">
                      <Calendar className="h-16 w-16 mx-auto mb-4 text-zippy-purple opacity-40" />
                      <p className="text-lg font-medium text-white">No schedules found for {format(selectedDay, 'dd MMM yyyy')}</p>
                      <p className="text-sm mt-2 text-gray-400">The world is a book and those who do not travel read only one page.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width - REPLACED RECENT ACTIVITY WITH SCHEDULE */}
          <div className="space-y-6">
            {/* Schedule Section - Replacing Recent Activity */}
            <Card className={`border-zippy-gray bg-zippy-darkGray animate-fadeSlideUp h-full backdrop-blur-sm bg-opacity-80 shadow-lg`} style={{
            animationDelay: '600ms'
          }}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 gold-stroke">Routes</h2>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zippy-purple"></div>
                    </div>
                  ) : routes.length > 0 ? (
                    routes.map(route => (
                      <div 
                        key={route.id} 
                        className="p-3 bg-zippy-darkGray/70 rounded-lg border border-zippy-gray/20 hover:bg-zippy-gray/30 transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-md"
                        onClick={() => navigate(`/routes/${route.id}`)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-zippy-purple rounded-full p-2 shadow-md">
                            <RouteIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{route.name}</h3>
                            <p className="text-sm text-gray-400 flex items-center">
                              <MapPin className="h-3 w-3 mr-1 inline" /> {route.origin} to {route.destination}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-sm text-gray-400">
                            {route.distance ? `${route.distance} km` : 'Distance not set'}
                           </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-12 text-gray-400 bg-zippy-darkGray/40 rounded-lg border border-zippy-gray/20 backdrop-blur-sm">
                      <RouteIcon className="h-16 w-16 mx-auto mb-4 text-zippy-purple opacity-40" />
                      <p className="text-lg font-medium text-white">No routes found.</p>
                      <p className="text-sm mt-2 text-gray-400">Discover comfortable and unique accommodations around the world.</p>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-6 bg-zippy-purple/10 border-zippy-purple/30 hover:bg-zippy-purple/20 transition-all duration-300 text-white" onClick={() => navigate('/routes')}>
                  View All Routes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};

export default Dashboard;