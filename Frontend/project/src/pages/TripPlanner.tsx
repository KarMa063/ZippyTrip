import React from 'react';
import { Compass, Map, Heart, Calendar, Clock, Sun } from 'lucide-react';
import { useGlobalTheme } from '../components/GlobalThemeContext';

interface Category {
  icon: JSX.Element;
  title: string;
  description: string;
}

const categories: Category[] = [
  {
    icon: <Compass className="h-6 w-6" />,
    title: 'Adventure',
    description: 'Thrilling outdoor activities'
  },
  {
    icon: <Map className="h-6 w-6" />,
    title: 'Cultural',
    description: 'Local traditions & heritage'
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Romantic',
    description: 'Perfect for couples'
  }
];

const TripPlanner: React.FC = () => {
  const { isDarkMode } = useGlobalTheme();

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`rounded-lg shadow-xl p-6 ${
        isDarkMode ? 'bg-gray-800/90' : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <Calendar className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
          Trip Planner
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`rounded-lg p-6 shadow-md transition-shadow ${
                isDarkMode
                  ? 'bg-gray-800 hover:shadow-xl'
                  : 'bg-white hover:shadow-lg'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-full ${
                  isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
                }`}>
                  {React.cloneElement(category.icon, {
                    className: `h-6 w-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`
                  })}
                </div>
                <h3 className={`ml-3 text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{category.title}</h3>
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {category.description}
              </p>
            </div>
          ))}
        </div>

        <div className={`rounded-lg p-6 ${
          isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50'
        }`}>
          <div className="flex items-center mb-4">
            <Clock className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Best Time to Visit</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Spring', 'Summer', 'Autumn', 'Winter'].map((season) => (
              <div key={season} className={`flex items-center space-x-2 p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <Sun className={`h-5 w-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {season}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;