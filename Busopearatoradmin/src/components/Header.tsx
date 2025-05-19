import { useEffect, useState } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { getUserProfile, UserProfile } from "@/services/profile";
import { RouteNotification, fetchRouteNotifications } from "@/services/api/uiNotifications";


const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<RouteNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const userProfile = await getUserProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch notifications on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      const routeNotifications = await fetchRouteNotifications();
      setNotifications(routeNotifications);
      setUnreadCount(routeNotifications.filter(n => !n.read).length);
    };

    loadNotifications();
    
    // Remove the polling interval - we don't want to check every minute
    // const intervalId = setInterval(loadNotifications, 60000);
    
    // return () => clearInterval(intervalId);
  }, []);

  // Add a function to handle notification dropdown open
  const handleNotificationOpen = (open: boolean) => {
    if (open) {
      // Refresh notifications when dropdown is opened
      const loadNotifications = async () => {
        const routeNotifications = await fetchRouteNotifications();
        setNotifications(routeNotifications);
        setUnreadCount(routeNotifications.filter(n => !n.read).length);
      };
      
      loadNotifications();
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  const userInitials = profile ? 
    `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : 
    user?.email?.[0]?.toUpperCase() || 'U';

  

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <header className="border-b border-zippy-gray p-4 flex items-center justify-between bg-zippy-darkGray">
      {/* Removed search bar */}
      <div className="flex-1"></div>
      
      <div className="flex items-center space-x-4">
        {/* Booking Notifications - Direct link to booking page */}
        <Button 
          variant="outline" 
          size="icon" 
          className="relative bg-zippy-gray border-none pulse-animation hover-float"
          onClick={() => navigate('/booking-alerts')}
        >
          <span className="font-bold text-lg hover-glow">B</span>
        </Button>
        
        {/* Route Notifications */}
        <DropdownMenu onOpenChange={handleNotificationOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative bg-zippy-gray border-none hover-rotate">
              <Bell className="h-5 w-5 hover-shake" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-zippy-purple text-[10px] flex items-center justify-center text-white notification-badge">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-zippy-darkGray border-zippy-gray dropdown-animation">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              {notifications.length > 0 ? (
                // Group notifications by route_id to avoid duplicates
                notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="p-4 cursor-pointer notification-item"
                    onClick={() => navigate(`/routes/${notification.route_id || notification.id}`)}
                  >
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {notification.message || "New bus added"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(notification.created_at)}</p>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full avatar-pulse">
              <Avatar className="avatar-rotate">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Profile" className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-zippy-purple text-white avatar-glow">{userInitials}</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-zippy-darkGray border-zippy-gray dropdown-animation">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer menu-item-hover"
              onClick={() => navigate("/settings")}
            >
              <User className="mr-2 h-4 w-4 icon-spin" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive menu-item-hover"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4 icon-bounce" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
