
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector('[data-sidebar="true"]');
      
      // Check if click was outside the sidebar
      if (sidebar && !sidebar.contains(target) && 
          !target.closest('[data-sidebar-trigger="true"]')) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close mobile sidebar when resizing to desktop
  useEffect(() => {
    if (!isMobile) {
      // We no longer automatically close the sidebar when switching to desktop
      // since we want the toggle button to work on desktop too
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsMobileOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      
      <div className="flex-1 flex">
        {/* Toggle button for sidebar */}
        <Button
          variant="ghost"
          size="icon"
          data-sidebar-trigger="true"
          className={cn(
            "fixed left-4 top-20 z-50 text-gray-400 hover:text-white hover:bg-zippy-dark active:scale-95 transition-all duration-200",
            isMobileOpen && "opacity-0 pointer-events-none"
          )}
          onClick={toggleSidebar}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          <Menu 
            size={24} 
            className="transform transition-transform duration-200 active:rotate-90"
          />
        </Button>
        
        {/* Mobile sidebar overlay */}
        {isMobile && (
          <div
            className={cn(
              "fixed inset-0 bg-black/80 z-40 transition-opacity duration-300",
              isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setIsMobileOpen(false)}
          >
            <div
              data-sidebar="true"
              className={cn(
                "absolute top-16 left-0 bottom-0 max-w-[280px] transition-transform duration-300 ease-in-out",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar isMobile setIsMobileOpen={setIsMobileOpen} />
            </div>
          </div>
        )}
        
        {/* Desktop sidebar */}
        {!isMobile && (
          <div
            data-sidebar="true"
            className={cn(
              "fixed inset-y-16 left-0 z-40 transition-transform duration-300 ease-in-out",
              isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <Sidebar setIsMobileOpen={setIsMobileOpen} />
          </div>
        )}
        
        <main className={cn(
          "flex-1 p-4 md:p-6 overflow-auto transition-all duration-300",
          !isMobile && isMobileOpen && "ml-64" // Add margin when sidebar is open on desktop
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
