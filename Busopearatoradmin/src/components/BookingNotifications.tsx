import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

type RouteDetails = {
  name: string;
  origin: string;
  destination: string;
};

type ScheduleDetails = {
  departure_time: string;
  arrival_time: string;
  routes?: RouteDetails;
};

type BookingWithDetails = {
  id: string;
  created_at: string;
  total_fare: number;
  status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  seat_numbers: string[];
  schedules?: ScheduleDetails;
};

const BookingNotifications = () => {
  const [notifications, setNotifications] = useState<BookingWithDetails[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Load initial notifications
  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            schedules (
              departure_time,
              arrival_time,
              routes (
                name,
                origin,
                destination
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        // Set notifications with all as unread initially
        // Convert the data to match BookingWithDetails shape
        const typedNotifications: BookingWithDetails[] = (data || []).map((booking: any) => ({
          id: booking.id,
          created_at: booking.created_at,
          total_fare: booking.total_fare,
          status: booking.status,
          payment_status: booking.payment_status,
          payment_method: booking.payment_method,
          seat_numbers: booking.seat_numbers || [],
          schedules: booking.schedules ? {
            departure_time: booking.schedules.departure_time,
            arrival_time: booking.schedules.arrival_time,
            routes: booking.schedules.routes
          } : undefined
        }));
        
        setNotifications(typedNotifications);
        setUnreadCount(typedNotifications.length || 0);
      } catch (error) {
        console.error('Error fetching recent bookings:', error);
      }
    };

    fetchRecentBookings();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('bookings-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
        },
        async (payload) => {
          try {
            // Fetch the complete booking with related data
            const { data, error } = await supabase
              .from('bookings')
              .select(`
                *,
                schedules (
                  departure_time,
                  arrival_time,
                  routes (
                    name,
                    origin,
                    destination
                  )
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) throw error;
            if (!data) return;

            // Show toast notification
            const routeName = data.schedules?.routes?.name || 'Unknown route';
            toast({
              title: "New Booking Received",
              description: `Route: ${routeName}`,
            });

            // Convert to BookingWithDetails format
            const newBooking: BookingWithDetails = {
              id: data.id,
              created_at: data.created_at,
              total_fare: data.total_fare,
              status: data.status,
              payment_status: data.payment_status,
              payment_method: data.payment_method,
              seat_numbers: data.seat_numbers || [],
              schedules: data.schedules ? {
                departure_time: data.schedules.departure_time,
                arrival_time: data.schedules.arrival_time,
                routes: data.schedules.routes
              } : undefined
            };

            // Update notifications state
            setNotifications(prev => [newBooking, ...prev]);
            setUnreadCount(prev => prev + 1);
          } catch (error) {
            console.error('Error processing new booking notification:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    // Mark notifications as read when opening the panel
    if (open) {
      setUnreadCount(0);
    }
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

  const getPaymentStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="border-green-500 text-green-500">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Refunded</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 text-xs bg-zippy-purple text-white rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[350px] sm:w-[400px] bg-zippy-darkGray border-zippy-gray">
        <SheetHeader>
          <SheetTitle className="flex justify-between">
            <span>Booking Notifications</span>
            <span className="text-sm text-muted-foreground">
              {notifications.length} bookings
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((booking) => (
                <div key={booking.id} className="border border-zippy-gray rounded-md p-3 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold">
                      {booking.schedules?.routes?.name || 'Unknown Route'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(booking.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="text-xs mb-3">
                    {booking.schedules?.routes?.origin} → {booking.schedules?.routes?.destination}
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Departure:</span> {booking.schedules?.departure_time ? formatDateTime(booking.schedules.departure_time) : 'Unknown'}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Seats:</span> {booking.seat_numbers.join(', ')}
                    </div>
                    <div className="text-xs font-semibold">
                      ${booking.total_fare}
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <div className="flex gap-2">
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.payment_status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No booking notifications yet</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BookingNotifications;
