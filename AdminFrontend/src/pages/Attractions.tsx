
import { useState, useEffect } from "react";
import { Ticket, Search, MapPin, Edit, Trash2, Eye, Plus, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Attraction } from "@/integrations/neon/types";
import { 
  getAllAttractions, 
  deleteAttraction, 
  searchAttractions,
  createAttraction,
  updateAttraction
} from "@/services/attractions";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Attractions() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [numberTwoCount, setNumberTwoCount] = useState(0);
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    category: "",
    price: 0,
    rating: 0,
    image: "/placeholder.svg",  // Changed from image_url to image
    status: "open" as "open" | "closed" | "limited",
    description: ""
  });
  
  // Fetch attractions on component mount
  useEffect(() => {
    fetchAttractions();
  }, []);
  
  // Fetch attractions from the database
  const fetchAttractions = async () => {
    try {
      setLoading(true);
      const data = await getAllAttractions();
      setAttractions(data);
      
      // Count occurrences of number 2
      countNumberTwoOccurrences(data);
    } catch (error) {
      console.error("Failed to fetch attractions:", error);
      toast.error("Failed to load attractions");
    } finally {
      setLoading(false);
    }
  };
  
  // Count occurrences of number 2 in attractions data
  const countNumberTwoOccurrences = (attractions: Attraction[]) => {
    let count = 0;
    
    attractions.forEach(attraction => {
      // Check if any property equals 2
      if (attraction.id === 2) count++;
      if (attraction.category === '2') count++;
      if (attraction.price === 2) count++;
      if (attraction.rating === 2) count++;
      if (attraction.location === '2') count++;
      if (attraction.name === '2') count++;
    });
    
    setNumberTwoCount(count);
  };
  
  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchAttractions();
      return;
    }
    
    try {
      setLoading(true);
      const results = await searchAttractions(searchTerm);
      setAttractions(results);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete attraction
  const handleDeleteAttraction = async (id: number) => {
    try {
      await deleteAttraction(id);
      toast.success(`Attraction ID #${id} deleted successfully`);
      fetchAttractions(); // Refresh the list
    } catch (error) {
      console.error(`Failed to delete attraction ${id}:`, error);
      toast.error("Failed to delete attraction");
    }
  };

  // Handle edit attraction
  const handleEditAttraction = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
    setFormData({
      name: attraction.name,
      location: attraction.location,
      category: attraction.category,
      price: attraction.price,
      rating: attraction.rating,
      image: attraction.image,  // Changed from image_url to image
      status: attraction.status,
      description: attraction.description || ""
    });
    setIsEditDialogOpen(true);
  };

  // Handle view attraction
  const handleViewAttraction = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
    setIsViewDialogOpen(true);
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Directly update the state without complex processing
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission for adding new attraction
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert numeric fields at submission time
      const submissionData = {
        ...formData,
        price: typeof formData.price === 'string' ? parseFloat(formData.price) || 0 : formData.price,
        rating: typeof formData.rating === 'string' ? parseFloat(formData.rating) || 0 : formData.rating
      };
      
      await createAttraction(submissionData);
      toast.success("Attraction added successfully");
      setIsAddDialogOpen(false);
      fetchAttractions(); // Refresh the list
      // Reset form
      setFormData({
        name: "",
        location: "",
        category: "",
        price: 0,
        rating: 0,
        image: "/placeholder.svg",  // Changed from image_url to image
        status: "open",
        description: ""
      });
    } catch (error) {
      console.error("Failed to add attraction:", error);
      toast.error("Failed to add attraction");
    }
  };
  
  // Handle form submission for editing attraction
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttraction) return;
    
    try {
      // Convert numeric fields at submission time
      const submissionData = {
        ...formData,
        price: typeof formData.price === 'string' ? parseFloat(formData.price) || 0 : formData.price,
        rating: typeof formData.rating === 'string' ? parseFloat(formData.rating) || 0 : formData.rating
      };
      
      await updateAttraction(selectedAttraction.id, submissionData);
      toast.success("Attraction updated successfully");
      setIsEditDialogOpen(false);
      fetchAttractions(); // Refresh the list
    } catch (error) {
      console.error("Failed to update attraction:", error);
      toast.error("Failed to update attraction");
    }
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

  // Form component for add/edit
  const AttractionForm = ({ isEdit = false, onSubmit }: { isEdit?: boolean, onSubmit: (e: React.FormEvent) => Promise<void> }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            required 
            className="bg-zippy-dark"
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            name="location" 
            value={formData.location} 
            onChange={handleInputChange} 
            required 
            className="bg-zippy-dark"
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input 
            id="category" 
            name="category" 
            value={formData.category} 
            onChange={handleInputChange} 
            required 
            className="bg-zippy-dark"
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price (NPR)</Label>
          <Input 
            id="price" 
            name="price" 
            type="number" 
            min="0" 
            step="0.01" 
            value={formData.price || ''} 
            onChange={handleInputChange} 
            required 
            className="bg-zippy-dark"
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-5)</Label>
          <Input 
            id="rating" 
            name="rating" 
            type="number" 
            min="0" 
            max="5" 
            step="0.1" 
            value={formData.rating || ''} 
            onChange={handleInputChange} 
            required 
            className="bg-zippy-dark"
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger className="bg-zippy-dark">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="limited">Limited</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input 
            id="image" 
            name="image" 
            value={formData.image} 
            onChange={handleInputChange} 
            className="bg-zippy-dark"
            autoComplete="off"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleInputChange} 
          rows={4} 
          className="bg-zippy-dark"
          autoComplete="off"
        />
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" className="bg-zippy-blue hover:bg-zippy-blue/90">
          {isEdit ? "Update Attraction" : "Add Attraction"}
        </Button>
      </DialogFooter>
    </form>
  );

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zippy-blue hover:bg-zippy-blue/90">
                <Plus className="mr-2 h-4 w-4" /> Add New Attraction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zippy-darker text-white border-white/[0.03] max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Attraction</DialogTitle>
              </DialogHeader>
              <AttractionForm onSubmit={handleAddSubmit} />
            </DialogContent>
          </Dialog>
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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button 
          className="bg-zippy-blue hover:bg-zippy-blue/90"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>
      
      {loading ? (
        <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-zippy-blue/10 flex items-center justify-center text-zippy-blue mb-4">
            <div className="animate-spin h-8 w-8 border-4 border-zippy-blue/20 border-t-zippy-blue rounded-full"></div>
          </div>
          <h2 className="text-xl font-medium mb-2">Loading Attractions...</h2>
        </div>
      ) : attractions.length > 0 ? (
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
                  {attractions.map(attraction => (
                    <TableRow key={attraction.id} className="border-white/[0.03]">
                      <TableCell className="font-medium">{attraction.name}</TableCell>
                      <TableCell>{attraction.location}</TableCell>
                      <TableCell>{attraction.category}</TableCell>
                      <TableCell>NPR {attraction.price}</TableCell>
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
                            onClick={() => handleViewAttraction(attraction)}
                            className="h-8 w-8 text-gray-400 hover:text-white"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditAttraction(attraction)}
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
            {attractions.map(attraction => (
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
                    <span>NPR {attraction.price}</span>
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
                        onClick={() => handleViewAttraction(attraction)}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditAttraction(attraction)}
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 bg-zippy-blue hover:bg-zippy-blue/90">
                Add New Attraction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zippy-darker text-white border-white/[0.03] max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Attraction</DialogTitle>
              </DialogHeader>
              <AttractionForm onSubmit={handleAddSubmit} />
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      {/* View Attraction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-zippy-darker text-white border-white/[0.03] max-w-3xl">
          <DialogHeader>
            <DialogTitle>Attraction Details</DialogTitle>
          </DialogHeader>
          {selectedAttraction && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-48 overflow-hidden rounded-lg">
                  <img 
                    src={selectedAttraction.image}
                    alt={selectedAttraction.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Description</h3>
                  <p className="text-gray-400">{selectedAttraction.description || "No description available."}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedAttraction.name}</h3>
                  <div className="flex items-center text-gray-400 gap-1 mt-1">
                    <MapPin size={16} />
                    <span>{selectedAttraction.location}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm text-gray-400">Category</h4>
                    <p>{selectedAttraction.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400">Price</h4>
                    <p>${selectedAttraction.price}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400">Rating</h4>
                    <p className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      {selectedAttraction.rating}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400">Status</h4>
                    <Badge variant="outline" className={getStatusColor(selectedAttraction.status)}>
                      {selectedAttraction.status.charAt(0).toUpperCase() + selectedAttraction.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">ID</h4>
                  <p>#{selectedAttraction.id}</p>
                </div>
                {selectedAttraction.created_at && (
                  <div>
                    <h4 className="text-sm text-gray-400">Created</h4>
                    <p>{new Date(selectedAttraction.created_at).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedAttraction.updated_at && (
                  <div>
                    <h4 className="text-sm text-gray-400">Last Updated</h4>
                    <p>{new Date(selectedAttraction.updated_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => selectedAttraction && handleEditAttraction(selectedAttraction)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Attraction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zippy-darker text-white border-white/[0.03] max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Attraction</DialogTitle>
          </DialogHeader>
          <AttractionForm isEdit onSubmit={handleEditSubmit} />
        </DialogContent>
      </Dialog>
      
      {/* Snackbar for notifications */}
      {/* You can implement a toast notification system here */}
    </div>
  );
}

// Add a default export that uses the named export
export default Attractions;
