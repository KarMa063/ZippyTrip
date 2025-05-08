import { query } from '@/integrations/neon/client';

type ActivityLogData = {
  action: 'create' | 'update' | 'delete' | 'view' | 'complete' | 'cancel';
  entity_type: 'booking' | 'route' | 'bus' | 'schedule' | 'driver' | 'user';
  entity_id: string;
  details?: any;
  user_id?: string;
};

/**
 * Logs an activity in the system
 * @param data Activity data to log
 * @returns The created activity log ID
 */
export async function logActivity(data: ActivityLogData): Promise<string> {
  try {
    // Convert details object to JSON string if it exists
    const detailsJson = data.details ? JSON.stringify(data.details) : null;
    
    // Insert activity log into database
    const result = await query(
      `INSERT INTO activity_logs (
        action, 
        entity_type, 
        entity_id, 
        details, 
        user_id, 
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
      [
        data.action,
        data.entity_type,
        data.entity_id,
        detailsJson,
        data.user_id || null
      ]
    );
    
    // Return the ID of the created activity log
    return result.rows[0].id;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
}

/**
 * Fetches recent activity logs
 * @param limit Number of logs to fetch (default: 10)
 * @returns Array of activity logs
 */
export async function fetchActivityLogs(limit = 10) {
  try {
    const result = await query(
      `SELECT 
        id, 
        action, 
        entity_type, 
        entity_id, 
        details, 
        user_id, 
        created_at 
      FROM 
        activity_logs 
      ORDER BY 
        created_at DESC 
      LIMIT $1`,
      [limit]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
}