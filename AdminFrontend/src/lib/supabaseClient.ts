import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// The admin email - in a real application, this should be in environment variables
export const ADMIN_EMAIL = 'admin@zippytrip.com'; // Consider moving to .env
export const RESET_EMAIL = 'animeshbaral10@gmail.com'; // Consider moving to .env


// Auth functions
export const signIn = async (email: string, password: string) => {
  // Check if the email is the admin email before attempting to sign in
  if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return {
      data: null,
      error: { message: 'Access denied. Only admin can login.' }
    };
  }

  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};


export const resetPassword = async (email: string) => {
  // Only allow password reset emails to be sent to the specified reset email
  if (email.toLowerCase() !== RESET_EMAIL.toLowerCase()) {
    // Need to import toast from a notification library like react-toastify
    console.error('Password reset is only allowed for the registered admin email.');
    return {
      data: null,
      error: { message: 'Password reset instructions can only be sent to the authorized email address.' }
    };
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    // Make sure this route exists in your React Router setup if you use it
    // redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    console.error(error.message || 'Failed to send password reset email.');
  } else {
    console.log('Password reset email sent. Please check your inbox.');
  }

  return { data, error };
};


export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error(error.message || 'Failed to sign out.');
  }
  return { error };
};


// Get the current user session
export const getSession = async () => {
  // Use data.session instead of returning the whole object for consistency
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

// Listen to auth changes
export const onAuthStateChange = (callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void) => {
    const { data: authListener } = supabase.auth.onAuthStateChange(callback);
    return authListener?.subscription;
};