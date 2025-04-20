
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  scheduleId: string;
  userId: string;
  seatNumbers: string[];
  totalFare: number;
  paymentMethod: string;
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
    
    const { scheduleId, userId, seatNumbers, totalFare, paymentMethod }: BookingRequest = await req.json();
    
    // Validate required fields
    if (!scheduleId || !userId || !seatNumbers || seatNumbers.length === 0 || !totalFare) {
      return new Response(
        JSON.stringify({ error: "Missing required booking information" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if schedule exists and has enough seats
    const { data: schedule, error: scheduleError } = await supabaseClient
      .from("schedules")
      .select("*")
      .eq("id", scheduleId)
      .single();

    if (scheduleError || !schedule) {
      console.error("Error fetching schedule:", scheduleError);
      return new Response(
        JSON.stringify({ error: "Schedule not found", details: scheduleError }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (schedule.available_seats < seatNumbers.length) {
      return new Response(
        JSON.stringify({ error: "Not enough available seats" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create booking record
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .insert({
        user_id: userId,
        schedule_id: scheduleId,
        seat_numbers: seatNumbers,
        total_fare: totalFare,
        status: "confirmed", // In a real app, you might set this to pending initially
        payment_status: "paid", // In a real app, this would depend on payment processing
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      return new Response(
        JSON.stringify({ error: "Failed to create booking", details: bookingError }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update available seats in schedule
    const { error: updateError } = await supabaseClient
      .from("schedules")
      .update({
        available_seats: schedule.available_seats - seatNumbers.length
      })
      .eq("id", scheduleId);

    if (updateError) {
      console.error("Error updating available seats:", updateError);
      // We don't want to fail the booking if this update fails, just log it
    }

    // Trigger email notification (in a real app you might want to use a background task)
    try {
      const emailResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-booking-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            bookingId: booking.id,
            emailType: "confirmation"
          }),
        }
      );
      
      // Also send admin notification
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-booking-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            bookingId: booking.id,
            emailType: "admin-notification"
          }),
        }
      );
      
      console.log("Email notification sent");
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // We don't want to fail the booking if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        booking,
        message: "Booking confirmed successfully" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
  } catch (error) {
    console.error("Error in process-booking function:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to process booking" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
