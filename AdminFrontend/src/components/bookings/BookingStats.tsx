
import { useEffect, useState } from 'react';
import { BookingStats } from '@/types/bookings';
import { getBookingStats } from '@/data/mockBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface BookingStatsProps {
  serviceType: 'flight' | 'bus' | 'attraction' | 'taxi';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function BookingStatsChart({ serviceType }: BookingStatsProps) {
  const [stats, setStats] = useState<BookingStats[]>([]);

  useEffect(() => {
    setStats(getBookingStats(serviceType));
  }, [serviceType]);

  if (stats.length === 0) {
    return <div className="text-center py-4">No booking data available</div>;
  }

  const serviceLabels = {
    'flight': 'Flight',
    'bus': 'Bus Rental',
    'attraction': 'Attraction',
    'taxi': 'Airport Taxi'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>{serviceLabels[serviceType]} Bookings by Destination</CardTitle>
          <CardDescription>Bar chart showing most booked destinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="destination" angle={-45} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{serviceLabels[serviceType]} Booking Distribution</CardTitle>
          <CardDescription>Pie chart showing booking distribution by destination</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ destination, count }) => `${destination}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
