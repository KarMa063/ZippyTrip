import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../gcomponents/button";
import { Card, CardContent } from "../gcomponents/card";
import { Input } from "../gcomponents/input";
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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch properties from the backend
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/gproperties");
        const data = await response.json();
        setProperties(data.properties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, []);

  const handleDeleteProperty = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/gproperties/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setProperties((prev) => prev.filter((property) => property.id !== id));
        alert("Property deleted successfully.");
      } else {
        alert("Failed to delete property.");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Failed to delete property.");
    }
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
          <Button onClick={() => navigate("/gproperties/add")}>
            <Plus className="h-4 w-4 mr-1" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Grid View */}
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
                    src={property.images?.[0]}
                    alt={property.name}
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
    </div>
  );
};

export default GProperties;
