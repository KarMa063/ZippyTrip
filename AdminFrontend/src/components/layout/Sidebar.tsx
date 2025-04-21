
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarRange, 
  BarChart3, 
  Users, 
  Hotel, 
  Plane, 
  Bus, 
  Ticket, 
  Car,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';

export default function Sidebar({ isMobile, setIsMobileOpen }: { 
  isMobile?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}) {
  const location = useLocation();
  
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CalendarRange, label: 'Bookings', path: '/bookings' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Users, label: 'Users', path: '/users' },
    { divider: true, label: 'SERVICES' },
    { icon: Hotel, label: 'Stays', path: '/stays' },
    { icon: Plane, label: 'Flights', path: '/flights' },
    { icon: Bus, label: 'Bus Rentals', path: '/bus-rentals' },
    { icon: Ticket, label: 'Attractions', path: '/attractions' },
    { icon: Car, label: 'Airport Taxis', path: '/airport-taxis' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleItemClick = () => {
    if (isMobile && setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };
  
  return (
    <div className={cn(
      "w-64 bg-zippy-darker h-full flex flex-col border-r border-white/[0.03] transition-all duration-300",
      isMobile && "w-full"
    )}>
      <div className="p-4 border-b border-white/[0.05] flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-white hover:bg-zippy-dark active:scale-95 transition-all duration-200"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          aria-label="Close menu"
        >
          <Menu 
            size={24} 
            className="transform transition-transform duration-200 hover:rotate-90"
          />
        </Button>
      </div>
      
      <SidebarContent className="py-0 flex-1">
        <SidebarGroup>
          <SidebarMenu>
            {sidebarItems.filter(item => !item.divider).slice(0, 4).map((item, index) => {
              const Icon = item.icon!;
              const active = isActive(item.path!);
              
              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className={cn(
                      "bg-transparent hover:bg-zippy-dark text-white hover:text-white focus-visible:ring-0 focus-visible:outline-none active:bg-zippy-dark",
                      active && "bg-white/[0.05]"
                    )}
                    tooltip={item.label}
                  >
                    <Link 
                      to={item.path!}
                      onClick={handleItemClick}
                      className="flex items-center gap-2"
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-gray-500">SERVICES</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarItems.filter(item => !item.divider).slice(4).map((item, index) => {
              const Icon = item.icon!;
              const active = isActive(item.path!);
              
              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className={cn(
                      "bg-transparent hover:bg-zippy-dark text-white hover:text-white focus-visible:ring-0 focus-visible:outline-none active:bg-zippy-dark",
                      active && "bg-white/[0.05]"
                    )}
                    tooltip={item.label}
                  >
                    <Link 
                      to={item.path!}
                      onClick={handleItemClick}
                      className="flex items-center gap-2"
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </div>
  );
}
