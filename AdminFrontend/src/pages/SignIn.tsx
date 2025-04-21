
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Plane } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Get the current origin to use as redirectTo
      const origin = window.location.origin;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setResetSent(true);
      toast.success("Password reset link sent to your email");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setIsForgotPassword(false);
    setResetSent(false);
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zippy-darker">
      <div className="w-full max-w-md px-4 py-8 mx-auto">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-zippy-blue mr-2">
              <Plane size={40} />
            </div>
            <h1 className="text-4xl font-bold text-white">ZippyTrip</h1>
          </div>
          <p className="text-gray-400">
            {isForgotPassword ? "Reset your password" : "Sign in to your account to continue"}
          </p>
        </div>
        
        <Card className="border-white/[0.05] bg-zippy-dark shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              {isForgotPassword ? "Forgot Password" : "Sign In"}
            </CardTitle>
            <CardDescription className="text-center">
              {isForgotPassword 
                ? "Enter your email to receive a password reset link" 
                : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {resetSent ? (
              <div className="text-center py-4">
                <p className="text-white mb-4">
                  We've sent a password reset link to your email address.
                </p>
                <Button
                  className="mt-4 bg-zippy-blue hover:bg-zippy-blue/90"
                  onClick={handleBackToSignIn}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={isForgotPassword ? handleForgotPassword : handleSignIn}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-white">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="animeshbaral10@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-zippy-darker border-white/10"
                    />
                  </div>
                  
                  {!isForgotPassword && (
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
                        className="bg-zippy-darker border-white/10"
                      />
                    </div>
                  )}
                </div>
                
                <Button 
                  className="mt-6 w-full bg-zippy-blue hover:bg-zippy-blue/90 rounded-md h-12" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading 
                    ? (isForgotPassword ? "Sending..." : "Signing in...") 
                    : (isForgotPassword ? "Send Reset Link" : "Sign In")}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col justify-center gap-2">
            {!resetSent && (
              <div className="text-center w-full">
                {isForgotPassword ? (
                  <button 
                    onClick={handleBackToSignIn}
                    className="text-sm text-zippy-blue hover:underline focus:outline-none"
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-zippy-blue hover:underline focus:outline-none"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}
            
            {!isForgotPassword && !resetSent && (
              <p className="text-sm text-muted-foreground">
                Demo credentials: admin@example.com / password
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
