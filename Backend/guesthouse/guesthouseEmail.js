const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: 'shakyapriti66@gmail.com',
        pass: 'nsoziybgabxehnld'
    }
});

function sendEmail(guestEmail, propertyName, roomName, checkInDate, checkOutDate, totalPrice) {
    transporter.sendMail({
        to: guestEmail,
        subject: 'Booking Confirmation - Your Stay at Guest House is Confirmed!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
         <h2 style="color: #2d3748;">Booking Confirmation</h2>
         <p>Dear Guest,</p>
         <p>We're excited to confirm your booking at <strong>${propertyName}</strong>!</p>
        
         <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
           <h3 style="color: #4a5568; margin-top: 0;">Booking Details</h3>
           <ul style="list-style-type: none; padding: 0;">
             <li><strong>Property:</strong> ${propertyName}</li>
             <li><strong>Room:</strong> ${roomName}</li>
             <li><strong>Check-in:</strong> ${new Date(checkInDate).toLocaleDateString()}</li>
             <li><strong>Check-out:</strong> ${new Date(checkOutDate).toLocaleDateString()}</li>
             <li><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</li>
           </ul>
         </div>
        
         <p>We look forward to welcoming you! If you have any questions before your arrival, please don't hesitate to contact us.</p>
        
         <p>Best regards,<br/>
         <strong>The ${propertyName} Team</strong></p>
        
         <div style="margin-top: 24px; font-size: 12px; color: #718096;">
           <p>This is an automated message. Please do not reply directly to this email.</p>
         </div>
       </div>`
    })
    console.log('Email sent');
}

sendEmail('shakyapriti66@gmail.com', 'Guest House', 'Room 1', '2023-08-01', '2023-08-05', 100);