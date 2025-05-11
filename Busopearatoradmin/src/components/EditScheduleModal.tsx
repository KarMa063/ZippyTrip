import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchRoutes, fetchBuses, fetchDrivers, updateSchedule } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: any;
  onSuccess: () => void;
}

const EditScheduleModal = ({ isOpen, onClose, schedule, onSuccess }: EditScheduleModalProps) => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [routeId, setRouteId] = useState(schedule?.routeId || "");
  const [busId, setBusId] = useState(schedule?.busId || "");
  const [driverId, setDriverId] = useState(schedule?.driverId || "");
  const [departureDate, setDepartureDate] = useState(schedule?.date || "");
  const [departureTime, setDepartureTime] = useState(
    schedule?.departureTime ? 
    format(parse(schedule.departureTime, "hh:mm a", new Date()), "HH:mm") : 
    ""
  );
  const [arrivalTime, setArrivalTime] = useState(
    schedule?.arrivalTime ? 
    format(parse(schedule.arrivalTime, "hh:mm a", new Date()), "HH:mm") : 
    ""
  );
  const [fare, setFare] = useState(schedule?.fare?.toString() || "");
  
  // Update form state when schedule changes
  useEffect(() => {
    if (schedule) {
      setRouteId(schedule.routeId || "");
      setBusId(schedule.busId || "");
      setDriverId(schedule.driverId || "");
      setDepartureDate(schedule.date || "");
      setDepartureTime(
        schedule.departureTime ? 
        format(parse(schedule.departureTime, "hh:mm a", new Date()), "HH:mm") : 
        ""
      );
      setArrivalTime(
        schedule.arrivalTime ? 
        format(parse(schedule.arrivalTime, "hh:mm a", new Date()), "HH:mm") : 
        ""
      );
      setFare(schedule.fare?.toString() || "");
    }
  }, [schedule]);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesData, busesData, driversData] = await Promise.all([
          fetchRoutes(),
          fetchBuses(),
          fetchDrivers()
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
    }
  }, [isOpen, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!schedule || !schedule.id) {
        throw new Error("Schedule ID is missing");
      }
      
      // Combine date and time
      const departureDateTime = new Date(`${departureDate}T${departureTime}`);
      const arrivalDateTime = new Date(`${departureDate}T${arrivalTime}`);
      
      // If arrival is before departure (next day), add a day
      if (arrivalDateTime < departureDateTime) {
        arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
      }
      
      const scheduleData = {
        route_id: routeId,
        bus_id: busId,
        driver_id: driverId,
        departure_time: departureDateTime.toISOString(),
        arrival_time: arrivalDateTime.toISOString(),
        fare: parseFloat(fare),
      };
      
      await updateSchedule(schedule.id, scheduleData);
      
      toast({
        title: "Success",
        description: "Schedule updated successfully",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
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
          <DialogTitle>Edit Schedule</DialogTitle>
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
              className="bg-zippy-darkGray border-zippy-gray"
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
                className="bg-zippy-darkGray border-zippy-gray"
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
                className="bg-zippy-darkGray border-zippy-gray"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fare">Fare (रू)</Label>
            <Input
              id="fare"
              type="number"
              min="0"
              step="0.01"
              value={fare}
              onChange={(e) => setFare(e.target.value)}
              required
              className="bg-zippy-darkGray border-zippy-gray"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-zippy-darkGray border-zippy-gray"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-zippy-purple hover:bg-zippy-darkPurple"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditScheduleModal;