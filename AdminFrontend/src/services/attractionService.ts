import axios from 'axios';
// You're importing these types but not using them in the file
import type { AxiosInstance } from 'axios';
import type { AxiosResponse } from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface AttractionData {
  id: number;
  name: string;
  location: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  status: "open" | "closed" | "limited";
}

// Get all attractions
export const getAllAttractions = async (): Promise<AttractionData[]> => {
  try {
    const response = await axios.get<AttractionData[]>(`${API_URL}/attractions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attractions:', error);
    throw error;
  }
};

// Get attraction by ID
export const getAttractionById = async (id: number): Promise<AttractionData> => {
  try {
    const response = await axios.get<AttractionData>(`${API_URL}/attractions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching attraction with ID ${id}:`, error);
    throw error;
  }
};

// Create new attraction
export const createAttraction = async (attractionData: Omit<AttractionData, 'id'>): Promise<AttractionData> => {
  try {
    const response = await axios.post<AttractionData>(`${API_URL}/attractions`, attractionData);
    return response.data;
  } catch (error) {
    console.error('Error creating attraction:', error);
    throw error;
  }
};

// Update attraction
export const updateAttraction = async (id: number, attractionData: Partial<AttractionData>): Promise<AttractionData> => {
  try {
    const response = await axios.put<AttractionData>(`${API_URL}/attractions/${id}`, attractionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating attraction with ID ${id}:`, error);
    throw error;
  }
};

// Delete attraction
export const deleteAttraction = async (id: number): Promise<{ success: boolean }> => {
  try {
    const response = await axios.delete<{ success: boolean }>(`${API_URL}/attractions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting attraction with ID ${id}:`, error);
    throw error;
  }
};