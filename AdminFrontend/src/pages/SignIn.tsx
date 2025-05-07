
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Plane, Mail, Wifi } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SignIn() {
  const navigate = useNavigate();
  const { login, sendPasswordResetEmail, isLoading: authIsLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate("/");
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!forgotPasswordEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    await sendPasswordResetEmail(forgotPasswordEmail);
  };

  if (authIsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zippy-darker text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="diamond-loader"></div>
          <p className="mt-4 text-zippy-blue">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zippy-darker relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 z-0">
        <div className="diamond-bg diamond-bg-1"></div>
        <div className="diamond-bg diamond-bg-2"></div>
        <div className="diamond-bg diamond-bg-3"></div>
      </div>
      
      {/* Center container - changed to flex with justify-center */}
      <div className="flex justify-center items-center w-full z-10">
        {/* Online status indicator */}
        <div className="absolute top-4 right-4 flex items-center text-sm">
          <Wifi size={16} className={`mr-1 ${isOnline ? 'text-green-400' : 'text-red-400'}`} />
          <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="logo-container mb-4">
            <div className="text-zippy-blue mr-2 logo-icon">
              <Plane size={40} />
            </div>
            <h1 className="text-4xl font-bold text-white logo-text">ZippyTrip</h1>
          </div>
          <p className="text-gray-400">Sign in to your account to continue</p>
          
          <div className="diamond-border-container mt-8">
            {/* Fixed width card */}
            <Card className="border-white/[0.05] bg-zippy-dark shadow-lg relative z-10 diamond-card w-[350px]">
              {!isForgotPassword ? (
                <>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold text-center glow-text">Sign In</CardTitle>
                    <CardDescription className="text-center">Admin Access</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handleSignIn}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="email" className="block text-sm font-medium text-white">
                            Email
                          </label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="admin@zippytrip.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-zippy-darker border-white/10 focus:border-zippy-blue focus:ring-zippy-blue/30 transition-all"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="password" className="block text-sm font-medium text-white">
                            Password
                          </label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-zippy-darker border-white/10 focus:border-zippy-blue focus:ring-zippy-blue/30 transition-all"
                            required
                          />
                          <div className="text-right">
                            <button
                              type="button"
                              onClick={() => { setIsForgotPassword(true); setError(''); }}
                              className="text-sm text-zippy-blue hover:text-zippy-blue/80 hover:underline focus:outline-none transition-colors"
                              disabled={authIsLoading}
                            >
                              Forgot Password?
                            </button>
                          </div>
                        </div>
                      </div>
                      <Button
                        className="mt-6 w-full bg-zippy-blue hover:bg-zippy-blue/90 rounded-md h-12 relative overflow-hidden button-glow"
                        type="submit"
                        disabled={authIsLoading}
                      >
                        <span className="relative z-10">{authIsLoading ? "Signing in..." : "Sign In"}</span>
                      </Button>
                    </form>
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold text-center glow-text">Reset Password</CardTitle>
                    <CardDescription className="text-center">Enter admin email to receive reset instructions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handleForgotPasswordRequest}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="forgot-email" className="block text-sm font-medium text-white">
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                              id="forgot-email"
                              type="email"
                              placeholder="animeshbaral10@gmail.com"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              className="bg-zippy-darker border-white/10 pl-10 focus:border-zippy-blue focus:ring-zippy-blue/30 transition-all"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        className="mt-6 w-full bg-zippy-blue hover:bg-zippy-blue/90 rounded-md h-12 relative overflow-hidden button-glow"
                        type="submit"
                        disabled={authIsLoading}
                      >
                        <span className="relative z-10">{authIsLoading ? "Sending..." : "Send Reset Email"}</span>
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(false); setError(''); }}
                      className="text-sm text-muted-foreground hover:text-white transition-colors"
                      disabled={authIsLoading}
                    >
                      Back to Sign In
                    </button>
                  </CardFooter>
                </>
              )}
            </Card>
            
            {/* Diamond border animation */}
            <div className="diamond-border diamond-border-top"></div>
            <div className="diamond-border diamond-border-right"></div>
            <div className="diamond-border diamond-border-bottom"></div>
            <div className="diamond-border diamond-border-left"></div>
          </div>
        </div>
      </div>
      
      {/* Add global styles */}
      <style>{`
        /* Diamond border animation */
        .diamond-border-container {
          position: relative;
          padding: 4px;
          width: 350px;
        }
        
        .diamond-card {
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }
        
        .diamond-border {
          position: absolute;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          z-index: 0;
        }
        
        .diamond-border-top, .diamond-border-bottom {
          height: 2px;
          width: 100%;
          left: 0;
        }
        
        .diamond-border-left, .diamond-border-right {
          width: 2px;
          height: 100%;
          top: 0;
        }
        
        .diamond-border-top {
          top: 0;
          animation: animateX 3s linear infinite;
        }
        
        .diamond-border-bottom {
          bottom: 0;
          animation: animateX 3s linear infinite reverse;
        }
        
        .diamond-border-left {
          left: 0;
          animation: animateY 3s linear infinite 1.5s;
        }
        
        .diamond-border-right {
          right: 0;
          animation: animateY 3s linear infinite 1.5s reverse;
        }
        
        @keyframes animateX {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes animateY {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        /* Background diamonds */
        .diamond-bg {
          position: absolute;
          width: 100px;
          height: 100px;
          background: rgba(59, 130, 246, 0.1);
          transform: rotate(45deg);
          border: 1px solid rgba(59, 130, 246, 0.3);
          filter: blur(3px);
        }
        
        .diamond-bg-1 {
          top: 20%;
          left: 15%;
          animation: float 15s ease-in-out infinite;
        }
        
        .diamond-bg-2 {
          top: 60%;
          right: 20%;
          width: 150px;
          height: 150px;
          animation: float 20s ease-in-out infinite 2s;
        }
        
        .diamond-bg-3 {
          bottom: 10%;
          left: 30%;
          width: 80px;
          height: 80px;
          animation: float 12s ease-in-out infinite 1s;
        }
        
        @keyframes float {
          0%, 100% { transform: rotate(45deg) translate(0, 0); }
          25% { transform: rotate(45deg) translate(15px, 15px); }
          50% { transform: rotate(45deg) translate(0, 30px); }
          75% { transform: rotate(45deg) translate(-15px, 15px); }
        }
        
        /* Loader */
        .diamond-loader {
          width: 50px;
          height: 50px;
          background: linear-gradient(45deg, transparent 30%, #3b82f6 30%);
          animation: diamondSpin 1.5s linear infinite;
        }
        
        @keyframes diamondSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Button glow effect */
        .button-glow {
          transition: all 0.3s ease;
        }
        
        .button-glow:before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          z-index: -1;
          background: linear-gradient(45deg, #3b82f6, #60a5fa, #3b82f6);
          background-size: 400%;
          border-radius: 6px;
          animation: glowing 20s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }
        
        .button-glow:hover:before {
          opacity: 1;
        }
        
        @keyframes glowing {
          0% { background-position: 0 0; }
          50% { background-position: 400% 0; }
          100% { background-position: 0 0; }
        }
        
        /* Logo animation */
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .logo-icon {
          animation: pulse 2s infinite ease-in-out;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .glow-text {
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        /* Input focus effects */
        input:focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }
        
        /* Remove the media query that was causing issues */
        /* @media (min-width: 640px) {
          .diamond-border-container {
            width: 350px;
            margin: 0 auto;
          }
        } */
      `}</style>
    </div>
  );
}
