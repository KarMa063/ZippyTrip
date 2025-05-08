import React, { useState } from 'react';
import { Bus, Calendar, Users, Search, MapPin, ArrowRight, Moon, Sun, Coffee, UtensilsCrossed, Wifi, Power, ArrowLeft } from 'lucide-react';
import { sendBusReminder } from './EmailController';
import { v4 as uuidv4 } from 'uuid';

interface Seat {
  id: string;
  number: string;
  isBooked: boolean;
  type: 'window' | 'aisle' | 'sleeper';
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
  type: 'AC' | 'Non-AC';
  seats: Seat[];
}

function BusRentalPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  const buses: BusRoute[] = [
    {
      id: '1',
      from: 'Kathmandu',
      to: 'Pokhara',
      departure: '08:00 AM',
      arrival: '12:30 PM',
      price: 1200,
      operator: 'Sajha Yatayat',
      duration: '4h 30m',
      amenities: ['wifi', 'charging', 'snacks', 'water'],
      seatsAvailable: 32,
      type: 'AC',
      seats: Array.from({ length: 40 }, (_, i) => ({
        id: `seat-${i + 1}`,
        number: `${i + 1}`,
        isBooked: Math.random() > 0.7,
        type: i % 2 === 0 ? 'window' : 'aisle'
      }))
    },
    {
      id: '2',
      from: 'Kathmandu',
      to: 'Chitwan',
      departure: '10:30 AM',
      arrival: '3:00 PM',
      price: 1000,
      operator: 'Buddha Express',
      duration: '4h 30m',
      amenities: ['wifi', 'charging', 'snacks', 'blanket', 'entertainment'],
      seatsAvailable: 25,
      type: 'AC',
      seats: Array.from({ length: 40 }, (_, i) => ({
        id: `seat-${i + 1}`,
        number: `${i + 1}`,
        isBooked: Math.random() > 0.7,
        type: i % 3 === 0 ? 'sleeper' : i % 2 === 0 ? 'window' : 'aisle'
      }))
    },
    {
      id: '3',
      from: 'Pokhara',
      to: 'Kathmandu',
      departure: '11:45 PM',
      arrival: '4:15 AM',
      price: 1500,
      operator: 'Deluxe Night Service',
      duration: '4h 30m',
      amenities: ['wifi', 'charging', 'blanket', 'pillow', 'sleeper'],
      seatsAvailable: 18,
      type: 'AC',
      seats: Array.from({ length: 30 }, (_, i) => ({
        id: `seat-${i + 1}`,
        number: `${i + 1}`,
        isBooked: Math.random() > 0.7,
        type: 'sleeper'
      }))
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('results');
  };

  const handleBusSelection = (bus: BusRoute) => {
    setSelectedBus(bus);
    setStep('seats');
  };

  const handleSeatSelection = (seatId: string) => {
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
        // Generate a unique ID for the ticket
        const ticketId = uuidv4();
        
        // Create ticket object
        const newTicket = {
          id: ticketId,
          busId: selectedBus.id,
          from: selectedBus.from,
          to: selectedBus.to,
          departure: selectedBus.departure,
          arrival: selectedBus.arrival,
          date: searchParams.date,
          operator: selectedBus.operator,
          price: selectedBus.price,
          seats: selectedSeats,
          passengerName: userName,
          busType: selectedBus.type,
          status: 'active',
          bookingDate: new Date().toISOString()
        };
        
        // Save to localStorage
        const existingTickets = localStorage.getItem('busTickets');
        const tickets = existingTickets ? JSON.parse(existingTickets) : [];
        tickets.push(newTicket);
        localStorage.setItem('busTickets', JSON.stringify(tickets));
        
        // Send email confirmation
        const response = await sendBusReminder({
          email: userEmail,
          from: selectedBus.from,
          to: selectedBus.to,
          departure: selectedBus.departure,
          arrival: selectedBus.arrival,
          operator: selectedBus.operator,
          date: searchParams.date,
          passengerName: userName,
          seats: selectedSeats,
          busType: selectedBus.type
        });

        console.log('Email response:', response);
        
        // Show confirmation regardless of actual email status
        setShowConfirmation(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setShowConfirmation(false);
          setStep('search');
          setSelectedBus(null);
          setSelectedSeats([]);
          setUserEmail('');
          setUserName('');
        }, 3000);
      } catch (error) {
        console.error('Failed to send email confirmation:', error);
        // Still show confirmation to user even if email fails
        setShowConfirmation(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setShowConfirmation(false);
          setStep('search');
          setSelectedBus(null);
          setSelectedSeats([]);
          setUserEmail('');
          setUserName('');
        }, 3000);
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
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm relative`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBackToHome}
                className={`mr-4 p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <Bus className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>ZippyBus</h1>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-600'}`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
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
}

export default BusRentalPage;