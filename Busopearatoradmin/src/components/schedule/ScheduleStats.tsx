
import { CalendarIcon, Clock, Bus, Route } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ScheduleStatsProps {
  todaySchedules: number;
  scheduledCount: number;
  inTransitCount: number;
  completedCount: number;
}

export const ScheduleStats = ({
  todaySchedules,
  scheduledCount,
  inTransitCount,
  completedCount
}: ScheduleStatsProps) => {
  return (
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
  );
};
