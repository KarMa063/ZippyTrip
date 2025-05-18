import emailjs from '@emailjs/browser';
import React from "react";

emailjs.init("PiBgwjGtX3mA0xO-H");

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
            "service_9qg79tj",
            "template_vq12jp5",
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
            "PiBgwjGtX3mA0xO-H"
        );
        console.log('Email sent successfully:', response);
        return response;
    } catch (error) {
        console.error("Error sending bus reminder:", error);
        throw error;
    }
};

interface RoomBookingDetails {
    email: string;
    guestName: string;
    guestHouseName: string;
    roomName: string;
    checkInDate: string;
    checkOutDate: string;
    price: number;
    location: string;
    guests: number;
}

// Function to send room booking confirmation email
export const sendRoomBookingConfirmation = async (details: RoomBookingDetails) => {
    try {
        console.log('Sending room booking confirmation with details:', details);
        
        const response = await emailjs.send(
            "service_9qg79tj",
            "template_1tg2m59",
            {
                email: details.email,
                name: details.guestName,
                guesthouse_name: details.guestHouseName,
                room_name: details.roomName,
                check_in: details.checkInDate,
                check_out: details.checkOutDate,
                price: `Rs. ${details.price}`,
                location: details.location,
                guests: details.guests,
                title: "Room Booking Confirmation"
            },
            "PiBgwjGtX3mA0xO-H"
        );
        console.log('Room booking email sent successfully:', response);
        return response;
    } catch (error) {
        console.error("Error sending room booking confirmation:", error);
        throw error;
    }
};

export const sendEmail = async (formRef: React.RefObject<HTMLFormElement>) => {
    if (!formRef.current) return;

    try {
        const response = await emailjs.sendForm(
            "service_zds5xi3",
            "template_nyvk1ep",
            formRef.current,
            'user_PiBgwjGtX3mA0xO-H'
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