
import React from "react";
import { Badge } from "@/components/ui/badge";

export const getStatusBadge = (status: string) => {
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

export const getOccupancyPercentage = (booked: number, total: number) => {
  return Math.round((booked / total) * 100);
};

export const getOccupancyColor = (percentage: number) => {
  if (percentage >= 85) return "text-green-500";
  if (percentage >= 60) return "text-amber-500";
  return "text-blue-500";
};
