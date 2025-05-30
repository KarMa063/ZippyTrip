import React, { useState, useEffect } from 'react';
import { Bus, Calendar, Users, Search, MapPin, ArrowRight, CreditCard, Luggage, Coffee, UtensilsCrossed, Wifi, Power, ArrowLeft, Check } from 'lucide-react';
import { sendBusReminder } from './EmailController';
import { useGlobalTheme } from '../components/GlobalThemeContext';
import Navigation from './Navigation';
import { getCurrentUser } from '../lib/supabase';

interface Seat {
  id: string;
  number: string;
  isBooked: boolean;
  type: string;
}

interface BusRoute {
  id: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: number;
  operator: string;
  duration: string;
  amenities: string[];
  seatsAvailable: number;
  type: string;
  seats: Seat[];
}

const BusRentalPage: React.FC = () => {
  const { isDarkMode } = useGlobalTheme();
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1',
    type: 'all',
  });

  const [step, setStep] = useState<'search' | 'results' | 'seats' | 'booking'>('search');
  const [selectedBus, setSelectedBus] = useState<BusRoute | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  
  const [buses, setBuses] = useState<BusRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedSeats, setBookedSeats] = useState<Record<string, string[]>>({});
  // Add the selectedDate state here at the component level
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  useEffect(() => {
    const fetchBuses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch schedules which include route information
        const response = await fetch('http://localhost:5000/api/routes/schedules/search');
        if (!response.ok) {
          throw new Error('Failed to fetch buses');
        }
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch buses');
        }

        const schedules = data.schedules || [];
        
        // Fetch all booked seats for these schedules
        const bookedSeatsMap: Record<string, string[]> = {};
        
        for (const schedule of schedules) {
          const bookedSeatsResponse = await fetch(`http://localhost:5000/api/bus-bookings/schedule/${schedule.id}/seats`);
          if (bookedSeatsResponse.ok) {
            const bookedSeatsData = await bookedSeatsResponse.json();
            if (bookedSeatsData.success) {
              bookedSeatsMap[schedule.id] = bookedSeatsData.bookedSeats || [];
            }
          }
        }
        
        setBookedSeats(bookedSeatsMap);
        
        const transformedBuses = schedules.map((schedule: any) => {
          const scheduleBookedSeats = bookedSeatsMap[schedule.id] || [];
          return {
            id: schedule.id,
            from: schedule.origin,
            to: schedule.destination,
            departure: new Date(schedule.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            arrival: new Date(schedule.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            price: schedule.fare,
            operator: schedule.route_name || 'ZippyBus Express',
            duration: schedule.duration || calculateDuration(schedule.departure_time, schedule.arrival_time),
            amenities: ['wifi', 'charging', 'snacks'],
            seatsAvailable: schedule.available_seats,
            type: 'AC',
            seats: generateSeats(schedule.total_seats || 40, scheduleBookedSeats)
          };
        });
        
        setBuses(transformedBuses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching buses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuses();
  }, []);

  // Helper function to calculate duration between two timestamps
  const calculateDuration = (departure: string, arrival: string) => {
    const departureTime = new Date(departure);
    const arrivalTime = new Date(arrival);
    const durationMs = arrivalTime.getTime() - departureTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Helper function to generate seats with actual booked status
  const generateSeats = (totalSeats: number, bookedSeatNumbers: string[]) => {
    return Array.from({ length: totalSeats }, (_, i) => {
      const seatNumber = `${i + 1}`;
      return {
        id: `seat-${seatNumber}`,
        number: seatNumber,
        isBooked: bookedSeatNumbers.includes(seatNumber),
        type: i % 3 === 0 ? 'sleeper' : i % 2 === 0 ? 'window' : 'aisle'
      };
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const searchUrl = new URLSearchParams();
      if (searchParams.from) searchUrl.append('from', searchParams.from);
      if (searchParams.to) searchUrl.append('to', searchParams.to);
      if (searchParams.date) searchUrl.append('date', searchParams.date);
      
      const response = await fetch(`http://localhost:5000/api/routes/schedules/search?${searchUrl.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch buses');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch buses');
      }
      
      const schedules = data.schedules || [];
      
      // Fetch all booked seats for these schedules
      const bookedSeatsMap: Record<string, string[]> = {};
      
      for (const schedule of schedules) {
        const bookedSeatsResponse = await fetch(`http://localhost:5000/api/bus-bookings/schedule/${schedule.id}/seats`);
        if (bookedSeatsResponse.ok) {
          const bookedSeatsData = await bookedSeatsResponse.json();
          if (bookedSeatsData.success) {
            bookedSeatsMap[schedule.id] = bookedSeatsData.bookedSeats || [];
          }
        }
      }
      
      setBookedSeats(bookedSeatsMap);
      
      const transformedBuses = schedules.map((schedule: any) => {
        const scheduleBookedSeats = bookedSeatsMap[schedule.id] || [];
        return {
          id: schedule.id,
          from: schedule.origin,
          to: schedule.destination,
          departure: new Date(schedule.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          arrival: new Date(schedule.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          price: schedule.fare,
          operator: schedule.route_name || 'ZippyBus Express',
          duration: schedule.duration || calculateDuration(schedule.departure_time, schedule.arrival_time),
          amenities: ['wifi', 'charging', 'snacks'],
          seatsAvailable: schedule.available_seats,
          type: 'AC',
          seats: generateSeats(schedule.total_seats || 40, scheduleBookedSeats)
        };
      });
      
      setBuses(transformedBuses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error searching buses:', err);
    } finally {
      setIsLoading(false);
      setStep('results');
    }
  };

  const handleBusSelection = (bus: BusRoute) => {
    setSelectedBus(bus);
    setSelectedSeats([]);
    setStep('seats');
  };

  const handleSeatSelection = (seatId: string, isBooked: boolean) => {
    if (isBooked) {
      // Don't allow selection of already booked seats
      return;
    }
    
    setSelectedSeats(prev => {
      const isSelected = prev.includes(seatId);
      const maxSeats = parseInt(searchParams.passengers);
      
      if (isSelected) {
        return prev.filter(id => id !== seatId);
      } else if (prev.length < maxSeats) {
        return [...prev, seatId];
      }
      return prev;
    });
  };

  const handleProceedToBooking = () => {
    if (selectedSeats.length === parseInt(searchParams.passengers)) {
      setStep('booking');
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedBus) {
      try {
        // Get the current user ID
        const userId = await getCurrentUser();
        
        if (!userId) {
          alert('You must be logged in to book a bus. Please sign in and try again.');
          return;
        }
        
        const userIdString = typeof userId === 'object' ? userId.user_id : userId;
        
        // Check if any of the selected seats are already booked
        const scheduleBookedSeats = bookedSeats[selectedBus.id] || [];
        const seatNumbers = selectedSeats.map(seatId => seatId.replace('seat-', ''));
        
        const alreadyBookedSeats = seatNumbers.filter(seat => scheduleBookedSeats.includes(seat));
        
        if (alreadyBookedSeats.length > 0) {
          alert(`Sorry, seats ${alreadyBookedSeats.join(', ')} have just been booked by someone else. Please select different seats.`);
          
          // Refresh the seat data
          const bookedSeatsResponse = await fetch(`http://localhost:5000/api/bus-bookings/schedule/${selectedBus.id}/seats`);
          if (bookedSeatsResponse.ok) {
            const bookedSeatsData = await bookedSeatsResponse.json();
            if (bookedSeatsData.success) {
              const updatedBookedSeats = {...bookedSeats};
              updatedBookedSeats[selectedBus.id] = bookedSeatsData.bookedSeats || [];
              setBookedSeats(updatedBookedSeats);
              
              // Update the selected bus with new seat information
              if (selectedBus) {
                setSelectedBus({
                  ...selectedBus,
                  seats: generateSeats(selectedBus.seats.length, updatedBookedSeats[selectedBus.id] || [])
                });
              }
              
              // Clear selected seats that are now booked
              setSelectedSeats(prev => prev.filter(seatId => {
                const seatNumber = seatId.replace('seat-', '');
                return !updatedBookedSeats[selectedBus.id].includes(seatNumber);
              }));
            }
          }
          
          return;
        }

        console.log('Original date from searchParams:', searchParams.date);
        
        // Make sure we have a valid date
        if (!searchParams.date) {
          alert('Please select a valid departure date.');
          return;
        }
        
        // Use the date from searchParams instead of hardcoded value
        const formattedDepartureDate = searchParams.date;
        console.log('Formatted departure date:', formattedDepartureDate);
        
        const bookingData = {
          user_id: userIdString,
          schedule_id: selectedBus.id,
          seat_numbers: seatNumbers,
          total_fare: selectedBus.price * seatNumbers.length,
          status: 'confirmed',
          payment_status: 'pending',
          payment_method: 'card',
          booking_date: new Date().toISOString(),
          departure_date: formattedDepartureDate,
          origin: selectedBus.from,
          destination: selectedBus.to,
          email: userEmail              
        };

        console.log('Sending booking data:', JSON.stringify(bookingData));

        const response = await fetch('http://localhost:5000/api/bus-bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          if (responseData.error === 'seats_already_booked') {
            alert(`Sorry, some of the seats you selected are already booked. Please select different seats.`);
            return;
          }
          
          // More detailed error handling
          console.error('Booking error:', responseData);
          alert(`Failed to create booking: ${responseData.message || 'Unknown error'}`);
          return;
        }
        
        console.log('Booking created:', responseData);

        const emailResponse = await sendBusReminder({
          email: userEmail,
          from: selectedBus.from,
          to: selectedBus.to,
          departure: selectedBus.departure,
          arrival: selectedBus.arrival,
          operator: selectedBus.operator,
          date: searchParams.date,
          passengerName: userName,
          seats: seatNumbers,
          busType: selectedBus.type,
        });

        console.log('Email response:', emailResponse);
        
        setShowConfirmation(true);
        
        setTimeout(() => {
          setShowConfirmation(false);
          setStep('search');
          setSelectedBus(null);
          setSelectedSeats([]);
          setUserEmail('');
          setUserName('');
          window.location.href = '/profile';
        }, 3000);
      
      } catch (error) {
        console.error('Booking failed:', error);
        alert('Failed to complete booking. Please try again.');
      }
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'charging': return <Power className="h-4 w-4" />;
      case 'snacks': return <Coffee className="h-4 w-4" />;
      case 'meal': return <UtensilsCrossed className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/home';
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-green-50 to-white'}`}>
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm relative`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={handleBackToHome}
              className={`mr-4 p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <Bus className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>ZippyBus</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {step === 'search' && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 md:p-8`}>
            <h2 className="text-2xl font-semibold mb-6">Find Your Bus</h2>
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      required
                      className={`pl-10 w-full rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Departure City"
                      value={searchParams.from}
                      onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      required
                      className={`pl-10 w-full rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Destination City"
                      value={searchParams.to}
                      onChange={(e) => setSearchParams({...searchParams, to: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      required
                      className={`pl-10 w-full rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      value={searchParams.date}
                      onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Passengers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      className={`pl-10 w-full rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      value={searchParams.passengers}
                      onChange={(e) => setSearchParams({...searchParams, passengers: e.target.value})}
                    >
                      {[1, 2, 3, 4].map((num) => (
                        <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className={`w-full md:w-auto px-8 py-4 rounded-lg ${
                  isDarkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'
                } text-white font-semibold flex items-center justify-center space-x-2`}
              >
                <Search className="h-5 w-5" />
                <span>Search Buses</span>
              </button>
            </form>
          </div>
        )}

        {step === 'results' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                Available Buses
              </h2>
              <button
                onClick={() => setStep('search')}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : error ? (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900' : 'bg-red-100'} text-red-700`}>
                <p>Error loading buses: {error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Retry
                </button>
              </div>
            ) : buses.length === 0 ? (
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm text-center`}>
                <p className="text-lg">No buses found for your search criteria.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {buses.map((bus) => (
                  <div
                    key={bus.id}
                    className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <Bus className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                          <div>
                            <p className="font-semibold">{bus.operator}</p>
                            <p className="text-sm text-gray-500">{bus.type}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold">{bus.departure}</p>
                            <p className="text-sm text-gray-500">{bus.from}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-semibold">{bus.arrival}</p>
                            <p className="text-sm text-gray-500">{bus.to}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold">{bus.duration}</p>
                            <p className="text-sm text-gray-500">Duration</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {bus.amenities.map((amenity, index) => (
                              <span key={index} className="text-gray-400">
                                {getAmenityIcon(amenity)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            Rs. {bus.price}
                          </p>
                          <p className="text-sm text-gray-500">{bus.seatsAvailable} seats left</p>
                        </div>
                        <button
                          onClick={() => handleBusSelection(bus)}
                          className={`px-6 py-3 rounded-lg ${
                            isDarkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'
                          } text-white font-semibold`}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'seats' && selectedBus && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                Select Your Seats
              </h2>
              <button
                onClick={() => setStep('results')}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="grid grid-cols-4 gap-4">
                {selectedBus.seats.map((seat) => (
                  <button
                    key={seat.id}
                    disabled={seat.isBooked}
                    onClick={() => handleSeatSelection(seat.id)}
                    className={`p-4 rounded-lg ${
                      seat.isBooked
                        ? `${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} cursor-not-allowed`
                        : selectedSeats.includes(seat.id)
                        ? `${isDarkMode ? 'bg-green-500' : 'bg-green-600'} text-white`
                        : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border`
                    }`}
                  >
                    <p className="font-semibold">Seat {seat.number}</p>
                    <p className="text-sm">{seat.type}</p>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Selected: {selectedSeats.length} / {searchParams.passengers} seats
                  </p>
                </div>
                <button
                  onClick={handleProceedToBooking}
                  disabled={selectedSeats.length !== parseInt(searchParams.passengers)}
                  className={`px-8 py-4 rounded-lg ${
                    isDarkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'
                  } text-white font-semibold ${
                    selectedSeats.length !== parseInt(searchParams.passengers) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Proceed to Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'booking' && selectedBus && (
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h2 className="text-2xl font-bold mb-6">Complete Your Booking</h2>
            <form onSubmit={handleConfirmBooking} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep('seats')}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        )}

        {showConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`p-8 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="text-center">
                <Bus className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
                <p className="text-gray-500">
                  Your bus tickets have been booked successfully. Check your email for details.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BusRentalPage;
