import { Attraction } from "@/integrations/neon/types";
import { attractionsDb } from "@/integrations/neon/client";

// Re-export the Attraction type for use in other files
export type { Attraction };

// Get all attractions
export const getAllAttractions = async (): Promise<Attraction[]> => {
  try {
    return await attractionsDb.getAll();
  } catch (error) {
    console.error("Error fetching attractions:", error);
    throw error;
  }
};

// Search attractions
export const searchAttractions = async (term: string): Promise<Attraction[]> => {
  try {
    const attractions = await attractionsDb.getAll();
    const lowercaseTerm = term.toLowerCase();
    
    return attractions.filter(attraction => 
      attraction.name.toLowerCase().includes(lowercaseTerm) ||
      attraction.location.toLowerCase().includes(lowercaseTerm) ||
      attraction.category.toLowerCase().includes(lowercaseTerm)
    );
  } catch (error) {
    console.error("Error searching attractions:", error);
    throw error;
  }
};

// Create a new attraction
export const createAttraction = async (attractionData: Omit<Attraction, 'id'>): Promise<Attraction> => {
  try {
    return await attractionsDb.create(attractionData);
  } catch (error) {
    console.error("Error creating attraction:", error);
    throw error;
  }
};

// Update an attraction
export const updateAttraction = async (id: number, attractionData: Partial<Attraction>): Promise<Attraction> => {
  try {
    return await attractionsDb.update(id, attractionData);
  } catch (error) {
    console.error(`Error updating attraction ${id}:`, error);
    throw error;
  }
};

// Delete an attraction
export const deleteAttraction = async (id: number): Promise<void> => {
  try {
    await attractionsDb.delete(id);
  } catch (error) {
    console.error(`Error deleting attraction ${id}:`, error);
    throw error;
  }
};