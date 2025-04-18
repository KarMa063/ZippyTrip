
import { useState } from "react";
import { Car, Search, MapPin, Edit, Trash2, Eye } from "lucide-react";
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

interface TaxiData {
  id: number;
  vehicleId: string;
  type: string;
  driver: string;
  location: string;
  capacity: number;
  price: number;
  status: "available" | "on-trip" | "maintenance";
}

const taxiData: TaxiData[] = [
  {
    id: 1,
    vehicleId: "ZT101",
    type: "Sedan",
    driver: "John Smith",
    location: "JFK Airport",
    capacity: 4,
    price: 45,
    status: "available"
  },
  {
    id: 2,
    vehicleId: "ZT202",
    type: "SUV",
    driver: "Maria Garcia",
    location: "LAX Airport",
    capacity: 6,
    price: 65,
    status: "on-trip"
  },
  {
    id: 3,
    vehicleId: "ZT303",
    type: "Van",
    driver: "Robert Johnson",
    location: "O'Hare Airport",
    capacity: 8,
    price: 85,
    status: "maintenance"
  }
];

export default function AirportTaxis() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  const filteredTaxis = taxiData.filter(taxi => 
    taxi.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    taxi.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    taxi.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    taxi.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTaxi = (id: number) => {
    toast.success(`Taxi ID #${id} deleted successfully`);
    // In a real app, this would delete the taxi from the database
  };

  const handleEditTaxi = (id: number) => {
    toast.info(`Editing taxi ID #${id}`);
    // In a real app, this would open an edit form
  };

  const handleViewTaxi = (id: number) => {
    toast.info(`Viewing details for taxi ID #${id}`);
    // In a real app, this would show detailed information
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'on-trip':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'maintenance':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Car className="text-zippy-blue" />
          Manage Airport Taxis
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
            Add New Taxi
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-zippy-darker rounded-lg">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search taxis by ID, driver, location, or type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zippy-dark focus:border-zippy-blue text-white"
          />
        </div>
        <Button className="bg-zippy-blue hover:bg-zippy-blue/90">
          Search
        </Button>
      </div>
      
      {filteredTaxis.length > 0 ? (
        viewMode === "table" ? (
          <Card className="bg-zippy-darker border-white/[0.03] text-white">
            <CardHeader className="pb-0">
              <h3 className="text-lg font-medium">Taxi Listings</h3>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.03]">
                    <TableHead>Vehicle ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTaxis.map(taxi => (
                    <TableRow key={taxi.id} className="border-white/[0.03]">
                      <TableCell className="font-medium">{taxi.vehicleId}</TableCell>
                      <TableCell>{taxi.type}</TableCell>
                      <TableCell>{taxi.driver}</TableCell>
                      <TableCell>{taxi.location}</TableCell>
                      <TableCell>{taxi.capacity} passengers</TableCell>
                      <TableCell>${taxi.price}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(taxi.status)}>
                          {taxi.status === 'available' ? 'Available' : 
                           taxi.status === 'on-trip' ? 'On Trip' : 'Maintenance'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewTaxi(taxi.id)}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditTaxi(taxi.id)}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteTaxi(taxi.id)}
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
            {filteredTaxis.map(taxi => (
              <Card key={taxi.id} className="bg-zippy-darker border-white/[0.03] text-white overflow-hidden">
                <div className="h-48 overflow-hidden relative bg-zippy-blue/20 flex items-center justify-center">
                  <Car size={64} className="text-zippy-blue opacity-50" />
                  <Badge 
                    variant="outline" 
                    className={`absolute top-3 right-3 ${getStatusColor(taxi.status)}`}
                  >
                    {taxi.status === 'available' ? 'Available' : 
                     taxi.status === 'on-trip' ? 'On Trip' : 'Maintenance'}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{taxi.vehicleId}</h3>
                    <span>${taxi.price}</span>
                  </div>
                  <div className="flex items-center text-gray-400 gap-1 text-sm">
                    <span>{taxi.type}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Driver:</span>
                      <span className="font-medium">{taxi.driver}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>Location:</span>
                      </div>
                      <span className="font-medium">{taxi.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Capacity:</span>
                      <span className="font-medium">{taxi.capacity} passengers</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewTaxi(taxi.id)}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditTaxi(taxi.id)}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteTaxi(taxi.id)}
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
            <Car size={32} />
          </div>
          <h2 className="text-xl font-medium mb-2">No Taxis Found</h2>
          <p className="text-gray-400 text-center max-w-md">
            We couldn't find any taxis matching your search criteria. 
            Try adjusting your search or add a new taxi.
          </p>
          <Button className="mt-4 bg-zippy-blue hover:bg-zippy-blue/90">
            Add New Taxi
          </Button>
        </div>
      )}
    </div>
  );
}
