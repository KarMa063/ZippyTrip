import { Compass, Map, Heart, Calendar, Clock, Sun } from 'lucide-react';

const categories = [
  {
    icon: <Compass className="h-6 w-6" />,
    title: 'Adventure',
    description: 'Thrilling outdoor activities'
  },
  {
    icon: <Map className="h-6 w-6" />,
    title: 'Cultural',
    description: 'Local traditions & heritage'
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Romantic',
    description: 'Perfect for couples'
  }
];

const TripPlanner = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Calendar className="h-6 w-6 text-blue-600 mr-2" />
          Trip Planner
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                  {category.icon}
                </div>
                <h3 className="ml-3 text-lg font-semibold">{category.title}</h3>
              </div>
              <p className="text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Best Time to Visit</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Spring', 'Summer', 'Autumn', 'Winter'].map((season) => (
              <div key={season} className="flex items-center space-x-2 bg-white p-3 rounded-lg">
                <Sun className="h-5 w-5 text-yellow-500" />
                <span>{season}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;