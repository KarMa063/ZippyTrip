
import { useState } from "react";
import { Hotel, Search, MapPin, Edit, Trash2, Eye } from "lucide-react";
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

interface HotelData {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  amenities: string[];
  status: "active" | "inactive" | "pending";
}

const hotelData: HotelData[] = [
  {
    id: 1,
    name: "Grand Luxury Hotel",
    location: "Downtown, New York",
    price: 199,
    rating: 4.8,
    image: "/lovable-uploads/e2b94875-a240-4cc0-b0e2-45c798e90d92.png",
    amenities: ["Wi-Fi", "Pool", "Spa", "Gym"],
    status: "active"
  },
  {
    id: 2,
    name: "Oceanview Resort",
    location: "Beachfront, Miami",
    price: 249,
    rating: 4.6,
    image: "/placeholder.svg",
    amenities: ["Wi-Fi", "Beach Access", "Restaurant", "Bar"],
    status: "active"
  },
  {
    id: 3,
    name: "Mountain Retreat Lodge",
    location: "Alpine Heights, Colorado",
    price: 179,
    rating: 4.5,
    image: "/placeholder.svg",
    amenities: ["Wi-Fi", "Fireplace", "Hiking", "Restaurant"],
    status: "pending"
  }
];

export default function Stays() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  const filteredHotels = hotelData.filter(hotel => 
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteHotel = (id: number) => {
    toast.success(`Hotel ID #${id} deleted successfully`);
    // In a real app, this would delete the hotel from the database
  };

  const handleEditHotel = (id: number) => {
    toast.info(`Editing hotel ID #${id}`);
    // In a real app, this would open an edit form
  };

  const handleViewHotel = (id: number) => {
    toast.info(`Viewing details for hotel ID #${id}`);
    // In a real app, this would show detailed information
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'inactive':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Hotel className="text-zippy-blue" />
          Manage Hotels
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
            Add New Hotel
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-zippy-darker rounded-lg">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search hotels by name or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zippy-dark focus:border-zippy-blue text-white"
          />
        </div>
        <Button className="bg-zippy-blue hover:bg-zippy-blue/90">
          Search
        </Button>
      </div>
      
      {filteredHotels.length > 0 ? (
        viewMode === "table" ? (
          <Card className="bg-zippy-darker border-white/[0.03] text-white">
            <CardHeader className="pb-0">
              <h3 className="text-lg font-medium">Hotel Listings</h3>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.03]">
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHotels.map(hotel => (
                    <TableRow key={hotel.id} className="border-white/[0.03]">
                      <TableCell className="font-medium">{hotel.id}</TableCell>
                      <TableCell>{hotel.name}</TableCell>
                      <TableCell>{hotel.location}</TableCell>
                      <TableCell>${hotel.price}</TableCell>
                      <TableCell>{hotel.rating}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(hotel.status)}>
                          {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewHotel(hotel.id)}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditHotel(hotel.id)}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteHotel(hotel.id)}
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
            {filteredHotels.map(hotel => (
              <Card key={hotel.id} className="bg-zippy-darker border-white/[0.03] text-white overflow-hidden">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={hotel.image} 
                    alt={hotel.name} 
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    variant="outline" 
                    className={`absolute top-3 right-3 ${getStatusColor(hotel.status)}`}
                  >
                    {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{hotel.name}</h3>
                    <span>${hotel.price}/night</span>
                  </div>
                  <div className="flex items-center text-gray-400 gap-1 text-sm">
                    <MapPin size={16} />
                    <span>{hotel.location}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="bg-zippy-blue/10 border-zippy-blue/20 text-zippy-blue">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <div className="flex">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{hotel.rating}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewHotel(hotel.id)}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditHotel(hotel.id)}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteHotel(hotel.id)}
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
            <Hotel size={32} />
          </div>
          <h2 className="text-xl font-medium mb-2">No Hotels Found</h2>
          <p className="text-gray-400 text-center max-w-md">
            We couldn't find any hotels matching your search criteria. 
            Try adjusting your search or add a new hotel.
          </p>
          <Button className="mt-4 bg-zippy-blue hover:bg-zippy-blue/90">
            Add New Hotel
          </Button>
        </div>
      )}
    </div>
  );
}
