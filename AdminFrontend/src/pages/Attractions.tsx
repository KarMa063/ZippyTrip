
import { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Star, Pencil, Trash2, Plus, Search } from 'lucide-react';

interface Attraction {
  id: number;
  name: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  properties: number;
  featured: boolean;
}

export default function Attractions() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAttraction, setCurrentAttraction] = useState<Attraction | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image: '',
    rating: 0,
    properties: 0,
    featured: false
  });

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/attractions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch attractions');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAttractions(data.attractions);
      } else {
        console.error('API returned unsuccessful response:', data);
        setAttractions([]);
      }
    } catch (error) {
      console.error('Error fetching attractions:', error);
      setAttractions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rating' || name === 'properties' ? parseFloat(value) : value
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      featured: checked
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      description: '',
      image: '',
      rating: 0,
      properties: 0,
      featured: false
    });
  };

  const openEditDialog = (attraction: Attraction) => {
    setCurrentAttraction(attraction);
    setFormData({
      name: attraction.name,
      location: attraction.location,
      description: attraction.description,
      image: attraction.image,
      rating: attraction.rating,
      properties: attraction.properties,
      featured: attraction.featured
    });
    setIsEditDialogOpen(true);
  };

  const handleAddAttraction = async () => {
    try {
      // Ensure all required fields are present
      if (!formData.name || !formData.location) {
        alert('Name and location are required fields');
        return;
      }
      
      console.log('Sending data:', formData);
      
      const response = await fetch('http://localhost:5000/api/attractions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add attraction');
      }
      
      const data = await response.json();
      
      if (data.success) {
        fetchAttractions();
        setIsAddDialogOpen(false);
        resetForm();
        alert('Attraction added successfully!');
      } else {
        console.error('API returned unsuccessful response:', data);
        alert('Failed to add attraction: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding attraction:', error);
      alert('Error adding attraction: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleUpdateAttraction = async () => {
    if (!currentAttraction) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/attractions/${currentAttraction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update attraction');
      }
      
      const data = await response.json();
      
      if (data.success) {
        fetchAttractions();
        setIsEditDialogOpen(false);
        setCurrentAttraction(null);
        resetForm();
      } else {
        console.error('API returned unsuccessful response:', data);
        alert('Failed to update attraction: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating attraction:', error);
      alert('Error updating attraction: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteAttraction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this attraction?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/attractions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete attraction');
      }
      
      const data = await response.json();
      
      if (data.success) {
        fetchAttractions();
      } else {
        console.error('API returned unsuccessful response:', data);
        alert('Failed to delete attraction: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting attraction:', error);
      alert('Error deleting attraction: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const filteredAttractions = attractions.filter(attraction => 
    attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attraction.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
          />
        ))}
        <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attractions Management</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attractions..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Attraction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Attraction</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rating" className="text-right">Rating</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="properties" className="text-right">Properties</Label>
                  <Input
                    id="properties"
                    name="properties"
                    type="number"
                    min="0"
                    value={formData.properties}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="featured" className="text-right">Featured</Label>
                  <div className="col-span-3">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={handleSwitchChange}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddAttraction}>Add Attraction</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading attractions...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttractions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No attractions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttractions.map((attraction) => (
                    <TableRow key={attraction.id}>
                      <TableCell>
                        <img 
                          src={attraction.image} 
                          alt={attraction.name} 
                          className="w-16 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{attraction.name}</TableCell>
                      <TableCell>{attraction.location}</TableCell>
                      <TableCell>{renderStars(attraction.rating)}</TableCell>
                      <TableCell>{attraction.properties}</TableCell>
                      <TableCell>{attraction.featured ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(attraction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteAttraction(attraction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Attraction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">Location</Label>
              <Input
                id="edit-location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image" className="text-right">Image URL</Label>
              <Input
                id="edit-image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-rating" className="text-right">Rating</Label>
              <Input
                id="edit-rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-properties" className="text-right">Properties</Label>
              <Input
                id="edit-properties"
                name="properties"
                type="number"
                min="0"
                value={formData.properties}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-featured" className="text-right">Featured</Label>
              <div className="col-span-3">
                <Switch
                  id="edit-featured"
                  checked={formData.featured}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateAttraction}>Update Attraction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
