
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Eye, Trash, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ScheduleTableProps {
  loading: boolean;
  schedules: any[];
  onEditSchedule: (schedule: any) => void;
  onViewSchedule?: (schedule: any) => void;
  onDeleteSchedule?: (schedule: any) => void;
}

export const ScheduleTable = ({ 
  loading, 
  schedules, 
  onEditSchedule,
  onViewSchedule,
  onDeleteSchedule
}: ScheduleTableProps) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-zippy-purple" />
        <span className="ml-2">Loading schedules...</span>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-zippy-gray">
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Route</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Bus</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Seats</TableHead>
          <TableHead>Fare</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="h-24 text-center">
              No schedules found
            </TableCell>
          </TableRow>
        ) : (
          schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">{schedule.id.substring(0, 8)}</TableCell>
              <TableCell>{schedule.route}</TableCell>
              <TableCell>{schedule.date}</TableCell>
              <TableCell>{schedule.departureTime} - {schedule.arrivalTime}</TableCell>
              <TableCell>{schedule.bus}</TableCell>
              <TableCell>{schedule.driver}</TableCell>
              <TableCell>{getStatusBadge(schedule.status)}</TableCell>
              <TableCell>{schedule.bookedSeats}/{schedule.totalSeats}</TableCell>
              <TableCell>₹{schedule.fare}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onViewSchedule && (
                      <DropdownMenuItem onClick={() => onViewSchedule(schedule)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEditSchedule(schedule)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {onDeleteSchedule && (
                      <DropdownMenuItem 
                        onClick={() => onDeleteSchedule(schedule)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
