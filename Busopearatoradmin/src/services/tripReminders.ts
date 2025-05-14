
export interface TripReminder {
  id: string;
  bookingId: string;
  departureTime: string;
  email: string;
  seat_numbers: string[];
  status: 'pending' | 'sent' | 'failed';
}

import { query } from '@/integrations/neon/client';
import { sendEmail, EmailNotification } from '@/services/email';

// Function to fetch trip reminders from Neon DB
export const fetchTripReminders = async (): Promise<TripReminder[]> => {
  try {
    // Fetch bookings with related data using Neon
    const result = await query(`
      SELECT 
        b.id,
        b.seat_numbers,
        email,
        b.status as reminder_status,
        s.departure_time
      FROM 
        bookings b
      LEFT JOIN 
        schedules s ON b.schedule_id = s.id
      ORDER BY 
        s.departure_time DESC
    `);

    // Transform the data to match TripReminder interface
    const reminders: TripReminder[] = result.rows.map(booking => ({
      id: booking.id,
      bookingId: booking.id.substring(0, 8),
      departureTime: booking.departure_time || 'Unknown',
      email: booking.email || 'No email provided',
      seat_numbers: Array.isArray(booking.seat_numbers) ? booking.seat_numbers : 
                   (booking.seat_numbers ? [booking.seat_numbers] : []),
      status: booking.reminder_status || 'pending'
    }));

    return reminders;
  } catch (error) {
    console.error('Error fetching trip reminders:', error);
    throw error;
  }
};

// Function to send a trip reminder
export const sendTripReminder = async (reminderId: string): Promise<boolean> => {
  try {
    // Get the booking details using Neon
    const result = await query(`
      SELECT 
        b.id,
        b.seat_numbers,
        b.email,
        b.status as reminder_status,
        s.departure_time
      FROM 
        bookings b
      LEFT JOIN 
        schedules s ON b.schedule_id = s.id
      WHERE 
        b.id = $1
    `, [reminderId]);

    if (result.rows.length === 0) return false;
    
    const booking = result.rows[0];
    
    // Ensure seat_numbers is an array
    const seatNumbers = Array.isArray(booking.seat_numbers) ? booking.seat_numbers : 
                       (booking.seat_numbers ? [booking.seat_numbers] : []);
    
    // Create email notification object
    const notification: EmailNotification = {
      to: booking.email,
      subject: 'Reminder: Your Upcoming Bus Trip',
      body: `
Dear Traveler,

This is a reminder for your upcoming bus trip:
Departure: ${new Date(booking.departure_time).toLocaleString()}
Seats: ${seatNumbers.join(', ') || 'N/A'}

Please arrive at least 30 minutes before departure.

Safe travels!
ZippyTrip Team
      `
    };
    
    // Send email
    const emailSent = await sendEmail(notification);
    
    if (emailSent) {
      // Update the reminder status in the database
      await query(
        `UPDATE bookings SET status = 'sent', updated_at = NOW() WHERE id = $1`,
        [reminderId]
      );
    }
    
    return emailSent;
  } catch (error) {
    console.error('Failed to send trip reminder:', error);
    
    // Update status to failed
    try {
      await query(
        `UPDATE bookings SET status = 'failed', updated_at = NOW() WHERE id = $1`,
        [reminderId]
      );
    } catch (updateError) {
      console.error('Failed to update reminder status:', updateError);
    }
    
    return false;
  }
};
