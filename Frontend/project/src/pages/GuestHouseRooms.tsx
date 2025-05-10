import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Moon, Sun, MapPin, Users, Calendar, ArrowLeft, Star, MessageSquare, X } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';
import { getCurrentUser } from '../lib/supabase';
import { sendRoomBookingConfirmation } from './EmailController';

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
  user_id?: string;
  email?: string;
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
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [guestHouseReviews, setGuestHouseReviews] = useState<Review[]>([]);
  const [dateFilteredRooms, setDateFilteredRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        let url = `http://localhost:5000/api/gproperties/${id}/rooms`;
        if (checkInDate && checkOutDate) {
          url += `?check_in=${checkInDate}&check_out=${checkOutDate}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          const formattedRooms = data.rooms.map((room: Room) => {
            // Process images
            let processedImages = [];
            
            if (room.images) {
              if (typeof room.images === 'string') {
                try {
                  // Try to parse if it's a JSON string
                  processedImages = JSON.parse(room.images);
                } catch (e) {
                  // If parsing fails, use as is
                  processedImages = [room.images];
                }
              } else if (Array.isArray(room.images)) {
                processedImages = room.images;
              } else if (typeof room.images === 'object') {
                // If it's already an object (parsed JSONB)
                processedImages = Object.values(room.images);
              }
            }
            
            return {
              ...room,
              images: processedImages,
              isAvailable: room.isAvailable === undefined ? true : room.isAvailable,
              reviews: room.reviews || []
            };
          });
          
          setRooms(formattedRooms);
          setDateFilteredRooms(formattedRooms);

          const guestHouseResponse = await fetch(`http://localhost:5000/api/gproperties/${id}`);
          const guestHouseData = await guestHouseResponse.json();

          if (guestHouseData.success) {
            setGuestHouse({
              ...guestHouseData.property,
              name: data.guestHouse?.name || guestHouseData.property.name,
              location: guestHouseData.property.address
            });
          } else {
            setGuestHouse(data.guestHouse);
          }
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
  }, [id, checkInDate, checkOutDate]);

  const DateSelectionComponent = () => (
    <div className={`mb-6 p-4 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className="text-lg font-semibold mb-3">Select Dates</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Check-in Date
          </label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
          />
        </div>
        <div>
          <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Check-out Date
          </label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            min={checkInDate || new Date().toISOString().split('T')[0]}
            className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
          />
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchGuestHouseReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/gproperties/${id}/reviews`);
        const data = await response.json();
        if (data.success) {
          const reviewsWithDates = data.reviews.map((review: any) => ({
            ...review,
            date: review.date || review.createdAt || new Date().toISOString()
          }));
          setGuestHouseReviews(reviewsWithDates);
        }
      } catch (err) {
        console.error('Error fetching guesthouse reviews:', err);
      }
    };

    if (id) {
      fetchGuestHouseReviews();
    }
  }, [id]);

  const ratings = guestHouseReviews.map(r => +r.rating);
  const averageGuestHouseRating = guestHouseReviews.length > 0
    ? parseFloat((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1))
    : 'No reviews';

  const submitReview = async () => {
    if (!reviewText.trim()) {
      alert('Please enter your review');
      return;
    }

    setReviewSubmitting(true);

    try {
      const userData = await getCurrentUser();
      if (!userData) {
        alert('You must be logged in to submit a review');
        setReviewSubmitting(false);
        return;
      }

      const newReview = {
        user_id: userData.user_id,
        email: userData.user_email,
        rating: reviewRating,
        review: reviewText,
        createdAt: new Date().toISOString(),
        guestHouseId: id
      };

      const response = await fetch(`http://localhost:5000/api/gproperties/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });
      const data = await response.json();

      if (data.success) {
        const formattedReview: Review = {
          id: data.review.id,
          userName: userData.user_email.split('@')[0] || 'Anonymous',
          rating: reviewRating,
          comment: reviewText,
          date: data.review.createdat,
          user_id: userData.user_id,
          email: userData.user_email
        };

        setGuestHouseReviews([...guestHouseReviews, formattedReview]);
        setReviewText('');
        setReviewRating(5);
        alert('Thank you for your review!');
      } else {
        alert('Failed to submit review. Please try again.');
      }

    } catch (err) {
      console.error('Error submitting review:', err);
      alert('An error occurred while submitting your review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleBookRoom = async (roomId: number) => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select both check-in and check-out dates');
      return;
    }
    
    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkIn >= checkOut) {
      alert('Check-out date must be after check-in date');
      return;
    }
    
    setBookingStatus('loading');
    setBookingError(null);
    
    try {
      // Get authenticated user from Supabase
      const userData = await getCurrentUser();
      
      // If no user is authenticated, show an error
      if (!userData) {
        alert('You must be logged in to book a room');
        setBookingStatus('error');
        setBookingError('Authentication required');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traveller_id: userData.user_id,
          property_id: id,
          room_id: roomId,
          check_in: checkInDate,
          check_out: checkOutDate
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBookingStatus('success');
        
        // Find the booked room
        const bookedRoom = rooms.find(room => room.id === roomId);
        
        // Send email confirmation
        if (bookedRoom) {
          try {
            // Import the email function
            const { sendRoomBookingConfirmation } = await import('../pages/EmailController');
            
            await sendRoomBookingConfirmation({
              email: userData.user_email,
              guestName: userData.user_name || userData.user_email.split('@')[0],
              guestHouseName: guestHouse?.name || 'Guesthouse',
              roomName: bookedRoom.name,
              checkInDate: checkInDate,
              checkOutDate: checkOutDate,
              price: bookedRoom.price,
              location: guestHouse?.location || 'N/A',
              guests: bookedRoom.capacity
            });
            
            console.log('Booking confirmation email sent successfully');
          } catch (emailError) {
            console.error('Failed to send booking confirmation email:', emailError);
            // Continue with booking process even if email fails
          }
        }
        
        alert('Room booked successfully!');
        
        // Update the room's availability in both state variables
        const updatedRooms = rooms.map(room => 
          room.id === roomId ? { ...room, isAvailable: false } : room
        );
        setRooms(updatedRooms);
        setDateFilteredRooms(updatedRooms);
        
        // Close the modal and redirect to profile page
        setSelectedRoom(null);
        navigate('/profile', { state: { activeTab: 'guesthouse' } });
      } else {
        setBookingStatus('error');
        setBookingError(data.message || 'Failed to book room');
        alert(`Booking failed: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error booking room:', err);
      setBookingStatus('error');
      setBookingError('An unexpected error occurred');
      alert('An error occurred while booking the room.');
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

  const allReviews = rooms.flatMap(room => room.reviews || []);
  const averageRating = allReviews.length > 0 
    ? (allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length).toFixed(1)
    : 'No reviews';

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
              <h1 className="text-2xl font-bold">{guestHouse?.name || 'Available Rooms'}</h1>
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
        {/* Property Details Section - Based on the image */}
        <div className={`mb-8 p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Property Image */}
            <div className="md:w-1/3">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={guestHouse?.images?.[0] || '/placeholder-property.jpg'}
                  alt={guestHouse?.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
            
            {/* Property Details */}
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold mb-2">{guestHouse?.name}</h2>
              
              {guestHouse?.location && (
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{guestHouse.location}</span>
                </div>
              )}
              
              {guestHouse?.description && (
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {guestHouse.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4">
                {guestHouse?.contact && (
                  <div>
                    <h3 className="font-semibold">Contact</h3>
                    <p>{guestHouse.contact}</p>
                  </div>
                )}
                
                {guestHouse?.email && (
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p>{guestHouse.email}</p>
                  </div>
                )}
                
                <div className="ml-auto">
                  {guestHouse && (
                    <button 
                      className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                      onClick={() => setSelectedRoom(null)}
                    >
                      <MessageSquare className="h-4 w-4 inline mr-2" />
                      Chat with Owner
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rooms Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Rooms</h2>            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                  isDarkMode ? 'border-white' : 'border-blue-600'
                }`}></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 p-4">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dateFilteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`rounded-lg shadow-md overflow-hidden ${
                      room.isAvailable 
                        ? 'cursor-pointer transition-transform hover:scale-105' 
                        : 'opacity-75 cursor-not-allowed'
                    } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                    onClick={() => room.isAvailable ? setSelectedRoom(room) : null}
                  >
                    <div className="h-40 relative">
                      <img
                        src={room.images[0] || '/placeholder-room.jpg'}
                        alt={room.name}
                        className={`w-full h-full object-cover ${!room.isAvailable ? 'filter grayscale' : ''}`}
                      />
                      <div className={`absolute bottom-0 left-0 right-0 py-1 px-2 text-sm ${
                        room.isAvailable 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {room.isAvailable ? 'Available' : 'Not Available'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{room.name}</h3>
                      <div className="flex items-center mt-1 mb-2">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm">Up to {room.capacity} guests</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-blue-600">
                          Rs. {room.price}/night
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-bold mb-4">Guesthouse Reviews</h2>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {averageGuestHouseRating !== 'No reviews' ? (
                      renderStars(Math.round(averageGuestHouseRating))
                    ) : null}
                  </div>
                  <span className="font-bold">{averageGuestHouseRating}</span>
                  <span className="text-sm ml-1 text-gray-500">({guestHouseReviews.length} reviews)</span>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {guestHouseReviews.length > 0 ? (
                  guestHouseReviews.map((review, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
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
                        {review.date ? new Date(review.date).toLocaleDateString() : 'No date available'}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No reviews yet. Be the first to review this guesthouse!
                  </p>
                )}
              </div>
              
              {/* Write a Review Section - Update this part */}
              <div className="mt-6 pt-4 border-t border-gray-300">
                <h3 className="text-lg font-semibold mb-3">Write a Review</h3>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Rating
                    </label>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
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
                      rows={4}
                      className={`w-full p-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                      }`}
                      placeholder="Share your experience..."
                      required
                    ></textarea>
                  </div>
                  <button
                    onClick={submitReview}
                    disabled={reviewSubmitting}
                    className={`px-4 py-2 rounded-lg ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white w-full ${reviewSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Room Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            <div className="relative">
              <button 
                onClick={() => setSelectedRoom(null)}
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
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        className={`w-full p-2 rounded-lg ${
                          isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                        }`}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        value={checkInDate}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        className={`w-full p-2 rounded-lg ${
                          isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                        }`}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        min={checkInDate || new Date().toISOString().split('T')[0]}
                        value={checkOutDate}
                      />
                    </div>
                    
                    {bookingError && (
                      <div className="text-red-500 text-sm p-2 bg-red-100 rounded-lg">
                        {bookingError}
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleBookRoom(selectedRoom.id)}
                      disabled={bookingStatus === 'loading' || !checkInDate || !checkOutDate}
                      className={`w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors ${
                        bookingStatus === 'loading' || !checkInDate || !checkOutDate ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {bookingStatus === 'loading' ? 'Processing...' : 'Book Now'}
                    </button>
                  </div>
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
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
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