import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Bus, 
  Clock, 
  DollarSign, 
  Edit, 
  Eye, 
  FileDown, 
  MapPin, 
  MoreHorizontal, 
  Plus, 
  Route, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchRoutes, deleteRoute } from "@/services/api";
import { useRealtime } from "@/hooks/useRealtime";
import { Database } from "@/integrations/supabase/types";

type RouteType = Database['public']['Tables']['routes']['Row'];

const Routes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const { data: routesData, loading } = useRealtime<RouteType>('routes', [], ['*'], fetchRoutes);

  const filteredRoutes = routesData.filter(route => 
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeRoutes = routesData.filter(route => route.is_active).length;
  const maintenanceRoutes = 0;
  const inactiveRoutes = routesData.filter(route => !route.is_active).length;

  const handleDeleteRoute = async (id: string) => {
    try {
      await deleteRoute(id);
      toast({
        title: "Route deleted",
        description: "The route has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting route:", error);
      toast({
        title: "Error",
        description: "Failed to delete the route.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bus Routes</h1>
          <p className="text-muted-foreground mt-1">Manage all your bus routes and schedules</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" className="bg-zippy-darkGray border-zippy-gray">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link to="/routes/add">
            <Button className="bg-zippy-purple hover:bg-zippy-darkPurple">
              <Plus className="mr-2 h-4 w-4" />
              Add New Route
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="bg-zippy-darkGray border-zippy-gray flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Route className="h-5 w-5 mr-2 text-zippy-purple" />
                Total Routes
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routesData.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-500" />
                Active Routes
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRoutes}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Bus className="h-5 w-5 mr-2 text-amber-500" />
                Maintenance
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceRoutes}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-red-500" />
                Inactive
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveRoutes}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Input 
            placeholder="Search routes..." 
            className="bg-zippy-darkGray border-zippy-gray pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Card className="bg-zippy-darkGray border-zippy-gray overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zippy-gray">
                <TableRow>
                  <TableHead>Route ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Source - Destination</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading routes...
                    </TableCell>
                  </TableRow>
                ) : filteredRoutes.length > 0 ? (
                  filteredRoutes.map((route) => (
                    <TableRow key={route.id} className="border-b border-zippy-gray">
                      <TableCell className="font-medium">{route.id.substring(0, 8)}</TableCell>
                      <TableCell>{route.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span>{route.origin}</span>
                          <span>→</span>
                          <span>{route.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>{route.duration ? `${Math.floor(route.duration / 60)}h ${route.duration % 60}m` : 'N/A'}</TableCell>
                      <TableCell>{route.distance ? `${route.distance} km` : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={route.is_active ? "outline" : "destructive"}
                          className={route.is_active ? "border-green-500 text-green-500" : ""}
                        >
                          {route.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zippy-darkGray border-zippy-gray">
                            <DropdownMenuItem className="cursor-pointer focus:bg-zippy-gray focus:text-white">
                              <Link to={`/routes/${route.id}`} className="flex items-center w-full">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer focus:bg-zippy-gray focus:text-white">
                              <Link to={`/routes/edit/${route.id}`} className="flex items-center w-full">
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                              onClick={() => handleDeleteRoute(route.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No routes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Routes;
