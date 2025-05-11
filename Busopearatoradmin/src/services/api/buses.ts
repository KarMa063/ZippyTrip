
import { query } from '@/integrations/neon/client';
import { Json } from "@/integrations/supabase/types";


// Type definitions
export type Bus = {
  id: string;
  registration_number: string;
  model: string | null;
  capacity: number;
  amenities: Json | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
};

export type BusInsert = Omit<Bus, 'id' | 'created_at' | 'updated_at'>;
export type BusUpdate = Partial<BusInsert>;

export const fetchBuses = async () => {
  console.log("Fetching buses...");
  try {
    const result = await query('SELECT * FROM buses ORDER BY registration_number');
    
    console.log("Buses fetched successfully:", result.rows);
    return result.rows as Bus[];
  } catch (err) {
    console.error("Error in fetchBuses:", err);
    throw err;
  }
};

export const getBus = async (id: string) => {
  try {
    const result = await query('SELECT * FROM buses WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      throw new Error(`Bus with ID ${id} not found`);
    }
    
    return result.rows[0] as Bus;
  } catch (err) {
    console.error("Error in getBus:", err);
    throw err;
  }
};

export const createBus = async (busData: BusInsert) => {
  try {
    const { registration_number, model, capacity, amenities, is_active } = busData;
    
    const result = await query(
      `INSERT INTO buses (registration_number, model, capacity, amenities, is_active) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [registration_number, model, capacity, amenities, is_active]
    );
    
    
    
    return result.rows[0];
  } catch (err) {
    console.error("Error creating bus:", err);
    throw err;
  }
};

export const updateBus = async (id: string, busData: BusUpdate) => {
  try {
    // Build the SET part of the query dynamically based on provided fields
    const updates = Object.entries(busData)
      .filter(([_, value]) => value !== undefined)
      .map(([key], index) => `${key} = $${index + 2}`);
    
    const values = Object.values(busData).filter(value => value !== undefined);
    
    if (updates.length === 0) return null; // No updates to make
    
    const sqlQuery = `
      UPDATE buses 
      SET ${updates.join(', ')}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await query(sqlQuery, [id, ...values]);
    
   
    
    return result.rows[0];
  } catch (err) {
    console.error("Error updating bus:", err);
    throw err;
  }
};

export const deleteBus = async (id: string) => {
  try {
    // Get bus details before deletion for activity log
    const busDetails = await getBus(id);
    
    await query('DELETE FROM buses WHERE id = $1', [id]);
    
    
    
    return true;
  } catch (err) {
    console.error("Error deleting bus:", err);
    throw err;
  }
};
