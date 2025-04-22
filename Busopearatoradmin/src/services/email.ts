
// Browser-compatible email service simulation
export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
}

// This function now calls your backend API endpoint
export const sendEmail = async (notification: EmailNotification): Promise<boolean> => {
  try {
    // Use the environment variable for the backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'; // Default fallback
    const apiUrl = `${backendUrl}/api/send-email`;

    console.log(`Sending email request to: ${apiUrl}`); // Add log to verify URL

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      // Handle API errors (e.g., log them, show user message)
      console.error('API Error:', response.status, await response.text());
      return false;
    }

    console.log('Email request sent to backend successfully.');
    return true; // Assume success if API call is ok

  } catch (error) {
    console.error('Error sending email via API:', error);
    return false;
  }
};
