import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../gcomponents/card";
import { Tabs, TabsContent } from "../gcomponents/tabs";
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
import axios from "axios";

interface Booking {
  id: string;
  traveller_id: string;
  property_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  status: string;
  // These will be fetched separately
  traveller_email?: string;
  property_name?: string;
  room_name?: string;
}

const GBookings = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean, type: string }>({ open: false, type: '' });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch bookings and related data
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // 1. Fetch basic booking data
        const bookingsResponse = await axios.get('http://localhost:5000/api/bookings');
        const bookingsData = bookingsResponse.data.bookings;
        
        const enrichedBookings = await Promise.all(
          bookingsData.map(async (booking: Booking) => {
            try {
              const [user, property, room] = await Promise.all([
                axios.get(`http://localhost:5000/api/users/${booking.traveller_id}`),
                axios.get(`http://localhost:5000/api/gproperties/${booking.property_id}`),
                axios.get(`http://localhost:5000/api/gproperties/${booking.property_id}/rooms/${booking.room_id}`)
              ]);
              
              return {
                ...booking,
                traveller_email: user.data.user.user_email, // Changed from user.data.email
                property_name: property.data.property.name, // Changed from property.data.name
                room_name: room.data.room?.name || 'Standard Room' // Adjust based on actual room response
              };
            } catch (error) {
              console.error(`Error enriching booking ${booking.id}:`, error);
              return {
                ...booking,
                traveller_email: 'Not available',
                property_name: 'Not available',
                room_name: 'Not available'
              };
            }
          })
        );
        
        setBookings(enrichedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  const handleBookingAction = async (action: string) => {
    if (!selectedBooking) return;
  
    try {
      let message = "";
      let updatedStatus = selectedBooking.status;
  
      switch (action) {
        case "checkin":
          message = `Check-in processed for ${selectedBooking.traveller_email}`;
          break;
        case "checkout":
          message = `Check-out processed for ${selectedBooking.traveller_email}`;
          break;
        case "cancel":
          updatedStatus = "cancelled";
          message = `Booking for ${selectedBooking.traveller_email} has been cancelled`;
          break;
        case "approve":
          updatedStatus = "confirmed";
          message = `Booking for ${selectedBooking.traveller_email} has been approved`;
          break;
        case "decline":
          updatedStatus = "declined";
          message = `Booking for ${selectedBooking.traveller_email} has been declined`;
          break;
        default:
          toast.error('Invalid action');
          return;
      }
  
      // Send request to backend using new status endpoint
      const response = await axios.patch(`http://localhost:5000/api/bookings/${selectedBooking.id}/status`, {
        status: updatedStatus
      });
  
      if (response.data.success) {
        // Update local state with the new booking data
        const updatedBooking = response.data.booking;
        setBookings(bookings.map(booking =>
          booking.id === updatedBooking.id
            ? { ...booking, status: updatedBooking.status }
            : booking
        ));
  
        toast.success(message);
      } else {
        toast.error('Backend update failed');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  
    setActionDialog({ open: false, type: '' });
    setSelectedBooking(null);
  };
    
  // Filter by status for list view
  const statusFilteredBookings = statusFilter === "all" 
    ? bookings 
    : bookings.filter(booking => booking.status.toLowerCase() === statusFilter.toLowerCase());

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">Manage your property bookings</p>
      </div>
      
      <Tabs defaultValue="list" className="space-y-6">        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Bookings</CardTitle>
                <Select 
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
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
                      <th className="p-3">Guest Email</th>
                      <th className="p-3">Check-in</th>
                      <th className="p-3">Check-out</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusFilteredBookings.map(booking => (
                      <tr key={booking.id} className="border-b">
                        <td className="p-3">
                          <div className="font-medium">{booking.property_name || 'Loading...'}</div>
                          <div className="text-sm text-muted-foreground">
                            Room {booking.room_name || 'Loading...'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>{booking.traveller_email || 'Loading...'}</div>
                        </td>
                        <td className="p-3">
                          {new Date(booking.check_in).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          {new Date(booking.check_out).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                : booking.status === 'declined'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setActionDialog({ open: true, type: 'approve' });
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setActionDialog({ open: true, type: 'decline' });
                                  }}
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
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
                              </>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setActionDialog({ open: true, type: 'cancel' });
                              }}
                              disabled={booking.status === 'cancelled'}
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
      
      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'checkin' ? 'Process Check-in' : 
               actionDialog.type === 'checkout' ? 'Process Check-out' : 
               actionDialog.type === 'approve' ? 'Approve Booking' :
               actionDialog.type === 'decline' ? 'Decline Booking' :
               'Cancel Booking'}
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="py-4">
              <div className="space-y-2">
                <p><span className="font-medium">Guest Email:</span> {selectedBooking.traveller_email || 'Not available'}</p>
                <p><span className="font-medium">Property:</span> {selectedBooking.property_name || 'Not available'}</p>
                <p><span className="font-medium">Room:</span> {selectedBooking.room_name || 'Not available'}</p>
                <p><span className="font-medium">Check-in Date:</span> {new Date(selectedBooking.check_in).toLocaleDateString()}</p>
                <p><span className="font-medium">Check-out Date:</span> {new Date(selectedBooking.check_out).toLocaleDateString()}</p>
                <p><span className="font-medium">Current Status:</span> {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}</p>
              </div>
              {(actionDialog.type === 'cancel' || actionDialog.type === 'decline') && (
                <div className="mt-4 p-3 bg-destructive/10 rounded-md text-destructive text-sm">
                  <p>Warning: This action cannot be undone.</p>
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
              variant={actionDialog.type === 'cancel' || actionDialog.type === 'decline' ? 'destructive' : 'default'}
            >
              {actionDialog.type === 'checkin' ? 'Complete Check-in' : 
               actionDialog.type === 'checkout' ? 'Complete Check-out' : 
               actionDialog.type === 'approve' ? 'Confirm Approval' :
               actionDialog.type === 'decline' ? 'Confirm Decline' :
               'Cancel Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GBookings;