import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      }
    }
  }
});

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  return { data, error };
};

export const generateBookingNumber = () => {
  return `BK${Date.now().toString(36).toUpperCase()}`;
};

export const createHotelBooking = async (
  userId: string,
  hotelId: string,
  roomType: string,
  checkIn: string,
  checkOut: string,
  totalPrice: number,
  paymentMethod: 'card' | 'cash'
) => {
  try {
    // First create the hotel booking
    const { data: bookingData, error: bookingError } = await supabase
      .from('hotel_bookings')
      .insert([
        {
          user_id: userId,
          hotel_id: hotelId,
          room_type: roomType,
          check_in_date: checkIn,
          check_out_date: checkOut,
          total_price: totalPrice,
          payment_method: paymentMethod,
          status: paymentMethod === 'card' ? 'confirmed' : 'pending'
        }
      ])
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Then create the ticket
    const bookingNumber = generateBookingNumber();
    const qrCode = `hotel-${bookingData.id}-${bookingNumber}`;

    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .insert([
        {
          user_id: userId,
          booking_type: 'hotel',
          booking_id: bookingData.id,
          booking_number: bookingNumber,
          qr_code: qrCode,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (ticketError) throw ticketError;

    return {
      booking: bookingData,
      ticket: ticketData
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getHotelBookings = async (userId: string) => {
  const { data, error } = await supabase
    .from('hotel_bookings')
    .select(`
      *,
      hotels (
        name,
        location,
        image_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getHotels = async (location: string) => {
  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('location', location)
    .order('rating', { ascending: false });

  if (error) throw error;
  return data;
};

export const saveTicket = async (userId: string, bookingType: 'flight' | 'bus' | 'hotel', bookingId: string) => {
  const bookingNumber = generateBookingNumber();
  const qrCode = `${bookingType}-${bookingId}-${bookingNumber}`;

  const { data, error } = await supabase
    .from('tickets')
    .insert([
      {
        user_id: userId,
        booking_type: bookingType,
        booking_id: bookingId,
        booking_number: bookingNumber,
        qr_code: qrCode,
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserTickets = async (userId: string) => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      hotel_bookings (
        *,
        hotels (
          name,
          location
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};