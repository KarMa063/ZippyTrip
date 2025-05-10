import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { fetchBuses, deleteBus } from '@/services/api/buses';

const Buses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBuses();
      setBuses(data);
    } catch (error) {
      console.error('Error loading buses:', error);
      toast({
        title: "Error",
        description: "Failed to load buses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await deleteBus(id);
        toast({
          title: "Success",
          description: "Bus deleted successfully.",
          variant: "default",
        });
        loadBuses();
      } catch (error) {
        console.error('Error deleting bus:', error);
        toast({
          title: "Error",
          description: "Failed to delete bus. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const formatAmenities = (amenities) => {
    if (!amenities) return 'None';
    
    const amenitiesList = Object.entries(amenities)
      .filter(([_, value]) => value === true)
      .map(([key]) => key.replace('_', ' '));
    
    return amenitiesList.length > 0 ? amenitiesList.join(', ') : 'None';
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-zippy-purple rounded-full">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Buses</CardTitle>
                <CardDescription>Manage your bus fleet</CardDescription>
              </div>
            </div>
            <Button onClick={() => navigate('/buses/add')}>
              <Plus className="mr-2 h-4 w-4" /> Add Bus
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading buses...</p>
            </div>
          ) : buses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No buses found. Add your first bus to get started.</p>
              <Button className="mt-4" onClick={() => navigate('/buses/add')}>
                <Plus className="mr-2 h-4 w-4" /> Add Bus
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Amenities</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell className="font-medium">{bus.registration_number}</TableCell>
                    <TableCell>{bus.model || 'N/A'}</TableCell>
                    <TableCell>{bus.capacity}</TableCell>
                    <TableCell>{formatAmenities(bus.amenities)}</TableCell>
                    <TableCell>
                      <Badge variant={bus.is_active ? "default" : "secondary"}>
                        {bus.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/buses/edit/${bus.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(bus.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Buses;