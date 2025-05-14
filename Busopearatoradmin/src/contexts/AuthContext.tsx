import { createContext, useContext, useState, useEffect, ReactNode } from "react";


type AuthContextType = {
  isAuthenticated: boolean;
  user: { id: string; email?: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  // Add state to store the current password
  const [currentAdminPassword, setCurrentAdminPassword] = useState<string>(() => {
    // Initialize from localStorage if available, otherwise use default
    return localStorage.getItem("adminPassword") || "zippytrip123";
  });

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
    // Check if credentials match the admin credentials
    if (username === "admin" && password === currentAdminPassword) {
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

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      // Verify the current password matches
      if (currentPassword !== currentAdminPassword) {
        console.error("Current password verification failed: Password doesn't match");
        return false;
      }

      // Update the password in state and localStorage
      setCurrentAdminPassword(newPassword);
      localStorage.setItem("adminPassword", newPassword);
      
      return true;
    } catch (error) {
      console.error("Password update error:", error);
      return false;
    }
  };

  // Add updatePassword to the context value
  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
