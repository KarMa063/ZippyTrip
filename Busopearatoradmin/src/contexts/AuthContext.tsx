import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../integrations/supabase/client";

type AuthContextType = {
  isAuthenticated: boolean;
  user: { id: string; email?: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      setUser({ id: "admin-user", email: "admin@zippytrip.com" });
    }
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    if (username === "admin" && password === "zippytrip123") {
      localStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);
      setUser({ id: "admin-user", email: "admin@zippytrip.com" });
      return true;
    }
    return false;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
