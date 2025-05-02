
import { useState, useEffect } from "react";
import { Filter, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";
import { fetchSchedules } from "@/services/api";
import AddScheduleModal from "@/components/AddScheduleModal";
import { ScheduleStats } from "@/components/schedule/ScheduleStats";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";

const Schedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;
  
  // Replace useRealtime with direct API call
  useEffect(() => {
    const getSchedules = async () => {
      setLoading(true);
      try {
        const result = await fetchSchedules(formattedDate);
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

  const schedules = scheduleData.map(schedule => {
    const departureTime = new Date(schedule.departure_time);
    const arrivalTime = new Date(schedule.arrival_time);
    
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
      driver: "Assigned Driver",
      status,
      bookedSeats: bus ? (bus.capacity - schedule.available_seats) : 0,
      totalSeats: bus ? bus.capacity : 0,
      fare: schedule.fare
    };
  });

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
            <ScheduleTable loading={loading} schedules={filteredSchedules} />
          </div>
        </CardContent>
      </Card>

      <AddScheduleModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          // Refresh schedules after adding a new one
          const getSchedules = async () => {
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
          getSchedules();
        }} 
      />
    </div>
  );
};

export default Schedule;
