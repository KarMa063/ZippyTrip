
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  bookingId: string;
  emailType: "confirmation" | "admin-notification";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { bookingId, emailType }: BookingEmailRequest = await req.json();
    
    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: "Booking ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select(`
        id,
        user_id,
        total_fare,
        seat_numbers,
        status,
        payment_status,
        schedules (
          id,
          departure_time,
          arrival_time,
          routes (
            name,
            origin,
            destination
          ),
          buses (
            registration_number,
            model
          )
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError);
      return new Response(
        JSON.stringify({ error: "Booking not found", details: bookingError }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user details
    const { data: userProfile, error: userError } = await supabaseClient
      .from("user_profiles")
      .select("first_name, last_name, phone")
      .eq("id", booking.user_id)
      .single();

    if (userError) {
      console.error("Error fetching user profile:", userError);
    }

    // Get user email from auth.users
    const { data: userData, error: userDataError } = await supabaseClient
      .auth
      .admin
      .getUserById(booking.user_id);

    if (userDataError) {
      console.error("Error fetching user data:", userDataError);
      return new Response(
        JSON.stringify({ error: "User not found", details: userDataError }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // In a production environment, you would connect to an email service like SendGrid, Resend, etc.
    // For this demo, we'll just log the email details
    
    const emailContent = {
      to: userData.user.email,
      subject: emailType === "confirmation" 
        ? "Your ZippyTrip Booking Confirmation" 
        : "New Booking Notification",
      body: emailType === "confirmation"
        ? `
          Hello ${userProfile?.first_name || "Traveler"},
          
          Your booking for the route ${booking.schedules.routes.origin} to ${booking.schedules.routes.destination} has been ${booking.status}.
          
          Booking Details:
          - Booking ID: ${booking.id}
          - Route: ${booking.schedules.routes.name}
          - Departure: ${new Date(booking.schedules.departure_time).toLocaleString()}
          - Arrival: ${new Date(booking.schedules.arrival_time).toLocaleString()}
          - Seats: ${booking.seat_numbers.join(", ")}
          - Total Fare: $${booking.total_fare}
          - Payment Status: ${booking.payment_status}
          
          Thank you for choosing ZippyTrip!
        `
        : `
          Admin Notification:
          
          A new booking has been made:
          
          - Booking ID: ${booking.id}
          - Customer: ${userProfile?.first_name || ""} ${userProfile?.last_name || ""} (${userData.user.email})
          - Route: ${booking.schedules.routes.name}
          - Departure: ${new Date(booking.schedules.departure_time).toLocaleString()}
          - Seats: ${booking.seat_numbers.join(", ")}
          - Total Fare: $${booking.total_fare}
          - Status: ${booking.status}
          - Payment Status: ${booking.payment_status}
        `
    };
    
    console.log("Would send email:", emailContent);
    
    // In production, you would use an email service here:
    // const emailResult = await emailService.send(emailContent);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email notification ${emailType} prepared for booking ${bookingId}`,
        // Simulating a successful email send
        emailId: `email_${Math.random().toString(36).substring(2, 15)}`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
  } catch (error) {
    console.error("Error in send-booking-email function:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to process booking email" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
