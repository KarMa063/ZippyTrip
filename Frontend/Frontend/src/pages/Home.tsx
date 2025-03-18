import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plane } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import './Home.css'; // Import external CSS for animations

const images: string[] = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fA%3D%3D&auto=format&fit=crop&w=2021&q=80',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2020',
  'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2020',
  'https://images.unsplash.com/photo-1533616688419-b7a585564566?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2020',
  'https://images.unsplash.com/photo-1516546453174-5e1098a4b4af?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bgImage, setBgImage] = useState<string>(images[0]);
  const [nextImage, setNextImage] = useState<string>(images[1]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    const changeBackground = () => {
      const newImage = images[Math.floor(Math.random() * images.length)];

      const img = new Image();
      img.src = newImage;
      img.onload = () => {
        setNextImage(newImage);
        setIsTransitioning(true);

        setTimeout(() => {
          setBgImage(newImage);
          setIsTransitioning(false);
        }, 1000); // Match transition duration
      };
    };

    const interval = setInterval(changeBackground, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background with sliding transition */}
      <div className="background-container">
        <div
          className={`background-slide ${isTransitioning ? 'slide-out' : ''}`}
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        {isTransitioning && (
          <div
            className="background-slide slide-in"
            style={{ backgroundImage: `url(${nextImage})` }}
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white bg-opacity-80 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Plane className="h-6 w-6 text-blue-500" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                ZippyTrip
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white bg-opacity-90 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome to Your Travel Dashboard
          </h2>
          <p className="text-gray-600">
            Start planning your next adventure with ZippyTrip!
          </p>
        </div>
      </main>
    </div>
  );
}
