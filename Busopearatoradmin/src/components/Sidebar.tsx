
import { NavLink } from "react-router-dom";
import { BarChart, Route, Calendar, Bus, Settings, Bell, MapPin, Users } from "lucide-react";
import { 
  Sidebar as SidebarWrapper, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarTrigger, 
  SidebarHeader 
} from "@/components/ui/sidebar";

const Sidebar = () => {
  const menuItems = [{
    id: 1,
    label: "Dashboard",
    icon: <BarChart size={20} />,
    path: "/"
  }, {
    id: 2,
    label: "Routes",
    icon: <Route size={20} />,
    path: "/routes"
  }, {
    id: 3,
    label: "Schedule",
    icon: <Calendar size={20} />,
    path: "/schedule"
  }, {
    id: 4,
    label: "Fleet",
    icon: <Bus size={20} />,
    path: "/fleet"
  }, {
    id: 5,
    label: "Analytics",
    icon: <BarChart size={20} />,
    path: "/analytics"
  }, {
    id: 6,
    label: "Trip Reminders",
    icon: <Bell size={20} />,
    path: "/trip-reminders"
  }, {
    id: 7,
    label: "Cancellations",
    icon: <Calendar size={20} />,
    path: "/cancellations"
  }, {
    id: 8,
    label: "Settings",
    icon: <Settings size={20} />,
    path: "/settings"
  }];
  return (
    <SidebarWrapper>
      <SidebarHeader className="p-4 flex flex-col items-center justify-center">
        <div className="flex items-center space-x-2">
          <Bus className="h-8 w-8 text-zippy-purple" />
          <span className="text-2xl font-bold text-gradient">ZippyTrip</span>
        </div>
        <div className="text-sm text-muted-foreground mt-1">Bus Operator Admin</div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.path} 
                      className={({ isActive }) => 
                        isActive 
                          ? "text-zippy-purple bg-zippy-darkGray" 
                          : "text-gray-400 hover:text-gray-100"
                      }
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Quick Access */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/routes/add" 
                    className={({ isActive }) => 
                      isActive 
                        ? "text-zippy-purple bg-zippy-darkGray" 
                        : "text-gray-400 hover:text-gray-100"
                    }
                  >
                    <MapPin size={20} />
                    <span>Add New Route</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/users" 
                    className={({ isActive }) => 
                      isActive 
                        ? "text-zippy-purple bg-zippy-darkGray" 
                        : "text-gray-400 hover:text-gray-100"
                    }
                  >
                    <Users size={20} />
                    <span>Manage Users</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <div className="mt-auto p-4 flex flex-col space-y-4" />
    </SidebarWrapper>
  );
};

export default Sidebar;
