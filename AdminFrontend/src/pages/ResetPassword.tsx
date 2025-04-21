
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    // Check if we have a hash fragment in the URL (from password reset email)
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) {
      setTokenError(true);
      setError("Invalid or expired reset link. Please request a new password reset.");
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError("Please enter both password fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      toast.success("Password has been reset successfully");
      
      // Clear hash fragment from URL
      if (window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      
      // Sign out after password reset to ensure clean login with new credentials
      await supabase.auth.signOut();
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate("/sign-in");
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
          <p className="text-gray-400">Reset your password</p>
        </div>
        
        <Card className="border-white/[0.05] bg-zippy-dark shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              Reset Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {tokenError ? (
              <div className="text-center py-4">
                <p className="text-white mb-4">
                  The password reset link is invalid or has expired.
                </p>
                <Button
                  className="mt-4 bg-zippy-blue hover:bg-zippy-blue/90"
                  onClick={handleBackToSignIn}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : isSuccess ? (
              <div className="text-center py-4">
                <p className="text-white mb-4">
                  Your password has been reset successfully!
                </p>
                <Button
                  className="mt-4 bg-zippy-blue hover:bg-zippy-blue/90"
                  onClick={handleBackToSignIn}
                >
                  Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-white">
                      New Password
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
                  
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-zippy-darker border-white/10"
                    />
                  </div>
                </div>
                
                <Button 
                  className="mt-6 w-full bg-zippy-blue hover:bg-zippy-blue/90 rounded-md h-12" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <button 
              onClick={handleBackToSignIn}
              className="text-sm text-zippy-blue hover:underline focus:outline-none"
            >
              Back to Sign In
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
