
import { Clock, Bus, User, Edit, Trash2, MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatNPR } from "@/utils/formatters";
import { getStatusBadge, getOccupancyPercentage, getOccupancyColor } from "./scheduleUtils";

interface Schedule {
  id: string;
  route: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  bus: string;
  driver: string;
  status: string;
  bookedSeats: number;
  totalSeats: number;
  fare: number;
}

interface ScheduleTableProps {
  loading: boolean;
  schedules: Schedule[];
}

export const ScheduleTable = ({ loading, schedules }: ScheduleTableProps) => {
  return (
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
        ) : schedules.length > 0 ? (
          schedules.map((schedule) => (
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
              <TableCell>{formatNPR(schedule.fare)}</TableCell>
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
  );
};
