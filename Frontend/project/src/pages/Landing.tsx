import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, Globe, ArrowRight, Compass, 
  Home, Map, Bus, Info, 
  Clock, Calendar, Luggage, MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Landing.css';

// High-quality dark travel images
const images = [
  'https://images.pexels.com/photos/2440021/pexels-photo-2440021.jpeg?auto=compress&cs=tinysrgb&w=1920', // Dark mountains
  'https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=1920', // Dark cityscape
  'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=1920', // Starry night mountains
  'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920', // Dark beach
  'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1920', // Dark forest path
];

// Travel quotes that will rotate
const travelQuotes = [
  { quote: "Travel is the only thing you buy that makes you richer.", author: "Anonymous" },
  { quote: "The world is a book and those who do not travel read only one page.", author: "Saint Augustine" },
  { quote: "Not all who wander are lost.", author: "J.R.R. Tolkien" },
  { quote: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
  { quote: "Travel far, travel wide, travel deep.", author: "Anita Desai" },
];

// Remove the destinations array since we're removing that section

export default function Landing() {
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [nextBgIndex, setNextBgIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [showQuote, setShowQuote] = useState(true);
  const [stars, setStars] = useState<Array<{id: number, size: number, top: string, left: string, delay: number}>>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Generate stars for the interactive background
  useEffect(() => {
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
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
        }, 50); // Short delay before starting fade-in
      }, 1500); // Longer transition duration for smoother effect
    }, 6000); // Change every 6 seconds

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
    }, 4000);

    return () => clearInterval(quoteInterval);
  }, []);

  // 3D parallax effect on mouse move
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const moveX = (clientX - innerWidth / 2) / 25;
      const moveY = (clientY - innerHeight / 2) / 25;
      
      hero.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/auth?mode=signup');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Images with Transition - Preload all images */}
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

      {/* Interactive star background */}
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

      {/* Diamond outline animation */}
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

        <main className="flex-grow flex flex-col items-center justify-center px-4 space-y-12">
          <div className="text-center max-w-4xl mx-auto hero-content" ref={heroRef}>
            {/* Quote Card - now with fixed position */}
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
            
            {/* Add back the Get Started button */}
            <button
              onClick={handleGetStarted}
              className="hero-button"
            >
              <span>Get Started</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          {/* Our Services section */}
          <div className="w-full max-w-6xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Guesthouse Service */}
              <div className="service-card-wrapper">
                <div className="service-card">
                  <div className="service-icon">
                    <Home className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Guesthouse</h3>
                  <p className="text-gray-300">
                    Discover comfortable and authentic accommodations with our curated selection of guesthouses around the world.
                  </p>
                  {/* Learn More button removed */}
                </div>
              </div>
              
              {/* Hidden Places Service */}
              <div className="service-card-wrapper">
                <div className="service-card">
                  <div className="service-icon">
                    <Map className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Hidden Places</h3>
                  <p className="text-gray-300">
                    Explore off-the-beaten-path destinations that most tourists never see, guided by local experts.
                  </p>
                  {/* Learn More button removed */}
                </div>
              </div>
              
              {/* Bus Rental Service */}
              <div className="service-card-wrapper">
                <div className="service-card">
                  <div className="service-icon">
                    <Bus className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Bus Rental</h3>
                  <p className="text-gray-300">
                    Travel comfortably with our premium bus rental services, perfect for group trips and excursions.
                  </p>
                  {/* Learn More button removed */}
                </div>
              </div>
            </div>
          </div>

          {/* Features section */}
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="feature-card">
              <div className="feature-icon">
                <Compass className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Discover</h3>
              <p className="text-gray-300">Find hidden gems and popular destinations around the world.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Plan</h3>
              <p className="text-gray-300">Create detailed itineraries and organize your perfect trip.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Experience</h3>
              <p className="text-gray-300">Enjoy seamless travel with our smart recommendations.</p>
            </div>
          </div>

          {/* Popular Destinations section removed as requested */}
        </main>

        <footer className="py-8 text-center text-gray-300 border-t border-gray-800 mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-center items-center mb-4">
              <div className="footer-icon-container">
                <Plane className="h-6 w-6 text-blue-500" />
              </div>
              <span className="ml-2 text-xl font-bold text-white">ZippyTrip</span>
            </div>
            <p className="mb-4">© 2025 ZippyTrip. All rights reserved.</p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Date and time display removed as requested */}
    </div>
  );
}