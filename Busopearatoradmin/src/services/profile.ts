
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    
    // If the profile doesn't exist, create a new one
    if (error.code === 'PGRST116') {
      try {
        const newProfile = await createUserProfile(userId);
        return newProfile;
      } catch (createError) {
        console.error('Error creating new profile:', createError);
        return null;
      }
    }
    
    return null;
  }
  
  return data;
};

export const createUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({ id: userId })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
  
  return data;
};

export const updateUserProfile = async (
  userId: string, 
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return data;
};

export const uploadProfileImage = async (userId: string, file: File): Promise<string | null> => {
  try {
    // Create a unique file path for the avatar
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${uuidv4()}.${fileExt}`;
    
    // Upload the file to Supabase storage
    const { error: uploadError } = await supabase
      .storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      throw uploadError;
    }
    
    // Get the public URL for the file
    const { data } = supabase
      .storage
      .from('profiles')
      .getPublicUrl(filePath);
    
    // Update the user's profile with the new avatar URL
    await updateUserProfile(userId, { avatar_url: data.publicUrl });
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return null;
  }
};
