import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  UserCircle,
  LayoutDashboard,
  Home,
  CalendarClock,
  MessageSquare,
  Cog,
  LogOut,
} from "lucide-react";
import { cn } from "../glib/utils";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../gcomponents/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../gcomponents/dropdown";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarItems = [
    {
      name: "Dashboard",
      path: "/gdashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Properties",
      path: "/gproperties",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Bookings",
      path: "/gbookings",
      icon: <CalendarClock className="h-5 w-5" />,
    },
    {
      name: "Messages",
      path: "/gmessages",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/gsettings",
      icon: <Cog className="h-5 w-5" />,
    },
  ];

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      // Redirect to login page with a query parameter
      navigate("/glogin");
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="border-b bg-card z-40 fixed top-0 w-full">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link to="/gdashboard" className="flex items-center gap-2 font-bold text-lg">
            <div className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">
              ZippyTrip
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-auto">
                  <div className="py-2 px-4 text-sm">
                    <p className="font-medium">New booking request</p>
                    <p className="text-muted-foreground">Ocean View Suite - May 15-18</p>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="py-2 px-4 text-sm">
                    <p className="font-medium">Message from guest</p>
                    <p className="text-muted-foreground">John D. sent you a message about their stay</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6 " /> {/* Profile Circle Icon */}
              </Button>


              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/gsettings">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/gsettings">
                    <Cog className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside
          className="bg-card border-r shrink-0 overflow-y-auto flex flex-col w-64 fixed left-0 top-16 bottom-0 transition-transform transform"
        >
          <nav className="flex-1 p-3">
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 md:ml-64">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
