import { useState, useEffect } from 'react';
import { 
  Bus, Calendar, BarChart, Filter, Download, 
  TrendingUp, Users, MapPin, DollarSign 
} from 'lucide-react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchDashboardStats, 
  fetchRevenueData, 
  fetchRoutePerformance, 
  fetchBusTypeDistribution,
  generateReport
} from '@/services/analytics';
import { 
  LineChart, Line, BarChart as RechartsBarChart, Bar, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Colors for charts
const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#F59E0B'];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('year');
  const [dashboardStats, setDashboardStats] = useState({
    total_revenue: 0,
    total_passengers: 0,
    active_routes: 0,
    fleet_size: 0,
    revenue_growth: 0,
    passenger_growth: 0,
    route_growth: 0,
    fleet_growth: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [routePerformance, setRoutePerformance] = useState([]);
  const [busTypeData, setBusTypeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData(timeRange);
  }, [timeRange]);

  const fetchAnalyticsData = async (period) => {
    setIsLoading(true);
    try {
      // Prepare date range based on selected period
      const now = new Date();
      let startDate, endDate;
      
      switch(period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          endDate = now;
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
          break;
        default:
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
      }
      
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        period
      };
      
      // Fetch all required data
      const stats = await fetchDashboardStats(params);
      const revenue = await fetchRevenueData(params);
      const routes = await fetchRoutePerformance(params);
      const busTypes = await fetchBusTypeDistribution(params);
      
      setDashboardStats(stats);
      setRevenueData(revenue);
      setRoutePerformance(routes);
      
      // Transform bus type data for pie chart
      const busTypeChartData = busTypes.map(item => ({
        name: item.bus_type,
        value: parseFloat(((item.booking_count / stats.total_passengers) * 100).toFixed(1))
      }));
      
      setBusTypeData(busTypeChartData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async (reportType) => {
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      const endDate = now.toISOString();
      
      const params = {
        reportType,
        startDate,
        endDate,
        format: 'csv'
      };
      
      const fileUrl = await generateReport(params);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the URL to free up memory
      setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
      
      toast({
        title: "Report Generated",
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been downloaded`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Performance metrics and business insights</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-zippy-darkGray border-zippy-gray">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent className="bg-zippy-darkGray border-zippy-gray">
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-zippy-darkGray border-zippy-gray">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            className="bg-zippy-darkGray border-zippy-gray"
            onClick={() => handleExportReport('dashboard')}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-zippy-purple" />
                Total Revenue
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NPR {dashboardStats.total_revenue.toLocaleString()}</div>
            <div className="flex items-center mt-1 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-zippy-purple" />
                Total Passengers
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.total_passengers.toLocaleString()}</div>
            <div className="flex items-center mt-1 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
            
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-zippy-purple" />
                Active Routes
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.active_routes}</div>
            <div className="flex items-center mt-1 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              
            </div>
          </CardContent>
        </Card>
        
        
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-zippy-gray">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routes">Route Analytics</TabsTrigger>
          <TabsTrigger value="passengers">Passenger Analytics</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-7">
            <Card className="bg-zippy-darkGray border-zippy-gray md:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue for the current year</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-zippy-darkGray border-zippy-gray"
                  onClick={() => handleExportReport('revenue')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
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
                    <XAxis dataKey="time_period" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E1E1E", borderColor: "#333" }} 
                      formatter={(value) => [formatCurrency(value), "Revenue"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray md:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Bus Type Distribution</CardTitle>
                  <CardDescription>Breakdown by vehicle type</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-zippy-darkGray border-zippy-gray"
                  onClick={() => handleExportReport('buses')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={busTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    >
                      {busTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E1E1E", borderColor: "#333" }} 
                      formatter={(value) => [`${value}%`, "Percentage"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-zippy-darkGray border-zippy-gray">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Performing Routes</CardTitle>
                <CardDescription>Routes by revenue and efficiency</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-zippy-darkGray border-zippy-gray"
                onClick={() => handleExportReport('routes')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-zippy-gray">
                    <TableRow>
                      <TableHead>Route Name</TableHead>
                      <TableHead>Origin - Destination</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Passengers</TableHead>
                      <TableHead>Occupancy Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routePerformance.slice(0, 5).map((route, index) => (
                      <TableRow key={route.id || index} className="border-b border-zippy-gray">
                        <TableCell className="font-medium">{route.name}</TableCell>
                        <TableCell>{route.origin} → {route.destination}</TableCell>
                        <TableCell>{formatCurrency(route.total_revenue)}</TableCell>
                        <TableCell>{route.total_bookings}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`
                              ${route.occupancy_rate >= 80 ? 'border-green-500 text-green-500' : 
                                route.occupancy_rate >= 60 ? 'border-blue-500 text-blue-500' : 
                                'border-amber-500 text-amber-500'}
                            `}
                          >
                            {Math.round(route.occupancy_rate)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="routes">
          <Card className="bg-zippy-darkGray border-zippy-gray">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Route Performance Analysis</CardTitle>
                <CardDescription>Detailed metrics for all routes</CardDescription>
              </div>
              <Button 
                variant="outline" 
                className="bg-zippy-darkGray border-zippy-gray"
                onClick={() => handleExportReport('routes-detailed')}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-zippy-gray">
                    <TableRow>
                      <TableHead>Route Name</TableHead>
                      <TableHead>Origin - Destination</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Occupancy Rate</TableHead>
                      <TableHead>Avg. Fare</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routePerformance.map((route, index) => (
                      <TableRow key={route.id || index} className="border-b border-zippy-gray">
                        <TableCell className="font-medium">{route.name}</TableCell>
                        <TableCell>{route.origin} → {route.destination}</TableCell>
                        <TableCell>{formatCurrency(route.total_revenue)}</TableCell>
                        <TableCell>{route.total_bookings}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`
                              ${route.occupancy_rate >= 80 ? 'border-green-500 text-green-500' : 
                                route.occupancy_rate >= 60 ? 'border-blue-500 text-blue-500' : 
                                'border-amber-500 text-amber-500'}
                            `}
                          >
                            {Math.round(route.occupancy_rate)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(route.total_revenue / route.total_bookings)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="passengers">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Passenger Growth</CardTitle>
                  <CardDescription>Monthly passenger counts</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-zippy-darkGray border-zippy-gray"
                  onClick={() => handleExportReport('passengers')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
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
                    <XAxis dataKey="time_period" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E1E1E", borderColor: "#333" }} 
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="passengers"
                      stroke="#EC4899"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Booking Distribution</CardTitle>
                  <CardDescription>By time of day</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-zippy-darkGray border-zippy-gray"
                  onClick={() => handleExportReport('bookings-time')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={[
                      { time: 'Morning', bookings: 120 },
                      { time: 'Afternoon', bookings: 98 },
                      { time: 'Evening', bookings: 165 },
                      { time: 'Night', bookings: 75 },
                    ]}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E1E1E", borderColor: "#333" }} 
                    />
                    <Legend />
                    <Bar 
                      dataKey="bookings" 
                      fill="#3B82F6" 
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financial">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                  <CardDescription>Monthly financial comparison</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-zippy-darkGray border-zippy-gray"
                  onClick={() => handleExportReport('financial')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: 'Jan', revenue: 40000, expenses: 25000 },
                      { month: 'Feb', revenue: 38000, expenses: 24000 },
                      { month: 'Mar', revenue: 45000, expenses: 26000 },
                      { month: 'Apr', revenue: 48000, expenses: 27000 },
                      { month: 'May', revenue: 52000, expenses: 28000 },
                      { month: 'Jun', revenue: 58000, expenses: 30000 },
                      { month: 'Jul', revenue: 62000, expenses: 31000 },
                      { month: 'Aug', revenue: 65000, expenses: 32000 },
                      { month: 'Sep', revenue: 61000, expenses: 31000 },
                      { month: 'Oct', revenue: 58000, expenses: 30000 },
                      { month: 'Nov', revenue: 55000, expenses: 29000 },
                      { month: 'Dec', revenue: 48000, expenses: 27000 },
                    ]}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E1E1E", borderColor: "#333" }} 
                      formatter={(value) => [formatCurrency(value), ""]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#F43F5E"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue by Bus Type</CardTitle>
                  <CardDescription>Contribution by vehicle category</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-zippy-darkGray border-zippy-gray"
                  onClick={() => handleExportReport('revenue-by-bus')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={busTypeData.map(type => ({
                      name: type.name,
                      revenue: type.value * dashboardStats.total_revenue / 100
                    }))}
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
                      formatter={(value) => [formatCurrency(value), "Revenue"]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      fill="#F59E0B" 
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;