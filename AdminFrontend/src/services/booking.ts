import { query } from '@/integrations/neon/client';

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
    const sqlQuery = `
      SELECT 
        b.*,
        s.id as schedule_id, s.departure_time, s.arrival_time, s.route_id, s.bus_id,
        r.id as route_id, r.name as route_name, r.origin as route_origin, r.destination as route_destination,
        bs.id as bus_id, bs.registration_number, bs.model
      FROM bookings b
      LEFT JOIN schedules s ON b.schedule_id = s.id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN buses bs ON s.bus_id = bs.id
      ORDER BY b.created_at DESC
    `;
    
    const result = await query(sqlQuery);
    
    // Transform the flat result into the expected nested structure
    const bookings = result.rows.map(row => {
      const booking: BookingWithRelations = {
        id: row.id,
        user_id: row.user_id,
        schedule_id: row.schedule_id,
        booking_date: row.booking_date,
        total_fare: row.total_fare,
        seat_numbers: row.seat_numbers,
        status: row.status,
        payment_method: row.payment_method,
        payment_id: row.payment_id,
        payment_status: row.payment_status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        schedules: row.schedule_id ? {
          id: row.schedule_id,
          departure_time: row.departure_time,
          arrival_time: row.arrival_time,
          route_id: row.route_id,
          bus_id: row.bus_id,
          routes: row.route_id ? {
            id: row.route_id,
            name: row.route_name,
            origin: row.route_origin,
            destination: row.route_destination
          } : undefined,
          buses: row.bus_id ? {
            id: row.bus_id,
            registration_number: row.registration_number,
            model: row.model
          } : undefined
        } : undefined
      };
      return booking;
    });
    
    console.log("Fetched bookings:", bookings);
    return bookings;
  } catch (err) {
    console.error("Error in fetchBookings:", err);
    throw err;
  }
};

export const getUserBookings = async (userId: string) => {
  try {
    const sqlQuery = `
      SELECT 
        b.*,
        s.id as schedule_id, s.departure_time, s.arrival_time, s.route_id, s.bus_id,
        r.id as route_id, r.name as route_name, r.origin as route_origin, r.destination as route_destination,
        bs.id as bus_id, bs.registration_number, bs.model
      FROM bookings b
      LEFT JOIN schedules s ON b.schedule_id = s.id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN buses bs ON s.bus_id = bs.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;
    
    const result = await query(sqlQuery, [userId]);
    
    // Transform the flat result into the expected nested structure
    const bookings = result.rows.map(row => {
      const booking: BookingWithRelations = {
        id: row.id,
        user_id: row.user_id,
        schedule_id: row.schedule_id,
        booking_date: row.booking_date,
        total_fare: row.total_fare,
        seat_numbers: row.seat_numbers,
        status: row.status,
        payment_method: row.payment_method,
        payment_id: row.payment_id,
        payment_status: row.payment_status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        schedules: row.schedule_id ? {
          id: row.schedule_id,
          departure_time: row.departure_time,
          arrival_time: row.arrival_time,
          route_id: row.route_id,
          bus_id: row.bus_id,
          routes: row.route_id ? {
            id: row.route_id,
            name: row.route_name,
            origin: row.route_origin,
            destination: row.route_destination
          } : undefined,
          buses: row.bus_id ? {
            id: row.bus_id,
            registration_number: row.registration_number,
            model: row.model
          } : undefined
        } : undefined
      };
      return booking;
    });
    
    return bookings;
  } catch (err) {
    console.error("Error in getUserBookings:", err);
    throw err;
  }
};

export const getBooking = async (id: string) => {
  try {
    const sqlQuery = `
      SELECT 
        b.*,
        s.id as schedule_id, s.departure_time, s.arrival_time, s.route_id, s.bus_id,
        r.id as route_id, r.name as route_name, r.origin as route_origin, r.destination as route_destination,
        bs.id as bus_id, bs.registration_number, bs.model
      FROM bookings b
      LEFT JOIN schedules s ON b.schedule_id = s.id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN buses bs ON s.bus_id = bs.id
      WHERE b.id = $1
    `;
    
    const result = await query(sqlQuery, [id]);
    
    if (result.rows.length === 0) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    const row = result.rows[0];
    
    // Transform to expected format
    const booking: BookingWithRelations = {
      id: row.id,
      user_id: row.user_id,
      schedule_id: row.schedule_id,
      booking_date: row.booking_date,
      total_fare: row.total_fare,
      seat_numbers: row.seat_numbers,
      status: row.status,
      payment_method: row.payment_method,
      payment_id: row.payment_id,
      payment_status: row.payment_status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      schedules: row.schedule_id ? {
        id: row.schedule_id,
        departure_time: row.departure_time,
        arrival_time: row.arrival_time,
        route_id: row.route_id,
        bus_id: row.bus_id,
        routes: row.route_id ? {
          id: row.route_id,
          name: row.route_name,
          origin: row.route_origin,
          destination: row.route_destination
        } : undefined,
        buses: row.bus_id ? {
          id: row.bus_id,
          registration_number: row.registration_number,
          model: row.model
        } : undefined
      } : undefined
    };
    
    return booking;
  } catch (err) {
    console.error("Error in getBooking:", err);
    throw err;
  }
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
    // Start a transaction
    await query('BEGIN');
    
    // Insert the booking
    const bookingResult = await query(
      `INSERT INTO bookings (
        user_id, schedule_id, booking_date, total_fare, seat_numbers, 
        status, payment_method, payment_status
      ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7) RETURNING *`,
      [userId, scheduleId, totalFare, seatNumbers, 'pending', paymentMethod, 'pending']
    );
    
    // Update available seats in the schedule
    const scheduleResult = await query(
      `UPDATE schedules 
       SET available_seats = available_seats - $1, updated_at = NOW() 
       WHERE id = $2 RETURNING *`,
      [seatNumbers.length, scheduleId]
    );
    
    // Commit the transaction
    await query('COMMIT');
    
    return {
      booking: bookingResult.rows[0],
      updatedSchedule: scheduleResult.rows[0]
    };
  } catch (error) {
    // Rollback in case of error
    await query('ROLLBACK');
    console.error('Error processing booking:', error);
    throw error;
  }
};

export const updateBooking = async (id: string, bookingData: BookingUpdate) => {
  try {
    // Build the SET part of the query dynamically based on provided fields
    const updates = Object.entries(bookingData)
      .filter(([_, value]) => value !== undefined)
      .map(([key], index) => `${key} = $${index + 2}`);
    
    const values = Object.values(bookingData).filter(value => value !== undefined);
    
    if (updates.length === 0) return null; // No updates to make
    
    const sqlQuery = `
      UPDATE bookings 
      SET ${updates.join(', ')}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await query(sqlQuery, [id, ...values]);
    return result.rows[0];
  } catch (err) {
    console.error("Error in updateBooking:", err);
    throw err;
  }
};

export const deleteBooking = async (id: string) => {
  try {
    await query('DELETE FROM bookings WHERE id = $1', [id]);
    return true;
  } catch (err) {
    console.error("Error in deleteBooking:", err);
    throw err;
  }
};

