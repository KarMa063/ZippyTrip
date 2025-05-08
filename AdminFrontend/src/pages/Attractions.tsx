
import { useState, useEffect } from "react";
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
import { attractionsDb } from "@/lib/neonClient";

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

export default function Attractions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [attractions, setAttractions] = useState<AttractionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAttraction, setNewAttraction] = useState<Omit<AttractionData, "id">>({
    name: "",
    location: "",
    category: "",
    price: 0,
    rating: 0,
    image: "",
    status: "open",
  });

  useEffect(() => {
    // Ensure the attractions table exists when the component mounts
    attractionsDb.ensureTableExists().then(() => {
      fetchAttractions();
    });
  }, []);

  const fetchAttractions = async () => {
    setLoading(true);
    try {
      const data = await attractionsDb.getAllAttractions();
      console.log("Fetched data:", data);
      setAttractions(data.attractions || []);
      if (!data.success) {
        toast.error("Failed to fetch attractions");
      }
    } catch (err) {
      console.error("Error fetching attractions:", err);
      toast.error("Error fetching attractions");
    } finally {
      setLoading(false);
    }
  };

  const filteredAttractions = attractions.filter(attraction =>
    attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attraction.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attraction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteAttraction = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this attraction?")) return;
    try {
      const data = await attractionsDb.deleteAttraction(id);
      if (data.success) {
        toast.success("Attraction deleted successfully");
        fetchAttractions();
      } else {
        toast.error(data.message || "Failed to delete attraction");
      }
    } catch (err) {
      console.error("Error deleting attraction:", err);
      toast.error("Error deleting attraction");
    }
  };

  const handleEditAttraction = (id: number) => {
    toast.info(`Editing attraction ID #${id}`);
    // Implement edit modal/form as needed
  };

  const handleViewAttraction = (id: number) => {
    toast.info(`Viewing details for attraction ID #${id}`);
    // Implement view modal as needed
  };

  const handleAddAttraction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await attractionsDb.addAttraction(newAttraction);
      if (data.success) {
        toast.success("Attraction added successfully");
        setShowAddForm(false);
        setNewAttraction({
          name: "",
          location: "",
          category: "",
          price: 0,
          rating: 0,
          image: "",
          status: "open",
        });
        fetchAttractions();
      } else {
        toast.error(data.message || "Failed to add attraction");
      }
    } catch (err) {
      console.error("Error adding attraction:", err);
      toast.error("Error adding attraction");
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
          <Button className="bg-zippy-blue hover:bg-zippy-blue/90" onClick={() => setShowAddForm(true)}>
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
        <Button className="bg-zippy-blue hover:bg-zippy-blue/90" onClick={fetchAttractions} disabled={loading}>
          Search
        </Button>
      </div>

      {showAddForm && (
        <form className="glass-card rounded-xl p-8 mb-4" onSubmit={handleAddAttraction}>
          <h2 className="text-lg font-semibold mb-4">Add New Attraction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Name"
              value={newAttraction.name}
              onChange={e => setNewAttraction({ ...newAttraction, name: e.target.value })}
              required
            />
            <Input
              placeholder="Location"
              value={newAttraction.location}
              onChange={e => setNewAttraction({ ...newAttraction, location: e.target.value })}
              required
            />
            <Input
              placeholder="Category"
              value={newAttraction.category}
              onChange={e => setNewAttraction({ ...newAttraction, category: e.target.value })}
              required
            />
            <Input
              placeholder="Price"
              type="number"
              value={newAttraction.price}
              onChange={e => setNewAttraction({ ...newAttraction, price: Number(e.target.value) })}
              required
            />
            <Input
              placeholder="Rating"
              type="number"
              step="0.1"
              value={newAttraction.rating}
              onChange={e => setNewAttraction({ ...newAttraction, rating: Number(e.target.value) })}
              required
            />
            <Input
              placeholder="Image URL"
              value={newAttraction.image}
              onChange={e => setNewAttraction({ ...newAttraction, image: e.target.value })}
            />
            <select
              className="bg-zippy-dark text-white border rounded px-2 py-1"
              value={newAttraction.status}
              onChange={e => setNewAttraction({ ...newAttraction, status: e.target.value as "open" | "closed" | "limited" })}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="limited">Limited</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" className="bg-zippy-blue hover:bg-zippy-blue/90">
              Add Attraction
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center text-gray-400">Loading attractions...</div>
      ) : filteredAttractions.length > 0 ? (
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
              <Card
                key={attraction.id}
                className="bg-zippy-darker border-white/[0.03] text-white overflow-hidden">
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
