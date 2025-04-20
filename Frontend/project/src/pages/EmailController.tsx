import emailjs from '@emailjs/browser';
import React from "react";

emailjs.init("00yKrhJ5D0m_ow_w2");

interface BusDetails {
    email: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
    operator: string;
    date: string;
    passengerName: string;
    seats: string[];
    busType: string;
}

// Function to send bus rental reminder
export const sendBusReminder = async (details: BusDetails) => {
    try {
        console.log('Sending bus reminder with details:', details);
        
        const response = await emailjs.send(
            "service_529qzso",
            "template_5z01v4p",
            {
                email: details.email,
                name: details.passengerName,
                from: details.from,
                to: details.to,
                departure: details.departure,
                arrival: details.arrival,
                operator: details.operator,
                date: details.date,
                bus_type: details.busType,
                seats: details.seats.join(", "),
                title: "Bus Booking Confirmation"
            },
            "00yKrhJ5D0m_ow_w2"
        );
        console.log('Email sent successfully:', response);
        return response;
    } catch (error) {
        console.error("Error sending bus reminder:", error);
        throw error;
    }
};

// Test function to verify email sending
export const testEmailSending = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
        const templateParams = {
            email: email,  
            name: "Test User", 
            title: "Test Email",
            message: "This is a test email to verify the email sending functionality is working correctly."
        };

        await emailjs.send(
            "service_529qzso",
            "template_jj4z6fk",
            templateParams,
            "00yKrhJ5D0m_ow_w2"
        );
        return { success: true, message: "Test email sent successfully!" };
    } catch (error) {
        console.error("Failed to send test email:", error);
        return { success: false, message: "Failed to send test email." };
    }
};


export const sendEmail = async (formRef: React.RefObject<HTMLFormElement>) => {
    if (!formRef.current) return;

    try {
        const response = await emailjs.sendForm(
            'service_529qzso',
            'template_jj4z6fk',
            formRef.current,
            'user_00yKrhJ5D0m_ow_w2'
        );
        alert('Email sent successfully!');
        return response;
    } catch (error) {
        console.error('Error sending email:', error);
        alert('Failed to send email. Please try again.');
        throw error;
    }
};

    
const EmailForm: React.FC = () => {
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendEmail(formRef);
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit}>
            <input type="text" name="user_name" placeholder="Full Name" required />
            <input type="email" name="user_email" placeholder="Email" required />
            <button type="submit">Send Email</button>
        </form>
    );
};

export default EmailForm; 