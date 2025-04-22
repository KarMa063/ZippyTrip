require('dotenv').config(); // Load .env variables
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const port = process.env.BACKEND_PORT || 3001; // Use a port different from your frontend, e.g., 3001

// --- Middleware ---
// Enable CORS for requests from your frontend (adjust origin if needed)
// For development, allowing all origins might be okay, but be more specific for production.
app.use(cors()); 
app.use(express.json()); // To parse JSON request bodies

// --- Nodemailer Transporter Setup ---
// Use credentials from your .env file
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address from .env
    pass: process.env.EMAIL_PASS, // Your Gmail App Password from .env
  },
  // Optional: Add TLS options if needed, e.g., for local testing issues
  // tls: {
  //   rejectUnauthorized: false 
  // }
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