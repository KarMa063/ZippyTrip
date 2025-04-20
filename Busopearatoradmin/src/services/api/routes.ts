import { supabase } from "@/integrations/supabase/client";
import { ValidTableName, asValidTableName, fromSafeTable } from "@/utils/tableTypes";

// Type definitions
export type Route = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number | null;
  duration: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
};

// Make is_active optional in RouteInsert to match database schema default value
export type RouteInsert = Omit<
  Route, 
  'id' | 'created_at' | 'updated_at' | 'is_active' | 'distance' | 'duration'
> & {
  is_active?: boolean | null;
  distance?: number | null;
  duration?: number | null;
};

export type RouteUpdate = Partial<Omit<Route, 'id' | 'created_at' | 'updated_at'>>;

export const fetchRoutes = async () => {
  console.log("Fetching routes...");
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching routes:", error);
      throw error;
    }
    
    console.log("Routes fetched successfully:", data);
    return data as Route[];
  } catch (err) {
    console.error("Error in fetchRoutes:", err);
    throw err;
  }
};

export const getRoute = async (id: string) => {
  console.log("Fetching route with ID:", id);
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching route:", error);
      throw error;
    }
    
    console.log("Route fetched successfully:", data);
    return data as Route;
  } catch (err) {
    console.error("Error in getRoute:", err);
    throw err;
  }
};

export const createRoute = async (routeData: RouteInsert) => {
  console.log("Creating route with data:", routeData);
  try {
    const { data, error } = await supabase
      .from('routes')
      .insert(routeData)
      .select();
    
    if (error) {
      console.error("Error creating route:", error);
      throw error;
    }
    
    console.log("Route created successfully:", data);
    return data;
  } catch (err) {
    console.error("Error in createRoute:", err);
    throw err;
  }
};

export const updateRoute = async (id: string, routeData: RouteUpdate) => {
  console.log("Updating route with ID:", id, "Data:", routeData);
  try {
    const { data, error } = await supabase
      .from('routes')
      .update(routeData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error("Error updating route:", error);
      throw error;
    }
    
    console.log("Route updated successfully:", data);
    return data;
  } catch (err) {
    console.error("Error in updateRoute:", err);
    throw err;
  }
};

export const deleteRoute = async (id: string) => {
  console.log("Deleting route with ID:", id);
  try {
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting route:", error);
      throw error;
    }
    
    console.log("Route deleted successfully");
    return true;
  } catch (err) {
    console.error("Error in deleteRoute:", err);
    throw err;
  }
};
