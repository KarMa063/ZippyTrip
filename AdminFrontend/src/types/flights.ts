
export interface FlightData {
  id: number;
  flightNumber: string;
  airline: string;
  departure: string;
  destination: string;
  departureTime: string;
  price: number;
  status: "on-time" | "delayed" | "cancelled";
}
