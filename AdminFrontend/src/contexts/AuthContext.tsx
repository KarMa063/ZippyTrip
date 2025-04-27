
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";

type User = {
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Add isLoading property
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUser = localStorage.getItem("user");
    
    if (storedAuth === "true" && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false); // Set loading to false after checking auth state
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true); // Set loading to true when login starts
    try {
      // For demo purposes, hardcoded credentials
      if (email === "admin@example.com" && password === "password") {
        const user = {
          name: "Admin",
          email: "admin@example.com",
          role: "Administrator"
        };
        
        // Store authentication state
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        toast.success("Login successful!");
        return true;
      }
      toast.error("Invalid credentials");
      return false;
    } finally {
      setIsLoading(false); // Set loading to false when login completes
    }
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/sign-in");
  };

  // Add the password reset function
  const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
    setIsLoading(true); // Set loading to true when password reset starts
    try {
      // IMPORTANT: Ensure your Supabase project has email templates configured
      // for password resets.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Optional: Specify the URL to redirect the user to after clicking the reset link
        // redirectTo: 'http://localhost:5173/update-password', // Example redirect URL
      });

      if (error) {
        console.error("Error sending password reset email:", error);
        toast.error(error.message || "Failed to send password reset email.");
        return false;
      }

      toast.success("Password reset email sent. Please check your inbox.");
      return true;
    } catch (err) {
      console.error("Unexpected error sending password reset email:", err);
      toast.error("An unexpected error occurred.");
      return false;
    } finally {
      setIsLoading(false); // Set loading to false when password reset completes
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, // Add isLoading to the context value
      login, 
      logout, 
      sendPasswordResetEmail 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
