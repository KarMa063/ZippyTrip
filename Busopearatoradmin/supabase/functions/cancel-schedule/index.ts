
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CancellationRequest {
  scheduleId: string;
  reason: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { scheduleId, reason }: CancellationRequest = await req.json()

    // 1. Update the schedule status
    const { data: schedule, error: scheduleError } = await supabaseClient
      .from('schedules')
      .update({
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq('id', scheduleId)
      .select('*')
      .single()

    if (scheduleError) throw scheduleError

    // 2. Get affected bookings
    const { data: bookings, error: bookingsError } = await supabaseClient
      .from('bookings')
      .select('id, user_id')
      .eq('schedule_id', scheduleId)
      .eq('status', 'confirmed')

    if (bookingsError) throw bookingsError

    // 3. Create notifications for affected bookings
    if (bookings && bookings.length > 0) {
      const notifications = bookings.map((booking) => ({
        schedule_id: scheduleId,
        booking_id: booking.id,
        notification_type: 'schedule_cancellation',
        status: 'pending',
      }))

      const { error: notificationError } = await supabaseClient
        .from('cancellation_notifications')
        .insert(notifications)

      if (notificationError) throw notificationError

      // 4. Update booking statuses
      const { error: updateBookingsError } = await supabaseClient
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('schedule_id', scheduleId)
        .eq('status', 'confirmed')

      if (updateBookingsError) throw updateBookingsError
    }

    return new Response(
      JSON.stringify({ 
        message: 'Schedule cancelled successfully',
        bookingsAffected: bookings?.length ?? 0 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
