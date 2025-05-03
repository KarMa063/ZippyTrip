import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TripReminder, fetchTripReminders, sendTripReminder } from "@/services/tripReminders";

const TripReminders = () => {
  const [reminders, setReminders] = useState<TripReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await fetchTripReminders();
      setReminders(data);
    } catch (error) {
      console.error('Failed to load reminders:', error);
      toast({
        title: "Error",
        description: "Failed to load trip reminders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (reminderId: string) => {
    // Find the reminder object from the state
    const reminder = reminders.find(r => r.id === reminderId);
    if (!reminder) {
      toast({
        title: "Error",
        description: "Could not find the reminder details.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Calls sendTripReminder, which returns true/false based on API call success
      const success = await sendTripReminder(reminderId);

      if (success) {
        // 2. If 'success' is true, show the success toast with the email
        toast({
          title: "Reminder Sent",
          description: `Mail sent to ${reminder.passengerInfo.email}`, // Updated description
        });
      } else {
        // 3. If 'success' is false, throw an error to trigger the catch block
        throw new Error("Failed to send reminder");
      }
    } catch (error) {
      // 4. If there was an error (network issue or API returned failure), show the error toast
      console.error('Failed to send reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send trip reminder",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trip Reminders</h1>
          <p className="text-muted-foreground mt-1">Send notifications and updates to travelers</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Input 
            placeholder="Search bookings..." 
            className="pl-8 bg-zippy-darkGray border-zippy-gray"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-md border border-zippy-gray">
        <Table>
          <TableHeader className="bg-zippy-darkGray">
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Route Details</TableHead>
              <TableHead>Travel Date</TableHead>
              <TableHead>Passenger Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading reminders...
                </TableCell>
              </TableRow>
            ) : reminders.map((reminder) => (
              <TableRow key={reminder.id}>
                <TableCell>{reminder.bookingId}</TableCell>
                <TableCell>{reminder.routeDetails}</TableCell>
                <TableCell>{reminder.travelDate}</TableCell>
                <TableCell>
                  <div>
                    <div>{reminder.passengerInfo.name}</div>
                    <div className="text-sm text-muted-foreground">{reminder.passengerInfo.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      reminder.status === 'sent' ? 'default' :
                      reminder.status === 'failed' ? 'destructive' : 'secondary'
                    }
                  >
                    {reminder.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendReminder(reminder.id)}
                    className="bg-zippy-darkGray border-zippy-gray"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TripReminders;