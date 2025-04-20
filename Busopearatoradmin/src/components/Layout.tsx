
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import BookingNotifications from "@/components/BookingNotifications";

const Layout = () => {
  const { theme } = useTheme();
  
  return (
    <SidebarProvider>
      <div className={`min-h-screen w-full flex ${theme === "dark" ? "dark" : "light-mode"}`}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="p-4 border-t border-zippy-gray text-sm text-center">
            <p className="text-muted-foreground">© {new Date().getFullYear()} ZippyTrip. All rights reserved.</p>
          </footer>
        </div>
      </div>
      <Toaster />
      <BookingNotifications />
    </SidebarProvider>
  );
};

export default Layout;
