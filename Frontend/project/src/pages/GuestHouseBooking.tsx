import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, Star, Heart, MessageSquare, Moon, Sun } from 'lucide-react';
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

interface Property {
    id: number;
    name: string;
    description: string;
    address: string;
    email: string;
    contact: string;
    images: string[];
    rooms: number;
    location?: string; // Add this field
    price?: number;
    rating?: number;
    amenities?: string[];
    reviews?: Review[];
}

interface GuestHouse {
    id: number;
    name: string;
    description: string;
    address: string;
    email: string;
    contact: string;
    images: string[];
    rooms: number;
}

const GuestHouseBooking: React.FC = () => {
    const [guestHousesList, setGuestHousesList] = useState<GuestHouse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch('http://localhost:5000/viewproperties');
                const data = await response.json();
                if (data.success) {
                    setGuestHousesList(data.properties);
                } else {
                    setError('Failed to fetch properties');
                }
            } catch (err) {
                console.error('Error fetching properties:', err);
                setError('Failed to load properties');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const handleViewRooms = (guestHouseId: number) => {
        navigate(`/guesthouse/${guestHouseId}/rooms`);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 ${
            isDarkMode 
                ? 'bg-gray-900 text-white' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-50'
        } p-4`}>
            <div className="max-w-7xl mx-auto relative">
                {/* Theme Toggle and Logo */}
                <div className="flex justify-between items-center mb-8">
                    <span 
                        className={`text-2xl font-bold cursor-pointer hover:scale-105 transition-transform duration-200 ${
                            isDarkMode ? 'text-white' : 'text-blue-600'
                        }`}
                        onClick={() => navigate('/home')}
                    >
                        ZippyTrip
                    </span>
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                            isDarkMode 
                                ? 'bg-gray-700 hover:bg-gray-600' 
                                : 'bg-white hover:bg-gray-100'
                        }`}
                    >
                        {isDarkMode ? (
                            <Sun className="w-5 h-5 text-yellow-400" />
                        ) : (
                            <Moon className="w-5 h-5 text-gray-600" />
                        )}
                    </button>
                </div>

                <h1 className={`text-4xl font-bold mb-8 relative ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                    Available Guest Houses
                    <span className="block h-1 w-20 bg-blue-600 mt-2"></span>
                </h1>

                {/* Guest Houses List */}
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
                        {guestHousesList.map((guestHouse) => (
                            <div 
                                key={guestHouse.id} 
                                className={`rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                                }`}
                                onClick={() => handleViewRooms(guestHouse.id)}
                            >
                                <div className="relative h-56">
                                    <img
                                        src={guestHouse.images && guestHouse.images.length > 0 
                                            ? guestHouse.images[0].replace('blob: ', '') 
                                            : '/placeholder-image.jpg'}
                                        alt={guestHouse.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <h3 className="text-2xl font-bold mb-1">{guestHouse.name}</h3>
                                        <p className="flex items-center text-sm">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {guestHouse.address}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className={`mb-4 line-clamp-3 text-sm leading-relaxed ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        {guestHouse.description}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <div className={`flex items-center ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                            <Users className="w-5 h-5 mr-2" />
                                            <span className="font-medium">
                                                {guestHouse.rooms} {guestHouse.rooms === 1 ? 'Room' : 'Rooms'}
                                            </span>
                                        </div>
                                        <button 
                                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleViewRooms(guestHouse.id);
                                            }}
                                        >
                                            View Rooms
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuestHouseBooking;