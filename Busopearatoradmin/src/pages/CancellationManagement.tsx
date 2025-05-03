
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Calendar } from "lucide-react";
import { formatNPR } from "@/utils/formatters";
import axios from 'axios';

const CancellationManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: cancellations, isLoading, refetch } = useQuery({
    queryKey: ['cancelled-bookings'],
    queryFn: async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/cancellations');
        return response.data;
      } catch (error) {
        console.error("API error:", error);
        return []; // Return empty array if API fails
      }
    },
    refetchInterval: 30000 // Refetch every 30 seconds to get new cancellations
  });

  // Set up a polling mechanism to check for new cancellations
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetch]);

  const filteredCancellations = cancellations?.filter(booking =>
    booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (booking.schedules?.routes?.name && booking.schedules.routes.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (booking.schedules?.routes?.origin && booking.schedules.routes.origin.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (booking.schedules?.routes?.destination && booking.schedules.routes.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (booking.from && booking.from.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (booking.to && booking.to.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-zippy-purple" />
        <span className="ml-2">Loading cancellations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Cancellations</h1>
        <p className="text-muted-foreground mt-1">View all cancelled bus bookings</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Input 
            placeholder="Search cancellations..." 
            className="bg-zippy-darkGray border-zippy-gray pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Card className="bg-zippy-darkGray border-zippy-gray overflow-hidden">
        <CardHeader>
          <CardTitle>Cancelled Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zippy-gray">
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Route Details</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Dates
                    </div>
                  </TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Refund Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCancellations && filteredCancellations.length > 0 ? (
                  filteredCancellations.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.id.substring(0, 8)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{booking.schedules?.routes?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {booking.schedules?.routes?.origin} → {booking.schedules?.routes?.destination}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs">Cancelled: {formatDate(booking.updated_at)}</span>
                          <span className="text-xs">Booked: {formatDate(booking.booking_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{booking.user_id.substring(0, 8)}</TableCell>
                      <TableCell>
                        <span className="text-xs">{booking.seat_numbers.join(", ")}</span>
                        <span className="text-xs text-muted-foreground block">
                          {booking.seat_numbers.length} {booking.seat_numbers.length === 1 ? 'seat' : 'seats'}
                        </span>
                      </TableCell>
                      <TableCell>{formatNPR(booking.total_fare)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={booking.payment_status === 'refunded' ? 'outline' : 'destructive'}
                          className={booking.payment_status === 'refunded' ? 'border-green-500 text-green-500' : ''}
                        >
                          {booking.payment_status === 'refunded' ? 'Refunded' : 'Pending Refund'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchTerm ? "No cancellations match your search" : "No cancellations found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CancellationManagement;
