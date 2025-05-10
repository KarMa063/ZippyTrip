
import { query } from '@/integrations/neon/client';
import { EmailNotification, sendEmail } from '../email';

export const sendTripNotification = async (
  email: string,
  type: 'reminder' | 'delay' | 'cancellation',
  tripDetails: {
    routeName: string,
    origin: string,
    destination: string,
    departureTime: string,
    seatNumbers: string[]
  }
): Promise<boolean> => {
  const subjects = {
    reminder: 'Reminder: Your Upcoming Bus Trip',
    delay: 'Important: Your Bus Trip Has Been Delayed',
    cancellation: 'Notice: Your Bus Trip Has Been Cancelled'
  };

  const messages = {
    reminder: `
      Dear Passenger,
      
      This is a reminder for your upcoming bus trip:
      Route: ${tripDetails.routeName}
      From: ${tripDetails.origin}
      To: ${tripDetails.destination}
      Departure: ${new Date(tripDetails.departureTime).toLocaleString()}
      Seat(s): ${tripDetails.seatNumbers.join(', ')}
      
      Please arrive at least 30 minutes before departure.
      
      Safe travels!
      ZippyTrip Team
    `,
    delay: `
      Dear Passenger,
      
      We regret to inform you that your bus trip has been delayed:
      Route: ${tripDetails.routeName}
      From: ${tripDetails.origin}
      To: ${tripDetails.destination}
      Original Departure: ${new Date(tripDetails.departureTime).toLocaleString()}
      
      We will notify you of the new departure time shortly.
      We apologize for any inconvenience caused.
      
      ZippyTrip Team
    `,
    cancellation: `
      Dear Passenger,
      
      We regret to inform you that your bus trip has been cancelled:
      Route: ${tripDetails.routeName}
      From: ${tripDetails.origin}
      To: ${tripDetails.destination}
      Original Departure: ${new Date(tripDetails.departureTime).toLocaleString()}
      
      Our customer service team will contact you regarding refund procedures.
      We sincerely apologize for any inconvenience caused.
      
      ZippyTrip Team
    `
  };

  const notification: EmailNotification = {
    to: email,
    subject: subjects[type],
    body: messages[type]
  };

  try {
    // Send the email
    const emailSent = await sendEmail(notification);
    
    // Log the notification in the database
    await query(
      `INSERT INTO notifications (
        recipient_email, notification_type, subject, message, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [email, type, subjects[type], messages[type], emailSent ? 'sent' : 'failed']
    );
    
    return emailSent;
  } catch (error) {
    console.error('Error sending trip notification:', error);
    
    // Log the failed notification
    try {
      await query(
        `INSERT INTO notifications (
          recipient_email, notification_type, subject, message, status, error_message, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [email, type, subjects[type], messages[type], 'failed', error.message || 'Unknown error']
      );
    } catch (logError) {
      console.error('Error logging notification failure:', logError);
    }
    
    return false;
  }
};
