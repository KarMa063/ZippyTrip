import React, { useState, useEffect } from 'react';
import { Building2, Plane, Car, MapPin, CarTaxiFront as Taxi, Globe, Moon, Sun, Bell, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  to: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, active = false, to }) => (
  <Link
    to={to}
    className={`nav-link inline-flex items-center px-1 pt-1 text-sm font-medium ${
      active
        ? 'text-blue-600 border-b-2 border-blue-600'
        : 'text-gray-500 hover:text-blue-600 hover:border-gray-300'
    }`}
  >
    {icon}
    <span className="ml-2">{text}</span>
  </Link>
);

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleUserClick = () => {
    navigate('/settings');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/home" className="text-blue-600 text-2xl font-bold hover-text">ZippyTrip</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavItem icon={<Building2 />} text="Stays" active to="/" />
              <NavItem icon={<Plane />} text="Flights" to="/flight-booking" />
              <NavItem icon={<Car />} text="Bus Rentals" to="/bus-rental" />
              <NavItem icon={<MapPin />} text="Attractions" to="/attraction/kathmandu" />
              <NavItem icon={<Taxi />} text="Airport Taxis" to="/404" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Globe className="h-5 w-5 text-gray-600 hover-text" />
            </button>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-gray-600 hover-text" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 hover-text" />
              )}
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600 hover-text" />
            </button>
            <button 
              onClick={handleUserClick}
              className="flex items-center space-x-2 border-2 border-blue-600 rounded-full px-4 py-1 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600 font-medium hover-text">User</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;