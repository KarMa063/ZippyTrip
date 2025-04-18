
import { Booking, BookingStats } from '@/types/bookings';

// Mock flight bookings data
export const flightBookings: Booking[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    serviceType: 'flight',
    destination: 'New York',
    departureDate: '2023-10-15',
    returnDate: '2023-10-22',
    status: 'confirmed',
    price: 450,
    createdAt: '2023-09-01'
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Jane Smith',
    serviceType: 'flight',
    destination: 'London',
    departureDate: '2023-11-05',
    returnDate: '2023-11-12',
    status: 'confirmed',
    price: 650,
    createdAt: '2023-09-05'
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Alice Johnson',
    serviceType: 'flight',
    destination: 'Paris',
    departureDate: '2023-12-10',
    returnDate: '2023-12-17',
    status: 'pending',
    price: 720,
    createdAt: '2023-09-10'
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Robert Brown',
    serviceType: 'flight',
    destination: 'Tokyo',
    departureDate: '2024-01-15',
    returnDate: '2024-01-25',
    status: 'confirmed',
    price: 1200,
    createdAt: '2023-09-15'
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Emma Wilson',
    serviceType: 'flight',
    destination: 'London',
    departureDate: '2024-02-01',
    returnDate: '2024-02-08',
    status: 'cancelled',
    price: 630,
    createdAt: '2023-09-20'
  },
  {
    id: '6',
    userId: 'user6',
    userName: 'Michael Davis',
    serviceType: 'flight',
    destination: 'New York',
    departureDate: '2024-03-10',
    returnDate: '2024-03-17',
    status: 'confirmed',
    price: 480,
    createdAt: '2023-09-25'
  },
  {
    id: '7',
    userId: 'user7',
    userName: 'Sophia Miller',
    serviceType: 'flight',
    destination: 'Paris',
    departureDate: '2024-04-05',
    returnDate: '2024-04-12',
    status: 'confirmed',
    price: 700,
    createdAt: '2023-09-30'
  }
];

// Mock bus bookings
export const busBookings: Booking[] = [
  {
    id: 'b1',
    userId: 'user1',
    userName: 'John Doe',
    serviceType: 'bus',
    destination: 'Chicago',
    departureDate: '2023-10-10',
    status: 'confirmed',
    price: 75,
    createdAt: '2023-09-02'
  },
  {
    id: 'b2',
    userId: 'user3',
    userName: 'Alice Johnson',
    serviceType: 'bus',
    destination: 'Boston',
    departureDate: '2023-11-15',
    status: 'confirmed',
    price: 65,
    createdAt: '2023-09-12'
  },
  {
    id: 'b3',
    userId: 'user5',
    userName: 'Emma Wilson',
    serviceType: 'bus',
    destination: 'Chicago',
    departureDate: '2023-12-05',
    status: 'pending',
    price: 70,
    createdAt: '2023-09-22'
  }
];

// Mock attraction bookings
export const attractionBookings: Booking[] = [
  {
    id: 'a1',
    userId: 'user2',
    userName: 'Jane Smith',
    serviceType: 'attraction',
    destination: 'Disney World',
    departureDate: '2023-10-20',
    status: 'confirmed',
    price: 120,
    createdAt: '2023-09-03'
  },
  {
    id: 'a2',
    userId: 'user4',
    userName: 'Robert Brown',
    serviceType: 'attraction',
    destination: 'Universal Studios',
    departureDate: '2023-11-10',
    status: 'confirmed',
    price: 110,
    createdAt: '2023-09-17'
  },
  {
    id: 'a3',
    userId: 'user6',
    userName: 'Michael Davis',
    serviceType: 'attraction',
    destination: 'Disney World',
    departureDate: '2023-12-15',
    status: 'confirmed',
    price: 125,
    createdAt: '2023-09-27'
  }
];

// Mock taxi bookings
export const taxiBookings: Booking[] = [
  {
    id: 't1',
    userId: 'user1',
    userName: 'John Doe',
    serviceType: 'taxi',
    destination: 'JFK Airport',
    departureDate: '2023-10-14',
    status: 'confirmed',
    price: 45,
    createdAt: '2023-09-01'
  },
  {
    id: 't2',
    userId: 'user3',
    userName: 'Alice Johnson',
    serviceType: 'taxi',
    destination: 'LAX Airport',
    departureDate: '2023-11-04',
    status: 'confirmed',
    price: 55,
    createdAt: '2023-09-10'
  },
  {
    id: 't3',
    userId: 'user7',
    userName: 'Sophia Miller',
    serviceType: 'taxi',
    destination: 'JFK Airport',
    departureDate: '2023-12-09',
    status: 'pending',
    price: 50,
    createdAt: '2023-09-30'
  }
];

// Get bookings by service type
export const getBookingsByType = (type: 'flight' | 'bus' | 'attraction' | 'taxi'): Booking[] => {
  switch (type) {
    case 'flight':
      return flightBookings;
    case 'bus':
      return busBookings;
    case 'attraction':
      return attractionBookings;
    case 'taxi':
      return taxiBookings;
  }
};

// Get booking statistics
export const getBookingStats = (type: 'flight' | 'bus' | 'attraction' | 'taxi'): BookingStats[] => {
  const bookings = getBookingsByType(type);
  const stats: Record<string, number> = {};
  
  bookings.forEach(booking => {
    if (stats[booking.destination]) {
      stats[booking.destination]++;
    } else {
      stats[booking.destination] = 1;
    }
  });
  
  return Object.keys(stats).map(destination => ({
    destination,
    count: stats[destination]
  })).sort((a, b) => b.count - a.count);
};
