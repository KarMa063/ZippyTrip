
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bus, AlertCircle, MapPin, Clock, Calendar, User, Shield, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Bus-themed gradient backgrounds
const backgroundImages = [
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop", // Bus station at night
  "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1000&auto=format&fit=crop", // Highway at night
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop", // Dark city lights
  "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=1000&auto=format&fit=crop"  // Night road
];

// Bus operator quotes
const operatorQuotes = [
  "Safety is not a gadget but a state of mind.",
  "The journey of a thousand miles begins with a single step.",
  "Time is the most valuable thing a man can spend.",
  "The road to success is always under construction."
];

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [systemStatus, setSystemStatus] = useState("Online");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  // Effect to change background image every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Effect to change quote every 8 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % operatorQuotes.length);
    }, 8000);
    return () => clearInterval(quoteInterval);
  }, []);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(false);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = login(username, password);

    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome to the ZippyTrip Bus Operator Dashboard!",
        //variant: "default",
      });
      navigate("/");
    } else {
      setLoginAttempts(prev => prev + 1);
      setLoginError(true);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Wrong username or password. Please try again.",
      });
    }
    
    setIsLoading(false);
  };

  // Format time as HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  // Format date as Day, Month Date, Year
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {/* Custom CSS for animations and effects */}
      <style>
        {`
          @property --angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }

          @keyframes rotate {
            to {
              --angle: 360deg;
            }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
          
          @keyframes typing {
            from { width: 0 }
            to { width: 100% }
          }
          
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          
          @keyframes glow {
            0% { text-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
            50% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
            100% { text-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          }

          .card-container {
            position: relative;
            padding: 4px; /* Space for the stroke */
            border-radius: 0.75rem; /* Match card's border radius */
            background: conic-gradient(
              from var(--angle),
              #1e3a8a, /* Darker blue */
              #3b82f6, /* Blue */
              #60a5fa, /* Light blue */
              #3b82f6,
              #1e3a8a
            );
            animation: rotate 6s linear infinite;
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.5);
            will-change: transform;
            transform: translateZ(0);
          }
          
          .error-shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          }
          
          .bg-transition {
            transition: background-image 3s ease-in-out;
          }
          
          .welcome-title {
            text-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
            animation: fadeIn 1s ease-out;
          }
          
          .stable-card {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
            will-change: transform;
          }
          
          .fixed-height-container {
            height: 100vh;
            overflow: hidden;
            position: relative;
          }
          
          .time-display {
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
          }
          
          .bus-icon-container {
            animation: pulse 2s infinite;
          }
          
          .typing-effect {
            overflow: hidden;
            white-space: nowrap;
            animation: typing 3.5s steps(40, end);
          }
          
          .glass-effect {
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }
          
          .info-badge {
            background: rgba(59, 130, 246, 0.2);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 9999px;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            backdrop-filter: blur(4px);
          }
          
          .quote-card {
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 0.5rem;
            padding: 1rem;
            max-width: 300px;
            backdrop-filter: blur(8px);
            animation: float 6s ease-in-out infinite;
          }
          
          .quote-text {
            font-style: italic;
            animation: glow 3s ease-in-out infinite;
          }
          
          .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #10b981;
            display: inline-block;
            margin-right: 6px;
          }
          
          .password-toggle {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: #3b82f6;
            cursor: pointer;
          }
          
          .login-attempts {
            font-size: 0.75rem;
            color: #ef4444;
            margin-top: 0.25rem;
          }
          
          .system-status {
            display: flex;
            align-items: center;
            font-size: 0.75rem;
            color: #10b981;
          }
        `}
      </style>

      {/* Main container */}
      <div
        className="fixed-height-container flex flex-col items-center justify-center p-4 bg-cover bg-center relative bg-transition"
        style={{ backgroundImage: `url(${backgroundImages[currentBgIndex]})` }}
      >
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-black/95"></div>
        
        {/* Info badges - top right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <div className="info-badge text-blue-200">
            <Clock className="h-3 w-3" />
            <span className="time-display">{formatTime(currentTime)}</span>
          </div>
          <div className="info-badge text-blue-200">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(currentTime)}</span>
          </div>
          <div className="info-badge text-green-200">
            <Activity className="h-3 w-3" />
            <span className="system-status">
              <span className="status-indicator"></span>
              System: {systemStatus}
            </span>
          </div>
        </div>

        {/* Content container */}
        <div className="relative z-10 flex flex-col items-center text-center text-white mb-6">
           {/* Welcome Text */}
           <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300 welcome-title">
             Bus Operator Portal
           </h1>
           <p className="text-2xl mb-4 text-gray-300 drop-shadow-md typing-effect">ZippyTrip Management System</p>
           {/* Travel Quote */}
           <p className="text-lg italic text-gray-400 max-w-xl drop-shadow-sm">
             "Driving the future of transportation, one journey at a time."
           </p>
        </div>

        {/* Main content area with login card and quote */}
        <div className="relative z-10 flex flex-row items-center justify-left w-full max-w-5xl gap-8">
          {/* Quote card - left side */}
          <div className="quote-card hidden md:block absolute right-0 -translate-x-[calc(100%+12rem)]">
            <p className="quote-text text-blue-200 text-lg mb-2">
              "{operatorQuotes[currentQuoteIndex]}"
            </p>
            <div className="flex justify-end">
              <p className="text-xs text-gray-400">- Bus Operator's Wisdom</p>
            </div>
          </div>

          {/* Card container with blue stroke animation */}
          <div className={`card-container z-10 w-full max-w-md ${loginError ? 'error-shake' : ''}`}>
            {/* Login Card */}
            <Card className="w-full bg-black backdrop-blur-lg rounded-lg shadow-xl overflow-hidden stable-card border border-blue-900/50">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-2">
                  {/* Icon background */}
                  <div className="size-16 bg-gradient-to-br from-blue-800 to-blue-950 rounded-full flex items-center justify-center border border-blue-500/30 bus-icon-container">
                    <Bus className="size-8 text-white" />
                  </div>
                </div>
                {/* Title and Description */}
                <CardTitle className="text-2xl text-blue-100 drop-shadow-md">Operator Login</CardTitle>
                <CardDescription className="text-gray-400">Access your control panel</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-400" />
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className={`bg-black/70 border ${loginError ? 'border-red-500' : 'border-blue-900'} text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className={`bg-black/70 border ${loginError ? 'border-red-500' : 'border-blue-900'} text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md pr-10`}
                        required
                      />
                      <button 
                        type="button" 
                        className="password-toggle" 
                        onClick={togglePasswordVisibility}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {loginAttempts > 0 && (
                      <div className="login-attempts">
                        Failed login attempts: {loginAttempts}
                      </div>
                    )}
                  </div>
                  
                  {/* Remember me checkbox */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-blue-900 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-400">Remember me</Label>
                  </div>
                  
                  {loginError && (
                    <div className="text-red-400 text-sm flex items-center bg-red-900/20 p-2 rounded-md">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Wrong username or password. Please try again.
                    </div>
                  )}
                  
                  {/* Button with loading state */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white font-semibold rounded-md transition-all duration-300 mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Authenticating...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 text-center text-xs text-gray-500 mt-2 border-t border-blue-900/30 pt-4">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-3 w-3 text-blue-400" />
                  <span>Secure Operator Access Portal</span>
                </div>
                <p className="w-full">© {new Date().getFullYear()} ZippyTrip Transportation Systems. All rights reserved.</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
