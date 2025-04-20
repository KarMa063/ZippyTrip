
import { Link } from "react-router-dom";
import { Bus, Calendar, BarChart, Route, Settings, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigationItems = [
    { id: 1, label: "Dashboard", icon: <BarChart size={24} />, path: "/", color: "bg-blue-500" },
    { id: 2, label: "Routes", icon: <Route size={24} />, path: "/routes", color: "bg-purple-500" },
    { id: 3, label: "Schedule", icon: <Calendar size={24} />, path: "/schedule", color: "bg-green-500" },
    { id: 4, label: "Fleet", icon: <Bus size={24} />, path: "/fleet", color: "bg-orange-500" },
    { id: 5, label: "Analytics", icon: <BarChart size={24} />, path: "/analytics", color: "bg-red-500" },
    { id: 6, label: "Settings", icon: <Settings size={24} />, path: "/settings", color: "bg-gray-500" },
  ];

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Bus className="h-12 w-12 text-zippy-purple mr-3" />
          <h1 className="text-4xl font-bold text-gradient">ZippyTrip</h1>
        </div>
        <p className="text-xl text-muted-foreground">Bus Operator Administration System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navigationItems.map((item) => (
          <Link key={item.id} to={item.path}>
            <Card className="bg-zippy-darkGray border-zippy-gray h-full transition-all hover:scale-105 hover:shadow-lg">
              <CardContent className="p-6 flex flex-col items-center">
                <div className={`${item.color} p-4 rounded-full mb-4`}>
                  {item.icon}
                </div>
                <h2 className="text-xl font-semibold mb-2">{item.label}</h2>
                <p className="text-muted-foreground text-center">
                  {getDescription(item.label)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link to="/routes/add">
          <Button className="bg-zippy-purple hover:bg-zippy-darkPurple">
            <MapPin className="mr-2 h-4 w-4" />
            Add New Route
          </Button>
        </Link>
      </div>
    </div>
  );
};

function getDescription(label: string): string {
  switch (label) {
    case "Dashboard":
      return "View system status and key metrics";
    case "Routes":
      return "Manage bus routes and destinations";
    case "Schedule":
      return "Configure and view bus timetables";
    case "Fleet":
      return "Manage your buses and maintenance";
    case "Analytics":
      return "Review performance and passenger data";
    case "Settings":
      return "Configure system preferences";
    default:
      return "";
  }
}

export default Index;
