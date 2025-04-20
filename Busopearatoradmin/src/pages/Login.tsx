
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Bus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError("");
    
    // Use the login function from AuthContext
    const success = login(username, password);
    
    if (success) {
      // Show success toast
      toast({
        title: "Login successful",
        description: "Welcome to ZippyTrip Admin Dashboard!",
      });
      
      // Redirect to dashboard
      navigate("/");
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zippy-dark p-4">
      <Card className="w-full max-w-md bg-zippy-darkGray border-zippy-gray">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="size-12 bg-zippy-purple rounded-full flex items-center justify-center">
              <Bus className="size-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gradient">ZippyTrip Admin</CardTitle>
          <CardDescription className="text-muted-foreground">Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-zippy-gray border-zippy-lightGray"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-zippy-gray border-zippy-lightGray"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-zippy-purple hover:bg-zippy-darkPurple text-white">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          <p className="w-full">© {new Date().getFullYear()} ZippyTrip. All rights reserved.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
