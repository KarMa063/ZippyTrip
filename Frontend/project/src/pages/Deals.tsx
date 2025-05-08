import React from 'react';
import { Tag, Sparkles } from 'lucide-react';
import { useGlobalTheme } from '../components/GlobalThemeContext'; // Import the global theme hook

interface Deal {
  id: string;
  title: string;
  discount: string;
  description: string;
  validUntil: string;
}

const deals: Deal[] = [
  {
    id: '1',
    title: 'Early Summer Sale',
    discount: '15% OFF',
    description: 'Book now and save on summer stays',
    validUntil: 'Valid until May 31, 2024'
  },
  {
    id: '2',
    title: 'Last Minute Deals',
    discount: '25% OFF',
    description: 'Spontaneous travel savings',
    validUntil: 'Limited time offer'
  }
];

const Deals: React.FC = () => {
  const { isDarkMode } = useGlobalTheme(); // Use global theme

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <h2 className={`text-2xl font-bold mb-6 flex items-center ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        <Sparkles className={`h-6 w-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'} mr-2`} />
        Deals & Promotions
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className={`rounded-lg shadow-md p-6 border transition-shadow ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 hover:shadow-xl'
                : 'bg-white border-gray-200 hover:shadow-lg'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{deal.title}</h3>
                <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {deal.description}
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {deal.validUntil}
                </p>
              </div>
              <div className={`flex items-center px-3 py-1 rounded-full ${
                isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-600'
              }`}>
                <Tag className="h-4 w-4 mr-1" />
                {deal.discount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deals;