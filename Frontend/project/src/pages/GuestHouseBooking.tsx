import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, Star, Heart, MessageSquare, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobalTheme } from '../components/GlobalThemeContext'; 
import Navigation from './Navigation';
import ChatWidget from '../components/ChatWidget';

interface Review {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
}

interface GuestHouse {
    id: number;
    name: string;
    description: string;
    address: string;
    email?: string;
    contact?: string;
    images: string[] | any;
    rooms: number;
    location?: string;
    price?: number;
    rating?: number;
    amenities?: string[];
    reviews?: Review[];
    ownerId?: string;
}

const GuestHouseBooking: React.FC = () => {
    const [guestHousesList, setGuestHousesList] = useState<GuestHouse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isDarkMode, toggleTheme } = useGlobalTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/gproperties');
                const data = await response.json();

                if (Array.isArray(data.properties)) {
                    // Process the properties to ensure images are in the correct format
                    const processedProperties = data.properties.map((property: any) => {
                        let processedImages = [];
                        
                        // Handle different image formats from the backend
                        if (property.images) {
                            if (typeof property.images === 'string') {
                                try {
                                    // Try to parse if it's a JSON string
                                    processedImages = JSON.parse(property.images);
                                } catch (e) {
                                    // If parsing fails, use as is
                                    processedImages = [property.images];
                                }
                            } else if (Array.isArray(property.images)) {
                                processedImages = property.images;
                            } else if (typeof property.images === 'object') {
                                // If it's already an object (parsed JSONB)
                                processedImages = Object.values(property.images);
                            }
                        }
                        
                        return {
                            ...property,
                            images: processedImages
                        };
                    });
                    
                    setGuestHousesList(processedProperties);
                } else {
                    console.error('Unexpected response shape:', data);
                    setError('Unexpected data format');
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

    // Helper function to get image URL
    const getImageUrl = (images: any, index: number = 0): string => {
        if (!images || images.length === 0) {
            return '/placeholder-image.jpg';
        }
        
        const image = images[index];
        // Check if the image is a full URL or just a path
        if (typeof image === 'string') {
            if (image.startsWith('http')) {
                return image;
            } else {
                // If it's a relative path, prepend the backend URL
                return `http://localhost:5000/${image}`;
            }
        }
        
        return '/placeholder-image.jpg';
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 ${
            isDarkMode 
                ? 'bg-gray-900 text-white' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800'
        } p-4`}>
            <div>
                {/* Navigation Bar */}
                <Navigation />
                <div className="max-w-7xl mx-auto relative">
                    {/* Theme Toggle and Logo */}
                    <div className="flex justify-between items-center mb-8">
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
                        <div className={`text-center p-4 ${
                            isDarkMode ? 'text-red-400' : 'text-red-600'
                        }`}>{error}</div>
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
                                            src={getImageUrl(guestHouse.images)}
                                            alt={guestHouse.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-image.jpg';
                                            }}
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
                                                className={`flex items-center gap-2 px-6 py-2 rounded-full transition-colors duration-200 font-medium shadow-md hover:shadow-lg ${
                                                    isDarkMode
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
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
            {/* Add ChatWidget for each guesthouse */}
            {guestHousesList.map((guestHouse) => (
                <ChatWidget 
                    key={guestHouse.id}
                    guestHouseId={guestHouse.id.toString()} 
                    ownerId={guestHouse.ownerId} 
                />
            ))}
        </div>
    );
};

export default GuestHouseBooking;