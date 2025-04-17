import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../gcomponents/button";
import { Card, CardContent } from "../gcomponents/card";
import { Input } from "../gcomponents/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../gcomponents/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../gcomponents/alert-dialog";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import placeholderImage from "../images/placeholder.png";
import guesthouse1 from "../images/guesthouse1.jpg";
import guesthouse2 from "../images/guesthouse2.jpg";

type Property = {
  id: string;
  name: string;
  address: string;
  description?: string;
  contact: string;
  email?: string;
  images: string[];
  rooms: number;
};

const GProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("properties");
      if (stored && JSON.parse(stored).length > 0) {
        setProperties(JSON.parse(stored));
      } else {
        const dummy: Property[] = [
          {
            id: "1",
            name: "Himalayan Retreat",
            address: "Lakeside, Pokhara, Kaski",
            description: "A beautiful lakeside property with a mountain view.",
            contact: "9800000001",
            email: "himalayan@zippytrip.com",
            images: [guesthouse1],
            rooms: 5,
          },
          {
            id: "2",
            name: "Everest Base Stay",
            address: "Namche Bazaar, Solukhumbu",
            description: "Experience the Everest base camp trail from this cozy stay.",
            contact: "9800000002",
            email: "everest@zippytrip.com",
            images: [guesthouse2],
            rooms: 3,
          }    
        ];
        
        localStorage.setItem("properties", JSON.stringify(dummy));
        setProperties(dummy);
      }
    } catch (error) {
      console.error("Failed to load properties:", error);
    }
  }, []);
  


  const saveToStorage = (updated: Property[]) => {
    localStorage.setItem("properties", JSON.stringify(updated));
    setProperties(updated);
  };

  const handleDeleteProperty = (id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    saveToStorage(updated);
    alert("Property deleted successfully.");
  };

  const filteredProperties = properties.filter((property) =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white-500">Properties</h1>
          <p className="text-muted-foreground">Manage your rental properties</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={view} onValueChange={(val) => setView(val as "grid" | "list")}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => navigate("/gproperties/add")}>
            <Plus className="h-4 w-4 mr-1" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Grid/List View */}
      <Tabs value={view}>
        <TabsContent value="grid">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No properties found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="group overflow-hidden">
                  <Link to={`/gproperties/${property.id}`}>
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={property.images?.[0] || placeholderImage}
                        alt={property.name}
                        onError={(e) => (e.currentTarget.src = placeholderImage)}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{property.name}</h3>
                      <p className="text-sm text-muted-foreground">{property.address}</p>
                      <div className="text-sm mt-1 text-primary font-medium">
                        {property.rooms} {property.rooms === 1 ? "Room" : "Rooms"}
                      </div>
                    </CardContent>
                  </Link>
                  <div className="px-4 pb-3 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/gproperties/edit/${property.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Property</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{property.name}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteProperty(property.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GProperties;
