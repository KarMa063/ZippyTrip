import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Route, MapPin } from "lucide-react";
import { createRoute, RouteInsert } from "@/services/api/routes";

const AddRoute = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    destination: "",
    distance: "",
    duration: "",
    is_active: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === "status") {
      const isActive = value === "active";
      setFormData(prev => ({ ...prev, is_active: isActive }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validate inputs
      if (!formData.name || !formData.origin || !formData.destination) {
        toast({
          title: "Validation error",
          description: "Please fill all required fields: name, origin, and destination.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Format data for API call
      const routeData: RouteInsert = {
        name: formData.name,
        origin: formData.origin,
        destination: formData.destination,
        distance: formData.distance ? parseFloat(formData.distance) : null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        is_active: formData.is_active
      };
      
      console.log("Creating route with data:", routeData);
      
      // Insert into Supabase
      await createRoute(routeData);
      
      // Show success toast
      toast({
        title: "Route created",
        description: "The new route has been created successfully."
      });
      
      // Redirect to routes page
      navigate("/routes");
    } catch (error) {
      console.error("Error creating route:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating the route.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Route</h1>
        <p className="text-muted-foreground mt-1">Create a new bus route</p>
      </div>
      
      <Card className="bg-zippy-darkGray border-zippy-gray">
        <CardHeader>
          <CardTitle>Route Information</CardTitle>
          <CardDescription>Define the details for the new bus route</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Route Name</Label>
                <div className="relative">
                  <Route className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Delhi to Mumbai Express"
                    className="pl-9 bg-zippy-gray border-zippy-lightGray"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="Delhi"
                    className="pl-9 bg-zippy-gray border-zippy-lightGray"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                    className="pl-9 bg-zippy-gray border-zippy-lightGray"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (km)</Label>
                <Input
                  id="distance"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  placeholder="1400"
                  className="bg-zippy-gray border-zippy-lightGray"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="990"
                  className="bg-zippy-gray border-zippy-lightGray"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={formData.is_active ? "active" : "inactive"}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger className="pl-9 bg-zippy-gray border-zippy-lightGray">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zippy-darkGray border-zippy-gray">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/routes")}
                className="bg-zippy-darkGray border-zippy-gray"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-zippy-purple hover:bg-zippy-darkPurple"
              >
                {isSubmitting ? "Creating..." : "Create Route"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddRoute;
