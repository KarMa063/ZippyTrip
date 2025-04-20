
import { Calendar, DollarSign, Filter, Search, TrendingUp, Users, MapPin, Route, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Mock data for analytics
const revenueData = [
  { month: "Jan", revenue: 42000, passengers: 4200 },
  { month: "Feb", revenue: 38000, passengers: 3800 },
  { month: "Mar", revenue: 45000, passengers: 4500 },
  { month: "Apr", revenue: 48500, passengers: 4850 },
  { month: "May", revenue: 53000, passengers: 5300 },
  { month: "Jun", revenue: 59000, passengers: 5900 },
  { month: "Jul", revenue: 65000, passengers: 6500 },
  { month: "Aug", revenue: 67000, passengers: 6700 },
  { month: "Sep", revenue: 63000, passengers: 6300 },
  { month: "Oct", revenue: 57000, passengers: 5700 },
  { month: "Nov", revenue: 52000, passengers: 5200 },
  { month: "Dec", revenue: 48000, passengers: 4800 },
];

const routePerformance = [
  { name: "Delhi-Mumbai", revenue: 185000, passengers: 7200, efficiency: 92 },
  { name: "Bangalore-Chennai", revenue: 124000, passengers: 6500, efficiency: 88 },
  { name: "Kolkata-Hyderabad", revenue: 96000, passengers: 4800, efficiency: 81 },
  { name: "Pune-Goa", revenue: 108000, passengers: 5400, efficiency: 85 },
  { name: "Jaipur-Delhi", revenue: 72000, passengers: 4200, efficiency: 76 },
];

const busTypePieData = [
  { name: "Luxury", value: 40 },
  { name: "Standard", value: 25 },
  { name: "Sleeper", value: 20 },
  { name: "Deluxe", value: 10 },
  { name: "AC Sleeper", value: 5 },
];

const COLORS = ["#8B5CF6", "#6D48D6", "#9B87F5", "#B4A0FF", "#D4CAFF"];

const Analytics = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Performance metrics and business insights</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Select defaultValue="year">
            <SelectTrigger className="w-[180px] bg-zippy-darkGray border-zippy-gray">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent className="bg-zippy-darkGray border-zippy-gray">
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-zippy-darkGray border-zippy-gray">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" className="bg-zippy-darkGray border-zippy-gray">
            <Calendar className="mr-2 h-4 w-4" />
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
            <div className="text-2xl font-bold">$587,500</div>
            <div className="flex items-center mt-1 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12.5% from last year</span>
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
            <div className="text-2xl font-bold">63,750</div>
            <div className="flex items-center mt-1 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8.3% from last year</span>
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
            <div className="text-2xl font-bold">24</div>
            <div className="flex items-center mt-1 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+4 from last year</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Bus className="h-5 w-5 mr-2 text-zippy-purple" />
                Fleet Size
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <div className="flex items-center mt-1 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+3 from last year</span>
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
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-7">
            <Card className="bg-zippy-darkGray border-zippy-gray md:col-span-4">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
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
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E1E1E", borderColor: "#333" }} 
                      formatter={(value) => [`$${value}`, "Revenue"]}
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
                <CardTitle>Bus Type Distribution</CardTitle>
                <CardDescription>Breakdown by vehicle type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={busTypePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {busTypePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E1E1E", borderColor: "#333" }} 
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            <Card className="bg-zippy-darkGray border-zippy-gray md:col-span-2">
              <CardHeader>
                <CardTitle>Top Performing Routes</CardTitle>
                <CardDescription>Routes by revenue and efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-zippy-gray">
                      <TableRow>
                        <TableHead>Route Name</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Passengers</TableHead>
                        <TableHead>Efficiency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routePerformance.map((route, i) => (
                        <TableRow key={i} className="border-b border-zippy-gray">
                          <TableCell className="font-medium">{route.name}</TableCell>
                          <TableCell>${route.revenue.toLocaleString()}</TableCell>
                          <TableCell>{route.passengers.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div 
                                className="w-16 bg-zippy-gray rounded-full h-2 mr-2 overflow-hidden"
                              >
                                <div 
                                  className={`h-full ${
                                    route.efficiency >= 85 
                                      ? "bg-green-500" 
                                      : route.efficiency >= 70 
                                      ? "bg-amber-500" 
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${route.efficiency}%` }}
                                />
                              </div>
                              <span>{route.efficiency}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>
                  Important trends and observations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <h3 className="font-medium mb-2 text-zippy-purple">Revenue Growth</h3>
                    <p className="text-sm">Revenue increased by 12.5% compared to the previous year, with the Delhi-Mumbai route being the top performer.</p>
                  </div>
                  
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <h3 className="font-medium mb-2 text-zippy-purple">Passenger Trends</h3>
                    <p className="text-sm">Weekend occupancy rates have increased by 15%, suggesting potential for additional weekend services.</p>
                  </div>
                  
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <h3 className="font-medium mb-2 text-zippy-purple">Fleet Utilization</h3>
                    <p className="text-sm">Luxury buses show 92% utilization rate, highest among all bus types, indicating strong demand for premium services.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="routes">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader>
                <CardTitle>Route Revenue Comparison</CardTitle>
                <CardDescription>Top 5 routes by revenue</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={routePerformance}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E1E1E", borderColor: "#333" }} 
                      formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader>
                <CardTitle>Route Passenger Volume</CardTitle>
                <CardDescription>Top 5 routes by passenger count</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={routePerformance}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E1E1E", borderColor: "#333" }} 
                      formatter={(value) => [`${value.toLocaleString()}`, "Passengers"]}
                    />
                    <Legend />
                    <Bar dataKey="passengers" fill="#6D48D6" name="Passengers" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 mt-6">
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader>
                <CardTitle>Route Efficiency</CardTitle>
                <CardDescription>
                  Efficiency metrics for top routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routePerformance.map((route, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{route.name}</span>
                        <span className={`text-sm ${
                          route.efficiency >= 85 
                            ? "text-green-500" 
                            : route.efficiency >= 70 
                            ? "text-amber-500" 
                            : "text-red-500"
                        }`}>
                          {route.efficiency}%
                        </span>
                      </div>
                      <div className="w-full bg-zippy-gray rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full ${
                            route.efficiency >= 85 
                              ? "bg-green-500" 
                              : route.efficiency >= 70 
                              ? "bg-amber-500" 
                              : "bg-red-500"
                          }`}
                          style={{ width: `${route.efficiency}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader>
                <CardTitle>Route Growth</CardTitle>
                <CardDescription>
                  Year-over-year growth by route
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routePerformance.map((route, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-zippy-gray rounded-md">
                      <span className="font-medium">{route.name}</span>
                      <span className="text-green-500">
                        +{Math.floor(Math.random() * 15) + 5}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader>
                <CardTitle>Route Recommendations</CardTitle>
                <CardDescription>
                  AI-powered suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-zippy-gray rounded-md">
                    <h3 className="font-medium text-zippy-purple">New Route Potential</h3>
                    <p className="text-sm mt-1">Consider adding a direct Mumbai to Jaipur route based on passenger search data.</p>
                  </div>
                  
                  <div className="p-3 bg-zippy-gray rounded-md">
                    <h3 className="font-medium text-zippy-purple">Schedule Optimization</h3>
                    <p className="text-sm mt-1">Adding an early morning departure on Delhi-Mumbai route could increase ridership by 8%.</p>
                  </div>
                  
                  <div className="p-3 bg-zippy-gray rounded-md">
                    <h3 className="font-medium text-zippy-purple">Pricing Strategy</h3>
                    <p className="text-sm mt-1">Dynamic pricing model for Bangalore-Chennai could increase revenue by 12%.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="passengers">
          <div className="grid gap-6 md:grid-cols-7">
            <Card className="bg-zippy-darkGray border-zippy-gray md:col-span-4">
              <CardHeader>
                <CardTitle>Passenger Trends</CardTitle>
                <CardDescription>Monthly passenger counts</CardDescription>
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
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E1E1E", borderColor: "#333" }} 
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="passengers"
                      stroke="#9B87F5"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray md:col-span-3">
              <CardHeader>
                <CardTitle>Passenger Demographics</CardTitle>
                <CardDescription>Breakdown by age and type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-medium">Age Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">18-24</span>
                      <span className="text-sm">22%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-zippy-purple h-full rounded-full" style={{ width: "22%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">25-34</span>
                      <span className="text-sm">35%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-zippy-purple h-full rounded-full" style={{ width: "35%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">35-44</span>
                      <span className="text-sm">25%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-zippy-purple h-full rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">45-64</span>
                      <span className="text-sm">15%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-zippy-purple h-full rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">65+</span>
                      <span className="text-sm">3%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-zippy-purple h-full rounded-full" style={{ width: "3%" }} />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium">Passenger Type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-zippy-gray rounded-md text-center">
                      <div className="text-xl font-bold">62%</div>
                      <div className="text-sm text-muted-foreground">Business</div>
                    </div>
                    
                    <div className="p-3 bg-zippy-gray rounded-md text-center">
                      <div className="text-xl font-bold">38%</div>
                      <div className="text-sm text-muted-foreground">Leisure</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 mt-6">
            <Card className="bg-zippy-darkGray border-zippy-gray md:col-span-2">
              <CardHeader>
                <CardTitle>Booking Patterns</CardTitle>
                <CardDescription>
                  How and when passengers book tickets
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={[
                      { name: "Same Day", value: 15 },
                      { name: "1-3 Days", value: 25 },
                      { name: "4-7 Days", value: 35 },
                      { name: "8-14 Days", value: 15 },
                      { name: "15+ Days", value: 10 },
                    ]}
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
                      formatter={(value) => [`${value}%`, "Bookings"]}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#6D48D6" name="Percentage" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader>
                <CardTitle>Booking Channels</CardTitle>
                <CardDescription>
                  Ticket sales by platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mobile App</span>
                      <span className="text-sm">42%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-zippy-purple h-full rounded-full" style={{ width: "42%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Website</span>
                      <span className="text-sm">35%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-zippy-purple h-full rounded-full" style={{ width: "35%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Travel Agents</span>
                      <span className="text-sm">15%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-zippy-purple h-full rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Call Center</span>
                      <span className="text-sm">5%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-zippy-purple h-full rounded-full" style={{ width: "5%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bus Station</span>
                      <span className="text-sm">3%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-zippy-purple h-full rounded-full" style={{ width: "3%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financial">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-zippy-darkGray border-zippy-gray md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue vs. Expenses</CardTitle>
                <CardDescription>Monthly financial overview</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={[
                      { month: "Jan", revenue: 42000, expenses: 32000 },
                      { month: "Feb", revenue: 38000, expenses: 30000 },
                      { month: "Mar", revenue: 45000, expenses: 33000 },
                      { month: "Apr", revenue: 48500, expenses: 35000 },
                      { month: "May", revenue: 53000, expenses: 36000 },
                      { month: "Jun", revenue: 59000, expenses: 39000 },
                    ]}
                    margin={{
                      top: 20,
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
                      formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#6D48D6" name="Expenses" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>
                  Major expense categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fuel</span>
                      <span className="text-sm">35%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: "35%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Staff Salaries</span>
                      <span className="text-sm">28%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: "28%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Maintenance</span>
                      <span className="text-sm">18%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: "18%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Insurance</span>
                      <span className="text-sm">10%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-green-500 h-full rounded-full" style={{ width: "10%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Taxes & Permits</span>
                      <span className="text-sm">5%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: "5%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Other</span>
                      <span className="text-sm">4%</span>
                    </div>
                    <div className="w-full bg-zippy-gray rounded-full h-2">
                      <div className="bg-pink-500 h-full rounded-full" style={{ width: "4%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 mt-6">
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader>
                <CardTitle>Profitability Metrics</CardTitle>
                <CardDescription>
                  Key financial indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Gross Margin</div>
                    <div className="text-2xl font-bold">38.5%</div>
                    <div className="text-xs text-green-500">+2.3% from last year</div>
                  </div>
                  
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Operating Margin</div>
                    <div className="text-2xl font-bold">22.7%</div>
                    <div className="text-xs text-green-500">+1.5% from last year</div>
                  </div>
                  
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Net Profit Margin</div>
                    <div className="text-2xl font-bold">18.2%</div>
                    <div className="text-xs text-green-500">+1.8% from last year</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader>
                <CardTitle>Revenue per Bus</CardTitle>
                <CardDescription>
                  Average monthly revenue by bus type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Luxury</div>
                    <div className="text-2xl font-bold">$12,850</div>
                    <div className="text-xs text-green-500">Highest earning</div>
                  </div>
                  
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">AC Sleeper</div>
                    <div className="text-2xl font-bold">$10,200</div>
                  </div>
                  
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Deluxe</div>
                    <div className="text-2xl font-bold">$8,500</div>
                  </div>
                  
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Standard</div>
                    <div className="text-2xl font-bold">$7,200</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zippy-darkGray border-zippy-gray">
              <CardHeader>
                <CardTitle>Financial Insights</CardTitle>
                <CardDescription>
                  Key observations and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <h3 className="font-medium text-zippy-purple mb-1">Fuel Efficiency</h3>
                    <p className="text-sm">Fuel costs have decreased by 5% due to route optimization and newer buses.</p>
                  </div>
                  
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <h3 className="font-medium text-zippy-purple mb-1">Premium Services</h3>
                    <p className="text-sm">Luxury and AC Sleeper buses deliver 40% higher profit margins than standard buses.</p>
                  </div>
                  
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <h3 className="font-medium text-zippy-purple mb-1">Seasonal Trends</h3>
                    <p className="text-sm">Holiday season (Oct-Dec) shows 22% higher revenue compared to other quarters.</p>
                  </div>
                  
                  <div className="p-4 bg-zippy-gray rounded-md">
                    <h3 className="font-medium text-zippy-purple mb-1">Cost Optimization</h3>
                    <p className="text-sm">Maintenance cost reduced by 8% through preventive maintenance scheduling.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
