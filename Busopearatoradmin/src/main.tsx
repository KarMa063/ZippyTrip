
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from '@/integrations/supabase/client';

// Ensure Supabase client is initialized
console.log('Supabase initialized');

createRoot(document.getElementById("root")!).render(<App />);
