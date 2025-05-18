import { query } from '@/integrations/neon/client';

// Define notification types
export type RouteNotification = {
  id: string;
  name: string;
  created_at: string;
  read: boolean;
  route_id?: string; // Add route_id to identify unique routes
  message?: string; // Add message field for notification content
};

/**
 * Fetches recent route notifications for the UI
 * @param limit Maximum number of notifications to fetch
 * @returns Array of route notifications
 */
export const fetchRouteNotifications = async (limit = 5): Promise<RouteNotification[]> => {
  try {
    // Query to get route updates that need attention - joining through schedules table
    // Modified to select distinct routes to avoid duplicates and removed r.status which doesn't exist
    const result = await query(`
      SELECT DISTINCT ON (r.id)
        r.id as route_id,
        r.name,
        b.id as booking_id,
        b.updated_at,
        r.origin,
        r.destination
      FROM 
        routes r
      JOIN 
        schedules s ON r.id = s.route_id
      JOIN 
        bookings b ON s.id = b.schedule_id
      WHERE 
        b.status IN ('pending', 'updated', 'needs_review')
        OR b.updated_at > NOW() - INTERVAL '24 hours'
      ORDER BY 
        r.id, b.updated_at DESC
      LIMIT $1
    `, [limit]);
    
    // Transform the database results into notification format with better messages
    return result.rows.map(row => ({
      id: row.booking_id,
      name: row.name || `Route #${row.route_id?.substring(0, 6)}`,
      created_at: row.updated_at,
      read: false,
      route_id: row.route_id,
      message: `New bus added for route ${row.origin} to ${row.destination}`
    }));
  } catch (error) {
    console.error('Error fetching route notifications:', error);
    // Return empty array if database query fails
    return [];
  }
};

/**
 * Marks notifications as read in the database
 * @param notificationIds Array of notification IDs to mark as read
 * @returns 
 */
export const markNotificationsAsRead = async (notificationIds: string[]): Promise<boolean> => {
  if (!notificationIds.length) return true;
  
  try {
    await query(`
      UPDATE bookings
      SET notification_read = true
      WHERE id = ANY($1)
    `, [notificationIds]);
    
    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return false;
  }
};




