
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import BookingNotifications from "@/components/BookingNotifications";

const Layout = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen w-full flex flex-col ${theme === "dark" ? "dark" : "light"}`}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
            <footer className="bg-zippy-darkGray shadow dark:bg-gray-800 dark:text-gray-200 py-4 px-6">
              <div className="max-w-7xl mx-auto">
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                  © {new Date().getFullYear()} ZippyTrip. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
      <Sonner />
      <BookingNotifications />
    </div>
  );
};

export default Layout;
