import React, { useState, useEffect } from 'react';
import { Bus, Home, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useGlobalTheme } from '../components/GlobalThemeContext';
import { getCurrentUser } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const UpcomingBookings: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useGlobalTheme();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [guestHouseBookings, setGuestHouseBookings] = useState<GuestHouseBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bus' | 'guesthouse'>('guesthouse');

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userId = await getCurrentUser();
        if (!userId) {
          setError('You must be logged in to view your bookings');
          setIsLoading(false);
          return;
        }
        const userIdString = typeof userId === 'object' ? userId.user_id : userId;
        
        // Fetch bus bookings
        const busResponse = await axios.get(`http://localhost:5000/api/bus-bookings`, {
          params: { user_id: userIdString }
        });
        
        if (busResponse.data.success) {
          // Filter active bookings and future dates only
          const transformedTickets = busResponse.data.bookings
            .filter((booking: any) => {
              const bookingDate = new Date(booking.departure_date || booking.travel_date || booking.booking_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return booking.status !== 'cancelled' && bookingDate >= today;
            })
            .map((booking: any) => ({
              id: String(booking.id),
              busId: booking.schedule_id || booking.route_id,
              from: booking.origin || '',
              to: booking.destination || '',
              departure: booking.departure_time || '08:00 AM',
              arrival: booking.arrival_time || '10:00 AM',
              date: new Date(booking.departure_date || booking.travel_date || booking.booking_date).toISOString().split('T')[0],
              operator: 'ZippyBus Express',
              price: booking.total_fare,
              seats: typeof booking.seat_numbers === 'string' ? booking.seat_numbers.split(',') : booking.seat_numbers,
              passengerName: userIdString,
              busType: 'AC',
              status: booking.status === 'cancelled' ? 'cancelled' : 'active',
              bookingDate: booking.booking_date
            }))
            .slice(0, 2); // Only show up to 2 bookings
          
          setTickets(transformedTickets);
        }

        // Fetch guesthouse bookings
        const guesthouseResponse = await axios.get(`http://localhost:5000/api/bookings`, {
          params: { traveller_id: userIdString }
        });
        
        if (guesthouseResponse.data.success) {
          const bookingsWithDetails = await Promise.all(
            guesthouseResponse.data.bookings
              .filter((booking: any) => {
                const checkInDate = new Date(booking.check_in);
                return checkInDate > new Date() && booking.status !== 'cancelled';
              })
              .slice(0, 2) // Only process up to 2 bookings
              .map(async (booking: any) => {
                try {
                  const [property, room] = await Promise.all([
                    axios.get(`http://localhost:5000/api/gproperties/${booking.property_id}`),
                    axios.get(`http://localhost:5000/api/gproperties/${booking.property_id}/rooms/${booking.room_id}`)
                  ]);
                  return {
                    booking,
                    property: property.data.property,
                    room: room.data.room
                  };
                } catch (error) {
                  console.error(`Error fetching details for booking ${booking.id}:`, error);
                  return {
                    booking,
                    property: null,
                    room: null
                  };
                }
              })
          );

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

        // Set default tab based on which has more bookings
        if (busResponse?.data?.success && busResponse.data.bookings.length > 0) {
          setActiveTab('bus');
        } else if (guesthouseResponse?.data?.success && guesthouseResponse.data.bookings.length > 0) {
          setActiveTab('guesthouse');
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

  const handleSeeMoreClick = () => {
    navigate('/profile', { state: { activeTab } });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900' : 'bg-red-100'} text-red-700`}>
        <p>{error}</p>
      </div>
    );
  }

  const hasUpcomingBookings = tickets.length > 0 || guestHouseBookings.length > 0;

  if (!hasUpcomingBookings) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Upcoming Bookings</h2>
        <button 
          onClick={handleSeeMoreClick}
          className={`flex items-center text-sm font-medium transition-all duration-300 hover:translate-x-1 ${
            isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
          }`}
        >
          View all bookings <ArrowRight className="ml-1 h-4 w-4" />
        </button>
      </div>
      
      {/* Tab Switcher */}
      <div className="flex mb-6 gap-4">
        <button
          className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-200 border-b-2 focus:outline-none ${
            activeTab === 'bus'
              ? isDarkMode
                ? 'border-blue-400 text-blue-400 bg-gray-800'
                : 'border-blue-600 text-blue-600 bg-blue-50'
              : isDarkMode
                ? 'border-transparent text-gray-400 hover:text-blue-300 hover:bg-gray-700'
                : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-100'
          }`}
          onClick={() => setActiveTab('bus')}
          disabled={tickets.length === 0}
        >
          <Bus className="h-5 w-5 mr-2" /> Bus Tickets
        </button>
        <button
          className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-200 border-b-2 focus:outline-none ${
            activeTab === 'guesthouse'
              ? isDarkMode
                ? 'border-blue-400 text-blue-400 bg-gray-800'
                : 'border-blue-600 text-blue-600 bg-blue-50'
              : isDarkMode
                ? 'border-transparent text-gray-400 hover:text-blue-300 hover:bg-gray-700'
                : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-100'
          }`}
          onClick={() => setActiveTab('guesthouse')}
          disabled={guestHouseBookings.length === 0}
        >
          <Home className="h-5 w-5 mr-2" /> Guesthouse Bookings
        </button>
      </div>
      
      {/* Bus Tickets */}
      {activeTab === 'bus' && tickets.length > 0 && (
        <div className="mb-8">
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`p-4 rounded-xl shadow-md border transition-transform duration-150 hover:scale-[1.01] ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                    : 'bg-white border-gray-200 hover:bg-blue-50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-bold">{ticket.operator}</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ticket.busType} • Booking ID: <span className="font-mono text-blue-500">{ticket.id.substring(0, 8)}</span></p>
                  </div>
                  <div className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Rs. {ticket.price}</div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-lg font-semibold">{ticket.from}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Origin</div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className={`w-16 h-0.5 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} relative`}>
                      <Bus className={`absolute -top-2 left-1/2 transform -translate-x-1/2 h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-lg font-semibold">{ticket.to}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Destination</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(ticket.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ticket.departure}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Guesthouse Bookings */}
      {activeTab === 'guesthouse' && guestHouseBookings.length > 0 && (
        <div>
          <div className="grid gap-4">
            {guestHouseBookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-4 rounded-xl shadow-md border transition-transform duration-150 hover:scale-[1.01] ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                    : 'bg-white border-gray-200 hover:bg-blue-50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-bold">{booking.guestHouseName}</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{booking.roomType}</p>
                  </div>
                  <div className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    NRs. {booking.total_price}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{booking.location}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingBookings;