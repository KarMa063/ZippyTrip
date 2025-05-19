import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from '@neondatabase/serverless';
import { Attraction } from './types';

// Use environment variable instead of hardcoded connection string
const connectionString = import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL;

// Enable WebSocket pooling for better performance
neonConfig.webSocketConstructor = globalThis.WebSocket;
neonConfig.useSecureWebSocket = true;
neonConfig.fetchConnectionCache = true;

// Create a Pool for database operations
export const pool = new Pool({ 
  connectionString,
  max: 10, // maximum number of clients
});

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Direct SQL execution with neon
export const sql = neon(connectionString);

// Attractions database operations
export const attractionsDb = {
  async getAll(): Promise<Attraction[]> {
    const result = await sql`SELECT * FROM attractions ORDER BY name`;
    return result as Attraction[];
  },
  
  async getById(id: number): Promise<Attraction | null> {
    const [result] = await sql`SELECT * FROM attractions WHERE id = ${id}`;
    return result ? (result as Attraction) : null;
  },
  
  async create(attraction: Omit<Attraction, 'id' | 'created_at' | 'updated_at'>): Promise<Attraction> {
    try {
      // Use the query function instead of direct sql template literal
      const queryText = `
        INSERT INTO attractions (
          name, location, category, price, rating, image, status, description, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        ) RETURNING *`;
      
      const values = [
        attraction.name,
        attraction.location,
        attraction.category,
        attraction.price,
        attraction.rating,
        attraction.image,
        attraction.status,
        attraction.description || ''
      ];
      
      const { rows } = await query(queryText, values);
      return rows[0] as Attraction;
    } catch (error) {
      console.error('Error creating attraction:', error);
      throw error;
    }
  },
  
  async update(id: number, attraction: Partial<Attraction>): Promise<Attraction> {
    const fields = Object.entries(attraction)
      .filter(([key]) => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
      .map(([key, value]) => ({ key, value }));
    
    let queryText = `UPDATE attractions SET `;
    queryText += fields.map((field, i) => `${field.key} = $${i + 1}`).join(', ');
    queryText += `, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;
    
    const values = [...fields.map(f => f.value), id];
    const { rows } = await query(queryText, values);
    return rows[0] as Attraction;
  },
  
  async delete(id: number): Promise<void> {
    await sql`DELETE FROM attractions WHERE id = ${id}`;
  }
};

// Example usage:
// import { sql } from "@/integrations/neon/client";
// 
// async function getUsers() {
//   const users = await sql`SELECT * FROM users`;
//   return users;
// }