import { query } from '@/integrations/neon/client';
import { fetchRoutes } from "./routes";
import { Bus } from "./buses";

// Type definitions
export type Schedule = {
  id: string;
  route_id: string;
  bus_id: string;
  driver_id?: string; // Add driver_id to the Schedule type
  departure_time: string;
  arrival_time: string;
  fare: number;
  available_seats: number;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
};

// Define Route type here since it's not exported from routes.ts
export type Route = {
  id: string;
  name: string;
  origin: string;
  destination: string;
};

// Enhanced types that include related data
export type ScheduleWithRelations = Schedule & {
  routes?: Route;
  buses?: Bus;
  driver_name?: string; // Add driver_name
  driver_phone?: string; // Add driver_phone
};

// Update ScheduleInsert and ScheduleUpdate to include driver_id
export type ScheduleInsert = Omit<Schedule, 'id' | 'created_at' | 'updated_at' | 'routes' | 'buses'>;
export type ScheduleUpdate = Partial<Omit<Schedule, 'id' | 'created_at' | 'updated_at' | 'routes' | 'buses'>>;

export const fetchSchedules = async (date?: string) => {
  console.log("Fetching schedules for date:", date);
  try {
    let sqlQuery = `
      SELECT 
        s.*,
        r.id as route_id, r.name as route_name, r.origin as route_origin, r.destination as route_destination,
        b.id as bus_id, b.registration_number, b.model, b.capacity,
        d.id as driver_id, d.name as driver_name, d.phone as driver_phone
      FROM schedules s
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN buses b ON s.bus_id = b.id
      LEFT JOIN drivers d ON s.driver_id = d.id
    `;
    
    const params: any[] = [];
    
    if (date) {
      // Use DATE() function to extract just the date part for comparison
      sqlQuery += ` WHERE DATE(s.departure_time) = $1`;
      params.push(date);
    }
    
    sqlQuery += ` ORDER BY s.departure_time ASC`;
    
    const result = await query(sqlQuery, params);
    
    // Transform the data to include related information
    const schedules = result.rows.map(row => {
      const departureDate = new Date(row.departure_time);
      return {
        id: row.id,
        routeId: row.route_id,
        route: row.route_name,
        origin: row.route_origin,
        destination: row.route_destination,
        busId: row.bus_id,
        bus: row.registration_number,
        driverId: row.driver_id,
        driver: row.driver_name,
        driverPhone: row.driver_phone,
        date: departureDate.toISOString().split('T')[0],
        departureTime: departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        arrivalTime: new Date(row.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fare: row.fare,
        availableSeats: row.available_seats,
        status: row.is_active ? 'scheduled' : 'cancelled',
        capacity: row.capacity || 0,
        bookedSeats: row.capacity ? (row.capacity - row.available_seats) : 0,
        totalSeats: row.capacity || 0
      };
    });
    
    console.log("Fetched schedules:", schedules);
    return schedules;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};

export const getSchedule = async (id: string) => {
  try {
    const sqlQuery = `
      SELECT 
        s.*,
        r.id as route_id, r.name as route_name, r.origin as route_origin, r.destination as route_destination,
        b.id as bus_id, b.registration_number, b.model, b.capacity, b.amenities, b.is_active as bus_is_active, 
        b.created_at as bus_created_at, b.updated_at as bus_updated_at,
        d.id as driver_id, d.name as driver_name, d.phone as driver_phone
      FROM schedules s
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN buses b ON s.bus_id = b.id
      LEFT JOIN drivers d ON s.driver_id = d.id
      WHERE s.id = $1
    `;
    
    const result = await query(sqlQuery, [id]);
    
    if (result.rows.length === 0) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    
    const row = result.rows[0];
    
    // Transform to expected format
    const schedule: ScheduleWithRelations = {
      id: row.id,
      route_id: row.route_id,
      bus_id: row.bus_id,
      driver_id: row.driver_id,
      departure_time: row.departure_time,
      arrival_time: row.arrival_time,
      fare: row.fare,
      available_seats: row.available_seats,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      routes: row.route_id ? {
        id: row.route_id,
        name: row.route_name,
        origin: row.route_origin,
        destination: row.route_destination
      } : undefined,
      buses: row.bus_id ? {
        id: row.bus_id,
        registration_number: row.registration_number,
        model: row.model,
        capacity: row.capacity,
        amenities: row.amenities,
        is_active: row.bus_is_active,
        created_at: row.bus_created_at,
        updated_at: row.bus_updated_at
      } : undefined,
      driver_name: row.driver_name,
      driver_phone: row.driver_phone
    };
    
    return schedule;
  } catch (err) {
    console.error("Error in getSchedule:", err);
    throw err;
  }
};

export const createSchedule = async (scheduleData: ScheduleInsert) => {
  console.log("Creating new schedule with data:", scheduleData);
  try {
    const { route_id, bus_id, departure_time, arrival_time, fare, available_seats, is_active } = scheduleData;
    
    const result = await query(
      `INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, fare, available_seats, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [route_id, bus_id, departure_time, arrival_time, fare, available_seats, is_active]
    );
    
    console.log("Schedule created successfully:", result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error("Error in createSchedule:", err);
    throw err;
  }
};

export const updateSchedule = async (id: string, scheduleData: ScheduleUpdate) => {
  console.log("Updating schedule with ID:", id, "Data:", scheduleData);
  try {
    const { route_id, bus_id, driver_id, departure_time, arrival_time, fare, available_seats, is_active } = scheduleData;
    
    // Build the SET part of the query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (route_id !== undefined) {
      updates.push(`route_id = $${paramIndex}`);
      values.push(route_id);
      paramIndex++;
    }
    
    if (bus_id !== undefined) {
      updates.push(`bus_id = $${paramIndex}`);
      values.push(bus_id);
      paramIndex++;
    }
    
    if (driver_id !== undefined) {
      updates.push(`driver_id = $${paramIndex}`);
      values.push(driver_id);
      paramIndex++;
    }
    
    if (departure_time !== undefined) {
      updates.push(`departure_time = $${paramIndex}`);
      values.push(departure_time);
      paramIndex++;
    }
    
    if (arrival_time !== undefined) {
      updates.push(`arrival_time = $${paramIndex}`);
      values.push(arrival_time);
      paramIndex++;
    }
    
    if (fare !== undefined) {
      updates.push(`fare = $${paramIndex}`);
      values.push(fare);
      paramIndex++;
    }
    
    if (available_seats !== undefined) {
      updates.push(`available_seats = $${paramIndex}`);
      values.push(available_seats);
      paramIndex++;
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }
    
    // Add the ID as the last parameter
    values.push(id);
    
    const result = await query(
      `UPDATE schedules SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    
    console.log("Schedule updated successfully:", result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error("Error in updateSchedule:", err);
    throw err;
  }
};

export const deleteSchedule = async (id: string) => {
  try {
    await query('DELETE FROM schedules WHERE id = $1', [id]);
    return true;
  } catch (err) {
    console.error("Error in deleteSchedule:", err);
    throw err;
  }
};

export const cancelSchedule = async (scheduleId: string, reason: string) => {
  try {
    // First update the schedule to inactive
    const updateResult = await query(
      `UPDATE schedules SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [scheduleId]
    );
    
    if (updateResult.rows.length === 0) {
      throw new Error(`Schedule with ID ${scheduleId} not found`);
    }
    
    // Then create a cancellation record
    const cancellationResult = await query(
      `INSERT INTO cancellation_notifications (schedule_id, reason, created_at) 
       VALUES ($1, $2, NOW()) 
       RETURNING *`,
      [scheduleId, reason]
    );
    
    return {
      schedule: updateResult.rows[0],
      cancellation: cancellationResult.rows[0]
    };
  } catch (error) {
    console.error('Error cancelling schedule:', error);
    throw error;
  }
};
