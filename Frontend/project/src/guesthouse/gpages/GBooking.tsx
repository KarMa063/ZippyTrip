import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../gcomponents/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../gcomponents/tabs";
import { Button } from "../gcomponents/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../gcomponents/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../gcomponents/dialog";
import { toast } from "react-hot-toast";
import { DayPicker } from "react-day-picker"; // Import DayPicker
import 'react-day-picker/dist/style.css'; // Import styles for the calendar

// Mock data for bookings
const bookings = [
  {
    id: "1",
    propertyName: "Ocean View Suite",
    roomNumber: "101",
    guestName: "John Doe",
    checkIn: "2025-04-10",
    checkOut: "2025-04-15",
    status: "Confirmed",
    email: "john.doe@example.com",
    phone: "555-123-4567"
  },
  {
    id: "2",
    propertyName: "Mountain Cabin",
    roomNumber: "201",
    guestName: "Jane Smith",
    checkIn: "2025-04-12",
    checkOut: "2025-04-14",
    status: "Pending",
    email: "jane.smith@example.com",
    phone: "555-987-6543"
  },
  {
    id: "3",
    propertyName: "City Apartment",
    roomNumber: "301",
    guestName: "Robert Brown",
    checkIn: "2025-04-15",
    checkOut: "2025-04-20",
    status: "Confirmed",
    email: "robert.brown@example.com",
    phone: "555-456-7890"
  },
];

const Bookings = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<typeof bookings[0] | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean, type: string }>({ open: false, type: '' });
  
  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };
  
  const handleBookingAction = (action: string) => {
    let message = "";
    
    switch (action) {
      case "checkin":
        message = `Check-in processed for ${selectedBooking?.guestName}`;
        break;
      case "checkout":
        message = `Check-out processed for ${selectedBooking?.guestName}`;
        break;
      case "cancel":
        message = `Booking for ${selectedBooking?.guestName} has been cancelled`;
        break;
    }
    
    toast.success(message);
    
    setActionDialog({ open: false, type: '' });
    setSelectedBooking(null);
  };
  
  // Function to format the date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Filter bookings for the selected date (if any)
  const filteredBookings = date 
    ? bookings.filter(booking => {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        const selectedDate = new Date(date);
        
        // Reset time part for comparison
        checkInDate.setHours(0, 0, 0, 0);
        checkOutDate.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        return selectedDate >= checkInDate && selectedDate <= checkOutDate;
      })
    : bookings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">Manage your property bookings</p>
      </div>
      
      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-[320px_1fr]">
            <Card>
          <CardContent className="p-2">
            {/* Custom DayPicker component */}
            <DayPicker 
              selected={date} 
              onDayClick={handleDateChange}
              className="custom-day-picker"
              modifiersClassNames={{
                selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                today: "bg-accent text-accent-foreground"
              }}
            />

          </CardContent>
        </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  {date 
                    ? `Bookings for ${date.toLocaleDateString()}`
                    : "All Bookings"
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No bookings found for this date.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map(booking => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{booking.propertyName} - Room {booking.roomNumber}</h4>
                            <p className="text-sm">Guest: {booking.guestName}</p>
                          </div>
                          <div 
                            className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === 'Confirmed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                            }`}
                          >
                            {booking.status}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Check-in: {booking.checkIn}</span>
                          <span>Check-out: {booking.checkOut}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t flex justify-end gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setActionDialog({ open: true, type: 'checkin' });
                            }}
                          >
                            Check-in
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setActionDialog({ open: true, type: 'checkout' });
                            }}
                          >
                            Check-out
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setActionDialog({ open: true, type: 'cancel' });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Bookings</CardTitle>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium">
                      <th className="p-3">Property & Room</th>
                      <th className="p-3">Guest</th>
                      <th className="p-3">Check-in</th>
                      <th className="p-3">Check-out</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id} className="border-b">
                        <td className="p-3">
                          <div className="font-medium">{booking.propertyName}</div>
                          <div className="text-sm text-muted-foreground">Room {booking.roomNumber}</div>
                        </td>
                        <td className="p-3">
                          <div>{booking.guestName}</div>
                          <div className="text-sm text-muted-foreground">{booking.email}</div>
                        </td>
                        <td className="p-3">{booking.checkIn}</td>
                        <td className="p-3">{booking.checkOut}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            booking.status === 'Confirmed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setActionDialog({ open: true, type: 'checkin' });
                              }}
                            >
                              Check-in
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setActionDialog({ open: true, type: 'checkout' });
                              }}
                            >
                              Check-out
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setActionDialog({ open: true, type: 'cancel' });
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Check-in/Check-out/Cancel Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'checkin' ? 'Process Check-in' : 
               actionDialog.type === 'checkout' ? 'Process Check-out' : 
               'Cancel Booking'}
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="py-4">
              <div className="space-y-2">
                <p><span className="font-medium">Guest:</span> {selectedBooking.guestName}</p>
                <p><span className="font-medium">Property:</span> {selectedBooking.propertyName}</p>
                <p><span className="font-medium">Room:</span> {selectedBooking.roomNumber}</p>
                <p><span className="font-medium">Check-in Date:</span> {selectedBooking.checkIn}</p>
                <p><span className="font-medium">Check-out Date:</span> {selectedBooking.checkOut}</p>
              </div>
               {actionDialog.type === 'cancel' && (
                <div className="mt-4 p-3 bg-destructive/10 rounded-md text-destructive text-sm">
                  <p>Warning: This will cancel the booking and update room availability. This action cannot be undone.</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, type: '' })}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleBookingAction(actionDialog.type)}
              variant={actionDialog.type === 'cancel' ? 'destructive' : 'default'}
            >
              {actionDialog.type === 'checkin' ? 'Complete Check-in' : 
               actionDialog.type === 'checkout' ? 'Complete Check-out' : 
               'Cancel Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookings;
