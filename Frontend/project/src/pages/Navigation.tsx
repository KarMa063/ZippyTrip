import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Car,
  MapPin,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGlobalTheme } from '../components/GlobalThemeContext';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  route: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, route, active = false }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useGlobalTheme();

  return (
    <button
      onClick={() => navigate(route)}
      className={`nav-link inline-flex items-center px-2 py-2 text-sm font-medium transition-all duration-200 transform ${
        active
          ? isDarkMode
            ? 'text-blue-400 border-b-4 border-blue-400 scale-105'
            : 'text-blue-600 border-b-4 border-blue-600 scale-105'
          : isDarkMode
          ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800 hover:scale-100'
          : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100 hover:scale-100'
      }`}
    >
      {icon}
      <span className="ml-2">{text}</span>
    </button>
  );
};

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useGlobalTheme();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const serviceMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const serviceButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }

      if (
        serviceMenuRef.current &&
        !serviceMenuRef.current.contains(event.target as Node) &&
        serviceButtonRef.current &&
        !serviceButtonRef.current.contains(event.target as Node)
      ) {
        setServiceMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSettingsClick = () => {
    navigate('/setting');
    setProfileMenuOpen(false);
  };
  const handleProfileClick = () => {
    navigate('/profile');
    setProfileMenuOpen(false);
  };
  const handleGuestHouseOwnerClick = () => {
    navigate('/glogin');
    setServiceMenuOpen(false);
  };
  const handleBusOperatorClick = () => {
    window.location.href = 'http://localhost:4000/services';
    setServiceMenuOpen(false);
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
    <nav
      className={`${isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-sm shadow-lg sticky top-0 z-50`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span
                className={`${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                } text-2xl font-bold hover-text cursor-pointer`}
                onClick={() => navigate('/home')}
              >
                ZippyTrip
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
              <NavItem
                icon={<Building2 className={isDarkMode ? 'h-5 w-5 text-gray-300' : 'h-5 w-5'} />}
                text="Stays"
                route="/guesthouses"
                active={location.pathname === '/guesthouses'}
              />
              <NavItem
                icon={<Car className={isDarkMode ? 'h-5 w-5 text-gray-300' : 'h-5 w-5'} />}
                text="Bus Rentals"
                route="/bus"
                active={location.pathname === '/bus'}
              />
              <NavItem
                icon={<MapPin className={isDarkMode ? 'h-5 w-5 text-gray-300' : 'h-5 w-5'} />}
                text="Attractions"
                route="/attractions"
                active={location.pathname === '/attractions'}
              />
            </div>
          </div>

          <div className="relative flex items-center space-x-4">
            <button
              className={`p-2 rounded-full ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              } transition-colors`}
            >
            </button>
            <button
              className={`p-2 rounded-full ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } transition-colors`}
              onClick={toggleTheme}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500 hover-text" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 hover-text" />
              )}
            </button>

<div className="relative">
  <button
    onClick={handleGuestHouseOwnerClick}
    className={`flex items-center space-x-2 border-2 ${
      isDarkMode
        ? 'border-blue-400 text-blue-400 hover:bg-gray-800'
        : 'border-blue-600 text-blue-600 hover:bg-blue-50'
    } rounded-full px-4 py-1 transition-colors`}
  >
    <span className="font-medium hover-text">List your Guesthouse</span>
  </button>
</div>


            <div className="relative">
              <button
                ref={profileButtonRef}
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className={`flex items-center space-x-2 border-2 ${
                  isDarkMode
                    ? 'border-blue-400 text-blue-400 hover:bg-gray-800'
                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                } rounded-full px-4 py-1 transition-colors`}
              >
                <span className="font-medium hover-text">Profile</span>
              </button>

              {profileMenuOpen && (
                <div
                  ref={profileMenuRef}
                  className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50"
                >
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Your Bookings
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