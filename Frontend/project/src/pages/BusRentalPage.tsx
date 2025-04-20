import React, { useState, useEffect } from 'react';
import { Bus, Calendar, Users, Search, MapPin, ArrowRight, Moon, Sun, CreditCard, Luggage, Coffee, UtensilsCrossed, Wifi, Power, ArrowLeft } from 'lucide-react';

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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

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

  const buses: BusRoute[] = [
    {
      id: '1',
      from: 'New York',
      to: 'Boston',
      departure: '08:00 AM',
      arrival: '12:30 PM',
      price: 45,
      operator: 'ZippyBus Express',
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
      from: 'New York',
      to: 'Boston',
      departure: '10:30 AM',
      arrival: '3:00 PM',
      price: 55,
      operator: 'ComfortLine',
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
      from: 'New York',
      to: 'Boston',
      departure: '11:45 PM',
      arrival: '4:15 AM',
      price: 65,
      operator: 'NightRider',
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

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setStep('search');
      setSelectedBus(null);
      setSelectedSeats([]);
    }, 3000);
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
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bus Type</label>
                  <div className="relative">
                    <Bus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      className={`pl-10 w-full rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      value={searchParams.type}
                      onChange={(e) => setSearchParams({...searchParams, type: e.target.value})}
                    >
                      <option value="all">All Types</option>
                      <option value="ac">AC</option>
                      <option value="nonac">Non-AC</option>
                      <option value="sleeper">Sleeper</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className={`w-full ${isDarkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2`}
              >
                <Search className="h-5 w-5" />
                <span>Search Buses</span>
              </button>
            </form>
          </div>
        )}

        {step === 'results' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Available Buses</h2>
            <div className="space-y-4">
              {buses.map((bus) => (
                <div key={bus.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <Bus className={`h-6 w-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <span className="text-lg font-medium">{bus.operator}</span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {bus.seatsAvailable} seats left
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {bus.type}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center space-x-4">
                        <div>
                          <p className="text-lg font-semibold">{bus.departure}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{bus.from}</p>
                        </div>
                        <div className="flex-1 border-t-2 border-gray-300 relative">
                          <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {bus.duration}
                          </span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{bus.arrival}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{bus.to}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center space-x-2">
                        {bus.amenities.map((amenity) => (
                          <div
                            key={amenity}
                            className={`px-2 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} flex items-center space-x-1`}
                          >
                            {getAmenityIcon(amenity)}
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>${bus.price}</p>
                      <button
                        onClick={() => handleBusSelection(bus)}
                        className={`mt-2 ${isDarkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded-lg transition-colors`}
                      >
                        Select Seats
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('search')}
              className={`${isDarkMode ? 'text-green-400 hover:text-green-500' : 'text-green-600 hover:text-green-700'} flex items-center space-x-2`}
            >
              <ArrowRight className="h-5 w-5" />
              <span>Modify Search</span>
            </button>
          </div>
        )}

        {step === 'seats' && selectedBus && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 md:p-8`}>
            <h2 className="text-2xl font-semibold mb-6">Select Your Seats</h2>
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-md border-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-gray-400"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-md ${isDarkMode ? 'bg-green-500' : 'bg-green-600'}`}></div>
                  <span>Selected</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                {selectedBus.seats.map((seat) => (
                  <button
                    key={seat.id}
                    disabled={seat.isBooked}
                    onClick={() => handleSeatSelection(seat.id)}
                    className={`
                      w-12 h-12 rounded-md flex items-center justify-center text-sm font-medium
                      ${seat.isBooked 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : selectedSeats.includes(seat.id)
                          ? isDarkMode ? 'bg-green-500' : 'bg-green-600 text-white'
                          : isDarkMode ? 'border-2 border-gray-600 hover:border-green-500' : 'border-2 border-gray-300 hover:border-green-600'
                      }
                    `}
                  >
                    {seat.number}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <div>
                <p className="text-sm">Selected: {selectedSeats.length} of {searchParams.passengers}</p>
                <p className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Total: ${selectedBus.price * selectedSeats.length}
                </p>
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => setStep('results')}
                  className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  Back
                </button>
                <button
                  onClick={handleProceedToBooking}
                  disabled={selectedSeats.length !== parseInt(searchParams.passengers)}
                  className={`px-6 py-2 rounded-lg ${
                    selectedSeats.length === parseInt(searchParams.passengers)
                      ? isDarkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  } text-white`}
                >
                  Proceed to Book
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'booking' && selectedBus && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 md:p-8`}>
            <h2 className="text-2xl font-semibold mb-6">Complete Your Booking</h2>
            <div className={`mb-6 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'} rounded-lg`}>
              <h3 className="font-medium text-lg mb-2">Journey Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>From</p>
                  <p className="font-medium">{selectedBus.from}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>To</p>
                  <p className="font-medium">{selectedBus.to}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Departure</p>
                  <p className="font-medium">{selectedBus.departure}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Seats</p>
                  <p className="font-medium">{selectedSeats.join(', ')}</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleConfirmBooking} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                  <input
                    type="text"
                    required
                    className={`mt-1 w-full rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  <input
                    type="email"
                    required
                    className={`mt-1 w-full rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                  <input
                    type="tel"
                    required
                    className={`mt-1 w-full rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                </div>
              </div>
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Total Price</span>
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ${selectedBus.price * selectedSeats.length}
                  </span>
                </div>
                <button
                  type="submit"
                  className={`w-full ${isDarkMode ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white py-3 px-6 rounded-lg transition-colors`}
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Confirmation Popup */}
        {showConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-xl z-10 transform animate-bounce`}>
              <div className="text-center">
                <Bus className={`h-12 w-12 ${isDarkMode ? 'text-green-400' : 'text-green-600'} mx-auto mb-4`} />
                <h3 className="text-xl font-bold mb-2">Booking Confirmed!</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Thank you for choosing ZippyBus.
                  <br />
                  Check your email for details.
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