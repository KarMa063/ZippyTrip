import './Home.css'; // Import external CSS for animations
import React from 'react';
import Navigation from './Navigation';
import Deals from './Deals';
import BackgroundCarousel from './BackgroundCarousel';
import PopularDestinations from './PopularDestinations';
import SearchBar from './SearchBar';
import TripPlanner from './TripPlanner';

const Home = () => {
  return (
    <div>
      {/* Navigation Bar */}
      <Navigation />

      {/* Background Carousel */}
      <BackgroundCarousel />

      {/* Search Bar */}
      <SearchBar />

      {/* Travel Deals Section */}
      <Deals />

      {/* Popular Destinations */}
      <PopularDestinations />

      {/* Trip Planner */}
      <TripPlanner />
    </div>
  );
};

export default Home;
