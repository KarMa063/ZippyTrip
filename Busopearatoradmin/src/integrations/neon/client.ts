import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from '@neondatabase/serverless';

// Connection string should be stored in environment variables
const connectionString = "postgresql://ZippyTrip_owner:npg_iX4GFVa3QKZt@ep-fragrant-bar-a1v8zqru-pooler.ap-southeast-1.aws.neon.tech/ZippyTrip?sslmode=require";

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