
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock, Bus, Route, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { fetchBuses, fetchRoutes, createSchedule } from "@/services/api";
import { useRealtime } from "@/hooks/useRealtime";

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddScheduleModal = ({ isOpen, onClose, onSuccess }: AddScheduleModalProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [departureTime, setDepartureTime] = useState<string>("");
  const [arrivalTime, setArrivalTime] = useState<string>("");
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [selectedBus, setSelectedBus] = useState<string>("");
  const [fare, setFare] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: routes, loading: loadingRoutes } = useRealtime<any>('routes', [], ['*'], fetchRoutes);
  const { data: buses, loading: loadingBuses } = useRealtime<any>('buses', [], ['*'], fetchBuses);

  useEffect(() => {
    console.log("Routes in modal:", routes);
    console.log("Buses in modal:", buses);
  }, [routes, buses]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log("Submitting schedule with data:", { 
        route_id: selectedRoute,
        bus_id: selectedBus,
        departureTime,
        arrivalTime,
        fare
      });

      if (!selectedRoute || !selectedBus || !departureTime || !arrivalTime || !fare) {
        throw new Error("Please fill in all required fields");
      }

      const departureDateTime = new Date(date);
      const [depHours, depMinutes] = departureTime.split(':').map(Number);
      departureDateTime.setHours(depHours, depMinutes, 0, 0);

      const arrivalDateTime = new Date(date);
      const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
      arrivalDateTime.setHours(arrHours, arrMinutes, 0, 0);

      // If arrival time is earlier than departure time, assume it's the next day
      if (arrivalDateTime < departureDateTime) {
        arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
      }

      const selectedBusObj = buses.find((bus: any) => bus.id === selectedBus);
      const availableSeats = selectedBusObj ? selectedBusObj.capacity : 0;

      const scheduleData = {
        route_id: selectedRoute,
        bus_id: selectedBus,
        departure_time: departureDateTime.toISOString(),
        arrival_time: arrivalDateTime.toISOString(),
        fare: parseFloat(fare),
        available_seats: availableSeats,
        is_active: true
      };

      // Use the API service to create the schedule
      const result = await createSchedule(scheduleData);

      console.log("Schedule created successfully:", result);

      toast({
        title: "Schedule created",
        description: "The new schedule has been successfully created and saved to the database.",
      });

      // Reset form
      setDepartureTime("");
      setArrivalTime("");
      setSelectedRoute("");
      setSelectedBus("");
      setFare("");
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error creating the schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px] bg-zippy-darkGray border-zippy-gray">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Schedule</DialogTitle>
          <DialogDescription>
            Create a new bus schedule by filling out the form below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route">Route</Label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger id="route" className="bg-zippy-darkGray border-zippy-gray">
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent className="bg-zippy-darkGray border-zippy-gray">
                  {loadingRoutes ? (
                    <SelectItem value="loading" disabled>Loading routes...</SelectItem>
                  ) : routes && routes.length > 0 ? (
                    routes.map((route: any) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name} ({route.origin} to {route.destination})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-routes" disabled>No routes available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bus">Bus</Label>
              <Select value={selectedBus} onValueChange={setSelectedBus}>
                <SelectTrigger id="bus" className="bg-zippy-darkGray border-zippy-gray">
                  <SelectValue placeholder="Select a bus" />
                </SelectTrigger>
                <SelectContent className="bg-zippy-darkGray border-zippy-gray">
                  {loadingBuses ? (
                    <SelectItem value="loading" disabled>Loading buses...</SelectItem>
                  ) : buses && buses.length > 0 ? (
                    buses.map((bus: any) => (
                      <SelectItem key={bus.id} value={bus.id}>
                        Bus #{bus.registration_number} - {bus.model} ({bus.capacity} seats)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-buses" disabled>No buses available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-zippy-darkGray border-zippy-gray",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zippy-dark border-zippy-gray">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                    className="bg-zippy-dark"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure-time">Departure Time</Label>
                <div className="flex">
                  <Clock className="mr-2 h-4 w-4 mt-3" />
                  <Input
                    id="departure-time"
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="bg-zippy-darkGray border-zippy-gray"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrival-time">Arrival Time</Label>
                <div className="flex">
                  <Clock className="mr-2 h-4 w-4 mt-3" />
                  <Input
                    id="arrival-time"
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="bg-zippy-darkGray border-zippy-gray"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fare">Fare (NPR)</Label>
              <Input
                id="fare"
                type="number"
                min="0"
                step="0.01"
                value={fare}
                onChange={(e) => setFare(e.target.value)}
                className="bg-zippy-darkGray border-zippy-gray"
                placeholder="Enter fare amount in NPR"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-zippy-gray border-zippy-lightGray">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedRoute || !selectedBus || !departureTime || !arrivalTime || !fare || loading}
            className="bg-zippy-purple hover:bg-zippy-darkPurple"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              <span className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Create Schedule
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddScheduleModal;
