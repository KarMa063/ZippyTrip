import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Search,
  Bus,
  Route,
  Edit,
  Trash2,
  User,
  CalendarCheck,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fetchSchedules } from "@/services/api";
import { useRealtime } from "@/hooks/useRealtime";
import { supabase } from "@/integrations/supabase/client";
import AddScheduleModal from "@/components/AddScheduleModal";

const Schedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;
  const fetchSchedulesForDate = async () => {
    return await fetchSchedules(formattedDate);
  };
  
  // Use the useRealtime hook with 'schedules' as the table and fetchSchedulesForDate as the fetch function
  const { data: scheduleData, loading } = useRealtime('schedules', [], ['*'], fetchSchedulesForDate);

  const schedules = scheduleData.map(schedule => {
    const departureTime = new Date(schedule.departure_time);
    const arrivalTime = new Date(schedule.arrival_time);
    
    let status = "scheduled";
    if (departureTime <= new Date() && arrivalTime >= new Date()) {
      status = "in-transit";
    } else if (arrivalTime < new Date()) {
      status = "completed";
    }
    
    // Use the nested route data directly from the scheduleData
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Scheduled</Badge>;
      case "in-transit":
        return <Badge variant="outline" className="border-amber-500 text-amber-500">In Transit</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-green-500 text-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getOccupancyPercentage = (booked: number, total: number) => {
    return Math.round((booked / total) * 100);
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 85) return "text-green-500";
    if (percentage >= 60) return "text-amber-500";
    return "text-blue-500";
  };

  const handleAddSchedule = () => {
    setIsAddModalOpen(true);
  };

  const handleScheduleAdded = () => {
    // The schedule data will be refreshed automatically by the useRealtime hook
  };

  return (
    
    <div className="space-y-6 animate-fade-in">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground mt-1">Manage your bus trips and schedules</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-zippy-darkGray border-zippy-gray">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button 
            className="bg-zippy-purple hover:bg-zippy-darkPurple"
            onClick={handleAddSchedule}
          >
            <CalendarCheck className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-zippy-purple" />
                Today's Trips
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySchedules}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Scheduled
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledCount}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Bus className="h-5 w-5 mr-2 text-amber-500" />
                In Transit
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inTransitCount}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Route className="h-5 w-5 mr-2 text-green-500" />
                Completed
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal bg-zippy-darkGray border-zippy-gray"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-zippy-dark border-zippy-gray">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="bg-zippy-dark"
              />
            </PopoverContent>
          </Popover>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 bg-zippy-darkGray border-zippy-gray"
              onClick={() => {
                if (date) {
                  const newDate = new Date(date);
                  newDate.setDate(newDate.getDate() - 1);
                  setDate(newDate);
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 bg-zippy-darkGray border-zippy-gray"
              onClick={() => {
                if (date) {
                  const newDate = new Date(date);
                  newDate.setDate(newDate.getDate() + 1);
                  setDate(newDate);
                }
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search schedules..." 
              className="bg-zippy-darkGray border-zippy-gray pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-zippy-darkGray border-zippy-gray">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-zippy-darkGray border-zippy-gray">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-transit">In Transit</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-zippy-darkGray border-zippy-gray overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zippy-gray">
                <TableRow>
                  <TableHead>Schedule ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4" />
                      Bus
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Driver
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Loading schedules...
                    </TableCell>
                  </TableRow>
                ) : filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id} className="border-b border-zippy-gray">
                      <TableCell className="font-medium">{schedule.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{schedule.route}</span>
                          <span className="text-xs text-muted-foreground">{schedule.routeId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center">
                            <span className="w-14">Dep:</span>
                            <span>{schedule.departureTime}</span>
                          </span>
                          <span className="flex items-center">
                            <span className="w-14">Arr:</span>
                            <span>{schedule.arrivalTime}</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{schedule.bus}</TableCell>
                      <TableCell>{schedule.driver}</TableCell>
                      <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                      <TableCell>NPR {schedule.fare.toFixed(2)}</TableCell>
                      <TableCell>
                        {schedule.status !== "cancelled" ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-zippy-gray rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full ${getOccupancyColor(getOccupancyPercentage(schedule.bookedSeats, schedule.totalSeats))}`}
                                style={{ width: `${getOccupancyPercentage(schedule.bookedSeats, schedule.totalSeats)}%` }}
                              />
                            </div>
                            <span className={`text-xs ${getOccupancyColor(getOccupancyPercentage(schedule.bookedSeats, schedule.totalSeats))}`}>
                              {schedule.bookedSeats}/{schedule.totalSeats} 
                              ({getOccupancyPercentage(schedule.bookedSeats, schedule.totalSeats)}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zippy-darkGray border-zippy-gray">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer focus:bg-zippy-gray focus:text-white">
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Schedule</span>
                            </DropdownMenuItem>
                            {schedule.status === "scheduled" && (
                              <DropdownMenuItem className="cursor-pointer focus:bg-zippy-gray focus:text-white">
                                <Bus className="mr-2 h-4 w-4" />
                                <span>Change Bus</span>
                              </DropdownMenuItem>
                            )}
                            {schedule.status === "scheduled" && (
                              <DropdownMenuItem className="cursor-pointer focus:bg-zippy-gray focus:text-white">
                                <User className="mr-2 h-4 w-4" />
                                <span>Change Driver</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {schedule.status === "scheduled" && (
                              <DropdownMenuItem 
                                className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Cancel Trip</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No schedules found for the selected criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddScheduleModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handleScheduleAdded}
      />
    
  );
};

export default Schedule;
