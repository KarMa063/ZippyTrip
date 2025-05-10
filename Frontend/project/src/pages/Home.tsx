import './Home.css'; // Import external CSS for animations
import Navigation from './Navigation';
import BackgroundCarousel from './BackgroundCarousel';
import PopularDestinations from './PopularDestinations';

const Home = () => {
  return (
    <div>
      {/* Navigation Bar */}
      <Navigation />

      {/* Background Carousel */}
      <BackgroundCarousel />

      {/* Popular Destinations */}
      <PopularDestinations />

    </div>
  );
};

export default Home;
