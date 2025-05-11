
import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchBookings, BookingWithRelations } from '@/services/booking';

interface UIBooking {
  id: string;
  customer: string;
  package: string;
  date: string;
  status: string;
  amount: number;
}

export default function RecentBookings() {
  const [bookings, setBookings] = useState<UIBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecentBookings = async () => {
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
          
          // Format the amount to ensure it doesn't exceed 10 digits
          const formattedAmount = booking.total_fare > 9999999 
            ? Math.floor(booking.total_fare / 1000000) + 'M'
            : booking.total_fare;
          
          return {
            id: booking.id,
            customer: booking.user_id.substring(0, 8), // Shortened user ID
            package: routeInfo,
            date: bookingDate,
            status: formattedStatus,
            amount: booking.total_fare
          };
        });
        
        // Sort by date (newest first) and take only the most recent 5
        const sortedBookings = transformedBookings
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        
        setBookings(sortedBookings);
      } catch (err) {
        console.error("Error fetching recent bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    
    getRecentBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Card className="glass-card rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CalendarClock className="text-zippy-blue" size={20} />
          <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zippy-blue"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No recent bookings found
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex justify-between items-center border-b border-white/[0.08] pb-3 last:border-0">
                <div>
                  <p className="font-medium">{booking.customer}</p>
                  <p className="text-sm text-gray-400">{booking.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {booking.amount > 9999999 
                      ? `NPR ${(booking.amount / 1000000).toFixed(1)}M` 
                      : `NPR ${booking.amount}`}
                  </p>
                  <Badge variant="outline" className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
