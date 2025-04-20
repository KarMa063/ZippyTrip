import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
// Import required modules
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { 
  Star, 
  ArrowLeft, 
  MapPin, 
  Users, 
  Calendar, 
  Phone, 
  Mail,
  Heart,
  Bed,
  CreditCard,
  Wallet,
  Coffee,
  Wifi,
  Tv,
  Bath,
  CheckCircle2
} from 'lucide-react';
import { supabase, createHotelBooking } from '../lib/supabase';
import { toast } from 'react-hot-toast';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface RoomType {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string;
  price_per_night: number;
  image_url: string;
  rating: number;
  room_types: RoomType[];
  payment_options: string[];
  amenities: string[];
}

interface Review {
  id: string;
  hotel_id: string;
  rating: number;
  comment: string;
  user_id: string;
  created_at: string;
}

const destinationImages = {
  kathmandu: [
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1605640840605-14ac1855827b?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1590689080414-acf9b8473bc4?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
  ],
  pokhara: [
    'https://images.unsplash.com/photo-1571392203315-35e9b53f3d3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1605640756066-4f5e2c9ba858?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1605640787069-83759c3bd419?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
  ],
};

const defaultRoomTypes: RoomType[] = [
  {
    id: '1',
    name: 'Deluxe Room',
    description: 'Spacious room with mountain view',
    price: 5000,
    capacity: 2,
    amenities: ['WiFi', 'TV', 'Mini Bar', 'Mountain View'],
  },
  {
    id: '2',
    name: 'Super Deluxe',
    description: 'Luxury room with balcony',
    price: 7500,
    capacity: 2,
    amenities: ['WiFi', 'TV', 'Mini Bar', 'Balcony', 'Bathtub'],
  },
  {
    id: '3',
    name: 'Family Suite',
    description: 'Perfect for families',
    price: 12000,
    capacity: 4,
    amenities: ['WiFi', 'TV', 'Kitchen', 'Living Room', 'Mountain View'],
  },
];

const PopularDestinationPage: React.FC = () => {
  const { destination } = useParams<{ destination: string }>();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [reviews, setReviews] = useState<{ [key: string]: Review[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    paymentMethod: 'card',
  });
  const [swiper, setSwiper] = useState<SwiperType>();

  useEffect(() => {
    fetchHotels();
  }, [destination]);

  const fetchHotels = async () => {
    try {
      const { data: hotelsData, error: hotelsError } = await supabase
        .from('hotels')
        .select('*')
        .eq('location', destination)
        .order('rating', { ascending: false });

      if (hotelsError) throw hotelsError;

      const enhancedHotels = (hotelsData || []).map(hotel => ({
        ...hotel,
        room_types: defaultRoomTypes,
        payment_options: ['card', 'cash'],
        amenities: ['WiFi', 'Restaurant', 'Parking', '24/7 Reception'],
      }));

      setHotels(enhancedHotels);

      const hotelIds = hotelsData?.map(hotel => hotel.id) || [];
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('hotel_reviews')
        .select('*')
        .in('hotel_id', hotelIds);

      if (reviewsError) throw reviewsError;

      const reviewsByHotel = (reviewsData || []).reduce((acc: { [key: string]: Review[] }, review) => {
        if (!acc[review.hotel_id]) {
          acc[review.hotel_id] = [];
        }
        acc[review.hotel_id].push(review);
        return acc;
      }, {});

      setReviews(reviewsByHotel);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (hotel: Hotel) => {
    if (!bookingData.checkIn || !bookingData.checkOut || !selectedRoomType) {
      toast.error('Please select dates and room type');
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast.error('Please sign in to book a hotel');
        return;
      }

      const nights = Math.ceil(
        (new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / 
        (1000 * 60 * 60 * 24)
      );

      const totalPrice = selectedRoomType.price * nights;

      const result = await createHotelBooking(
        session.session.user.id,
        hotel.id,
        selectedRoomType.name,
        bookingData.checkIn,
        bookingData.checkOut,
        totalPrice,
        bookingData.paymentMethod as 'card' | 'cash'
      );

      toast.success(
        bookingData.paymentMethod === 'cash' 
          ? 'Booking confirmed! Please pay at check-in.' 
          : 'Booking and payment successful!'
      );
      
      setSelectedHotel(null);
      setSelectedRoomType(null);
      setBookingData({ checkIn: '', checkOut: '', guests: 1, paymentMethod: 'card' });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(price);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'tv': return <Tv className="h-4 w-4" />;
      case 'coffee': return <Coffee className="h-4 w-4" />;
      case 'bathtub': return <Bath className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image Carousel */}
      <div className="relative h-[60vh]">
        {/* @ts-ignore */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          effect="fade"
          className="h-full"
          onSwiper={setSwiper}
        >
          {destinationImages[destination as keyof typeof destinationImages]?.map((image, index) => (
            <SwiperSlide key={index}>
              <img
                src={image}
                alt={`${destination} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Hotels List */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative h-48">
                <img
                  src={hotel.image_url}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{hotel.name}</h3>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span>{hotel.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-400 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{hotel.location}</span>
                </div>
                <p className="text-gray-400 mb-4 line-clamp-2">
                  {hotel.description}
                </p>

                {/* Room Types Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Available Rooms</h4>
                  <div className="space-y-2">
                    {hotel.room_types.map((room) => (
                      <div key={room.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">{room.name}</span>
                        <span className="font-medium text-blue-400">{formatPrice(room.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotel Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {hotel.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300 flex items-center"
                    >
                      {getAmenityIcon(amenity)}
                      <span className="ml-1">{amenity}</span>
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedHotel(hotel)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <Bed className="h-5 w-5 mr-2" />
                  View Rooms & Book
                </button>
              </div>

              {/* Reviews Section */}
              {reviews[hotel.id] && reviews[hotel.id].length > 0 && (
                <div className="border-t border-gray-700 p-6">
                  <h4 className="text-lg font-semibold mb-4">Guest Reviews</h4>
                  <div className="space-y-4">
                    {reviews[hotel.id].slice(0, 2).map((review) => (
                      <div key={review.id} className="border-b border-gray-700 pb-4">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 text-yellow-400 fill-current"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400 ml-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold">{selectedHotel.name}</h3>
              <button
                onClick={() => setSelectedHotel(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Room Types Selection */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {selectedHotel.room_types.map((room) => (
                <div
                  key={room.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedRoomType?.id === room.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-blue-500/50'
                  }`}
                  onClick={() => setSelectedRoomType(room)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-medium">{room.name}</h4>
                    <span className="text-xl font-bold text-blue-400">
                      {formatPrice(room.price)}
                      <span className="text-sm text-gray-400">/night</span>
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{room.description}</p>
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Up to {room.capacity} guests</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300 flex items-center"
                      >
                        {getAmenityIcon(amenity)}
                        <span className="ml-1">{amenity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Booking Form */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Check-in Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                    className="pl-10 w-full bg-gray-700 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Check-out Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    className="pl-10 w-full bg-gray-700 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setBookingData({ ...bookingData, paymentMethod: 'card' })}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center ${
                    bookingData.paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-blue-500/50'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay Now with Card
                </button>
                <button
                  onClick={() => setBookingData({ ...bookingData, paymentMethod: 'cash' })}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center ${
                    bookingData.paymentMethod === 'cash'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-blue-500/50'
                  }`}
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Pay at Check-in
                </button>
              </div>
            </div>

            {/* Booking Summary */}
            {selectedRoomType && bookingData.checkIn && bookingData.checkOut && (
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h4 className="text-lg font-medium mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Room Type</span>
                    <span className="font-medium">{selectedRoomType.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Price per Night</span>
                    <span className="font-medium">{formatPrice(selectedRoomType.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Number of Nights</span>
                    <span className="font-medium">
                      {Math.ceil(
                        (new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-400">
                        {formatPrice(
                          selectedRoomType.price *
                            Math.ceil(
                              (new Date(bookingData.checkOut).getTime() -
                                new Date(bookingData.checkIn).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => handleBooking(selectedHotel)}
                disabled={!selectedRoomType || !bookingData.checkIn || !bookingData.checkOut}
                className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                  !selectedRoomType || !bookingData.checkIn || !bookingData.checkOut
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {bookingData.paymentMethod === 'card' ? (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay & Book Now
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5 mr-2" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopularDestinationPage;