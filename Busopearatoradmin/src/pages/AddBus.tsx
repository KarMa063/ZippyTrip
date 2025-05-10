import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { createBus } from '@/services/api/buses';

const AddBus = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    registration_number: '',
    model: '',
    capacity: 0,
    amenities: {
      wifi: false,
      usb_charging: false,
      entertainment: false,
      air_conditioning: false,
      restroom: false
    },
    is_active: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capacity' ? parseInt(value) : value
    });
  };

  const handleAmenityChange = (amenity) => {
    setFormData({
      ...formData,
      amenities: {
        ...formData.amenities,
        [amenity]: !formData.amenities[amenity]
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert amenities object to JSON for database storage
      const busData = {
        ...formData,
        amenities: formData.amenities
      };

      await createBus(busData);
      
      toast({
        title: "Success!",
        description: "Bus has been added successfully.",
        variant: "default",
      });
      
      // Redirect to buses list
      navigate('/buses');
    } catch (error) {
      console.error('Error adding bus:', error);
      toast({
        title: "Error",
        description: "Failed to add bus. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-zippy-purple rounded-full">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Add New Bus</CardTitle>
              <CardDescription>Enter the details of the new bus</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration Number*</Label>
                  <Input
                    id="registration_number"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    placeholder="e.g., KA-01-AB-1234"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Bus Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., Volvo 9400"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity">Seating Capacity*</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="wifi" 
                      checked={formData.amenities.wifi}
                      onCheckedChange={() => handleAmenityChange('wifi')}
                    />
                    <Label htmlFor="wifi" className="font-normal">WiFi</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="usb_charging" 
                      checked={formData.amenities.usb_charging}
                      onCheckedChange={() => handleAmenityChange('usb_charging')}
                    />
                    <Label htmlFor="usb_charging" className="font-normal">USB Charging</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="entertainment" 
                      checked={formData.amenities.entertainment}
                      onCheckedChange={() => handleAmenityChange('entertainment')}
                    />
                    <Label htmlFor="entertainment" className="font-normal">Entertainment System</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="air_conditioning" 
                      checked={formData.amenities.air_conditioning}
                      onCheckedChange={() => handleAmenityChange('air_conditioning')}
                    />
                    <Label htmlFor="air_conditioning" className="font-normal">Air Conditioning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="restroom" 
                      checked={formData.amenities.restroom}
                      onCheckedChange={() => handleAmenityChange('restroom')}
                    />
                    <Label htmlFor="restroom" className="font-normal">Restroom</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_active" 
                  checked={formData.is_active}
                  onCheckedChange={() => setFormData({...formData, is_active: !formData.is_active})}
                />
                <Label htmlFor="is_active" className="font-normal">Active</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/buses')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Bus'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBus;