import dotenv from 'dotenv';
dotenv.config(); // Load .env variables
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
const port = process.env.BACKEND_PORT || 3001; // Use a port different from your frontend, e.g., 3001

// --- Middleware ---
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// --- Nodemailer Transporter Setup ---
const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10); // Default to 587
const emailSecure = process.env.EMAIL_SECURE === 'false' || emailPort === 465; // Secure true for port 465 or if explicitly set

console.log('Configuring transporter with:', {
  host: process.env.EMAIL_HOST,
  port: emailPort, // Use the parsed port
  secure: emailSecure, // Use the determined secure value
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? '***' : undefined
});
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: emailPort, // Use the parsed port
  secure: emailSecure, // Use the determined secure value
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  requireTLS: emailPort === 587, // Require TLS specifically for port 587 (STARTTLS)
  tls: {
    // Consider keeping rejectUnauthorized: false only for development/testing
    // In production, you should ideally use valid certificates.
    rejectUnauthorized: process.env.NODE_ENV !== 'production' // Example: false in dev, true in prod
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error configuring email transporter:', error);
  } else {
    console.log('Email transporter configured successfully. Ready to send emails.');
  }
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ success: false, message: 'Missing required fields: to, subject, body' });
  }
  const mailOptions = {
    from: `"ZippyTrip Admin" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: body,
  };
  try {
    // Verify connection before sending (optional but good for debugging)
    // await transporter.verify(); 
    // console.log('Transporter verified successfully.');

    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ success: true, message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    // Send back the actual error message from nodemailer for better debugging
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message || JSON.stringify(error) });
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});

// --- DELETE ALL CODE FROM HERE DOWN TO THE END OF THE FILE ---
// The following lines are duplicates and should be removed:
/*
// --- Nodemailer Transporter Setup ---
// Use credentials from your .env file
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // Check this value in .env
  port: parseInt(process.env.EMAIL_PORT || '587', 10), // Check this value in .env
  secure: process.env.EMAIL_SECURE === 'true', // Check this value in .env (false for 587 with STARTTLS)
  auth: {
    user: process.env.EMAIL_USER, // Your email address from .env
    pass: process.env.EMAIL_PASS, // Your email password or App Password from .env
  },
  // Explicitly configure TLS for STARTTLS on port 587
  tls: {
    ciphers:'SSLv3', // Try specifying cipher suite
    rejectUnauthorized: false // Set to true in production after testing, but false can help bypass cert issues during dev
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error configuring email transporter:', error);
  } else {
    console.log('Email transporter configured successfully. Ready to send emails.');
  }
});

// --- API Endpoint for Sending Email ---
app.post('/api/send-email', async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ success: false, message: 'Missing required fields: to, subject, body' });
  }

  const mailOptions = {
    from: `"ZippyTrip Admin" <${process.env.EMAIL_USER}>`, // Sender address (use your app name)
    to: to, // Recipient address from the request
    subject: subject, // Subject line from the request
    text: body, // Plain text body from the request
    // html: `<p>${body.replace(/\n/g, '<br>')}</p>` // Optional: Send HTML body
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ success: true, message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    // Provide more specific error feedback if possible
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
*/
// Make sure to delete all lines below the initial app.listen call.
dotenv.config(); // Load .env variables
console.log('Loaded ENV:', {
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_SECURE: process.env.EMAIL_SECURE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? '***' : undefined
});

// Add this endpoint to receive cancellations from the backend
app.post('/api/cancellations', async (req, res) => {
  try {
    const cancellationData = req.body;
    console.log('Received cancellation:', cancellationData);
    
    // Store in memory (replace with your actual storage solution)
    if (!app.locals.cancellations) {
      app.locals.cancellations = [];
    }
    
    app.locals.cancellations.push({
      ...cancellationData,
      received_at: new Date().toISOString()
    });
    
    // Emit socket event for real-time updates
    io.emit('new_cancellation', cancellationData);
    
    // Send email notification if needed
    if (cancellationData.userEmail) {
      try {
        await sendRealEmail(
          cancellationData.userEmail,
          'Your Booking Cancellation Confirmation',
          `Your booking has been cancelled successfully. Booking ID: ${cancellationData.bookingId}`
        );
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Continue processing even if email fails
      }
    }
    
    res.status(200).json({ success: true, message: 'Cancellation received and processed' });
  } catch (error) {
    console.error('Error processing cancellation:', error);
    res.status(500).json({ success: false, message: 'Error processing cancellation' });
  }
});

// Add an endpoint to retrieve cancellations
app.get('/api/cancellations', (req, res) => {
  const cancellations = app.locals.cancellations || [];
  res.json(cancellations);
});