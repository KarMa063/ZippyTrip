
import { useState } from "react";
import { Bus, Search, MapPin, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface BusData {
  id: number;
  busNumber: string;
  company: string;
  route: string;
  departureTime: string;
  capacity: number;
  price: number;
  status: "available" | "limited" | "booked";
}

const busData: BusData[] = [
  {
    id: 1,
    busNumber: "ZB1001",
    company: "Zippy Bus Co.",
    route: "New York to Boston",
    departureTime: "08:00 AM",
    capacity: 45,
    price: 39,
    status: "available"
  },
  {
    id: 2,
    busNumber: "ZB1002",
    company: "Zippy Bus Co.",
    route: "Washington DC to Philadelphia",
    departureTime: "10:30 AM",
    capacity: 45,
    price: 29,
    status: "limited"
  },
  {
    id: 3,
    busNumber: "ZB1003",
    company: "Zippy Bus Co.",
    route: "San Francisco to Los Angeles",
    departureTime: "07:45 AM",
    capacity: 50,
    price: 49,
    status: "booked"
  }
];

export default function BusRentals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  const filteredBuses = busData.filter(bus => 
    bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteBus = (id: number) => {
    toast.success(`Bus ID #${id} deleted successfully`);
    // In a real app, this would delete the bus from the database
  };

  const handleEditBus = (id: number) => {
    toast.info(`Editing bus ID #${id}`);
    // In a real app, this would open an edit form
  };

  const handleViewBus = (id: number) => {
    toast.info(`Viewing details for bus ID #${id}`);
    // In a real app, this would show detailed information
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'limited':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'booked':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bus className="text-zippy-blue" />
          Manage Bus Rentals
        </h1>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === "table" ? "default" : "outline"} 
            onClick={() => setViewMode("table")}
            size="sm"
          >
            Table View
          </Button>
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"} 
            onClick={() => setViewMode("grid")}
            size="sm"
          >
            Grid View
          </Button>
          <Button className="bg-zippy-blue hover:bg-zippy-blue/90">
            Add New Bus
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-zippy-darker rounded-lg">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search buses by number, company, or route..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zippy-dark focus:border-zippy-blue text-white"
          />
        </div>
        <Button className="bg-zippy-blue hover:bg-zippy-blue/90">
          Search
        </Button>
      </div>
      
      {filteredBuses.length > 0 ? (
        viewMode === "table" ? (
          <Card className="bg-zippy-darker border-white/[0.03] text-white">
            <CardHeader className="pb-0">
              <h3 className="text-lg font-medium">Bus Listings</h3>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.03]">
                    <TableHead>Bus #</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuses.map(bus => (
                    <TableRow key={bus.id} className="border-white/[0.03]">
                      <TableCell className="font-medium">{bus.busNumber}</TableCell>
                      <TableCell>{bus.company}</TableCell>
                      <TableCell>{bus.route}</TableCell>
                      <TableCell>{bus.departureTime}</TableCell>
                      <TableCell>{bus.capacity} seats</TableCell>
                      <TableCell>${bus.price}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(bus.status)}>
                          {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewBus(bus.id)}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditBus(bus.id)}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteBus(bus.id)}
                            className="h-8 w-8 text-gray-400 hover:text-white hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuses.map(bus => (
              <Card key={bus.id} className="bg-zippy-darker border-white/[0.03] text-white overflow-hidden">
                <div className="h-48 overflow-hidden relative bg-zippy-blue/20 flex items-center justify-center">
                  <Bus size={64} className="text-zippy-blue opacity-50" />
                  <Badge 
                    variant="outline" 
                    className={`absolute top-3 right-3 ${getStatusColor(bus.status)}`}
                  >
                    {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{bus.busNumber}</h3>
                    <span>${bus.price}</span>
                  </div>
                  <div className="flex items-center text-gray-400 gap-1 text-sm">
                    <span>{bus.company}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>Route:</span>
                      </div>
                      <span className="font-medium">{bus.route}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Departure:</span>
                      <span className="font-medium">{bus.departureTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Capacity:</span>
                      <span className="font-medium">{bus.capacity} seats</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewBus(bus.id)}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditBus(bus.id)}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteBus(bus.id)}
                        className="h-8 w-8 text-gray-400 hover:text-white hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-zippy-blue/10 flex items-center justify-center text-zippy-blue mb-4">
            <Bus size={32} />
          </div>
          <h2 className="text-xl font-medium mb-2">No Buses Found</h2>
          <p className="text-gray-400 text-center max-w-md">
            We couldn't find any buses matching your search criteria. 
            Try adjusting your search or add a new bus.
          </p>
          <Button className="mt-4 bg-zippy-blue hover:bg-zippy-blue/90">
            Add New Bus
          </Button>
        </div>
      )}
    </div>
  );
}
