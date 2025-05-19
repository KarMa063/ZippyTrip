
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bus, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Single quote that doesn't rotate
const operatorQuote = "The journey of a thousand miles begins with a single step.";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(false);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to the ZippyTrip Bus Operator Dashboard!",
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
    } catch (error) {
      setLoginAttempts(prev => prev + 1);
      setLoginError(true);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Bus Operator Portal</h1>
          <p className="text-sm text-white/80 mb-1">ZippyTrip Management System</p>
          <p className="text-xs text-white/60 italic max-w-sm mx-auto">
            "{operatorQuote}"
          </p>
        </div>
        
        {/* Login Card */}
        <Card className="border-0 shadow-md bg-[#111827]">
          <CardHeader className="space-y-1 text-center pb-4 border-b border-gray-800">
            <div className="flex justify-center mb-2">
              <div className="bg-blue-600 rounded-full p-2">
                <Bus className="h-5 w-5 text-white" />
              </div>
            </div>
            <CardTitle className="text-white">Operator Login</CardTitle>
            <CardDescription className="text-gray-400">Access your control panel</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className={`bg-[#1a2234] border-gray-700 text-white ${loginError ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`bg-[#1a2234] border-gray-700 text-white pr-10 ${loginError ? 'border-red-500' : ''}`}
                    required
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {loginAttempts > 0 && (
                  <div className="text-xs text-red-400">
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
                  className="h-4 w-4 rounded bg-[#1a2234] border-gray-700 text-blue-600"
                />
                <Label htmlFor="remember" className="text-sm text-gray-300">Remember me</Label>
              </div>
              
              {loginError && (
                <div className="text-red-400 text-sm flex items-center bg-red-900/20 p-2 rounded-md">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Wrong username or password. Please try again.
                </div>
              )}
              
              {/* Login button */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center text-center text-xs text-gray-500 border-t border-gray-800 pt-4">
            <p>© {new Date().getFullYear()} ZippyTrip Transportation Systems</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
