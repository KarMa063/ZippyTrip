import React, { useState } from 'react';
import { Search, Calendar, Users, MapPin, Plane, Car } from 'lucide-react';
import { useGlobalTheme } from '../components/GlobalThemeContext'; // Import the global theme hook

const SearchBar: React.FC = () => {
  const { isDarkMode } = useGlobalTheme(); // Use global theme
  const [searchType, setSearchType] = useState<'stays' | 'flights' | 'cars'>('stays');

  return (
    <div className={`py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className={`p-6 rounded-lg shadow-lg ${
          isDarkMode ? 'bg-gray-800/90' : 'bg-white/90 backdrop-blur-sm'
        }`}>
          {/* Search Type Buttons */}
          <div className="flex space-x-4 mb-6">
            {[
              {
                type: 'stays' as const,
                label: 'Stays',
                icon: <MapPin className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />,
              },
              {
                type: 'flights' as const,
                label: 'Flights',
                icon: <Plane className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />,
              },
              {
                type: 'cars' as const,
                label: 'Car Rental',
                icon: <Car className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />,
              },
            ].map(({ type, label, icon }) => (
              <button
                key={type}
                className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 transform ${
                  searchType === type
                    ? isDarkMode
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white hover:scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white hover:scale-105'
                }`}
                onClick={() => setSearchType(type)}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Search Inputs */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className={`flex items-center border rounded-md p-3 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 hover:border-blue-400'
                  : 'bg-white border-gray-300 hover:border-blue-500'
              }`}>
                <Search className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder={`Where would you like to ${
                    searchType === 'stays'
                      ? 'stay'
                      : searchType === 'flights'
                      ? 'fly'
                      : 'rent'
                  }?`}
                  className={`ml-2 w-full outline-none ${
                    isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
                  }`}
                />
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className={`flex items-center border rounded-md p-3 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 hover:border-blue-400'
                  : 'bg-white border-gray-300 hover:border-blue-500'
              }`}>
                <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Check-in - Check-out"
                  className={`ml-2 w-full outline-none ${
                    isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
                  }`}
                />
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className={`flex items-center border rounded-md p-3 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 hover:border-blue-400'
                  : 'bg-white border-gray-300 hover:border-blue-500'
              }`}>
                <Users className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder={
                    searchType === 'stays'
                      ? '2 adults · 0 children · 1 room'
                      : searchType === 'flights'
                      ? 'Passengers'
                      : 'Driver age'
                  }
                  className={`ml-2 w-full outline-none ${
                    isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'
                  }`}
                />
              </div>
            </div>

            <button className={`px-8 py-3 rounded-md transition-all duration-300 transform hover:scale-105 ${
              isDarkMode
                ? 'bg-blue-700 text-white hover:bg-blue-800'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}>
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;