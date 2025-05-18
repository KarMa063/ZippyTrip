
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(false);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to the ZippyTrip Bus Operator Dashboard!",
        });
        navigate("/");
      } else {
        setLoginError(true);
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Wrong username or password. Please try again.",
        });
      }
    } catch (error) {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border border-gray-700">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl text-white">ZippyTrip Bus Operator</CardTitle>
          <CardDescription className="text-gray-400">Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className={`bg-gray-700 border ${loginError ? 'border-red-500' : 'border-gray-600'} text-white placeholder-gray-400`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`bg-gray-700 border ${loginError ? 'border-red-500' : 'border-gray-600'} text-white placeholder-gray-400 pr-10`}
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white" 
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600"
              />
              <Label htmlFor="remember" className="text-sm text-gray-400">Remember me</Label>
            </div>
            
            {loginError && (
              <div className="text-red-400 text-sm flex items-center bg-red-900/20 p-2 rounded-md">
                <AlertCircle className="h-4 w-4 mr-2" />
                Wrong username or password. Please try again.
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-gray-500 border-t border-gray-700 pt-4">
          <p className="w-full">© {new Date().getFullYear()} ZippyTrip Transportation Systems</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
