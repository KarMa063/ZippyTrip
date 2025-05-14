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
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
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
          description: `Mail sent to ${reminder.email}`,
        });
        
        // 3. Update the local state to reflect the change
        setReminders(prev => 
          prev.map(r => r.id === reminderId ? { ...r, status: 'sent' } : r)
        );
      } else {
        // 4. If 'success' is false, throw an error to trigger the catch block
        throw new Error("Failed to send reminder");
      }
    } catch (error) {
      // 5. If there was an error, show the error toast and update local state
      console.error('Failed to send reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send trip reminder",
        variant: "destructive",
      });
      
      setReminders(prev => 
        prev.map(r => r.id === reminderId ? { ...r, status: 'failed' } : r)
      );
    }
  };

  // Filter reminders based on search term
  const filteredReminders = reminders.filter(reminder => 
    reminder.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reminder.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <Button 
          variant="outline" 
          onClick={loadReminders} 
          className="bg-zippy-darkGray border-zippy-gray"
        >
          Refresh
        </Button>
      </div>

      <div className="rounded-md border border-zippy-gray">
        <Table>
          <TableHeader className="bg-zippy-darkGray">
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Departure Time</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Seats</TableHead>
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
            ) : filteredReminders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {searchTerm ? "No reminders match your search" : "No reminders found"}
                </TableCell>
              </TableRow>
            ) : filteredReminders.map((reminder) => (
              <TableRow key={reminder.id}>
                <TableCell>{reminder.bookingId}</TableCell>
                <TableCell>{new Date(reminder.departureTime).toLocaleString()}</TableCell>
                <TableCell>{reminder.email}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {Array.isArray(reminder.seat_numbers) 
                      ? reminder.seat_numbers.join(', ') 
                      : reminder.seat_numbers}
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
                    disabled={reminder.status === 'sent'}
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