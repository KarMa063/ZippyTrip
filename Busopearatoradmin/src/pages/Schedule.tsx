
import { useState, useEffect } from "react";
import { Filter, CalendarCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";
import { fetchSchedules, deleteSchedule } from "@/services/api";
import AddScheduleModal from "@/components/AddScheduleModal";
import { ScheduleStats } from "@/components/schedule/ScheduleStats";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import EditScheduleModal from "@/components/EditScheduleModal";
import ViewScheduleModal from "@/components/ViewScheduleModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const Schedule = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null); 
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;
  
  // Replace useRealtime with direct API call
  useEffect(() => {
    const getSchedules = async () => {
      setLoading(true);
      try {
        const result = await fetchSchedules(formattedDate);
        console.log("API Response:", result); // Add this debug line
        setScheduleData(result || []);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    };
    
    getSchedules();
  }, [formattedDate]);

  // Add this debug log to check the transformed data
  useEffect(() => {
    console.log("Schedule Data:", scheduleData);
    console.log("Transformed Schedules:", schedules);
  }, [scheduleData]);

  const schedules = scheduleData.map(schedule => {
    // Check if departure_time and arrival_time exist
    if (!schedule.departure_time || !schedule.arrival_time) {
      console.warn("Missing time data for schedule:", schedule);
      return null;
    }
    
    const departureTime = new Date(schedule.departure_time);
    const arrivalTime = new Date(schedule.arrival_time);
    
    // Validate date objects
    if (isNaN(departureTime.getTime()) || isNaN(arrivalTime.getTime())) {
      console.warn("Invalid date format for schedule:", schedule);
      return null;
    }
    
    let status = "scheduled";
    if (departureTime <= new Date() && arrivalTime >= new Date()) {
      status = "in-transit";
    } else if (arrivalTime < new Date()) {
      status = "completed";
    }
    
    const route = schedule.routes;
    const bus = schedule.buses;
    
    return {
      id: schedule.id,
      route: route ? route.name : "Unknown Route",
      routeId: route ? route.id : "Unknown",
      departureTime: format(departureTime, "hh:mm a"),
      arrivalTime: format(arrivalTime, "hh:mm a"),
      date: format(departureTime, "yyyy-MM-dd"),
      bus: bus ? `Bus #${bus.registration_number} - ${bus.model} (${bus.capacity} seats)` : "Unknown Bus",
      busId: bus ? bus.id : null,
      driver: schedule.driver_name || "Unassigned",
      driverId: schedule.driver_id || null,
      status,
      bookedSeats: bus ? (bus.capacity - schedule.available_seats) : 0,
      totalSeats: bus ? bus.capacity : 0,
      fare: schedule.fare,
      rawData: schedule
    };
  }).filter(Boolean); // Filter out null values

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesDate = date 
      ? schedule.date === format(date, "yyyy-MM-dd") 
      : true;
    
    const matchesSearch = schedule.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.bus.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" 
      ? true 
      : schedule.status === statusFilter;
    
    return matchesDate && matchesSearch && matchesStatus;
  });

  const todaySchedules = schedules.filter(s => s.date === format(new Date(), "yyyy-MM-dd")).length;
  const scheduledCount = schedules.filter(s => s.status === "scheduled").length;
  const inTransitCount = schedules.filter(s => s.status === "in-transit").length;
  const completedCount = schedules.filter(s => s.status === "completed").length;

  // Function to handle edit button click
  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsEditModalOpen(true);
  };

  // Function to handle view button click
  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsViewModalOpen(true);
  };

  // Function to handle delete button click
  const handleDeleteSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteDialogOpen(true);
  };

  // Function to confirm deletion
  const confirmDelete = async () => {
    if (!selectedSchedule) return;
    
    setLoading(true);
    try {
      await deleteSchedule(selectedSchedule.id);
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
      refreshSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Function to refresh schedules
  const refreshSchedules = async () => {
    setLoading(true);
    try {
      const result = await fetchSchedules(formattedDate);
      setScheduleData(result || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Remove this duplicate declaration
  // const { toast } = useToast();
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground mt-1">Manage your bus trips and schedules</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-zippy-darkGray border-zippy-gray">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button 
            className="bg-zippy-purple hover:bg-zippy-darkPurple"
            onClick={() => setIsAddModalOpen(true)}
          >
            <CalendarCheck className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </div>
      </div>

      <ScheduleStats
        todaySchedules={todaySchedules}
        scheduledCount={scheduledCount}
        inTransitCount={inTransitCount}
        completedCount={completedCount}
      />

      <ScheduleFilters
        date={date}
        setDate={setDate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <Card className="bg-zippy-darkGray border-zippy-gray overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <ScheduleTable 
              loading={loading}
              schedules={filteredSchedules}
              onEditSchedule={handleEditSchedule}
              onViewSchedule={handleViewSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Schedule Modal */}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refreshSchedules}
      />

      {/* Edit Schedule Modal */}
      {selectedSchedule && (
        <EditScheduleModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          schedule={selectedSchedule}
          onSuccess={refreshSchedules}
        />
      )}

      {/* View Schedule Modal */}
      {selectedSchedule && (
        <ViewScheduleModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          schedule={selectedSchedule}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zippy-darkGray border-zippy-gray">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the schedule
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zippy-darkGray border-zippy-gray">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Schedule;
