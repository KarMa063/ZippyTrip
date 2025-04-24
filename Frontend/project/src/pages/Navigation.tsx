import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Car,
  MapPin,
  Globe,
  Moon,
  Bell,
  User,
  Ticket,
  Settings,
  LogOut,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  route: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, route, active = false }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(route)}
      className={`nav-link inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-500 hover:text-blue-600 hover:border-gray-300'
      }`}
    >
      {icon}
      <span className="ml-2">{text}</span>
    </button>
  );
};

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  // Removed: const [showTickets, setShowTickets] = useState(false);

  const handleSettingsClick = () => {
    navigate('/setting');
    setProfileMenuOpen(false);
  };

  const handleMyTicketsClick = () => {
    navigate('/my-tickets');
    setProfileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error.message);
    }
  };
  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span
                className="text-blue-600 text-2xl font-bold hover-text cursor-pointer"
                onClick={() => navigate('/')}
              >
                ZippyTrip
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavItem icon={<Building2 />} text="Stays" route="/home" active />
              <NavItem icon={<Car />} text="Bus Rentals" route="/bus" />
              <NavItem icon={<MapPin />} text="Attractions" route="/attractions" />
            </div>
          </div>

            <div className="relative flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Globe className="h-5 w-5 text-gray-600 hover-text" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Moon className="h-5 w-5 text-gray-600 hover-text" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600 hover-text" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex items-center space-x-2 border-2 border-blue-600 rounded-full px-4 py-1 hover:bg-blue-50 transition-colors"
              >
                <User className="h-5 w-5 text-blue-600" />
                <span className="text-blue-600 font-medium hover-text">Profile</span>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={handleMyTicketsClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    My Tickets
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
