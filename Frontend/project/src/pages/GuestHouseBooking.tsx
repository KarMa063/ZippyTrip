import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, Star, Heart, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GuestHouse {
    id: number;
    name: string;
    location: string;
    price: number;
    rating: number;
    amenities: string[];
    images: string[];
    reviews: Review[];
}

interface Review {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
}

const GuestHouseBooking: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        location: '',
        checkIn: '',
        checkOut: '',
        guests: 1
    });

    const [selectedGuestHouse, setSelectedGuestHouse] = useState<GuestHouse | null>(null);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: ''
    });

    const [guestHousesList, setGuestHousesList] = useState<GuestHouse[]>([
        {
            id: 1,
            name: "Mountain View Guest House",
            location: "Pokhara",
            price: 2500,
            rating: 4.5,
            amenities: ["Free WiFi", "Breakfast", "Parking", "Air Conditioning"],
            images: [
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400"
            ],
            reviews: [
                {
                    id: 1,
                    user: "John Doe",
                    rating: 5,
                    comment: "Great location and friendly staff! The view of the mountains was breathtaking.",
                    date: "2024-03-15"
                },
                {
                    id: 2,
                    user: "Jane Smith",
                    rating: 4,
                    comment: "Comfortable stay with good amenities. Would recommend!",
                    date: "2024-03-10"
                }
            ]
        },
        {
            id: 2,
            name: "Lakeside Retreat",
            location: "Pokhara",
            price: 3000,
            rating: 4.8,
            amenities: ["Free WiFi", "Breakfast", "Swimming Pool", "Restaurant"],
            images: [
                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400",
                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400"
            ],
            reviews: [
                {
                    id: 3,
                    user: "Mike Johnson",
                    rating: 5,
                    comment: "Perfect location by the lake. Amazing service and food!",
                    date: "2024-03-12"
                }
            ]
        },
        {
            id: 3,
            name: "Peaceful Valley Inn",
            location: "Kathmandu",
            price: 2000,
            rating: 4.2,
            amenities: ["Free WiFi", "Garden", "24/7 Reception"],
            images: [
                "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&h=400",
                "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&h=400"
            ],
            reviews: [
                {
                    id: 4,
                    user: "Sarah Williams",
                    rating: 4,
                    comment: "Quiet and peaceful place. Good value for money.",
                    date: "2024-03-08"
                }
            ]
        }
    ]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call an API
        console.log('Searching with params:', searchParams);
    };

    const handleBooking = (guestHouse: GuestHouse) => {
        setSelectedGuestHouse(guestHouse);
        setShowBookingForm(true);
    };

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGuestHouse) {
            const review: Review = {
                id: Date.now(),
                user: "Current User", // This would be the logged-in user
                rating: newReview.rating,
                comment: newReview.comment,
                date: new Date().toISOString().split('T')[0]
            };
            
            // Update the guest houses list with the new review
            const updatedGuestHouses = guestHousesList.map(gh => {
                if (gh.id === selectedGuestHouse.id) {
                    return {
                        ...gh,
                        reviews: [...gh.reviews, review],
                        rating: ((gh.rating * gh.reviews.length) + review.rating) / (gh.reviews.length + 1)
                    };
                }
                return gh;
            });
            
            setGuestHousesList(updatedGuestHouses);
            setShowReviewForm(false);
            setNewReview({ rating: 5, comment: '' });
        }
    };

    const handleBookingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically make an API call to save the booking
        setShowBookingForm(false);
        // Redirect to a confirmation page
        navigate('/booking-confirmation');
    };

    const handleWriteReview = (guestHouse: GuestHouse) => {
        setSelectedGuestHouse(guestHouse);
        setShowReviewForm(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Find Your Perfect Stay</h1>
                
                {/* Search Form */}
                <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Location"
                                className="w-full pl-10 p-2 border rounded-md"
                                value={searchParams.location}
                                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                className="w-full pl-10 p-2 border rounded-md"
                                value={searchParams.checkIn}
                                onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                className="w-full pl-10 p-2 border rounded-md"
                                value={searchParams.checkOut}
                                onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                            />
                        </div>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                min="1"
                                placeholder="Guests"
                                className="w-full pl-10 p-2 border rounded-md"
                                value={searchParams.guests}
                                onChange={(e) => setSearchParams({ ...searchParams, guests: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                    >
                        Search
                    </button>
                </form>

                {/* Guest Houses List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guestHousesList.map((guestHouse) => (
                        <div key={guestHouse.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative h-48">
                                <img
                                    src={guestHouse.images[0]}
                                    alt={guestHouse.name}
                                    className="w-full h-full object-cover"
                                />
                                <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md">
                                    <Heart className="w-5 h-5 text-red-500" />
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold">{guestHouse.name}</h3>
                                    <div className="flex items-center">
                                        <Star className="w-5 h-5 text-yellow-400" />
                                        <span className="ml-1">{guestHouse.rating}</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    {guestHouse.location}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {guestHouse.amenities.map((amenity, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                                        >
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xl font-bold">Rs. {guestHouse.price}/night</p>
                                    <div className="space-x-2">
                                        <button
                                            onClick={() => handleWriteReview(guestHouse)}
                                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                        >
                                            Write Review
                                        </button>
                                        <button
                                            onClick={() => handleBooking(guestHouse)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                                {/* Reviews Section */}
                                <div className="mt-4 border-t pt-4">
                                    <h4 className="font-semibold mb-2">Recent Reviews</h4>
                                    {guestHouse.reviews.map((review) => (
                                        <div key={review.id} className="mb-3">
                                            <div className="flex items-center mb-1">
                                                <span className="font-medium">{review.user}</span>
                                                <div className="flex ml-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${
                                                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm">{review.comment}</p>
                                            <p className="text-gray-400 text-xs">{review.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Booking Form Modal */}
                {showBookingForm && selectedGuestHouse && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">Book {selectedGuestHouse.name}</h2>
                            <form onSubmit={handleBookingSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input type="tel" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowBookingForm(false)}
                                        className="px-4 py-2 border rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Review Form Modal */}
                {showReviewForm && selectedGuestHouse && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">Write a Review for {selectedGuestHouse.name}</h2>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                    <div className="flex space-x-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${
                                                        star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {newReview.rating} {newReview.rating === 1 ? 'star' : 'stars'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Comment</label>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        rows={4}
                                        placeholder="Share your experience..."
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowReviewForm(false)}
                                        className="px-4 py-2 border rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Submit Review
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuestHouseBooking; 