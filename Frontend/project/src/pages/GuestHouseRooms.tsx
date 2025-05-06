import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Moon, Sun, MapPin, Users, Calendar, ArrowLeft, Star, MessageSquare, X } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';

interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  images: string[];
  isAvailable: boolean;
  amenities?: string[];
  reviews?: Review[];
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

const GuestHouseRooms: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guestHouse, setGuestHouse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/gproperties/${id}/rooms`);
        const data = await response.json();
        if (data.success) {
          // Ensure rooms have the correct isAvailable property
          const formattedRooms = data.rooms.map((room: Room) => ({
            ...room,
            isAvailable: room.isAvailable === undefined ? true : room.isAvailable,
            reviews: room.reviews || []
          }));
          setRooms(formattedRooms);
          setGuestHouse(data.guestHouse);
        } else {
          setError('Failed to fetch rooms');
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRooms();
    }
  }, [id]);

  const handleBookRoom = async (roomId: number) => {
    if (!bookingDate) {
      alert('Please select a booking date');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/gproperties/${id}/rooms/${roomId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: bookingDate,
          userId: localStorage.getItem('userId')
        }), // Remove isAvailable: false from request body
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state to reflect the change
        setRooms(rooms.map(room => 
          room.id === roomId ? { ...room, isAvailable: false } : room
        ));
        
        // Send message to guesthouse owner
        const selectedRoom = rooms.find(room => room.id === roomId);
        if (selectedRoom && guestHouse) {
          try {
            // Create a new message
            const messageData = {
              text: `Hello, I would like to book ${selectedRoom.name} for ${bookingDate}. The booking has been confirmed.`,
              sender: 'user',
              timestamp: new Date(),
              guestHouseId: id,
              ownerId: guestHouse.ownerId,
              userId: localStorage.getItem('userId')
            };
            
            // Send message to backend
            await fetch(`http://localhost:5000/api/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(messageData),
            });
            
            console.log('Booking message sent to owner');
          } catch (msgError) {
            console.error('Error sending booking message:', msgError);
            // Continue with booking process even if message fails
          }
        }
        
        alert('Room booked successfully!');
        navigate('/profile'); // Redirect to profile/bookings page
      } else {
        // Handle specific error cases
        if (data.error === 'ALREADY_BOOKED') {
          alert('This room has already been booked for the selected date.');
        } else {
          alert(data.message || 'Failed to book room. Please try again.');
        }
        
        // Refresh the rooms data to get the latest availability
        const refreshResponse = await fetch(`http://localhost:5000/api/gproperties/${id}/rooms`);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setRooms(refreshData.rooms);
        }
      }
    } catch (err) {
      console.error('Error booking room:', err);
      alert('Failed to book room. Please try again.');
    }
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
  };

  const closeRoomDetails = () => {
    setSelectedRoom(null);
  };

  const submitReview = async () => {
    if (!selectedRoom || !reviewText || !userName) {
      alert('Please fill in all review fields');
      return;
    }

    try {
      const newReview = {
        userName,
        rating: reviewRating,
        comment: reviewText,
        date: new Date().toISOString()
      };

      const response = await fetch(`http://localhost:5000/api/gproperties/${id}/rooms/${selectedRoom.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the room with the new review
        setRooms(rooms.map(room => 
          room.id === selectedRoom.id 
            ? { 
                ...room, 
                reviews: [...(room.reviews || []), {...newReview, id: Date.now()}] 
              } 
            : room
        ));
        
        // Update selected room
        setSelectedRoom({
          ...selectedRoom,
          reviews: [...(selectedRoom.reviews || []), {...newReview, id: Date.now()}]
        });
        
        // Reset form
        setReviewText('');
        setReviewRating(5);
        alert('Review submitted successfully!');
      } else {
        alert(data.message || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/guesthouses')}
                className={`mr-4 p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">{guestHouse?.name || 'Available Rooms'}</h1>
                {!isLoading && !error && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'} Available
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Reviews Section */}
        {!isLoading && !error && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Guest Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.flatMap(room => room.reviews || []).slice(0, 6).map((review, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{review.userName}</div>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {review.comment}
                  </p>
                  <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add Review Form */}
            <div className="mt-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
              <div className="space-y-4 p-6 rounded-lg shadow-md bg-opacity-50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div>
                  <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className={`w-full p-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                    }`}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`h-6 w-6 ${
                            star <= reviewRating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Your Review
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className={`w-full p-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                    }`}
                    rows={4}
                    placeholder="Share your experience..."
                  ></textarea>
                </div>
                <button
                  onClick={submitReview}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
              isDarkMode ? 'border-white' : 'border-blue-600'
            }`}></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-4">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`rounded-xl shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={() => handleRoomClick(room)}
              >
                <div className="relative h-48">
                  <img
                    src={room.images[0] || '/placeholder-room.jpg'}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  {room.reviews && room.reviews.length > 0 && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm">
                        {(room.reviews.reduce((acc, review) => acc + review.rating, 0) / room.reviews.length).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                  <p className={`mb-4 text-sm line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {room.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      <span>Up to {room.capacity} guests</span>
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      Rs. {room.price}/night
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {room.reviews?.length || 0} {room.reviews?.length === 1 ? 'review' : 'reviews'}
                    </div>
                    <div className={`text-sm ${room.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                      {room.isAvailable ? 'Available' : 'Booked'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Room Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            <div className="relative">
              <button 
                onClick={closeRoomDetails}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="h-64 md:h-80">
                <img
                  src={selectedRoom.images[0] || '/placeholder-room.jpg'}
                  alt={selectedRoom.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedRoom.name}</h2>
                  <div className="flex items-center mt-1">
                    <Users className="h-5 w-5 mr-2" />
                    <span>Up to {selectedRoom.capacity} guests</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  Rs. {selectedRoom.price}/night
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedRoom.description}
                </p>
              </div>
              
              {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.amenities.map((amenity, index) => (
                      <span 
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedRoom.isAvailable ? (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Book This Room</h3>
                  <input
                    type="date"
                    className={`w-full p-2 rounded-lg mb-4 ${
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                    }`}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <button
                    onClick={() => handleBookRoom(selectedRoom.id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              ) : (
                <div className="mb-6">
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white py-2 rounded-lg cursor-not-allowed"
                  >
                    Not Available
                  </button>
                </div>
              )}
              
              {/* Reviews Section */}
              
            </div>
          </div>
        </div>
      )}
      
      {guestHouse && (
        <ChatWidget 
          guestHouseId={id as string} 
          ownerId={guestHouse.ownerId} 
        />
      )}
    </div>
  );
};

export default GuestHouseRooms;