
import { useState } from "react";
import { Ticket, Search, MapPin, Edit, Trash2, Eye } from "lucide-react";
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

interface AttractionData {
  id: number;
  name: string;
  location: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  status: "open" | "closed" | "limited";
}

const attractionData: AttractionData[] = [
  {
    id: 1,
    name: "Grand Museum",
    location: "Downtown, New York",
    category: "Museum",
    price: 25,
    rating: 4.7,
    image: "/placeholder.svg",
    status: "open"
  },
  {
    id: 2,
    name: "Adventure Theme Park",
    location: "Orlando, Florida",
    category: "Theme Park",
    price: 89,
    rating: 4.9,
    image: "/placeholder.svg",
    status: "open"
  },
  {
    id: 3,
    name: "Historic Castle Tour",
    location: "Edinburgh, Scotland",
    category: "Historic Site",
    price: 35,
    rating: 4.5,
    image: "/placeholder.svg",
    status: "limited"
  }
];

export default function Attractions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  const filteredAttractions = attractionData.filter(attraction => 
    attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attraction.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attraction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteAttraction = (id: number) => {
    toast.success(`Attraction ID #${id} deleted successfully`);
    // In a real app, this would delete the attraction from the database
  };

  const handleEditAttraction = (id: number) => {
    toast.info(`Editing attraction ID #${id}`);
    // In a real app, this would open an edit form
  };

  const handleViewAttraction = (id: number) => {
    toast.info(`Viewing details for attraction ID #${id}`);
    // In a real app, this would show detailed information
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'limited':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'closed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="text-zippy-blue" />
          Manage Attractions
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
            Add New Attraction
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-zippy-darker rounded-lg">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search attractions by name, location, or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zippy-dark focus:border-zippy-blue text-white"
          />
        </div>
        <Button className="bg-zippy-blue hover:bg-zippy-blue/90">
          Search
        </Button>
      </div>
      
      {filteredAttractions.length > 0 ? (
        viewMode === "table" ? (
          <Card className="bg-zippy-darker border-white/[0.03] text-white">
            <CardHeader className="pb-0">
              <h3 className="text-lg font-medium">Attraction Listings</h3>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.03]">
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttractions.map(attraction => (
                    <TableRow key={attraction.id} className="border-white/[0.03]">
                      <TableCell className="font-medium">{attraction.name}</TableCell>
                      <TableCell>{attraction.location}</TableCell>
                      <TableCell>{attraction.category}</TableCell>
                      <TableCell>${attraction.price}</TableCell>
                      <TableCell>{attraction.rating}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(attraction.status)}>
                          {attraction.status.charAt(0).toUpperCase() + attraction.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewAttraction(attraction.id)}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditAttraction(attraction.id)}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteAttraction(attraction.id)}
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
            {filteredAttractions.map(attraction => (
              <Card key={attraction.id} className="bg-zippy-darker border-white/[0.03] text-white overflow-hidden">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={attraction.image} 
                    alt={attraction.name} 
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    variant="outline" 
                    className={`absolute top-3 right-3 ${getStatusColor(attraction.status)}`}
                  >
                    {attraction.status.charAt(0).toUpperCase() + attraction.status.slice(1)}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{attraction.name}</h3>
                    <span>${attraction.price}</span>
                  </div>
                  <div className="flex items-center text-gray-400 gap-1 text-sm">
                    <MapPin size={16} />
                    <span>{attraction.location}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-sm text-gray-400">{attraction.category}</span>
                    <div className="flex">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{attraction.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewAttraction(attraction.id)}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditAttraction(attraction.id)}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteAttraction(attraction.id)}
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
            <Ticket size={32} />
          </div>
          <h2 className="text-xl font-medium mb-2">No Attractions Found</h2>
          <p className="text-gray-400 text-center max-w-md">
            We couldn't find any attractions matching your search criteria. 
            Try adjusting your search or add a new attraction.
          </p>
          <Button className="mt-4 bg-zippy-blue hover:bg-zippy-blue/90">
            Add New Attraction
          </Button>
        </div>
      )}
    </div>
  );
}
