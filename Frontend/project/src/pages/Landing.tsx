import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, Globe, ArrowRight, 
  Home, Map, Bus,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Landing.css';

// High-quality dark travel images
const images = [
  'https://images.pexels.com/photos/2440021/pexels-photo-2440021.jpeg?auto=compress&cs=tinysrgb&w=1920', // Dark mountains
  'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=1920', // Dark cityscape
  'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=1920', // Starry night mountains
];

// Travel quotes that will rotate
const travelQuotes = [
  { quote: "Travel is the only thing you buy that makes you richer.", author: "Anonymous" },
  { quote: "The world is a book and those who do not travel read only one page.", author: "Saint Augustine" },
  { quote: "Not all who wander are lost.", author: "J.R.R. Tolkien" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [nextBgIndex, setNextBgIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [showQuote, setShowQuote] = useState(true);
  const [stars, setStars] = useState<Array<{id: number, size: number, top: string, left: string, delay: number}>>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Generate stars for the interactive background - reduced number for cleaner look
  useEffect(() => {
    const newStars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 2 + 1, // Smaller stars
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 4
    }));
    setStars(newStars);
  }, []);

  // Background image rotation effect with smoother transition
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentBgIndex(nextBgIndex);
        setNextBgIndex((nextBgIndex + 1) % images.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 1500);
    }, 8000); // Longer interval between changes

    return () => clearInterval(intervalId);
  }, [nextBgIndex]);

  // Quote rotation effect
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setShowQuote(false);
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % travelQuotes.length);
        setShowQuote(true);
      }, 500);
    }, 6000); // Longer interval for quotes

    return () => clearInterval(quoteInterval);
  }, []);

  const handleGetStarted = () => {
    navigate('/auth?mode=signup');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Images with Transition */}
      <div className="hidden">
        {images.map((img, i) => (
          <img key={i} src={img} alt="" />
        ))}
      </div>
      
      {/* Current background image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-2000 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url("${images[currentBgIndex]}")`,
        }}
      />
      
      {/* Next background image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-2000 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url("${images[nextBgIndex]}")`,
        }}
      />
      
      {/* Dark overlay - increased opacity for darker background */}
      <div className="absolute inset-0 bg-black bg-opacity-75"></div>

      {/* Interactive star background - reduced for cleaner look */}
      <div className="interactive-bg">
        {stars.map(star => (
          <div 
            key={star.id}
            className="star"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: star.top,
              left: star.left,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* Diamond outline animation - kept as requested */}
      <div className="diamond-outline"></div>
      <div className="diamond-outline diamond-outline-delayed"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="px-6 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="logo-container">
              <Plane className="h-8 w-8 text-blue-500 plane-animation" />
            </div>
            <span className="ml-2 text-2xl font-bold text-white animated-text">
              ZippyTrip
            </span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="diamond-button-outline"
            >
              <span className="diamond-button-content">Sign In</span>
            </button>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Quote Card - kept as requested */}
            <div className={`quote-card mb-8 mx-auto ${showQuote ? 'quote-visible' : 'quote-hidden'}`}>
              <div className="quote-icon">
                <Globe className="w-6 h-6" />
              </div>
              <p className="quote-text">{travelQuotes[currentQuoteIndex].quote}</p>
              <p className="quote-author">— {travelQuotes[currentQuoteIndex].author}</p>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-6 text-glow">
              Travel Smarter, Adventure Better
            </h1>
            <p className="text-xl text-gray-200 mb-10">
              Join ZippyTrip to discover amazing destinations, plan your perfect
              trips, and create unforgettable memories.
            </p>
            
            <button
              onClick={handleGetStarted}
              className="hero-button"
            >
              <span>Get Started</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          {/* Our Services section - kept as requested */}
          <div className="w-full max-w-4xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Guesthouse Service */}
              <div className="service-card">
                <div className="service-icon">
                  <Home className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Guesthouse</h3>
                <p className="text-gray-300 text-sm">
                  Discover comfortable and authentic accommodations around the world.
                </p>
              </div>
              
              {/* Hidden Places Service */}
              <div className="service-card">
                <div className="service-icon">
                  <Map className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Hidden Places</h3>
                <p className="text-gray-300 text-sm">
                  Explore off-the-beaten-path destinations guided by local experts.
                </p>
              </div>
              
              {/* Bus Rental Service */}
              <div className="service-card">
                <div className="service-icon">
                  <Bus className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Bus Rental</h3>
                <p className="text-gray-300 text-sm">
                  Travel comfortably with our premium bus rental services.
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-6 text-center text-gray-300 border-t border-gray-800 mt-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-center items-center mb-2">
              <div className="footer-icon-container">
                <Plane className="h-5 w-5 text-blue-500" />
              </div>
              <span className="ml-2 text-lg font-bold text-white">ZippyTrip</span>
            </div>
            <p className="mb-2 text-sm">© 2025 ZippyTrip. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}