
import { useState, useEffect } from 'react';
import { 
  CalendarRange, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Loader2,
  Home,
  PieChart,
  BarChart
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { fetchBookings, BookingWithRelations } from '@/services/booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Interface for the transformed booking data to match UI requirements
interface UIBooking {
  id: string;
  customer: string;
  email: string;
  package: string;
  date: string;
  status: string;
  amount: number;
  type?: string;
  location?: string;
}

// Interface for booking statistics
interface BookingStats {
  location: string;
  count: number;
  revenue: number;
}

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookings, setBookings] = useState<UIBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStats[]>([]);
  const [activeTab, setActiveTab] = useState('list');
  const itemsPerPage = 7;
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Fetch bookings from the database
  useEffect(() => {
    const getBookings = async () => {
      try {
        setLoading(true);
        const data = await fetchBookings();
        
        // Transform the data to match the UI requirements
        const transformedBookings = data.map((booking: BookingWithRelations): UIBooking => {
          // Extract route information if available
          const routeName = booking.schedules?.routes?.name || 'Unknown Route';
          const origin = booking.schedules?.routes?.origin || '';
          const destination = booking.schedules?.routes?.destination || '';
          const routeInfo = `${routeName} (${origin} to ${destination})`;
          
          // Format the date
          const bookingDate = new Date(booking.booking_date).toLocaleDateString();
          
          // Capitalize the first letter of status
          const formattedStatus = booking.status 
            ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) 
            : 'Unknown';
          
          // Only bus type now
          const type = 'bus';
          const location = destination;
          
          return {
            id: booking.id,
            customer: booking.user_id, // Ideally, you would fetch user details to get the name
            email: `user-${booking.user_id.substring(0, 8)}@example.com`, // Placeholder email
            package: routeInfo,
            date: bookingDate,
            status: formattedStatus as 'Confirmed' | 'Pending' | 'Cancelled',
            amount: booking.total_fare,
            type,
            location
          };
        });
        
        setBookings(transformedBookings);
        
        // Generate booking statistics
        generateBookingStats(transformedBookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    getBookings();
  }, []);
  
  // Generate booking statistics for charts
  const generateBookingStats = (bookings: UIBooking[]) => {
    // Group by location
    const locationMap = new Map<string, { count: number, revenue: number }>();
    
    bookings.forEach(booking => {
      const location = booking.location || 'Unknown';
      if (!locationMap.has(location)) {
        locationMap.set(location, { count: 0, revenue: 0 });
      }
      
      const stats = locationMap.get(location)!;
      stats.count += 1;
      stats.revenue += booking.amount;
    });
    
    // Convert to array for charts
    const stats: BookingStats[] = Array.from(locationMap.entries()).map(([location, stats]) => ({
      location,
      count: stats.count,
      revenue: stats.revenue
    }));
    
    setBookingStats(stats);
  };
  
  // Filter bookings based on search, status filter, and type filter
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || booking.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calculate summary statistics
  const totalBookings = bookings.length;
  const busBookings = bookings.filter(b => b.type === 'bus').length;
  const confirmedBookings = bookings.filter(b => b.status.toLowerCase() === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status.toLowerCase() === 'pending').length;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarRange className="text-zippy-blue" />
          Bookings
        </h1>
      </div>
      
      {/* Booking Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bus Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{busBookings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedBookings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search bookings..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <Home size={16} />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="glass-card rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-zippy-blue" />
                <span className="ml-2">Loading bookings...</span>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-400 border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Package</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((booking) => (
                        <tr key={booking.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium">{booking.customer}</div>
                              <div className="text-sm text-gray-400">{booking.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">{booking.package}</td>
                          <td className="px-6 py-4">
                            <span className="capitalize">{booking.type}</span>
                          </td>
                          <td className="px-6 py-4">{booking.date}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium',
                              booking.status.toLowerCase() === 'confirmed' ? 'status-confirmed' : 
                              booking.status.toLowerCase() === 'pending' ? 'status-pending' :
                              'bg-zippy-red/20 text-zippy-red'
                            )}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">${booking.amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                          No bookings found matching your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {filteredBookings.length > 0 && (
              <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBookings.length)} of {filteredBookings.length}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <Home size={16} />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {bookingStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={bookingStats}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="location" angle={-45} textAnchor="end" height={60} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" name="Bookings" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No booking data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {bookingStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={bookingStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ location, count, percent }) => `${location}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {bookingStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No booking data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {bookingStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={bookingStats}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="location" angle={-45} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No revenue data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
