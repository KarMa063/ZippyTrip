import './Home.css'; // Import external CSS for animations
import Navigation from './Navigation';
import BackgroundCarousel from './BackgroundCarousel';
import PopularDestinations from './PopularDestinations';
import UpcomingBookings from './UpcomingBookings';
import { useNavigate } from 'react-router-dom';
import { Bus, Home as HomeIcon } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      {/* Navigation Bar */}
      <Navigation />

      {/* Background Carousel */}
      <BackgroundCarousel />

      {/* Upcoming Bookings */}
      <UpcomingBookings />

      {/* Book Your Services */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Book Your Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bus Services Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center"><Bus className="h-6 w-6 mr-2 text-blue-500" /> Bus Services</h3>
            <div className="space-y-4">
              {/* Sample Bus 1 */}
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition cursor-pointer" onClick={() => navigate('/bus')}>
                <div className="flex items-center">
                  <Bus className="h-10 w-10 text-blue-400 mr-4" />
                  <div>
                    <div className="font-semibold">Kathmandu ⇄ Pokhara</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">ZippyBus Express • AC Deluxe</div>
                  </div>
                </div>
                <button className="px-4 py-1 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">View</button>
              </div>
              {/* Sample Bus 2 */}
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition cursor-pointer" onClick={() => navigate('/bus')}>
                <div className="flex items-center">
                  <Bus className="h-10 w-10 text-blue-400 mr-4" />
                  <div>
                    <div className="font-semibold">Butwal ⇄ Chitwan</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">ZippyBus Express • Standard</div>
                  </div>
                </div>
                <button className="px-4 py-1 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">View</button>
              </div>
            </div>
          </div>
          {/* Guesthouse Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center"><HomeIcon className="h-6 w-6 mr-2 text-green-500" /> Guesthouses</h3>
            <div className="space-y-4">
              {/* Sample Guesthouse 1 */}
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition cursor-pointer" onClick={() => navigate('/guesthouses')}>
                <div className="flex items-center">
                  <HomeIcon className="h-10 w-10 text-green-400 mr-4" />
                  <div>
                    <div className="font-semibold">Hotel Lo Mustang</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Thamel, Kathmandu</div>
                  </div>
                </div>
                <button className="px-4 py-1 rounded bg-green-600 text-white text-sm font-semibold hover:bg-green-700">View</button>
              </div>
              {/* Sample Guesthouse 2 */}
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition cursor-pointer" onClick={() => navigate('/guesthouses')}>
                <div className="flex items-center">
                  <HomeIcon className="h-10 w-10 text-green-400 mr-4" />
                  <div>
                    <div className="font-semibold">Everest Guesthouse</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Lakeside, Pokhara</div>
                  </div>
                </div>
                <button className="px-4 py-1 rounded bg-green-600 text-white text-sm font-semibold hover:bg-green-700">View</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <PopularDestinations />

    </div>
  );
};

export default Home;
