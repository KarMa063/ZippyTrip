
export interface TripReminder {
  id: string;
  bookingId: string;
  routeDetails: string;
  travelDate: string;
  passengerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'sent' | 'failed';
  actions: string[];
}

// Dummy data for trip reminders
export const dummyTripReminders: TripReminder[] = [
  {
    id: "TR001",
    bookingId: "BK123",
    routeDetails: "Delhi to Mumbai Express",
    travelDate: "2024-02-25",
    passengerInfo: {
      name: "Prekshya Panta khatri",
      email: "pantaprekshya9@gmail.com",
      phone: "+91 98765 43210"
    },
    status: "pending",
    actions: ["Send Reminder", "Cancel"]
  },
  {
    id: "TR002",
    bookingId: "BK124",
    routeDetails: "Bangalore to Chennai",
    travelDate: "2024-02-26",
    passengerInfo: {
      name: "Jane Smith",
      email: "avishekkadel4@gmail.com",
      phone: "+91 98765 43211"
    },
    status: "sent",
    actions: ["Resend", "Cancel"]
  },
  {
    id: "TR003",
    bookingId: "BK125",
    routeDetails: "Pune to Goa",
    travelDate: "2024-02-27",
    passengerInfo: {
      name: "Mike Johnson",
      email: "avishekkadel45@gmail.com",
      phone: "+91 98765 43212"
    },
    status: "failed",
    actions: ["Retry", "Cancel"]
  }
];

// Function to fetch trip reminders
export const fetchTripReminders = async (): Promise<TripReminder[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return dummyTripReminders;
};

import { sendEmail, EmailNotification } from '@/services/email';

// Function to send a trip reminder
export const sendTripReminder = async (reminderId: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const reminder = dummyTripReminders.find(r => r.id === reminderId);
  if (!reminder) return false;
  
  try {
    const routeParts = reminder.routeDetails.split(' to ');
    const origin = routeParts[0] || '';
    const destination = routeParts.length > 1 ? routeParts[1] : '';
    
    // Create email notification object
    const notification: EmailNotification = {
      to: reminder.passengerInfo.email,
      subject: 'Reminder: Your Upcoming Bus Trip',
      body: `
Dear ${reminder.passengerInfo.name},

This is a reminder for your upcoming bus trip:
Route: ${reminder.routeDetails}
From: ${origin}
To: ${destination}
Departure: ${new Date(reminder.travelDate).toLocaleString()}

Please arrive at least 30 minutes before departure.
Do contact us if you need to reschedule or cancel your trip.
We hope you'll enjoy your journey.
Safe travels!
ZippyTrip Team
      `
    };
    
    // Send email using the browser-compatible email service
    // If sendEmail returns false or throws, this function will return false
    return await sendEmail(notification); 
  } catch (error) {
    console.error('Failed to send trip reminder:', error);
    return false; // Returns false on error
  }
};
