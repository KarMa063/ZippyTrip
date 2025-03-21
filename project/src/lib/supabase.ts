import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('https://yettdpczyheodrijitvz.supabase.co');
}

if (!supabaseAnonKey) {
  throw new Error('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHRkcGN6eWhlb2RyaWppdHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMzAxODgsImV4cCI6MjA1NzgwNjE4OH0.Avpka475DXMc2IjqOEnQoSxZLRDoJO7erCP8RfI-J_o');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});