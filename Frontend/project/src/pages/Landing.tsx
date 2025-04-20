import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { supabase } from '../lib/supabase';

const images = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fA%3D%3D&auto=format&fit=crop&w=2021&q=80',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDV8fHRyYXZlbHxlbnwwfHx8fDE2MzM1NTg5OTc&ixlib=rb-1.2.1&q=80&w=2020',
  'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDR8fHRyYXZlbHxlbnwwfHx8fDE2MzM1NTg5OTc&ixlib=rb-1.2.1&q=80&w=2020',
  'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1516546453174-5e1098a4b4af?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
];

export default function Landing() {
  const navigate = useNavigate();
  const [bgImage, setBgImage] = useState(images[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgImage(images[Math.floor(Math.random() * images.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate('/auth?mode=signup');
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <Plane className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-2xl font-bold text-white">
              ZippyTrip
            </span>
          </div>
          <button
            onClick={() => navigate('/auth?mode=login')}
            className="px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
          >
            Sign In
          </button>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-4 space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Travel Smarter, Adventure Better
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Join ZippyTrip to discover amazing destinations, plan your perfect
              trips, and create unforgettable memories.
            </p>
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 text-xl rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
            >
              Get Started
            </button>
          </div>
        </main>

        <footer className="py-8 text-center text-gray-300">
          <p>© 2025 ZippyTrip. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}