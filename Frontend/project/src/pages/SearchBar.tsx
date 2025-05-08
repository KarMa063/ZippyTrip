import React, { useState } from 'react';
import { Search, Calendar, Users, MapPin, Plane, Car } from 'lucide-react';

const SearchBar = () => {
  const [searchType, setSearchType] = useState<'stays' | 'flights' | 'cars'>(
    'stays'
  );

  return (
    <div className="bg-transparent py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
          {/* Search Type Buttons */}
          <div className="flex space-x-4 mb-6">
            {[
              {
                type: 'stays',
                label: 'Stays',
                icon: <MapPin className="h-5 w-5 mr-2" />,
              },
              {
                type: 'flights',
                label: 'Flights',
                icon: <Plane className="h-5 w-5 mr-2" />,
              },
              {
                type: 'cars',
                label: 'Car Rental',
                icon: <Car className="h-5 w-5 mr-2" />,
              },
            ].map(({ type, label, icon }) => (
              <button
                key={type}
                className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 transform ${
                  searchType === type
                    ? 'bg-blue-600 text-white'
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
              <div className="flex items-center border rounded-md p-3 hover:border-blue-500 transition-all duration-300 bg-white">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Where would you like to ${
                    searchType === 'stays'
                      ? 'stay'
                      : searchType === 'flights'
                      ? 'fly'
                      : 'rent'
                  }?`}
                  className="ml-2 w-full outline-none"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center border rounded-md p-3 hover:border-blue-500 transition-all duration-300 bg-white">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Check-in - Check-out"
                  className="ml-2 w-full outline-none"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center border rounded-md p-3 hover:border-blue-500 transition-all duration-300 bg-white">
                <Users className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    searchType === 'stays'
                      ? '2 adults · 0 children · 1 room'
                      : searchType === 'flights'
                      ? 'Passengers'
                      : 'Driver age'
                  }
                  className="ml-2 w-full outline-none"
                />
              </div>
            </div>

            <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;