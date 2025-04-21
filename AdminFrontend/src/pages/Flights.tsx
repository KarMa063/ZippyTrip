
import { useState } from "react";
import { Edit, Eye, MapPin, Plane, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { FlightData } from "@/types/flights";

const flightData: FlightData[] = [
  {
    id: 1,
    flightNumber: "ZT1234",
    airline: "ZippyAir",
    departure: "New York (JFK)",
    destination: "London (LHR)",
    departureTime: "09:30 AM",
    price: 449,
    status: "on-time"
  },
  {
    id: 2,
    flightNumber: "ZT2345",
    airline: "ZippyAir",
    departure: "Los Angeles (LAX)",
    destination: "Tokyo (HND)",
    departureTime: "11:45 AM",
    price: 899,
    status: "delayed"
  },
  {
    id: 3,
    flightNumber: "ZT3456",
    airline: "ZippyAir",
    departure: "Chicago (ORD)",
    destination: "Paris (CDG)",
    departureTime: "07:15 PM",
    price: 599,
    status: "on-time"
  }
];

export default function Flights() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  const filteredFlights = flightData.filter(flight => 
    flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteFlight = (id: number) => {
    toast.success(`Flight ID #${id} deleted successfully`);
    // In a real app, this would delete the flight from the database
  };

  const handleEditFlight = (id: number) => {
    toast.info(`Editing flight ID #${id}`);
    // In a real app, this would open an edit form
  };

  const handleViewFlight = (id: number) => {
    toast.info(`Viewing details for flight ID #${id}`);
    // In a real app, this would show detailed information
  };

  const handleAddNewFlight = () => {
    toast.info("Adding new flight");
    // In a real app, this would open a form to add a new flight
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'delayed':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  // Flight Search Bar Component (inline)
  const FlightSearchBar = () => (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-zippy-darker rounded-lg">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input 
          placeholder="Search flights by number, airline, or location..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-zippy-dark focus:border-zippy-blue text-white"
        />
      </div>
      <Button className="bg-zippy-blue hover:bg-zippy-blue/90">
        Search
      </Button>
    </div>
  );

  // Flight Table Component (inline)
  const FlightTable = () => (
    <Card className="bg-zippy-darker border-white/[0.03] text-white">
      <CardHeader className="pb-0">
        <h3 className="text-lg font-medium">Flight Listings</h3>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.03]">
              <TableHead>Flight #</TableHead>
              <TableHead>Airline</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFlights.map(flight => (
              <TableRow key={flight.id} className="border-white/[0.03]">
                <TableCell className="font-medium">{flight.flightNumber}</TableCell>
                <TableCell>{flight.airline}</TableCell>
                <TableCell>{flight.departure}</TableCell>
                <TableCell>{flight.destination}</TableCell>
                <TableCell>{flight.departureTime}</TableCell>
                <TableCell>${flight.price}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(flight.status)}>
                    {flight.status === 'on-time' ? 'On Time' : 
                     flight.status === 'delayed' ? 'Delayed' : 'Cancelled'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleViewFlight(flight.id)}
                      className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditFlight(flight.id)}
                      className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteFlight(flight.id)}
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
  );

  // Flight Grid Component (inline)
  const FlightGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredFlights.map(flight => (
        <Card key={flight.id} className="bg-zippy-darker border-white/[0.03] text-white overflow-hidden">
          <div className="h-48 overflow-hidden relative bg-zippy-blue/20 flex items-center justify-center">
            <Plane size={64} className="text-zippy-blue opacity-50" />
            <Badge 
              variant="outline" 
              className={`absolute top-3 right-3 ${getStatusColor(flight.status)}`}
            >
              {flight.status === 'on-time' ? 'On Time' : 
                flight.status === 'delayed' ? 'Delayed' : 'Cancelled'}
            </Badge>
          </div>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">{flight.flightNumber}</h3>
              <span>${flight.price}</span>
            </div>
            <div className="flex items-center text-gray-400 gap-1 text-sm">
              <span>{flight.airline}</span>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>From:</span>
                </div>
                <span className="font-medium">{flight.departure}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>To:</span>
                </div>
                <span className="font-medium">{flight.destination}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Departure Time:</span>
                <span className="font-medium">{flight.departureTime}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleViewFlight(flight.id)}
                  className="h-8 w-8 text-gray-400 hover:text-white"
                >
                  <Eye size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEditFlight(flight.id)}
                  className="h-8 w-8 text-gray-400 hover:text-white"
                >
                  <Edit size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteFlight(flight.id)}
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
  );

  // Empty State Component (inline)
  const EmptyFlightState = () => (
    <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-zippy-blue/10 flex items-center justify-center text-zippy-blue mb-4">
        <Plane size={32} />
      </div>
      <h2 className="text-xl font-medium mb-2">No Flights Found</h2>
      <p className="text-gray-400 text-center max-w-md">
        We couldn't find any flights matching your search criteria. 
        Try adjusting your search or add a new flight.
      </p>
      <Button className="mt-4 bg-zippy-blue hover:bg-zippy-blue/90" onClick={handleAddNewFlight}>
        Add New Flight
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plane className="text-zippy-blue" />
          Manage Flights
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
          <Button 
            className="bg-zippy-blue hover:bg-zippy-blue/90"
            onClick={handleAddNewFlight}
          >
            Add New Flight
          </Button>
        </div>
      </div>
      
      <FlightSearchBar />
      
      {filteredFlights.length > 0 ? (
        viewMode === "table" ? (
          <FlightTable />
        ) : (
          <FlightGrid />
        )
      ) : (
        <EmptyFlightState />
      )}
    </div>
  );
}
