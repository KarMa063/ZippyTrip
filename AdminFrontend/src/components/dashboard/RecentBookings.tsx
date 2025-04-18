
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Booking {
  id: number;
  customer: string;
  package: string;
  status: 'Confirmed' | 'Pending';
  amount: number;
}

const initialBookings: Booking[] = [
  { id: 1, customer: 'John Doe', package: 'Paris Tour', status: 'Confirmed', amount: 2500 },
  { id: 2, customer: 'Jane Smith', package: 'Tokyo Adventure', status: 'Pending', amount: 3200 },
  { id: 3, customer: 'Mike Johnson', package: 'Safari Trip', status: 'Confirmed', amount: 4100 }
];

export default function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  useEffect(() => {
    // Animation effect: gradually reveal bookings
    const timer = setTimeout(() => {
      setBookings(initialBookings);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="glass-card rounded-xl p-5 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-white/5">
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Package</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-4">{booking.customer}</td>
                <td className="py-4">{booking.package}</td>
                <td className="py-4">
                  <span className={cn(
                    booking.status === 'Confirmed' ? 'status-confirmed' : 'status-pending'
                  )}>
                    {booking.status}
                  </span>
                </td>
                <td className="py-4 text-right">${booking.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
