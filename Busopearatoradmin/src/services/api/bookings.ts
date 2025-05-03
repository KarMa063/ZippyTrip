import { supabase } from "@/integrations/supabase/client";
import { Schedule } from "./schedules";
import { ValidTableName, fromSafeTable } from "@/utils/tableTypes";

// Define simpler types to avoid circular references
export type BookingSchedule = {
  id: string;
  departure_time: string;
  arrival_time: string;
  route_id: string;
  bus_id: string;
  routes?: {
    id: string;
    name: string;
    origin: string;
    destination: string;
  };
  buses?: {
    id: string;
    registration_number: string;
    model: string;
  };
};

// Type definitions
export type Booking = {
  id: string;
  user_id: string;
  schedule_id: string;
  booking_date: string;
  total_fare: number;
  seat_numbers: string[];
  status: string | null;
  payment_method: string | null;
  payment_id: string | null;
  payment_status: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingWithRelations = Booking & {
  schedules?: BookingSchedule;
};

export type BookingInsert = Omit<Booking, 'id' | 'created_at' | 'updated_at'>;
export type BookingUpdate = Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>;

export const fetchBookings = async () => {
  console.log("Fetching bookings...");
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        schedules (
          id,
          departure_time,
          arrival_time,
          routes (
            id,
            name,
            origin,
            destination
          ),
          buses (
            id,
            registration_number,
            model
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
    
    console.log("Fetched bookings:", data);
    return data as BookingWithRelations[];
  } catch (err) {
    console.error("Error in fetchBookings:", err);
    throw err;
  }
};

export const getUserBookings = async (userId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      schedules (
        id,
        departure_time,
        arrival_time,
        routes (
          id,
          name,
          origin,
          destination
        ),
        buses (
          id,
          registration_number,
          model
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getBooking = async (id: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      schedules (
        id,
        departure_time,
        arrival_time,
        routes (
          id,
          name,
          origin,
          destination
        ),
        buses (
          id,
          registration_number,
          model
        )
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const processBooking = async (bookingData: {
  scheduleId: string;
  userId: string;
  seatNumbers: string[];
  totalFare: number;
  paymentMethod: string;
}) => {
  const { scheduleId, userId, seatNumbers, totalFare, paymentMethod } = bookingData;
  
  try {
    const response = await supabase.functions.invoke('process-booking', {
      body: { scheduleId, userId, seatNumbers, totalFare, paymentMethod }
    });
    
    if (response.error) throw response.error;
    return response.data;
  } catch (error) {
    console.error('Error processing booking:', error);
    throw error;
  }
};

export const updateBooking = async (id: string, bookingData: BookingUpdate) => {
  const { data, error } = await supabase
    .from('bookings')
    .update(bookingData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data;
};

export const deleteBooking = async (id: string) => {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};
