// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Dummy in‑memory store
let services ={
    id: '1',
    from: 'Kathmandu',
    to: 'Pokhara',
    departure: '08:00 AM',
    arrival: '12:30 PM',
    price: 1200,
    operator: 'Sajha Yatayat',
    duration: '4h 30m',
    amenities: ['wifi', 'charging', 'snacks', 'water'],
    seatsAvailable: 32,
    type: 'AC',
    seats: Array.from({ length: 40 }, (_, i) => ({
      id: `seat-${i + 1}`,
      number: `${i + 1}`,
      isBooked: Math.random() > 0.7,
      type: i % 2 === 0 ? 'window' : 'aisle'
    }))}

// GET /services
app.get('/services', (req, res) => {
  res.json(services);
});

// POST /services  (bus operator will use later)
app.post('/services', (req, res) => {
  const newService = { id: Date.now(), ...req.body };
  // services.push(newService);
  res.status(201).json(newService);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚍 Bus‑API on http://localhost:${port}`));
