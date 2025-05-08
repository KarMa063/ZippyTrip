import { MapPin, Star } from 'lucide-react';

const destinations = [
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
];

const PopularDestinations = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Popular Destinations</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination) => (
          <div
            key={destination.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* ... existing code ... */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularDestinations; // Add this line
