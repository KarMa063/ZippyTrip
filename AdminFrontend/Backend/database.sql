-- Create attractions table
CREATE TABLE IF NOT EXISTS attractions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  rating DECIMAL(3, 1) NOT NULL,
  image VARCHAR(255),
  status VARCHAR(50) CHECK (status IN ('open', 'closed', 'limited')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO attractions (name, location, category, price, rating, image, status)
VALUES
  ('Grand Museum', 'Downtown, New York', 'Museum', 25.00, 4.7, '/placeholder.svg', 'open'),
  ('Adventure Theme Park', 'Orlando, Florida', 'Theme Park', 89.00, 4.9, '/placeholder.svg', 'open'),
  ('Historic Castle Tour', 'Edinburgh, Scotland', 'Historic Site', 35.00, 4.5, '/placeholder.svg', 'limited');