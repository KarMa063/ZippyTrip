import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Bus, User, MapPin, DollarSign } from "lucide-react";

interface ViewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: any;
}

const ViewScheduleModal = ({ isOpen, onClose, schedule }: ViewScheduleModalProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Scheduled</Badge>;
      case "in-transit":
        return <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/10">In Transit</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-green-500 text-green-500">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-zippy-darkGray border-zippy-gray text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Schedule Details</span>
            {getStatusBadge(schedule.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{schedule.route}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Route ID: {schedule.routeId}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-zippy-purple" />
                {schedule.date}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Time</div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-zippy-purple" />
                {schedule.departureTime} - {schedule.arrivalTime}
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Bus</div>
            <div className="flex items-center">
              <Bus className="h-4 w-4 mr-2 text-zippy-purple" />
              {schedule.bus}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Driver</div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-zippy-purple" />
              {schedule.driver}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Seats</div>
              <div>
                {schedule.bookedSeats}/{schedule.totalSeats} booked
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Fare</div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-zippy-purple" />
                रू{schedule.fare}
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={onClose}
              className="w-full bg-zippy-purple hover:bg-zippy-darkPurple"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewScheduleModal;