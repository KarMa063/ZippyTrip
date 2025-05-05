import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { useGlobalTheme } from '../components/GlobalThemeContext';
import Navigation from './Navigation';

interface Destination {
  id: string;
  name: string;
  image: string;
  description: string;
  rating: number;
  properties: number;
}

const destinations: Destination[] = [
  {
    id: '1',
    name: 'Kathmandu',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    description: 'Cultural heritage and mountain views',
    rating: 4.5,
    properties: 1234
  },
  {
    id: '2',
    name: 'Pokhara',
    image: 'https://images.unsplash.com/photo-1570637089934-9c491b8287c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    description: 'Lakeside paradise with mountain backdrop',
    rating: 4.7,
    properties: 856
  }
];

const PopularDestinations: React.FC = () => {
  const { isDarkMode } = useGlobalTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Popular Destinations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className={`rounded-lg shadow-md overflow-hidden transition-shadow ${
                isDarkMode
                  ? 'bg-gray-800 hover:shadow-xl'
                  : 'bg-white hover:shadow-lg'
              }`}
            >
              <div className="relative h-48">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold transition-colors ${
                    isDarkMode
                      ? 'text-white hover:text-blue-400'
                      : 'text-gray-900 hover:text-blue-500'
                  }`}>
                    {destination.name}
                  </h3>
                  <div className={`flex items-center ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1">{destination.rating}</span>
                  </div>
                </div>
                
                <p className={`text-sm mb-3 transition-colors ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-gray-100'
                    : 'text-gray-600 hover:text-gray-800'
                }`}>
                  {destination.description}
                </p>
                
                <div className={`flex items-center text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{destination.properties} properties</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularDestinations;