import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  Search,
  Ticket,
  Check,
  Clock,
  Ban,
  User,
  MapPin,
  DollarSign,
  FileDown,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchBookings } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { formatNPR } from "@/utils/formatters";

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: fetchBookings
  });

  useEffect(() => {
    if (data) {
      setBookings(data);
    }
  }, [data]);

  useEffect(() => {
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'bookings',
        },
        async (payload) => {
          const refreshedData = await fetchBookings();
          setBookings(refreshedData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredBookings = bookings
    ? bookings.filter((booking) => {
        const matchesSearch = 
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.schedules?.routes?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.schedules?.routes?.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.schedules?.routes?.destination.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="outline" className="border-green-500 text-green-500">Confirmed</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-green-700 text-green-700">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge variant="outline" className="border-green-500 text-green-500">Paid</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "refunded":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Refunded</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;
  const confirmedBookings = bookings?.filter(b => b.status === "confirmed").length || 0;
  const cancelledBookings = bookings?.filter(b => b.status === "cancelled").length || 0;
  const completedBookings = bookings?.filter(b => b.status === "completed").length || 0;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-zippy-purple" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>Error loading bookings</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all bus bookings</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="outline" className="bg-zippy-darkGray border-zippy-gray">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Pending
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-green-500" />
                Confirmed
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedBookings}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Ban className="h-5 w-5 mr-2 text-red-500" />
                Cancelled
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledBookings}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zippy-darkGray border-zippy-gray">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <div className="flex items-center">
                <Ticket className="h-5 w-5 mr-2 text-green-700" />
                Completed
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Input 
            placeholder="Search bookings..." 
            className="bg-zippy-darkGray border-zippy-gray pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-zippy-darkGray border-zippy-gray">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-zippy-darkGray border-zippy-gray">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-zippy-darkGray border-zippy-gray overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zippy-gray">
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Route
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Date & Time
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Passenger
                    </div>
                  </TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Amount
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id} className="border-b border-zippy-gray">
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
                          <span className="text-xs">Booked: {formatDate(booking.booking_date)}</span>
                          <span className="text-xs">Departure: {formatDate(booking.schedules?.departure_time)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span>User ID: {booking.user_id.substring(0, 8)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{booking.seat_numbers.join(", ")}</span>
                        <span className="text-xs text-muted-foreground block">
                          {booking.seat_numbers.length} {booking.seat_numbers.length === 1 ? 'seat' : 'seats'}
                        </span>
                      </TableCell>
                      <TableCell>{formatNPR(booking.total_fare)}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getPaymentStatusBadge(booking.payment_status)}
                          {booking.payment_method && (
                            <span className="text-xs text-muted-foreground">
                              via {booking.payment_method}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {searchTerm || statusFilter !== "all" 
                        ? "No bookings match your filters"
                        : "No bookings found"}
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

export default Bookings;
