import { useState } from "react";
import { MapPin, Search, Plus, Edit, Trash2, Eye } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Destination {
  id: number;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  price: number;
  featured: boolean;
  rating: number;
}

// Sample data - in a real app, this would come from an API
const initialDestinations: Destination[] = [
  {
    id: 1,
    name: "Paris Getaway",
    location: "Paris, France",
    description: "Experience the romance of Paris with this 5-day tour package.",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3",
    price: 1200,
    featured: true,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Tokyo Adventure",
    location: "Tokyo, Japan",
    description: "Explore the vibrant city of Tokyo with our guided tour.",
    imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3",
    price: 1500,
    featured: true,
    rating: 4.7,
  },
  {
    id: 3,
    name: "Bali Retreat",
    location: "Bali, Indonesia",
    description: "Relax and rejuvenate in the beautiful island of Bali.",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1938&auto=format&fit=crop&ixlib=rb-4.0.3",
    price: 900,
    featured: false,
    rating: 4.5,
  },
];

export default function Destinations() {
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [newDestination, setNewDestination] = useState<Partial<Destination>>({
    name: "",
    location: "",
    description: "",
    imageUrl: "",
    price: 0,
    featured: false,
    rating: 4.0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredDestinations = destinations.filter(
    (destination) =>
      destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDestination((prev) => ({
      ...prev,
      [name]: name === "price" || name === "rating" ? parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewDestination((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAddDestination = async () => {
    try {
      // In a real app, this would be an API call
      const response = await fetch('http://localhost:5000/api/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDestination),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add destination');
      }
      
      const data = await response.json();
      
      // Add the new destination to the state
      const newId = destinations.length > 0 ? Math.max(...destinations.map(d => d.id)) + 1 : 1;
      const destinationToAdd = {
        ...newDestination,
        id: data.id || newId,
      } as Destination;
      
      setDestinations([...destinations, destinationToAdd]);
      setNewDestination({
        name: "",
        location: "",
        description: "",
        imageUrl: "",
        price: 0,
        featured: false,
        rating: 4.0,
      });
      setIsDialogOpen(false);
      toast.success("Destination added successfully!");
    } catch (error) {
      console.error("Error adding destination:", error);
      toast.error("Failed to add destination. Please try again.");
    }
  };

  const handleUpdateDestination = async () => {
    if (editingId === null) return;
    
    try {
      // In a real app, this would be an API call
      const response = await fetch(`http://localhost:5000/api/destinations/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDestination),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update destination');
      }
      
      // Update the destination in the state
      setDestinations(
        destinations.map((dest) =>
          dest.id === editingId ? { ...dest, ...newDestination } as Destination : dest
        )
      );
      
      setNewDestination({
        name: "",
        location: "",
        description: "",
        imageUrl: "",
        price: 0,
        featured: false,
        rating: 4.0,
      });
      setEditingId(null);
      setIsDialogOpen(false);
      toast.success("Destination updated successfully!");
    } catch (error) {
      console.error("Error updating destination:", error);
      toast.error("Failed to update destination. Please try again.");
    }
  };

  const handleDeleteDestination = async (id: number) => {
    try {
      // In a real app, this would be an API call
      const response = await fetch(`http://localhost:5000/api/destinations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete destination');
      }
      
      // Remove the destination from the state
      setDestinations(destinations.filter((dest) => dest.id !== id));
      toast.success("Destination deleted successfully!");
    } catch (error) {
      console.error("Error deleting destination:", error);
      toast.error("Failed to delete destination. Please try again.");
    }
  };

  const handleEditDestination = (destination: Destination) => {
    setNewDestination(destination);
    setEditingId(destination.id);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="text-zippy-blue" />
          Manage Travel Destinations
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zippy-blue hover:bg-zippy-blue/90">
                <Plus className="mr-2 h-4 w-4" /> Add Destination
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Destination" : "Add New Destination"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update the destination details below."
                    : "Fill in the details for the new travel destination."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={newDestination.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={newDestination.location}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newDestination.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="imageUrl" className="text-right">
                    Image URL
                  </Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={newDestination.imageUrl}
                    onChange={handleInputChange}
                    className="col-span-3"
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
                    value={newDestination.price}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rating" className="text-right">
                    Rating
                  </Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={newDestination.rating}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="featured" className="text-right">
                    Featured
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={newDestination.featured}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="featured">Show as featured destination</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingId(null);
                    setNewDestination({
                      name: "",
                      location: "",
                      description: "",
                      imageUrl: "",
                      price: 0,
                      featured: false,
                      rating: 4.0,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={editingId ? handleUpdateDestination : handleAddDestination}
                >
                  {editingId ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-zippy-darker rounded-lg">
        <div className="relative flex-grow">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search destinations by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zippy-dark focus:border-zippy-blue text-white"
          />
        </div>
        <Button className="bg-zippy-blue hover:bg-zippy-blue/90">Search</Button>
      </div>

      {filteredDestinations.length > 0 ? (
        viewMode === "table" ? (
          <Card className="bg-zippy-darker border-white/[0.03] text-white">
            <CardHeader className="pb-0">
              <h3 className="text-lg font-medium">Destination Listings</h3>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.03]">
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDestinations.map((destination) => (
                    <TableRow key={destination.id} className="border-white/[0.03]">
                      <TableCell className="font-medium">{destination.name}</TableCell>
                      <TableCell>{destination.location}</TableCell>
                      <TableCell>${destination.price}</TableCell>
                      <TableCell>{destination.rating}/5</TableCell>
                      <TableCell>
                        {destination.featured ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            Featured
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-400">
                            Standard
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toast.info(`Viewing ${destination.name}`)}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditDestination(destination)}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDestination(destination.id)}
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
            {filteredDestinations.map((destination) => (
              <Card
                key={destination.id}
                className="bg-zippy-darker border-white/[0.03] text-white overflow-hidden"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={destination.imageUrl}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                  {destination.featured && (
                    <Badge className="absolute top-3 right-3 bg-zippy-blue">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{destination.name}</h3>
                    <span>${destination.price}</span>
                  </div>
                  <div className="flex items-center text-gray-400 gap-1 text-sm">
                    <MapPin size={14} />
                    <span>{destination.location}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                    {destination.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{destination.rating}/5</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toast.info(`Viewing ${destination.name}`)}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditDestination(destination)}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDestination(destination.id)}
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
            <MapPin size={32} />
          </div>
          <h2 className="text-xl font-medium mb-2">No Destinations Found</h2>
          <p className="text-gray-400 text-center max-w-md">
            We couldn't find any destinations matching your search criteria. Try
            adjusting your search or add a new destination.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 bg-zippy-blue hover:bg-zippy-blue/90">
                Add New Destination
              </Button>
            </DialogTrigger>
            <DialogContent>{/* Dialog content as above */}</DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}