import { query } from '@/integrations/neon/client';

// Type definitions
export type Driver = {
  id: string;
  name: string;
  phone: string;
  email: string;
  license_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DriverInsert = Omit<Driver, 'id' | 'created_at' | 'updated_at'>;
export type DriverUpdate = Partial<Omit<Driver, 'id' | 'created_at' | 'updated_at'>>;

export const fetchDrivers = async () => {
  try {
    const result = await query(
      `SELECT * FROM drivers WHERE is_active = true ORDER BY name`,
      []
    );
    
    return result.rows;
  } catch (err) {
    console.error("Error in fetchDrivers:", err);
    throw err;
  }
};

export const getDriver = async (id: string) => {
  try {
    const result = await query(
      `SELECT * FROM drivers WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Driver with ID ${id} not found`);
    }
    
    return result.rows[0];
  } catch (err) {
    console.error("Error in getDriver:", err);
    throw err;
  }
};

export const createDriver = async (driverData: DriverInsert) => {
  try {
    const { name, phone, email, license_number, is_active } = driverData;
    
    const result = await query(
      `INSERT INTO drivers (name, phone, email, license_number, is_active) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, phone, email, license_number, is_active]
    );
    
    return result.rows[0];
  } catch (err) {
    console.error("Error in createDriver:", err);
    throw err;
  }
};

export const updateDriver = async (id: string, driverData: DriverUpdate) => {
  try {
    const { name, phone, email, license_number, is_active } = driverData;
    
    // Build the SET part of the query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }
    
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      values.push(phone);
      paramIndex++;
    }
    
    if (email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }
    
    if (license_number !== undefined) {
      updates.push(`license_number = $${paramIndex}`);
      values.push(license_number);
      paramIndex++;
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }
    
    // Add the ID as the last parameter
    values.push(id);
    
    const result = await query(
      `UPDATE drivers SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Driver with ID ${id} not found`);
    }
    
    return result.rows[0];
  } catch (err) {
    console.error("Error in updateDriver:", err);
    throw err;
  }
};

export const deleteDriver = async (id: string) => {
  try {
    // Soft delete by setting is_active to false
    const result = await query(
      `UPDATE drivers SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Driver with ID ${id} not found`);
    }
    
    return result.rows[0];
  } catch (err) {
    console.error("Error in deleteDriver:", err);
    throw err;
  }
};