import { query } from '@/integrations/neon/client';

// Type for route insertion
export interface RouteInsert {
  name: string;
  origin: string;
  destination: string;
  distance: number | null;
  duration: number | null;
  is_active: boolean;
}

// Fetch all routes
export async function fetchRoutes() {
  try {
    const result = await query('SELECT * FROM routes ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
}

// Get a single route by ID
export async function getRoute(id: string) {
  try {
    const result = await query('SELECT * FROM routes WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
}

// Create a new route
export async function createRoute(routeData: RouteInsert) {
  try {
    const { name, origin, destination, distance, duration, is_active } = routeData;
    
    const result = await query(
      `INSERT INTO routes (name, origin, destination, distance, duration, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [name, origin, destination, distance, duration, is_active]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating route:', error);
    throw error;
  }
}

// Update an existing route
export async function updateRoute(id: string, routeData: Partial<RouteInsert>) {
  try {
    // Build the SET part of the query dynamically based on provided fields
    const updates = Object.entries(routeData)
      .filter(([_, value]) => value !== undefined)
      .map(([key], index) => `${key} = $${index + 2}`);
    
    const values = Object.values(routeData).filter(value => value !== undefined);
    
    if (updates.length === 0) return null; // No updates to make
    
    const sqlQuery = `
      UPDATE routes 
      SET ${updates.join(', ')}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await query(sqlQuery, [id, ...values]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating route:', error);
    throw error;
  }
}

// Delete a route
export async function deleteRoute(id: string) {
  try {
    await query('DELETE FROM routes WHERE id = $1', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting route:', error);
    throw error;
  }
}
