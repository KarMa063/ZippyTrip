import React from 'react';
import Navigation from './Navigation';
import PopularDestinations from './PopularDestinations';
import { useGlobalTheme } from '../components/GlobalThemeContext';

const PopularDestinationsPage: React.FC = () => {
  const { isDarkMode } = useGlobalTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Navigation />
      <PopularDestinations />
    </div>
  );
};

export default PopularDestinationsPage;