import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bell, AlertTriangle, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { updateBooking } from '@/services/api/bookings';
import { sendTripNotification } from '@/services/api/notifications';
import { query } from '@/integrations/neon/client';

type BookingAlert = {
  id: string;
  routeName: string;
  origin: string;
  destination: string;
  departureTime: string;
  passengerEmail: string;
  seatNumbers: string[];
  status: string;
  created_at: string;
};

const BookingAlertsPage = () => {
  const [alerts, setAlerts] = useState<BookingAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<BookingAlert | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookingAlerts();
    
    // Set up polling for new bookings instead of real-time subscription
    const pollingInterval = setInterval(() => {
      fetchBookingAlerts();
    }, 30000); // Poll every 30 seconds
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, []);

  const fetchBookingAlerts = async () => {
    try {
      setIsLoading(true);
      
      // Use Neon DB query with proper table aliases
      const result = await query(`
        SELECT 
          b.id,
          b.user_id,
          b.schedule_id,
          b.booking_date,
          b.total_fare,
          b.seat_numbers,
          b.status,
          payment_method,
          payment_status,
          b.created_at,
          b.updated_at,
          s.departure_time,
          r.name,
          r.origin,
          r.destination
        FROM 
          bookings b
        LEFT JOIN 
          schedules s ON b.schedule_id = s.id
        LEFT JOIN 
          routes r ON s.route_id = r.id
        ORDER BY 
          b.created_at DESC
        LIMIT 50
      `);

      if (!result || !result.rows) {
        throw new Error('Failed to fetch booking alerts');
      }

      // Create booking alerts from data with proper handling of seat_numbers
      const bookingAlerts: BookingAlert[] = result.rows.map((booking: any) => {
        // Handle seat_numbers which might be in different formats
        let seatNumbersArray: string[] = [];
        if (booking.seat_numbers) {
          if (Array.isArray(booking.seat_numbers)) {
            seatNumbersArray = booking.seat_numbers;
          } else if (typeof booking.seat_numbers === 'string') {
            try {
              // Try to parse if it's a JSON string
              const parsed = JSON.parse(booking.seat_numbers);
              seatNumbersArray = Array.isArray(parsed) ? parsed : [booking.seat_numbers];
            } catch (e) {
              // If parsing fails, treat as a comma-separated string
              seatNumbersArray = booking.seat_numbers.split(',');
            }
          } else {
            seatNumbersArray = [String(booking.seat_numbers)];
          }
        }

        return {
          id: booking.id || '',
          routeName: booking.route_name || 'Unknown Route',
          origin: booking.origin || 'Unknown',
          destination: booking.destination || 'Unknown',
          departureTime: booking.departure_time || '',
          passengerEmail: booking.user_id || 'Unknown User',
          seatNumbers: seatNumbersArray,
          status: booking.status || 'pending',
          created_at: booking.created_at || new Date().toISOString()
        };
      });

      setAlerts(bookingAlerts);
    } catch (error) {
      console.error('Error fetching booking alerts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch booking alerts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;
    
    try {
      setIsLoading(true);
      
      // Update booking status to confirmed
      await updateBooking(alert.id, { status: 'confirmed' });
      
      // Send confirmation notification to passenger
      await sendTripNotification(
        alert.passengerEmail,
        'reminder',
        {
          routeName: alert.routeName,
          origin: alert.origin,
          destination: alert.destination,
          departureTime: alert.departureTime,
          seatNumbers: alert.seatNumbers
        }
      );
      
      toast({
        title: "Booking Confirmed",
        description: "Passenger has been notified",
      });
      
      // Update local state
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, status: 'confirmed' } : a
      ));
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: "Confirmation Failed",
        description: "Failed to confirm booking",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
      setSelectedAlert(null);
    }
  };

  const handleCancel = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;
    
    try {
      setIsLoading(true);
      
      // Update booking status to cancelled
      await updateBooking(alert.id, { status: 'cancelled' });
      
      // Send cancellation notification to passenger
      await sendTripNotification(
        alert.passengerEmail,
        'cancellation',
        {
          routeName: alert.routeName,
          origin: alert.origin,
          destination: alert.destination,
          departureTime: alert.departureTime,
          seatNumbers: alert.seatNumbers
        }
      );
      
      toast({
        title: "Booking Cancelled",
        description: "Passenger has been notified",
      });
      
      // Update local state
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, status: 'cancelled' } : a
      ));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel booking",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
      setSelectedAlert(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Alerts</h1>
          <p className="text-muted-foreground mt-1">Manage and respond to booking notifications</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={fetchBookingAlerts} variant="outline" className="bg-zippy-darkGray border-zippy-gray">
            <Bell className="mr-2 h-4 w-4" />
            Refresh Alerts
          </Button>
        </div>
      </div>

      <Card className="bg-zippy-darkGray border-zippy-gray overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zippy-gray">
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Clock className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading booking alerts...
                    </TableCell>
                  </TableRow>
                ) : alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <TableRow key={alert.id} className="border-b border-zippy-gray">
                      <TableCell>
                        <div className="font-medium">{alert.routeName}</div>
                        <div className="text-xs text-muted-foreground">
                          {alert.origin} → {alert.destination}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(alert.departureTime)}</TableCell>
                      <TableCell>{alert.passengerEmail}</TableCell>
                      <TableCell>
                        <span className="text-xs">{alert.seatNumbers.join(", ")}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell>{formatDate(alert.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-zippy-darkGray border-zippy-gray"
                            disabled={alert.status !== 'pending'}
                            onClick={() => {
                              setSelectedAlert(alert);
                              setIsDialogOpen(true);
                            }}
                          >
                            
                            
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No booking alerts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-zippy-darkGray border-zippy-gray">
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Alert Response</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAlert && (
                <div className="space-y-2 mt-2">
                  <div>
                    <span className="font-medium">Route:</span> {selectedAlert.routeName}
                  </div>
                  <div>
                    <span className="font-medium">Departure:</span> {formatDate(selectedAlert.departureTime)}
                  </div>
                  <div>
                    <span className="font-medium">Passenger:</span> {selectedAlert.passengerEmail}
                  </div>
                  <div>
                    <span className="font-medium">Seats:</span> {selectedAlert.seatNumbers.join(", ")}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zippy-gray">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedAlert && handleConfirm(selectedAlert.id)}
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm Booking
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => selectedAlert && handleCancel(selectedAlert.id)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingAlertsPage;