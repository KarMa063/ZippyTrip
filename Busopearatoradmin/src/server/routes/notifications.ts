
import { sendTripNotification } from '../../services/api/notifications';

export const sendNotification = async (
  email: string, 
  type: 'reminder' | 'delay' | 'cancellation',
  tripDetails: {
    routeName: string,
    origin: string,
    destination: string,
    departureTime: string,
    seatNumbers: string[]
  }
) => {
  try {
    const success = await sendTripNotification(email, type, tripDetails);
    return { success, message: 'Notification sent successfully' };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, message: 'Failed to send notification' };
  }
};
