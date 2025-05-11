
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
  const [showAllSchedules, setShowAllSchedules] = useState(true); // New state to toggle between all and date-specific
  
  const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;
  
  // Fetch schedules when date changes or showAllSchedules changes
  useEffect(() => {
    const getSchedules = async () => {
      setLoading(true);
      try {
        // If showAllSchedules is true, pass null to fetch all schedules
        // Otherwise, pass the formatted date to fetch schedules for that date
        const data = await fetchSchedules(showAllSchedules ? null : formattedDate);
        console.log("API Response:", data);
        setScheduleData(data || []);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        toast({
          title: "Error",
          description: "Failed to load schedules",
          variant: "destructive",
        });
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    };
    
    getSchedules();
  }, [formattedDate, showAllSchedules, toast]);
  
  // Filter schedules based on search query and status
  const filteredSchedules = scheduleData.filter(schedule => {
    const matchesSearch = 
      (schedule.route && schedule.route.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (schedule.origin && schedule.origin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (schedule.destination && schedule.destination.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (schedule.bus && schedule.bus.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || schedule.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate stats
  const todaySchedules = scheduleData.filter(s => s.date === format(new Date(), "yyyy-MM-dd")).length;
  const scheduledCount = scheduleData.filter(s => s.status === "scheduled").length;
  const inTransitCount = scheduleData.filter(s => s.status === "in-transit").length;
  const completedCount = scheduleData.filter(s => s.status === "completed").length;
  
  const handleAddSchedule = () => {
    setIsAddModalOpen(true);
  };
  
  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsEditModalOpen(true);
  };
  
  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsViewModalOpen(true);
  };
  
  const handleDeleteSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteSchedule = async () => {
    if (!selectedSchedule) return;
    
    try {
      await deleteSchedule(selectedSchedule.id);
      
      // Update local state
      setScheduleData(scheduleData.filter(s => s.id !== selectedSchedule.id));
      
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedSchedule(null);
    }
  };
  
  const handleScheduleSuccess = async () => {
    // Refresh data after add/edit
    try {
      const data = await fetchSchedules(formattedDate);
      setScheduleData(data || []);
      
      // Close modals
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedSchedule(null);
      
      toast({
        title: "Success",
        description: "Schedule updated successfully",
      });
    } catch (error) {
      console.error("Error refreshing schedules:", error);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground mt-1">Manage your bus trips and schedules</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={handleAddSchedule}>
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
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <ScheduleFilters 
              date={date}
              setDate={setDate}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className={`${showAllSchedules ? 'bg-zippy-purple text-white' : 'bg-zippy-gray'}`}
                onClick={() => setShowAllSchedules(true)}
              >
                Show All Schedules
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAllSchedules(false)}
                className={`${!showAllSchedules ? 'bg-zippy-purple text-white' : 'bg-zippy-gray'}`}
              >
                Show Selected Date Only
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
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
      
      {/* Modals */}
      <AddScheduleModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleScheduleSuccess}
      />
      
      {selectedSchedule && (
        <>
          <EditScheduleModal 
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedSchedule(null);
            }}
            schedule={selectedSchedule}
            onSuccess={handleScheduleSuccess}
          />
          
          <ViewScheduleModal 
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedSchedule(null);
            }}
            schedule={selectedSchedule}
          />
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zippy-darkGray border-zippy-gray">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedSchedule(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSchedule} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Schedule;
