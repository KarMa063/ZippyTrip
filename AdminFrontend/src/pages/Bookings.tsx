
import { useState } from 'react';
import { 
  CalendarRange, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Filter
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

interface Booking {
  id: number;
  customer: string;
  email: string;
  package: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  amount: number;
}

const bookingsData: Booking[] = [
  { id: 1, customer: 'John Doe', email: 'john@example.com', package: 'Paris Tour', date: '2023-09-15', status: 'Confirmed', amount: 2500 },
  { id: 2, customer: 'Jane Smith', email: 'jane@example.com', package: 'Tokyo Adventure', date: '2023-09-20', status: 'Pending', amount: 3200 },
  { id: 3, customer: 'Mike Johnson', email: 'mike@example.com', package: 'Safari Trip', date: '2023-09-25', status: 'Confirmed', amount: 4100 },
  { id: 4, customer: 'Emily Davis', email: 'emily@example.com', package: 'Rome Explorer', date: '2023-10-05', status: 'Confirmed', amount: 2800 },
  { id: 5, customer: 'Alex Wilson', email: 'alex@example.com', package: 'NYC Weekend', date: '2023-10-10', status: 'Cancelled', amount: 1200 },
  { id: 6, customer: 'Sarah Brown', email: 'sarah@example.com', package: 'Bali Retreat', date: '2023-10-15', status: 'Pending', amount: 3500 },
  { id: 7, customer: 'David Lee', email: 'david@example.com', package: 'London Tour', date: '2023-10-20', status: 'Confirmed', amount: 2900 },
  { id: 8, customer: 'Lisa Chen', email: 'lisa@example.com', package: 'Maldives Package', date: '2023-10-25', status: 'Pending', amount: 5000 },
  { id: 9, customer: 'James Wilson', email: 'james@example.com', package: 'Grand Canyon', date: '2023-11-01', status: 'Confirmed', amount: 2300 },
  { id: 10, customer: 'Emma Thomas', email: 'emma@example.com', package: 'Dubai Experience', date: '2023-11-05', status: 'Cancelled', amount: 4200 },
];

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // Filter bookings based on search and status filter
  const filteredBookings = bookingsData.filter(booking => {
    const matchesSearch = 
      booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarRange className="text-zippy-blue" />
          Bookings
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
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
        </div>
      </div>
      
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Package</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((booking) => (
                <tr key={booking.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{booking.customer}</div>
                      <div className="text-sm text-gray-400">{booking.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{booking.package}</td>
                  <td className="px-6 py-4">{new Date(booking.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      booking.status === 'Confirmed' ? 'status-confirmed' : 
                      booking.status === 'Pending' ? 'status-pending' :
                      'bg-zippy-red/20 text-zippy-red'
                    )}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">${booking.amount}</td>
                </tr>
              ))}
              
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No bookings found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
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
    </div>
  );
}
