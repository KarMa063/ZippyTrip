import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Bus, Clock, X, AlertTriangle, Home, Bed } from 'lucide-react';
import axios from 'axios';
import { useGlobalTheme } from '../components/GlobalThemeContext'; 
import { getCurrentUser } from '../lib/supabase';

interface Ticket {
  id: string;
  busId: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  date: string;
  operator: string;
  price: number;
  seats: string[];
  passengerName: string;
  busType: string;
  status: 'active' | 'cancelled';
  bookingDate: string;
}

interface GuestHouseBooking {
  id: string;
  guestHouseId: string;
  guestHouseName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  price: number;
  total_price: number;
  status: 'active' | 'cancelled';
  bookingDate: string;
  location: string;
}

function toLocalDateString(date: string) {
  return new Date(date).toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
}

const todayStr = new Date().toLocaleDateString('en-CA');

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useGlobalTheme();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [guestHouseBookings, setGuestHouseBookings] = useState<GuestHouseBooking[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [cancelType, setCancelType] = useState<'bus' | 'guesthouse'>('bus');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bus' | 'guesthouse'>(
    location.state?.activeTab === 'guesthouse' ? 'guesthouse' : 'bus'
  );
  const [bookingTab, setBookingTab] = useState<'current' | 'past' | 'cancelled'>('current');

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get the current user ID
        const userId = await getCurrentUser();
        
        if (!userId) {
          setError('You must be logged in to view your bookings');
          setIsLoading(false);
          return;
        }
        
        // Make sure userId is a string, not an object
        const userIdString = typeof userId === 'object' ? userId.user_id : userId;
        
        // Fetch user's bus bookings
        const busResponse = await axios.get(`http://localhost:5000/api/bus-bookings/user/${userIdString}`);
        
        if (busResponse.data.success) {
          // Transform backend bookings to match the Ticket interface
          const transformedTickets = busResponse.data.bookings.map((booking: any) => {
            const seatNumbers = booking.seat_numbers.startsWith('seat-') 
              ? booking.seat_numbers.split(',') 
              : booking.seat_numbers.split(',').map((seat: string) => `seat-${seat.trim()}`);
            
            return {
              id: booking.id,
              busId: booking.schedule_id || booking.route_id,
              from: booking.origin || '',
              to: booking.destination || '',
              departure: booking.departure_time || '08:00 AM',
              arrival: booking.arrival_time || '10:00 AM',
              date: booking.travel_date || new Date(booking.booking_date).toISOString().split('T')[0],
              operator: 'ZippyBus Express',
              price: booking.total_fare,
              seats: seatNumbers,
              passengerName: userIdString,
              busType: 'AC',
              status: booking.status === 'cancelled' ? 'cancelled' : 'active',
              bookingDate: booking.booking_date
            };
          });
          
          setTickets(transformedTickets);
        }
        
        // Fetch user's guesthouse bookings
        try {
          const guestHouseResponse = await axios.get(`http://localhost:5000/api/bookings`, {
            params: { traveller_id: userIdString }
          });
          
          if (guestHouseResponse.data.success) {
            // Filter bookings for this user
            const userBookings = guestHouseResponse.data.bookings.filter(
              (booking: any) => booking.traveller_id === userIdString
            );
            
            // Create an array of promises to fetch room details for each booking
            const roomDetailsPromises = userBookings.map(async (booking: any) => {
              try {
                // Fetch property details
                const propertyResponse = await axios.get(`http://localhost:5000/api/gproperties/${booking.property_id}`);
                
                // Fetch room details
                const roomResponse = await axios.get(
                  `http://localhost:5000/api/gproperties/${booking.property_id}/rooms/${booking.room_id}`
                );
                
                return {
                  booking,
                  property: propertyResponse.data.success ? propertyResponse.data.property : null,
                  room: roomResponse.data.success ? roomResponse.data.room : null
                };
              } catch (error) {
                console.error(`Error fetching details for booking ${booking.id}:`, error);
                return { booking, property: null, room: null };
              }
            });
            
            // Wait for all room detail requests to complete
            const bookingsWithDetails = await Promise.all(roomDetailsPromises);
            
            const transformedGuestHouseBookings = bookingsWithDetails.map(({ booking, property, room }) => ({
              id: String(booking.id),
              guestHouseId: booking.property_id,
              guestHouseName: property?.name || booking.property_name || 'ZippyStay Guesthouse',
              roomType: room?.name || booking.room_name || 'Standard Room',
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              guests: room?.capacity || booking.capacity || 1,
              price: room ? parseFloat(room.price) : 0,
              total_price: booking.total_price || 0,
              status: booking.status === 'cancelled' ? 'cancelled' : 'active',
              bookingDate: booking.created_at || new Date().toISOString(),
              location: property?.address || 'Unknown Location'
            }));
            
            setGuestHouseBookings(transformedGuestHouseBookings);
          }
        } catch (guestHouseError) {
          console.error('Error fetching guesthouse bookings:', guestHouseError);
        }
        
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCancelTicket = (ticketId: string, type: 'bus' | 'guesthouse') => {
    setShowCancelConfirm(ticketId);
    setCancelType(type);
  };

  const confirmCancelTicket = async (ticketId: string) => {
    try {
      setIsCancelling(true);
      
      if (cancelType === 'bus') {
        // Find the ticket to cancel
        const ticketToCancel = tickets.find(ticket => ticket.id === ticketId);
        if (!ticketToCancel) return;
        
        // Send cancellation request to the backend
        const response = await axios.post('http://localhost:5000/api/cancellations/cancel', {
          id: ticketId
        }, { timeout: 5000 });
        
        if (response.data.success) {
          const updatedTickets = tickets.map(ticket =>
            ticket.id === ticketId ? { ...ticket, status: 'cancelled' as const } : ticket
          );
          
          setTickets(updatedTickets);

          // Insert into cancelled_bookings
          const cancelledBooking = response.data.booking;
          await axios.post('http://localhost:5000/api/cancellations/cancel', {
            route_details: `${cancelledBooking.from} to ${cancelledBooking.to}`,
            travel_date: cancelledBooking.date,
            user_id: cancelledBooking.passengerName,
            seat_count: cancelledBooking.seats.length,
            amount: cancelledBooking.price,
            refund_status: 'pending',
            cancelled_at: new Date().toISOString()
          }, { timeout: 5000 });
        } else {
          console.error('Backend cancellation failed:', response.data.message);
          alert('Failed to cancel ticket: ' + response.data.message);
        }
      } else {
        // Find the guesthouse booking to cancel
        const bookingToCancel = guestHouseBookings.find(booking => booking.id === ticketId);
        if (!bookingToCancel) return;
        
        // Send cancellation request to the backend
        const response = await axios.post('http://localhost:5000/api/guesthouse-cancellations/cancel', {
          id: ticketId
        }, { timeout: 5000 });
        
        if (response.data.success) {
          // Update the booking status to cancelled locally
          const updatedBookings = guestHouseBookings.map(booking =>
            booking.id === ticketId ? { ...booking, status: 'cancelled' as const } : booking
          );
          
          setGuestHouseBookings(updatedBookings);
        } else {
          console.error('Backend cancellation failed:', response.data.message);
          alert('Failed to cancel booking: ' + response.data.message);
        }
      }
      
      setShowCancelConfirm(null);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking. Please try again later.');
    } finally {
      setIsCancelling(false);
    }
  };

  const cancelConfirmation = () => {
    setShowCancelConfirm(null);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper functions to classify bookings
  const isFuture = (date: string) => new Date(date) > new Date();
  const isPast = (date: string) => new Date(date) < new Date();

  const currentTickets = tickets.filter(ticket => ticket.status === 'active' && isFuture(ticket.date));
  const pastTickets = tickets.filter(ticket => ticket.status === 'active' && isPast(ticket.date));
  const cancelledTickets = tickets.filter(ticket => ticket.status === 'cancelled');

  const currentGuesthouse = guestHouseBookings.filter(booking => booking.status === 'active' && isFuture(booking.checkIn));
  const pastGuesthouse = guestHouseBookings.filter(booking => booking.status === 'active' && isPast(booking.checkOut));
  const cancelledGuesthouse = guestHouseBookings.filter(booking => booking.status === 'cancelled');

  // Booking counts for selected type
  const currentCount = activeTab === 'bus' ? currentTickets.length : currentGuesthouse.length;
  const pastCount = activeTab === 'bus' ? pastTickets.length : pastGuesthouse.length;
  const cancelledCount = activeTab === 'bus' ? cancelledTickets.length : cancelledGuesthouse.length;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={handleBackClick}
              className={`mr-4 p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold">My Bookings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900' : 'bg-red-100'} text-red-700`}>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className={`flex border-b mb-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setActiveTab('bus')}
                className={`py-3 px-6 font-medium flex items-center ${
                  activeTab === 'bus' 
                    ? isDarkMode 
                      ? 'border-b-2 border-blue-500 text-blue-400' 
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Bus className="h-5 w-5 mr-2" />
                Bus Tickets {tickets.length > 0 && `(${tickets.length})`}
              </button>
              <button
                onClick={() => setActiveTab('guesthouse')}
                className={`py-3 px-6 font-medium flex items-center ${
                  activeTab === 'guesthouse' 
                    ? isDarkMode 
                      ? 'border-b-2 border-blue-500 text-blue-400' 
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Home className="h-5 w-5 mr-2" />
                Guesthouse Bookings {guestHouseBookings.length > 0 && `(${guestHouseBookings.length})`}
              </button>
            </div>

            {/* Booking Tabs */}
            <div className={`flex border-b mb-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setBookingTab('current')}
                className={`py-3 px-6 font-medium flex items-center ${
                  bookingTab === 'current'
                    ? isDarkMode
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Current Bookings <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">{currentCount}</span>
              </button>
              <button
                onClick={() => setBookingTab('past')}
                className={`py-3 px-6 font-medium flex items-center ${
                  bookingTab === 'past'
                    ? isDarkMode
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Past Bookings <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">{pastCount}</span>
              </button>
              <button
                onClick={() => setBookingTab('cancelled')}
                className={`py-3 px-6 font-medium flex items-center ${
                  bookingTab === 'cancelled'
                    ? isDarkMode
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'border-b-2 border-blue-600 text-blue-600'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Cancelled Bookings <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-200">{cancelledCount}</span>
              </button>
            </div>

            {/* Bus Tickets Section */}
            {activeTab === 'bus' && (
              bookingTab === 'current' ? (
                currentTickets.length === 0 ? (
                  <div className={`text-center p-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Bus className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Bus Tickets Found</h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      You haven't booked any bus tickets yet.
                    </p>
                    <button
                      onClick={() => navigate('/bus')}
                      className={`px-4 py-2 rounded-lg transition duration-200 ${
                        isDarkMode
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Book a Bus Ticket
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentTickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className={`rounded-lg shadow-md overflow-hidden ${
                          isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } ${
                          ticket.status === 'cancelled' ? 'opacity-75' : ''
                        }`}
                      >
                        {ticket.status === 'cancelled' && (
                          <div className={`px-4 py-2 flex items-center ${
                            isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-500 text-white'
                          }`}>
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            <span>This ticket has been cancelled</span>
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-xl font-bold">{ticket.operator}</h2>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {ticket.busType} • Booking ID: {ticket.id.substring(0, 8)}
                              </p>
                            </div>
                            <div className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              Rs. {ticket.price}
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:justify-between mb-6">
                            <div className="flex items-start space-x-3 mb-4 md:mb-0">
                              <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Travel Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(ticket.date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 mb-4 md:mb-0">
                              <Clock className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Departure Time</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {ticket.departure}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <Clock className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Arrival Time</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {ticket.arrival}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-6">
                            <div className="flex-1">
                              <div className="text-lg font-semibold">{ticket.from}</div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Origin</div>
                            </div>
                            <div className="flex-1 flex justify-center">
                              <div className={`w-20 h-0.5 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} relative`}>
                                <Bus className={`absolute -top-2 left-1/2 transform -translate-x-1/2 h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                              </div>
                            </div>
                            <div className="flex-1 text-right">
                              <div className="text-lg font-semibold">{ticket.to}</div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Destination</div>
                            </div>
                          </div>

                          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                            <div className="flex flex-col md:flex-row md:justify-between">
                              <div className="mb-4 md:mb-0">
                                <p className="font-medium">Passenger</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {ticket.passengerName}
                                </p>
                              </div>
                              <div className="mb-4 md:mb-0">
                                <p className="font-medium">Seat Numbers</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {ticket.seats.map(seat => seat.split('-')[1]).join(', ')}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">Booking Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(ticket.bookingDate)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {ticket.status === 'active' && (
                            <div className="mt-6 flex justify-end">
                              <button
                                onClick={() => handleCancelTicket(ticket.id, 'bus')}
                                className={`px-4 py-2 rounded-lg transition duration-200 ${
                                  isDarkMode
                                    ? 'bg-red-700 text-white hover:bg-red-800'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                              >
                                Cancel Ticket
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : bookingTab === 'past' ? (
                pastTickets.length === 0 ? (
                  <div className={`text-center p-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Bus className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Bus Tickets Found</h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      You haven't booked any bus tickets yet.
                    </p>
                    <button
                      onClick={() => navigate('/bus')}
                      className={`px-4 py-2 rounded-lg transition duration-200 ${
                        isDarkMode
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Book a Bus Ticket
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pastTickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className={`rounded-lg shadow-md overflow-hidden ${
                          isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } ${
                          ticket.status === 'cancelled' ? 'opacity-75' : ''
                        }`}
                      >
                        {ticket.status === 'cancelled' && (
                          <div className={`px-4 py-2 flex items-center ${
                            isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-500 text-white'
                          }`}>
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            <span>This ticket has been cancelled</span>
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-xl font-bold">{ticket.operator}</h2>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {ticket.busType} • Booking ID: {ticket.id.substring(0, 8)}
                              </p>
                            </div>
                            <div className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              Rs. {ticket.price}
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:justify-between mb-6">
                            <div className="flex items-start space-x-3 mb-4 md:mb-0">
                              <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Travel Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(ticket.date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 mb-4 md:mb-0">
                              <Clock className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Departure Time</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {ticket.departure}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <Clock className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Arrival Time</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {ticket.arrival}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-6">
                            <div className="flex-1">
                              <div className="text-lg font-semibold">{ticket.from}</div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Origin</div>
                            </div>
                            <div className="flex-1 flex justify-center">
                              <div className={`w-20 h-0.5 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} relative`}>
                                <Bus className={`absolute -top-2 left-1/2 transform -translate-x-1/2 h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                              </div>
                            </div>
                            <div className="flex-1 text-right">
                              <div className="text-lg font-semibold">{ticket.to}</div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Destination</div>
                            </div>
                          </div>

                          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                            <div className="flex flex-col md:flex-row md:justify-between">
                              <div className="mb-4 md:mb-0">
                                <p className="font-medium">Passenger</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {ticket.passengerName}
                                </p>
                              </div>
                              <div className="mb-4 md:mb-0">
                                <p className="font-medium">Seat Numbers</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {ticket.seats.map(seat => seat.split('-')[1]).join(', ')}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">Booking Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(ticket.bookingDate)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                cancelledTickets.length === 0 ? (
                  <div className={`text-center p-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Bus className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Bus Tickets Found</h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      You haven't booked any bus tickets yet.
                    </p>
                    <button
                      onClick={() => navigate('/bus')}
                      className={`px-4 py-2 rounded-lg transition duration-200 ${
                        isDarkMode
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Book a Bus Ticket
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cancelledTickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className={`rounded-lg shadow-md overflow-hidden ${
                          isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } ${
                          ticket.status === 'cancelled' ? 'opacity-75' : ''
                        }`}
                      >
                        {ticket.status === 'cancelled' && (
                          <div className={`px-4 py-2 flex items-center ${
                            isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-500 text-white'
                          }`}>
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            <span>This ticket has been cancelled</span>
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-xl font-bold">{ticket.operator}</h2>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {ticket.busType} • Booking ID: {ticket.id.substring(0, 8)}
                              </p>
                            </div>
                            <div className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              Rs. {ticket.price}
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:justify-between mb-6">
                            <div className="flex items-start space-x-3 mb-4 md:mb-0">
                              <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Travel Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(ticket.date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 mb-4 md:mb-0">
                              <Clock className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Departure Time</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {ticket.departure}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <Clock className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Arrival Time</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {ticket.arrival}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-6">
                            <div className="flex-1">
                              <div className="text-lg font-semibold">{ticket.from}</div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Origin</div>
                            </div>
                            <div className="flex-1 flex justify-center">
                              <div className={`w-20 h-0.5 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} relative`}>
                                <Bus className={`absolute -top-2 left-1/2 transform -translate-x-1/2 h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                              </div>
                            </div>
                            <div className="flex-1 text-right">
                              <div className="text-lg font-semibold">{ticket.to}</div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Destination</div>
                            </div>
                          </div>

                          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                            <div className="flex flex-col md:flex-row md:justify-between">
                              <div className="mb-4 md:mb-0">
                                <p className="font-medium">Passenger</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {ticket.passengerName}
                                </p>
                              </div>
                              <div className="mb-4 md:mb-0">
                                <p className="font-medium">Seat Numbers</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {ticket.seats.map(seat => seat.split('-')[1]).join(', ')}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">Booking Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(ticket.bookingDate)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )
            )}

            {/* Guesthouse Bookings Section */}
            {activeTab === 'guesthouse' && (
              bookingTab === 'current' ? (
                currentGuesthouse.length === 0 ? (
                  <div className={`text-center p-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Home className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Guesthouse Bookings Found</h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      You haven't booked any guesthouse rooms yet.
                    </p>
                    <button
                      onClick={() => navigate('/guesthouses')}
                      className={`px-4 py-2 rounded-lg transition duration-200 ${
                        isDarkMode
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Book a Guesthouse
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentGuesthouse.map((booking) => (
                      <div 
                        key={booking.id} 
                        className={`rounded-lg shadow-md overflow-hidden ${
                          isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } ${
                          booking.status === 'cancelled' ? 'opacity-75' : ''
                        }`}
                      >
                        {booking.status === 'cancelled' && (
                          <div className={`px-4 py-2 flex items-center ${
                            isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-500 text-white'
                          }`}>
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            <span>This booking has been cancelled</span>
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-xl font-bold">{booking.guestHouseName}</h2>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {booking.roomType} • Booking ID: {String(booking.id).substring(0, 8)}
                              </p>
                            </div>
                            <div className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              NRs. {booking.total_price}
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:justify-between mb-6">
                            <div className="flex items-start space-x-3 mb-4 md:mb-0">
                              <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Check-in Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(booking.checkIn)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 mb-4 md:mb-0">
                              <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Check-out Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(booking.checkOut)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <Bed className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Guests</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {booking.guests}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-6">
                            <div className="flex-1">
                              <div className="text-lg font-semibold">{booking.location}</div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location</div>
                            </div>
                          </div>

                          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                            <div className="flex flex-col md:flex-row md:justify-between">
                              <div>
                                <p className="font-medium">Booking Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(booking.bookingDate)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {booking.status === 'active' && (
                            <div className="mt-6 flex justify-end">
                              <button
                                onClick={() => handleCancelTicket(booking.id, 'guesthouse')}
                                className={`px-4 py-2 rounded-lg transition duration-200 ${
                                  isDarkMode
                                    ? 'bg-red-700 text-white hover:bg-red-800'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                              >
                                Cancel Booking
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : bookingTab === 'past' ? (
                pastGuesthouse.length === 0 ? (
                  <div className={`text-center p-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Home className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Guesthouse Bookings Found</h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      You haven't booked any guesthouse rooms yet.
                    </p>
                    <button
                      onClick={() => navigate('/guesthouses')}
                      className={`px-4 py-2 rounded-lg transition duration-200 ${
                        isDarkMode
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Book a Guesthouse
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pastGuesthouse.map((booking) => (
                      <div 
                        key={booking.id} 
                        className={`rounded-lg shadow-md overflow-hidden ${
                          isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } ${
                          booking.status === 'cancelled' ? 'opacity-75' : ''
                        }`}
                      >
                        {booking.status === 'cancelled' && (
                          <div className={`px-4 py-2 flex items-center ${
                            isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-500 text-white'
                          }`}>
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            <span>This booking has been cancelled</span>
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-xl font-bold">{booking.guestHouseName}</h2>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {booking.roomType} • Booking ID: {String(booking.id).substring(0, 8)}
                              </p>
                            </div>
                            <div className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              Rs. {booking.price}
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:justify-between mb-6">
                            <div className="flex items-start space-x-3 mb-4 md:mb-0">
                              <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Check-in Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(booking.checkIn)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 mb-4 md:mb-0">
                              <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Check-out Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(booking.checkOut)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <Bed className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Guests</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {booking.guests}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-6">
                            <div className="flex-1">
                              <div className="text-lg font-semibold">{booking.location}</div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location</div>
                            </div>
                          </div>

                          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                            <div className="flex flex-col md:flex-row md:justify-between">
                              <div>
                                <p className="font-medium">Booking Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(booking.bookingDate)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                cancelledGuesthouse.length === 0 ? (
                  <div className={`text-center p-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Home className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Guesthouse Bookings Found</h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      You haven't booked any guesthouse rooms yet.
                    </p>
                    <button
                      onClick={() => navigate('/guesthouses')}
                      className={`px-4 py-2 rounded-lg transition duration-200 ${
                        isDarkMode
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Book a Guesthouse
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cancelledGuesthouse.map((booking) => (
                      <div 
                        key={booking.id} 
                        className={`rounded-lg shadow-md overflow-hidden ${
                          isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } ${
                          booking.status === 'cancelled' ? 'opacity-75' : ''
                        }`}
                      >
                        {booking.status === 'cancelled' && (
                          <div className={`px-4 py-2 flex items-center ${
                            isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-500 text-white'
                          }`}>
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            <span>This booking has been cancelled</span>
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-xl font-bold">{booking.guestHouseName}</h2>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {booking.roomType} • Booking ID: {String(booking.id).substring(0, 8)}
                              </p>
                            </div>
                            <div className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              Rs. {booking.price}
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:justify-between mb-6">
                            <div className="flex items-start space-x-3 mb-4 md:mb-0">
                              <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Check-in Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(booking.checkIn)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 mb-4 md:mb-0">
                              <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Check-out Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(booking.checkOut)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <Bed className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mt-1`} />
                              <div>
                                <p className="font-medium">Guests</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {booking.guests}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-6">
                            <div className="flex-1">
                              <div className="text-lg font-semibold">{booking.location}</div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location</div>
                            </div>
                          </div>

                          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                            <div className="flex flex-col md:flex-row md:justify-between">
                              <div>
                                <p className="font-medium">Booking Date</p>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(booking.bookingDate)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )
            )}
          </>
        )}
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cancel {cancelType === 'bus' ? 'Ticket' : 'Booking'}</h3>
              <button
                onClick={() => setShowCancelConfirm(null)}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Are you sure you want to cancel this {cancelType === 'bus' ? 'ticket' : 'booking'}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => cancelConfirmation()}
                className={`px-4 py-2 rounded-lg transition duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                disabled={isCancelling}
              >
                No, Keep {cancelType === 'bus' ? 'Ticket' : 'Booking'}
              </button>
              <button
                onClick={() => confirmCancelTicket(showCancelConfirm)}
                className={`px-4 py-2 rounded-lg transition duration-200 flex items-center ${
                  isDarkMode
                    ? 'bg-red-700 text-white hover:bg-red-800'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  `Yes, Cancel ${cancelType === 'bus' ? 'Ticket' : 'Booking'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;