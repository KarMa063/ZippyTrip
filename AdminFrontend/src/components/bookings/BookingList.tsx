
import { useEffect, useState } from 'react';
import { Booking } from '@/types/bookings';
import { getBookingsByType } from '@/data/mockBookings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface BookingListProps {
  serviceType: 'flight' | 'bus' | 'attraction' | 'taxi';
}

export function BookingList({ serviceType }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setBookings(getBookingsByType(serviceType));
  }, [serviceType]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 hover:bg-green-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const serviceLabels = {
    'flight': 'Flight',
    'bus': 'Bus Rental',
    'attraction': 'Attraction',
    'taxi': 'Airport Taxi'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{serviceLabels[serviceType]} Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Departure Date</TableHead>
                {serviceType === 'flight' && <TableHead>Return Date</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.userName}</TableCell>
                  <TableCell>{booking.destination}</TableCell>
                  <TableCell>{formatDate(booking.departureDate)}</TableCell>
                  {serviceType === 'flight' && (
                    <TableCell>{booking.returnDate ? formatDate(booking.returnDate) : '-'}</TableCell>
                  )}
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">${booking.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4">No bookings found</div>
        )}
      </CardContent>
    </Card>
  );
}
