import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Plus, Edit, Trash2, Phone, Mail } from 'lucide-react';
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
import { fetchDrivers, deleteDriver } from '@/services/api/drivers';

const Drivers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDrivers();
      setDrivers(data);
    } catch (error) {
      console.error('Error loading drivers:', error);
      toast({
        title: "Error",
        description: "Failed to load drivers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await deleteDriver(id);
        toast({
          title: "Success",
          description: "Driver deleted successfully.",
          variant: "default",
        });
        loadDrivers();
      } catch (error) {
        console.error('Error deleting driver:', error);
        toast({
          title: "Error",
          description: "Failed to delete driver. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-zippy-purple rounded-full">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Drivers</CardTitle>
                <CardDescription>Manage your driver team</CardDescription>
              </div>
            </div>
            <Button onClick={() => navigate('/drivers/add')}>
              <Plus className="mr-2 h-4 w-4" /> Add Driver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading drivers...</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No drivers found. Add your first driver to get started.</p>
              <Button className="mt-4" onClick={() => navigate('/drivers/add')}>
                <Plus className="mr-2 h-4 w-4" /> Add Driver
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>License Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2" />
                          {driver.phone}
                        </div>
                        {driver.email && (
                          <div className="flex items-center mt-1">
                            <Mail className="h-3 w-3 mr-2" />
                            {driver.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{driver.license_number}</TableCell>
                    <TableCell>
                      <Badge variant={driver.is_active ? "default" : "secondary"}>
                        {driver.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/drivers/edit/${driver.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(driver.id)}>
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

export default Drivers;