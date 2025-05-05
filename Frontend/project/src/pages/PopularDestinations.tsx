import { MapPin, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Destination {
  id: string | number; // Updated to accept both string and number
  name: string;
  image: string;
  description: string;
  rating: number;
  properties: number;
  location?: string;
}

const PopularDestinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/attractions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch destinations');
        }
        
        const data = await response.json();
        
        if (data.success && data.attractions) {
          // Convert numeric IDs to strings if needed
          const formattedAttractions = data.attractions.map((attraction: any) => ({
            ...attraction,
            id: attraction.id.toString() // Ensure ID is a string
          }));
          setDestinations(formattedAttractions);
        } else {
          // Fallback to default destinations if API returns empty
          setDestinations([
            {
              id: '1',
              name: 'Kathmandu',
              image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
              description: 'Cultural heritage and mountain views',
              rating: 4.5,
              properties: 1234
            },
            {
              id: '2',
              name: 'Pokhara',
              image: 'https://media.istockphoto.com/id/532348030/photo/twilight-with-boats-on-phewa-lake-pokhara-nepal.jpg?s=612x612&w=0&k=20&c=ILHRUN-zVLTgi37biQMRrIbz7cB9ZH0I6cffwq6kBN4=',
              description: 'Lakeside paradise with mountain backdrop',
              rating: 4.7,
              properties: 856
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setError('Failed to load destinations. Using default data.');
        
        // Use default destinations on error
        setDestinations([
          {
            id: '1',
            name: 'Kathmandu',
            image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
            description: 'Cultural heritage and mountain views',
            rating: 4.5,
            properties: 1234
          },
          {
            id: '2',
            name: 'Pokhara',
            image: 'https://media.istockphoto.com/id/532348030/photo/twilight-with-boats-on-phewa-lake-pokhara-nepal.jpg?s=612x612&w=0&k=20&c=ILHRUN-zVLTgi37biQMRrIbz7cB9ZH0I6cffwq6kBN4=',
            description: 'Lakeside paradise with mountain backdrop',
            rating: 4.7,
            properties: 856
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Popular Destinations</h2>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading destinations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={destination.image} 
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{destination.name}</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>
                
                {destination.location && (
                  <div className="flex items-center text-gray-500 mt-1 mb-2">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span className="text-sm">{destination.location}</span>
                  </div>
                )}
                
                <p className="text-gray-600 text-sm mt-2">{destination.description}</p>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{destination.properties} properties</span>
                  <Link 
                    to={`/destinations/${destination.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PopularDestinations;
