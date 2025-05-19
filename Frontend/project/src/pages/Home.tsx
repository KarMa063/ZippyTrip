import './Home.css';
import Navigation from './Navigation';
import BackgroundCarousel from './BackgroundCarousel';
import PopularDestinations from './PopularDestinations';
import UpcomingBookings from './UpcomingBookings';
import { useNavigate } from 'react-router-dom';
import { Bus, Home as HomeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getCurrentUser } from '../lib/supabase';

interface GuestHouseBooking {
  id: string;
  guestHouseName: string;
  location: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [recentGuesthouses, setRecentGuesthouses] = useState<GuestHouseBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch recent guesthouse bookings
  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        setIsLoading(true);
        const userId = await getCurrentUser();
        
        if (!userId) return;
        
        const userIdString = typeof userId === 'object' ? userId.user_id : userId;
        
        const response = await axios.get(`http://localhost:5000/api/bookings`, {
          params: { traveller_id: userIdString }
        });
        
        if (response.data.success) {
          // Get the most recent 2 active bookings
          const bookings = response.data.bookings
            .filter((booking: any) => booking.status !== 'cancelled')
            .slice(0, 2)
            .map((booking: any) => ({
              id: booking.id,
              guestHouseName: booking.property_name || 'ZippyStay Guesthouse',
              location: booking.location || 'Unknown Location'
            }));
          
          setRecentGuesthouses(bookings);
        }
      } catch (error) {
        console.error('Error fetching recent guesthouse bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentBookings();
  }, []);

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
              {/* Always show these specific guesthouses */}
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition cursor-pointer" onClick={() => navigate('/guesthouses')}>
                <div className="flex items-center">
                  <HomeIcon className="h-10 w-10 text-green-400 mr-4" />
                  <div>
                    <div className="font-semibold">Hotel Pristine Himalaya</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Sarangkot Road, Pokhara, Kaski</div>
                  </div>
                </div>
                <button className="px-4 py-1 rounded bg-green-600 text-white text-sm font-semibold hover:bg-green-700">View Rooms</button>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition cursor-pointer" onClick={() => navigate('/guesthouses')}>
                <div className="flex items-center">
                  <HomeIcon className="h-10 w-10 text-green-400 mr-4" />
                  <div>
                    <div className="font-semibold">Hotel Jungle Crown</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Tigerpoint, Baghmara, Sauraha, Sauraha</div>
                  </div>
                </div>
                <button className="px-4 py-1 rounded bg-green-600 text-white text-sm font-semibold hover:bg-green-700">View Rooms</button>
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
