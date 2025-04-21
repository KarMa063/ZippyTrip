
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
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
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUser = localStorage.getItem("user");
    
    if (storedAuth === "true" && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // For now, we'll use the existing mock user system
          // In a real app, you would fetch the user profile from Supabase here
          if (event === 'PASSWORD_RECOVERY' || event === 'TOKEN_REFRESHED') {
            // Don't automatically log in the user for these events
            return;
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("user");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // For demo purposes with our mock data
    if (email === "admin@example.com" && password === "password") {
      const user = {
        id: "admin-123", // This would be the actual Supabase user ID in production
        name: "Admin",
        email: "admin@example.com",
        role: "Administrator"
      };
      
      // Store authentication state
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      return true;
    }

    // For the admin email case (animeshbaral10@gmail.com)
    if (email === "animeshbaral10@gmail.com") {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
          return false;
        }

        if (data.user) {
          const user = {
            id: data.user.id,
            name: "Admin",
            email: data.user.email || "animeshbaral10@gmail.com",
            role: "Administrator"
          };
          
          // Store authentication state
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("user", JSON.stringify(user));
          
          setUser(user);
          setIsAuthenticated(true);
          return true;
        }
      } catch (err) {
        console.error("Login error:", err);
        toast.error("Failed to log in");
        return false;
      }
    }

    return false;
  };

  const logout = async () => {
    // For our mock system
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    
    // For Supabase
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
    
    navigate("/sign-in");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
