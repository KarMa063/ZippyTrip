import React, { useEffect, useState } from "react";

const mockDelay = () => new Promise((res) => setTimeout(res, 1500));

export default function BookingsPage() {
  const [loading, setLoading] = useState(true);
  const [busBookings, setBusBookings] = useState({ current: [], past: [] });
  const [guesthouseBookings, setGuesthouseBookings] = useState({ current: [], past: [] });
  const [tab, setTab] = useState("bus");

  useEffect(() => {
    const fetchBookings = async () => {
      await mockDelay();
      setBusBookings({
        current: [],
        past: [],
      });
      setGuesthouseBookings({
        current: [],
        past: [],
      });
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const BookingCard = ({ title, details }) => (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>{title}</h3>
      <p>{details}</p>
    </div>
  );

  const LoadingPlaceholder = () => (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ height: "60px", backgroundColor: "#eee", borderRadius: "8px" }}></div>
    </div>
  );

  const renderSection = (title, bookings, isLoading) => (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{title}</h2>
      {isLoading ? (
        <>
          <LoadingPlaceholder />
          <LoadingPlaceholder />
        </>
      ) : bookings.length > 0 ? (
        bookings.map((b) => (
          <BookingCard
            key={b.id}
            title={b.route || `${b.name} - ${b.city}`}
            details={b.date ? `Date: ${b.date}` : `From: ${b.from} To: ${b.to}`}
          />
        ))
      ) : (
        <p>No {title.toLowerCase()}.</p>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Your Bookings</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setTab("bus")} style={{ padding: "10px 16px", backgroundColor: tab === "bus" ? "#333" : "#ccc", color: tab === "bus" ? "#fff" : "#000" }}>
          Bus Bookings
        </button>
        <button onClick={() => setTab("guesthouse")} style={{ padding: "10px 16px", backgroundColor: tab === "guesthouse" ? "#333" : "#ccc", color: tab === "guesthouse" ? "#fff" : "#000" }}>
          Guesthouse Bookings
        </button>
      </div>

      {tab === "bus" && (
        <>
          {renderSection("Current Bus Bookings", busBookings.current, loading)}
          <div style={{ marginTop: "20px" }}>
            {renderSection("Past Bus Bookings", busBookings.past, loading)}
          </div>
        </>
      )}

      {tab === "guesthouse" && (
        <>
          {renderSection("Current Guesthouse Bookings", guesthouseBookings.current, loading)}
          <div style={{ marginTop: "20px" }}>
            {renderSection("Past Guesthouse Bookings", guesthouseBookings.past, loading)}
          </div>
        </>
      )}
    </div>
  );
}
