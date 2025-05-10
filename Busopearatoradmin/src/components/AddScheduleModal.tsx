
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchRoutes, fetchBuses, fetchDrivers, createSchedule } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddScheduleModal = ({ isOpen, onClose, onSuccess }: AddScheduleModalProps) => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [routeId, setRouteId] = useState("");
  const [busId, setBusId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [fare, setFare] = useState("");
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesData, busesData, driversData] = await Promise.all([
          fetchRoutes(),
          fetchBuses(),
          fetchDrivers() // You'll need to implement this API function
        ]);
        
        setRoutes(routesData || []);
        setBuses(busesData || []);
        setDrivers(driversData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load necessary data",
          variant: "destructive",
        });
      }
    };
    
    if (isOpen) {
      fetchData();
      // Reset form
      setRouteId("");
      setBusId("");
      setDriverId("");
      setDepartureDate("");
      setDepartureTime("");
      setArrivalTime("");
      setFare("");
    }
  }, [isOpen, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Combine date and time
      const departureDateTime = new Date(`${departureDate}T${departureTime}`);
      const arrivalDateTime = new Date(`${departureDate}T${arrivalTime}`);
      
      // If arrival is before departure (next day), add a day
      if (arrivalDateTime < departureDateTime) {
        arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
      }
      
      // Get the selected bus to calculate available seats
      const selectedBus = buses.find(bus => bus.id === busId);
      const availableSeats = selectedBus ? selectedBus.capacity : 0;
      
      const scheduleData = {
        route_id: routeId,
        bus_id: busId,
        driver_id: driverId, // Add driver ID
        departure_time: departureDateTime.toISOString(),
        arrival_time: arrivalDateTime.toISOString(),
        fare: parseFloat(fare),
        available_seats: availableSeats,
        is_active: true
      };
      
      await createSchedule(scheduleData);
      
      toast({
        title: "Success",
        description: "Schedule created successfully",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to create schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-zippy-darkGray border-zippy-gray text-white">
        <DialogHeader>
          <DialogTitle>Add New Schedule</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="route">Route</Label>
            <Select value={routeId} onValueChange={setRouteId} required>
              <SelectTrigger id="route">
                <SelectValue placeholder="Select a route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.name} ({route.origin} to {route.destination})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bus">Bus</Label>
            <Select value={busId} onValueChange={setBusId} required>
              <SelectTrigger id="bus">
                <SelectValue placeholder="Select a bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((bus) => (
                  <SelectItem key={bus.id} value={bus.id}>
                    Bus #{bus.registration_number} - {bus.model} ({bus.capacity} seats)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="driver">Driver</Label>
            <Select value={driverId} onValueChange={setDriverId} required>
              <SelectTrigger id="driver">
                <SelectValue placeholder="Assign a driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name} - {driver.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="departureDate">Departure Date</Label>
            <Input
              id="departureDate"
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureTime">Departure Time</Label>
              <Input
                id="departureTime"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="arrivalTime">Arrival Time</Label>
              <Input
                id="arrivalTime"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fare">Fare ($)</Label>
            <Input
              id="fare"
              type="number"
              min="0"
              step="0.01"
              value={fare}
              onChange={(e) => setFare(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-zippy-purple hover:bg-zippy-darkPurple">
              {loading ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddScheduleModal;
