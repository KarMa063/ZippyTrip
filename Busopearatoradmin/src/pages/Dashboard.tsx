import React, { useEffect, useState } from 'react';
import { ChevronRight, DollarSign, MapPin, Route, Users, Bus, ArrowUp, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // Simulate data loading and trigger animations
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Get current date and time
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Animated stats with realistic data
  const stats = [{
    id: 1,
    title: 'Total Bookings',
    value: '1,256',
    increase: '+12.5%',
    icon: <DollarSign className="h-8 w-8 text-zippy-purple" />,
    color: 'from-purple-500 to-indigo-600',
    delay: 0
  }, {
    id: 2,
    title: 'Active Routes',
    value: '28',
    increase: '+4.3%',
    icon: <Route className="h-8 w-8 text-green-500" />,
    color: 'from-green-400 to-teal-500',
    delay: 100
  }, {
    id: 3,
    title: 'Total Passengers',
    value: '18,432',
    increase: '+8.1%',
    icon: <Users className="h-8 w-8 text-blue-500" />,
    color: 'from-blue-400 to-blue-600',
    delay: 200
  }, {
    id: 4,
    title: 'Fleet Size',
    value: '42',
    increase: '+3 units',
    icon: <Bus className="h-8 w-8 text-amber-500" />,
    color: 'from-amber-400 to-amber-600',
    delay: 300
  }];

  // Quick actions
  const quickActions = [{
    title: 'Add New Route',
    path: '/routes/add',
    icon: <Route className="h-5 w-5" />
  }, {
    title: 'View Bookings',
    path: '/bookings',
    icon: <DollarSign className="h-5 w-5" />
  }, {
    title: 'Schedule',
    path: '/schedule',
    icon: <Calendar className="h-5 w-5" />
  }, {
    title: 'Analytics',
    path: '/analytics',
    icon: <ChevronRight className="h-5 w-5" />
  }];

  // Recent activity dummy data
  const recentActivity = [{
    id: 1,
    event: 'New booking on Delhi-Mumbai route',
    time: '15 minutes ago'
  }, {
    id: 2,
    event: 'Bus #B-1234 completed trip',
    time: '45 minutes ago'
  }, {
    id: 3,
    event: 'Schedule updated for Bangalore-Chennai',
    time: '2 hours ago'
  }, {
    id: 4,
    event: 'New route added: Jaipur-Udaipur',
    time: '3 hours ago'
  }, {
    id: 5,
    event: 'Price adjustment on 3 routes',
    time: '5 hours ago'
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

        {/* Stats Cards Row - Animated with delay for each */}
        

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

            {/* Top Routes Performance Section with Fancy Graphics */}
            <Card className={`border-zippy-gray bg-zippy-darkGray animate-fadeSlideUp`} style={{
            animationDelay: '500ms'
          }}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 gold-stroke">Top Route Performance</h2>
                <div className="space-y-4">
                  {/* Route 1 */}
                  <div className="p-4 bg-zippy-gray rounded-lg border border-zippy-lightGray card-hover">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-500 rounded-full p-2.5">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">Delhi - Mumbai</h3>
                          <p className="text-sm text-muted-foreground">124 bookings this week</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">₹189,450</p>
                        <p className="text-sm text-green-500 flex items-center justify-end">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          12.4%
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-zippy-lightGray rounded-full h-2.5">
                        <div className="bg-purple-500 h-2.5 rounded-full" style={{
                        width: '78%'
                      }}></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span>Occupancy: 78%</span>
                        <span>Target: 80%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Route 2 */}
                  <div className="p-4 bg-zippy-gray rounded-lg border border-zippy-lightGray card-hover">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-500 rounded-full p-2.5">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">Bangalore - Chennai</h3>
                          <p className="text-sm text-muted-foreground">98 bookings this week</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">₹142,750</p>
                        <p className="text-sm text-green-500 flex items-center justify-end">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          8.7%
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-zippy-lightGray rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{
                        width: '65%'
                      }}></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span>Occupancy: 65%</span>
                        <span>Target: 75%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Route 3 */}
                  <div className="p-4 bg-zippy-gray rounded-lg border border-zippy-lightGray card-hover">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-500 rounded-full p-2.5">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">Jaipur - Delhi</h3>
                          <p className="text-sm text-muted-foreground">87 bookings this week</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">₹95,840</p>
                        <p className="text-sm text-green-500 flex items-center justify-end">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          5.2%
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-zippy-lightGray rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{
                        width: '82%'
                      }}></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span>Occupancy: 82%</span>
                        <span>Target: 70%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Recent Activity Feed */}
            <Card className={`border-zippy-gray bg-zippy-darkGray animate-fadeSlideUp h-full`} style={{
            animationDelay: '600ms'
          }}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 gold-stroke">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map(activity => <div key={activity.id} className="p-3 bg-zippy-gray rounded-lg border border-zippy-lightGray card-hover">
                      <p className="font-medium">{activity.event}</p>
                      <p className="text-sm text-muted-foreground mt-1">{activity.time}</p>
                    </div>)}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-zippy-gray border-zippy-lightGray">
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