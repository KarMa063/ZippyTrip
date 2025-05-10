import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Check, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBooking, updateBooking } from '@/services/api/bookings';

const BookingCheckIn = () => {
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!bookingId.trim()) return;
    
    setIsLoading(true);
    setError('');
    setBooking(null);
    
    try {
      const data = await getBooking(bookingId);
      setBooking(data);
      
      if (!data) {
        setError('Booking not found');
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Failed to fetch booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!booking) return;
    
    setIsLoading(true);
    
    try {
      await updateBooking(booking.id, { status: 'completed' });
      
      toast({
        title: "Check-in Successful",
        description: `Passenger checked in for ${booking.schedules?.routes?.name}`,
      });
      
      // Update local state
      setBooking({
        ...booking,
        status: 'completed'
      });
    } catch (err) {
      console.error('Error checking in passenger:', err);
      toast({
        title: "Check-in Failed",
        description: "Failed to check in passenger",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status) {
      case 'confirmed':
        return <Badge variant="outline" className="border-green-500 text-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-700 text-green-700">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-zippy-darkGray border-zippy-gray">
      <CardHeader>
        <CardTitle>Passenger Check-in</CardTitle>
        <CardDescription>Check in passengers for their trips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Enter booking ID"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="bg-zippy-gray border-zippy-gray"
          />
          <Button 
            onClick={handleSearch}
            disabled={isLoading || !bookingId.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2">Search</span>
          </Button>
        </div>
        
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
        
        {booking && (
          <div className="border border-zippy-gray rounded-md p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{booking.schedules?.routes?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {booking.schedules?.routes?.origin} → {booking.schedules?.routes?.destination}
                </p>
              </div>
              {getStatusBadge(booking.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p>{booking.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passenger</p>
                <p>User ID: {booking.user_id.substring(0, 8)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departure</p>
                <p>{formatDate(booking.schedules?.departure_time)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seats</p>
                <p>{booking.seat_numbers.join(', ')}</p>
              </div>
            </div>
            
            <Button
              className="w-full"
              disabled={isLoading || booking.status === 'completed' || booking.status === 'cancelled'}
              onClick={handleCheckIn}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {booking.status === 'completed' 
                ? 'Already Checked In' 
                : booking.status === 'cancelled'
                  ? 'Booking Cancelled'
                  : 'Check In Passenger'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCheckIn;