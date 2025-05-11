import { useState, useEffect } from "react";
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
import axios from "axios";

interface Booking {
  id: string;
  traveller_id: string;
  property_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  status: string;
  total_price?: number;
  checkin_status: 'not_checked_in' | 'checked_in' | 'checked_out';
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
  const [activeTab, setActiveTab] = useState("current");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
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
                traveller_email: user.data.user.user_email,
                property_name: property.data.property.name,
                room_name: room.data.room?.name || 'Standard Room',
                total_price: booking.total_price
              };
            } catch (error) {
              console.error(`Error enriching booking ${booking.id}:`, error);
              return {
                ...booking,
                traveller_email: 'Not available',
                property_name: 'Not available',
                room_name: 'Not available',
                total_price: booking.total_price || 0
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
      let endpoint = '';
      let message = '';
      let payload = {};

      switch (action) {
        case "checkin":
          endpoint = 'check-in';
          message = `${selectedBooking.traveller_email} has been checked in`;
          break;
        case "checkout":
          endpoint = 'check-out';
          message = `${selectedBooking.traveller_email} has been checked out`;
          break;
        case "approve":
          endpoint = 'status';
          payload = { status: 'confirmed' };
          message = `Booking for ${selectedBooking.traveller_email} has been approved`;
          break;
        case "decline":
          endpoint = 'status';
          payload = { status: 'declined' };
          message = `Booking for ${selectedBooking.traveller_email} has been declined`;
          break;
        case "cancel":
          endpoint = 'status';
          payload = { status: 'cancelled' };
          message = `Booking for ${selectedBooking.traveller_email} has been cancelled`;
          break;
        default:
          toast.error('Invalid action');
          return;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/bookings/${selectedBooking.id}/${endpoint}`,
        payload
      );

      if (response.data.success) {
        setBookings(bookings.map(booking => 
          booking.id === selectedBooking.id ? {
            ...response.data.booking,
            traveller_email: selectedBooking.traveller_email,
            property_name: selectedBooking.property_name,
            room_name: selectedBooking.room_name
          } : booking
        ));
        toast.success(message);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }

    setActionDialog({ open: false, type: '' });
    setSelectedBooking(null);
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const today = new Date();
    const checkOutDate = new Date(booking.check_out);
    
    if (activeTab === "current") {
      return booking.checkin_status !== 'checked_out' && checkOutDate >= today;
    } else {
      return booking.checkin_status === 'checked_out' || checkOutDate < today;
    }
  });

  // Apply additional status filter
  const statusFilteredBookings = statusFilter === "all"
    ? filteredBookings
    : filteredBookings.filter(booking => booking.status.toLowerCase() === statusFilter.toLowerCase());

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Bookings</TabsTrigger>
          <TabsTrigger value="previous">Previous Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Current Bookings</CardTitle>
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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium">
                      <th className="p-2">Property & Room</th>
                      <th className="p-2">Guest Email</th>
                      <th className="p-2">Check-in</th>
                      <th className="p-2">Check-out</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Check-in Status</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusFilteredBookings.map(booking => (
                      <tr key={booking.id} className="border-b">
                        <td className="p-2">
                          <div className="font-medium text-sm">{booking.property_name || 'Loading...'}</div>
                          <div className="text-xs text-muted-foreground">
                            Room {booking.room_name || 'Loading...'}
                          </div>
                        </td>
                        <td className="p-2 text-xs">
                          {booking.traveller_email || 'Loading...'}
                        </td>
                        <td className="p-2 text-xs">
                          {new Date(booking.check_in).toLocaleDateString()}
                        </td>
                        <td className="p-2 text-xs">
                          {new Date(booking.check_out).toLocaleDateString()}
                        </td>
                        <td className="p-2 text-xs">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
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
                        <td className="p-2 text-xs">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                            booking.checkin_status === 'checked_in' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                              : booking.checkin_status === 'checked_out'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                          }`}>
                            {booking.checkin_status === 'checked_in' ? 'Checked In' :
                            booking.checkin_status === 'checked_out' ? 'Checked Out' : 'Not Checked In'}
                          </span>
                        </td>
                        <td className="p-2 text-xs">
                          {booking.status === 'confirmed' ? (
                            `Rs. ${booking.total_price?.toLocaleString() || 'N/A'}`
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-2">
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
                                {booking.checkin_status !== 'checked_in' && (
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
                                )}
                                {booking.checkin_status === 'checked_in' && (
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
                                )}
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

        <TabsContent value="previous">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Previous Bookings</CardTitle>
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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium">
                      <th className="p-2">Property & Room</th>
                      <th className="p-2">Guest Email</th>
                      <th className="p-2">Check-in</th>
                      <th className="p-2">Check-out</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Check-in Status</th>
                      <th className="p-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusFilteredBookings.length > 0 ? (
                      statusFilteredBookings.map(booking => (
                        <tr key={booking.id} className="border-b">
                          <td className="p-2">
                            <div className="font-medium text-sm">{booking.property_name || 'Loading...'}</div>
                            <div className="text-xs text-muted-foreground">
                              Room {booking.room_name || 'Loading...'}
                            </div>
                          </td>
                          <td className="p-2 text-xs">
                            {booking.traveller_email || 'Loading...'}
                          </td>
                          <td className="p-2 text-xs">
                            {new Date(booking.check_in).toLocaleDateString()}
                          </td>
                          <td className="p-2 text-xs">
                            {new Date(booking.check_out).toLocaleDateString()}
                          </td>
                          <td className="p-2 text-xs">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
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
                          <td className="p-2 text-xs">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                              booking.checkin_status === 'checked_in' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                                : booking.checkin_status === 'checked_out'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                            }`}>
                              {booking.checkin_status === 'checked_in' ? 'Checked In' :
                              booking.checkin_status === 'checked_out' ? 'Checked Out' : 'Not Checked In'}
                            </span>
                          </td>
                          <td className="p-2 text-xs">
                            {booking.status === 'confirmed' ? (
                              `Rs. ${booking.total_price?.toLocaleString() || 'N/A'}`
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-muted-foreground">
                          No previous bookings found
                        </td>
                      </tr>
                    )}
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
                {selectedBooking.status === 'confirmed' && selectedBooking.total_price && (
                  <p><span className="font-medium">Total Price:</span> Rs. {selectedBooking.total_price.toLocaleString()}</p>
                )}
                <p><span className="font-medium">Check-in Status:</span> {selectedBooking.checkin_status === 'checked_in' ? 'Checked In' :
                   selectedBooking.checkin_status === 'checked_out' ? 'Checked Out' : 'Not Checked In'}</p>
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