// Example backend email sending logic (e.g., in server.js or an API route)
require('dotenv').config(); // Load variables from .env file
const nodemailer = require('nodemailer');

// Configure the transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'false', // true for 465, false for other ports (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Optional: Add TLS options if needed, e.g., for self-signed certs
  // tls: {
  //   rejectUnauthorized: false
  // }
});

// Function to be called by your API endpoint
async function sendRealEmail(to, subject, body) {
  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_USER}>`, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: body, // plain text body
    // html: "<b>Hello world?</b>", // You can also send HTML body
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Example usage (you'd call this from your API route handler)
// sendRealEmail('recipient@example.com', 'Test Subject', 'This is the email body.');

module.exports = { sendRealEmail }; // Export if needed elsewhere