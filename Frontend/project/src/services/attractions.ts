import axios from 'axios';

// Define the Attraction interface to match the backend structure
export interface Attraction {
  id: number;
  name: string;
  location: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  status: "open" | "closed" | "limited";
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// API endpoint for attractions
const API_URL = import.meta.env.DATABASE_URL;

// Get all attractions
export const getAllAttractions = async (): Promise<Attraction[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/attractions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attractions:", error);
    throw error;
  }
};

// Get popular attractions (those with high ratings)
export const getPopularAttractions = async (limit = 6): Promise<Attraction[]> => {
  try {
    const attractions = await getAllAttractions();
    // Sort by rating (highest first) and take the specified limit
    return attractions
      .filter(attraction => attraction.status === 'open') // Only show open attractions
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching popular attractions:", error);
    throw error;
  }
};