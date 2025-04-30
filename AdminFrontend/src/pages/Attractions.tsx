
import { useState } from "react";
import { Ticket, Search, MapPin, Edit, Trash2, Eye, X, Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  const [attractions, setAttractions] = useState<AttractionData[]>(attractionData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAttraction, setCurrentAttraction] = useState<AttractionData>({
    id: 0,
    name: "",
    location: "",
    category: "",
    price: 0,
    rating: 5.0,
    image: "/placeholder.svg",
    status: "open"
  });
  
  const filteredAttractions = attractions.filter(attraction => 
    attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attraction.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attraction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteAttraction = (id: number) => {
    setAttractions(attractions.filter(attraction => attraction.id !== id));
    toast.success(`Attraction ID #${id} deleted successfully`);
  };

  const handleEditAttraction = (id: number) => {
    const attractionToEdit = attractions.find(attraction => attraction.id === id);
    if (attractionToEdit) {
      setCurrentAttraction(attractionToEdit);
      setIsEditing(true);
      setIsModalOpen(true);
    }
  };

  const handleViewAttraction = (id: number) => {
    const attractionToView = attractions.find(attraction => attraction.id === id);
    if (attractionToView) {
      setCurrentAttraction(attractionToView);
      toast.info(`Viewing details for ${attractionToView.name}`);
      // In a real app, this would show detailed information
    }
  };

  const handleAddNewAttraction = () => {
    setCurrentAttraction({
      id: attractions.length > 0 ? Math.max(...attractions.map(a => a.id)) + 1 : 1,
      name: "",
      location: "",
      category: "",
      price: 0,
      rating: 5.0,
      image: "/placeholder.svg",
      status: "open"
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentAttraction({
      ...currentAttraction,
      [name]: name === "price" ? parseFloat(value) : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentAttraction({
      ...currentAttraction,
      [name]: value
    });
  };

  const handleSaveAttraction = () => {
    // Validate form
    if (!currentAttraction.name || !currentAttraction.location || !currentAttraction.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isEditing) {
      // Update existing attraction
      setAttractions(attractions.map(attraction => 
        attraction.id === currentAttraction.id ? currentAttraction : attraction
      ));
      toast.success(`Attraction "${currentAttraction.name}" updated successfully`);
    } else {
      // Add new attraction
      setAttractions([...attractions, currentAttraction]);
      toast.success(`Attraction "${currentAttraction.name}" added successfully`);
    }

    // In a real app, this would save to the database
    // Example API call:
    // const saveToDb = async () => {
    //   try {
    //     const response = await fetch('/api/attractions', {
    //       method: isEditing ? 'PUT' : 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(currentAttraction)
    //     });
    //     const data = await response.json();
    //     if (!response.ok) throw new Error(data.message);
    //   } catch (error) {
    //     toast.error(`Failed to save: ${error.message}`);
    //   }
    // };
    // saveToDb();

    setIsModalOpen(false);
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
          <Button 
            className="bg-zippy-blue hover:bg-zippy-blue/90"
            onClick={handleAddNewAttraction}
          >
            <Plus className="mr-2 h-4 w-4" />
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
          <Button 
            className="mt-4 bg-zippy-blue hover:bg-zippy-blue/90"
            onClick={handleAddNewAttraction}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Attraction
          </Button>
        </div>
      )}

      {/* Add/Edit Attraction Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zippy-darker border-white/[0.03] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Attraction" : "Add New Attraction"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the attraction details below." 
                : "Fill in the details to add a new attraction."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input
                id="name"
                name="name"
                value={currentAttraction.name}
                onChange={handleInputChange}
                className="col-span-3 bg-zippy-dark focus:border-zippy-blue text-white"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location*
              </Label>
              <Input
                id="location"
                name="location"
                value={currentAttraction.location}
                onChange={handleInputChange}
                className="col-span-3 bg-zippy-dark focus:border-zippy-blue text-white"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category*
              </Label>
              <Input
                id="category"
                name="category"
                value={currentAttraction.category}
                onChange={handleInputChange}
                className="col-span-3 bg-zippy-dark focus:border-zippy-blue text-white"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={currentAttraction.price}
                onChange={handleInputChange}
                className="col-span-3 bg-zippy-dark focus:border-zippy-blue text-white"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={currentAttraction.status} 
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="col-span-3 bg-zippy-dark focus:border-zippy-blue text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-zippy-dark border-white/[0.03] text-white">
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image URL
              </Label>
              <Input
                id="image"
                name="image"
                value={currentAttraction.image}
                onChange={handleInputChange}
                className="col-span-3 bg-zippy-dark focus:border-zippy-blue text-white"
                placeholder="/placeholder.svg"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="border-white/10 hover:bg-zippy-dark"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAttraction}
              className="bg-zippy-blue hover:bg-zippy-blue/90"
            >
              {isEditing ? "Update" : "Add"} Attraction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
