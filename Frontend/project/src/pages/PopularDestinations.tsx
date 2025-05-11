import React, { useState, useEffect } from 'react';
import { MapPin, Star } from 'lucide-react';
import { useGlobalTheme } from '../components/GlobalThemeContext';
import { Attraction, getPopularAttractions } from '../services/attractions';

const PopularDestinations: React.FC = () => {
  const { isDarkMode } = useGlobalTheme();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        const data = await getPopularAttractions(6); // Get top 6 attractions
        // Ensure all ratings and prices are numbers
        const sanitizedData = data.map(attraction => ({
          ...attraction,
          rating: typeof attraction.rating === 'number' ? attraction.rating : parseFloat(attraction.rating) || 0,
          price: typeof attraction.price === 'number' ? attraction.price : parseFloat(attraction.price) || 0
        }));
        setAttractions(sanitizedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch attractions:', err);
        setError('Failed to load popular destinations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, []);

  // Loading state UI
  if (loading) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Popular Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index}
                className={`rounded-lg shadow-md overflow-hidden ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } animate-pulse`}
              >
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Popular Destinations
          </h2>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-200' : 'bg-red-100 text-red-800'}`}>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className={`mt-2 px-4 py-2 rounded-md ${
                isDarkMode 
                  ? 'bg-red-800 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No results state
  if (attractions.length === 0) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Popular Destinations
          </h2>
          <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No popular destinations found at the moment. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // Main content with data
  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Popular Destinations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attraction) => (
            <div
              key={attraction.id}
              className={`rounded-lg shadow-md overflow-hidden transition-shadow ${
                isDarkMode
                  ? 'bg-gray-800 hover:shadow-xl'
                  : 'bg-white hover:shadow-lg'
              }`}
            >
              <div className="relative h-48">
                <img
                  src={attraction.image}
                  alt={attraction.name}
                  className="w-full h-full object-cover"
                />
                {attraction.status !== 'open' && (
                  <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded ${
                    attraction.status === 'limited' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {attraction.status.charAt(0).toUpperCase() + attraction.status.slice(1)}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold transition-colors ${
                    isDarkMode
                      ? 'text-white hover:text-blue-400'
                      : 'text-gray-900 hover:text-blue-500'
                  }`}>
                    {attraction.name}
                  </h3>
                  <div className={`flex items-center ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1">{attraction.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <p className={`text-sm mb-3 transition-colors ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-gray-100'
                    : 'text-gray-600 hover:text-gray-800'
                }`}>
                  {attraction.description || attraction.category}
                </p>
                
                <div className={`flex items-center text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{attraction.location}</span>
                </div>
                
                <div className={`mt-2 text-sm font-medium ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Rs {attraction.price.toFixed(2)}
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