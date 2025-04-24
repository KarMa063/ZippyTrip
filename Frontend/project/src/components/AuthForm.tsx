import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plane, Lock, Mail, Loader2, ArrowLeft, MapPin, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './AuthForm.css'; // We'll create this CSS file for animations

// Array of background images that will rotate - darker travel images
const backgroundImages = [
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
  { quote: "Adventure is worthwhile in itself.", author: "Amelia Earhart" },
  { quote: "To travel is to live.", author: "Hans Christian Andersen" },
  { quote: "The journey not the arrival matters.", author: "T.S. Eliot" },
];

export default function AuthForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(
    location.search.includes('mode=login')
  );
  const [loading, setLoading] = useState(false);
  const [loginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [nextBgIndex, setNextBgIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [showQuote, setShowQuote] = useState(true);

  // Background image rotation effect with smoother transition
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentBgIndex(nextBgIndex);
        setNextBgIndex((nextBgIndex + 1) % backgroundImages.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50); // Short delay before starting fade-in
      }, 1500); // Longer transition duration for smoother effect
    }, 4000); // Change every 4 seconds

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

  useEffect(() => {
    setIsLogin(location.search.includes('mode=login'));
  }, [location]);

  // 🔹 Handle Email/Phone Authentication
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const credentials =
        loginMethod === 'email' ? { email, password } : { email, password };

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          ...credentials,
        });
        if (error) throw error;
        toast.success('Welcome back to ZippyTrip!');
        navigate('/home'); //Most probably for going to home after login can only be sure after after home is assembled
      } else {
        // Signup Flow
        const { error } = await supabase.auth.signUp({
          ...credentials,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
            data: { email_confirm: false },
          },
        });

        if (error?.message.includes('confirmation')) {
          toast.success(
            'Check your email to confirm your account before logging in.'
          );
        } else if (error) {
          throw error;
        } else {
          if(1==1){
          toast.success('Welcome to ZippyTrip! Your account has been created.');//If no id is found in db goto preferences as the user is new
          navigate('/Preferences'); // After this go to preferences page(PASA   DONOT REMOVE BEFORE REDIRECTING)
        }
      else{
        toast.success('Welcome to ZippyTrip! Your account has been created.');//Treat as login and goto home if user already exists
        navigate('/Preferences'); // After this go to home page(PASA   DONOT REMOVE THIS COMMENT BEFORE REDIRECTING)
      }}
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email) {
        toast.error('Please enter your email.');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=login`,
      });

      if (error) throw error;

      toast.success('Password reset link sent! Check your email.');
      setIsResetPassword(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Images with Transition - Preload all images */}
      <div className="hidden">
        {backgroundImages.map((img, i) => (
          <img key={i} src={img} alt="" />
        ))}
      </div>
      
      {/* Current background image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-2000 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url("${backgroundImages[currentBgIndex]}")`,
        }}
      />
      
      {/* Next background image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-2000 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url("${backgroundImages[nextBgIndex]}")`,
        }}
      />
      
      {/* Dark overlay - increased opacity for darker background */}
      <div className="absolute inset-0 bg-black bg-opacity-85"></div>

      {/* Diamond outline animation */}
      <div className="diamond-outline"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Quote Card */}
        <div className={`quote-card mb-8 ${showQuote ? 'quote-visible' : 'quote-hidden'}`}>
          <div className="quote-icon">
            <Globe className="w-6 h-6" />
          </div>
          <p className="quote-text">{travelQuotes[currentQuoteIndex].quote}</p>
          <p className="quote-author">— {travelQuotes[currentQuoteIndex].author}</p>
        </div>
        
        <div className="card-container">
          <div className="card-outline"></div>
          <div className="bg-black bg-opacity-95 rounded-2xl shadow-xl w-full max-w-md p-8 border border-blue-500/30 relative overflow-hidden card-content">
            {/* Animated particles */}
            <div className="particles"></div>
            
            {isResetPassword && (
              <button
                onClick={() => setIsResetPassword(false)}
                className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors hover-glow"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </button>
            )}

            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-blue-500 bg-opacity-20 rounded-full mb-4 pulse-animation">
                <Plane className="w-8 h-8 text-blue-500 plane-animation" />
              </div>
              <h2 className="text-3xl font-bold text-white text-glow animated-text">
                {isResetPassword
                  ? 'Reset Password'
                  : isLogin
                  ? 'Welcome to ZippyTrip'
                  : 'Join ZippyTrip'}
              </h2>
              <p className="text-gray-400 mt-2 fade-in-animation">
                {isResetPassword
                  ? 'Enter your email to receive reset instructions'
                  : isLogin
                  ? 'Sign in to continue your journey'
                  : 'Create an account to start your adventure'}
              </p>
            </div>

            <form
              onSubmit={isResetPassword ? handlePasswordReset : handleAuth}
              className="space-y-6"
            >
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 input-glow"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {!isResetPassword && (
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 input-glow"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>
              )}

              {isLogin && !isResetPassword && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-gray-300 hover-glow">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-500 checkbox-glow"
                    />
                    <span className="ml-2">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsResetPassword(true)}
                    className="text-sm text-blue-500 hover:text-blue-400 hover-glow"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 button-glow"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isResetPassword ? (
                  'Send Reset Instructions'
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Sign Up'
                )}
              </button>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-400 hover:text-blue-300 text-sm hover-glow"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </form>

            {/* Travel destination indicator */}
            <div className="destination-indicator">
              <MapPin className="map-pin" />
              <div className="destination-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
