
import { supabase } from "@/integrations/supabase/client";
import { ValidTableName, asValidTableName } from "@/utils/tableTypes";
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
    const { data, error } = await supabase
      .from(asValidTableName('buses'))
      .select('*')
      .order('registration_number');
    
    if (error) {
      console.error("Error fetching buses:", error);
      throw error;
    }
    
    console.log("Buses fetched successfully:", data);
    return data as Bus[];
  } catch (err) {
    console.error("Error in fetchBuses:", err);
    throw err;
  }
};

export const getBus = async (id: string) => {
  const { data, error } = await supabase
    .from(asValidTableName('buses'))
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Bus;
};

export const createBus = async (busData: BusInsert) => {
  try {
    const { data, error } = await supabase
      .from(asValidTableName('buses'))
      .insert(busData)
      .select();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error creating bus:", err);
    throw err;
  }
};

export const updateBus = async (id: string, busData: BusUpdate) => {
  const { data, error } = await supabase
    .from(asValidTableName('buses'))
    .update(busData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data;
};

export const deleteBus = async (id: string) => {
  const { error } = await supabase
    .from(asValidTableName('buses'))
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};
