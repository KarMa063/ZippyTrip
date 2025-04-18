
export interface Booking {
  id: string;
  userId: string;
  userName: string;
  serviceType: 'flight' | 'bus' | 'attraction' | 'taxi';
  destination: string;
  departureDate: string;
  returnDate?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  createdAt: string;
}

export interface BookingStats {
  destination: string;
  count: number;
}
