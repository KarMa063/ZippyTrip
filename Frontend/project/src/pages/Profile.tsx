import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Bus, Clock, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';
// Remove Supabase import

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

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const isDarkMode = false;
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    // Load tickets from localStorage
    const savedTickets = localStorage.getItem('busTickets');
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    }
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCancelTicket = (ticketId: string) => {
    setShowCancelConfirm(ticketId);
  };

  const confirmCancelTicket = async (ticketId: string) => {
    try {
      setIsCancelling(true);
      
      // Find the ticket to cancel
      const ticketToCancel = tickets.find(ticket => ticket.id === ticketId);
      if (!ticketToCancel) return;
      
      // Update the ticket status to cancelled locally
      const updatedTickets = tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, status: 'cancelled' as const } : ticket
      );
      
      // Save to localStorage
      localStorage.setItem('busTickets', JSON.stringify(updatedTickets));
      setTickets(updatedTickets);
      
      // Send to Express backend (Main Backend on port 5000)
      try {
        await axios.post('http://localhost:5000/api/cancellations/cancel', { // <-- Changed port from 3001 to 5000
          ...ticketToCancel,
          status: 'cancelled',
          cancellation_date: new Date().toISOString()
        }, { timeout: 5000 });
      } catch (backendError) {
        console.error('Backend cancellation failed:', backendError);
        // Still continue with UI update even if backend fails
      }
      
      setShowCancelConfirm(null);
    } catch (error) {
      console.error('Failed to cancel ticket:', error);
      // Still update UI even if all operations fail
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={handleBackClick}
              className={`mr-4 p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold">My Tickets</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {tickets.length === 0 ? (
          <div className={`text-center p-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Bus className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">No Tickets Found</h2>
            <p className="text-gray-500 mb-4">You haven't booked any bus tickets yet.</p>
            <button
              onClick={() => navigate('/bus')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Book a Bus Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className={`rounded-lg shadow-md overflow-hidden ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } ${
                  ticket.status === 'cancelled' ? 'opacity-75' : ''
                }`}
              >
                {ticket.status === 'cancelled' && (
                  <div className="bg-red-500 text-white px-4 py-2 flex items-center">
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
                      <Calendar className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="font-medium">Travel Date</p>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(ticket.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 mb-4 md:mb-0">
                      <Clock className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="font-medium">Departure Time</p>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {ticket.departure}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-blue-500 mt-1" />
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
                      <div className="w-20 h-0.5 bg-gray-300 relative">
                        <Bus className="absolute -top-2 left-1/2 transform -translate-x-1/2 h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-lg font-semibold">{ticket.to}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Destination</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
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
                        onClick={() => handleCancelTicket(ticket.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Cancel Ticket
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cancel Ticket</h3>
              <button onClick={() => setShowCancelConfirm(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6">Are you sure you want to cancel this ticket? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => cancelConfirmation()} // Updated call site
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                disabled={isCancelling}
              >
                No, Keep Ticket
              </button>
              <button
                onClick={() => confirmCancelTicket(showCancelConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  'Yes, Cancel Ticket'
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