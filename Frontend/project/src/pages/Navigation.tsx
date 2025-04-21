import React from 'react';
import { Building2, Plane, Car, MapPin, CarTaxiFront as Taxi, Globe, Moon, Bell, User } from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, active = false }) => (
  <a
    href="#"
    className={`nav-link inline-flex items-center px-1 pt-1 text-sm font-medium ${
      active
        ? 'text-blue-600 border-b-2 border-blue-600'
        : 'text-gray-500 hover:text-blue-600 hover:border-gray-300'
    }`}
  >
    {icon}
    <span className="ml-2">{text}</span>
  </a>
);

const Navigation: React.FC = () => {
  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-blue-600 text-2xl font-bold hover-text">ZippyTrip</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavItem icon={<Building2 />} text="Stays" active />
              <NavItem icon={<Plane />} text="Flights" />
              <NavItem icon={<Car />} text="Bus Rentals" />
              <NavItem icon={<MapPin />} text="Attractions" />
              <NavItem icon={<Taxi />} text="Airport Taxis" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Globe className="h-5 w-5 text-gray-600 hover-text" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Moon className="h-5 w-5 text-gray-600 hover-text" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600 hover-text" />
            </button>
            <div className="flex items-center space-x-2 border-2 border-blue-600 rounded-full px-4 py-1 hover:bg-blue-50 transition-colors">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600 font-medium hover-text">User</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;