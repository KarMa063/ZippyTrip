// Define your database schema types here
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

// Attraction database schema
export interface Attraction {
  id: number;
  name: string;
  location: string;
  category: string;
  price: number;
  rating: number;
  image: string;  // Changed from image_url to image
  status: "open" | "closed" | "limited";
  description?: string;
  created_at?: string;  // Added this property
  updated_at?: string;  // Added this property
}

