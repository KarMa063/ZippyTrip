import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

type BookingAlert = {
  id: string;
  routeName: string;
  origin: string;
  destination: string;
  departureTime: string;
  passengerEmail: string;
  passengerName?: string;
  userId: string;
  seatNumbers: string[];
  status: string;
};

const BookingAlerts = () => {
  const [currentAlert, setCurrentAlert] = useState<BookingAlert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create audio element for notifications
    audioRef.current = new Audio('/notification-sound.mp3');
    
    // Subscribe to real-time booking updates
    const channel = supabase
      .channel('booking-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
        },
        async (payload) => {
          try {
            // Fetch complete booking details
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

            // Play sound notification if enabled
            if (soundEnabled && audioRef.current) {
              audioRef.current.play().catch(err => console.error('Error playing notification sound:', err));
            }

            // Create booking alert object
            const newAlert: BookingAlert = {
              id: data.id,
              routeName: data.schedules?.routes?.name || 'Unknown Route',
              origin: data.schedules?.routes?.origin || 'Unknown',
              destination: data.schedules?.routes?.destination || 'Unknown',
              departureTime: data.schedules?.departure_time || '',
              passengerEmail: data.user_id || '', // Use user_id instead of trying to access email
              passengerName: 'Passenger', // Default name since we can't access user_profiles
              userId: data.user_id || '',
              seatNumbers: data.seat_numbers || [],
              status: data.status || 'pending'
            };

            // Show toast notification
            toast({
              title: "New Booking Alert!",
              description: `Route: ${newAlert.routeName}`,
            });

            // Set current alert and open dialog
            setCurrentAlert(newAlert);
            setIsOpen(true);
          } catch (error) {
            console.error('Error processing booking alert:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, soundEnabled]);

  const handleConfirm = async () => {
    if (!currentAlert) return;
    
    try {
      // Update booking status to confirmed
      await updateBooking(currentAlert.id, { status: 'confirmed' });
      
      // Send confirmation notification to passenger
      await sendTripNotification(
        currentAlert.passengerEmail,
        'reminder',
        {
          routeName: currentAlert.routeName,
          origin: currentAlert.origin,
          destination: currentAlert.destination,
          departureTime: currentAlert.departureTime,
          seatNumbers: currentAlert.seatNumbers
        }
      );
      
      toast({
        title: "Booking Confirmed",
        description: "Passenger has been notified",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: "Confirmation Failed",
        description: "Failed to confirm booking",
        variant: "destructive"
      });
    }
  };

  const handleCancel = async () => {
    if (!currentAlert) return;
    
    try {
      // Update booking status to cancelled
      await updateBooking(currentAlert.id, { status: 'cancelled' });
      
      // Send cancellation notification to passenger
      await sendTripNotification(
        currentAlert.passengerEmail,
        'cancellation',
        {
          routeName: currentAlert.routeName,
          origin: currentAlert.origin,
          destination: currentAlert.destination,
          departureTime: currentAlert.departureTime,
          seatNumbers: currentAlert.seatNumbers
        }
      );
      
      toast({
        title: "Booking Cancelled",
        description: "Passenger has been notified",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel booking",
        variant: "destructive"
      });
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="booking-alerts-container relative inline-block">
      <Button 
        variant="outline" 
        size="icon" 
        className="relative booking-alerts-button bg-zippy-darkGray border-zippy-gray transition-all duration-200 hover:bg-zippy-gray hover:scale-105" 
        onClick={toggleSound}
        title={soundEnabled ? "Disable alert sounds" : "Enable alert sounds"}
      >
        {soundEnabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-zippy-darkGray border-zippy-gray max-w-[450px] rounded-lg shadow-lg">
          <AlertDialogHeader className="border-b border-zippy-gray pb-3">
            <AlertDialogTitle className="text-xl font-bold text-zippy-purple">New Booking Alert</AlertDialogTitle>
            <AlertDialogDescription>
              {currentAlert && (
                <div className="space-y-2 mt-2 bg-black/10 p-3 rounded-md">
                  <p className="text-lg text-zippy-purple"><strong>Route:</strong> {currentAlert.routeName}</p>
                  <p className="flex items-center flex-wrap gap-2">
                    <strong>From:</strong> <span className="text-zippy-blue">{currentAlert.origin}</span> 
                    <strong>To:</strong> <span className="text-zippy-blue">{currentAlert.destination}</span>
                  </p>
                  <p className="text-zippy-green">
                    <strong>Departure:</strong> <span>{new Date(currentAlert.departureTime).toLocaleString()}</span>
                  </p>
                  <p className="flex items-center flex-wrap gap-2">
                    <strong>Passenger:</strong> <span className="text-zippy-purple">{currentAlert.passengerName}</span>
                  </p>
                  <p className="flex items-center flex-wrap gap-2">
                    <strong>Email:</strong> <span className="text-zippy-blue">{currentAlert.passengerEmail}</span>
                  </p>
                  <p className="flex items-center flex-wrap gap-2">
                    <strong>User ID:</strong> <span className="font-mono text-xs">{currentAlert.userId}</span>
                  </p>
                  <p className="mt-2">
                    <strong>Seats:</strong> <span className="font-mono bg-zippy-gray px-1 py-0.5 rounded">{currentAlert.seatNumbers.join(', ')}</span>
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex justify-end gap-2">
            <AlertDialogCancel className="bg-zippy-gray text-white">Dismiss</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel}
              className="bg-red-500 hover:bg-red-600 transition-all duration-200 hover:-translate-y-0.5"
            >
              Cancel Booking
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={handleConfirm}
              className="bg-green-500 hover:bg-green-600 transition-all duration-200 hover:-translate-y-0.5"
            >
              Confirm Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingAlerts;