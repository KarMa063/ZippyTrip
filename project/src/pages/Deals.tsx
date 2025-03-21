import React from 'react';
import { Tag, Sparkles } from 'lucide-react';

const deals = [
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

const Deals = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Sparkles className="h-6 w-6 text-yellow-500 mr-2" />
        Deals & Promotions
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{deal.title}</h3>
                <p className="text-gray-600 mt-1">{deal.description}</p>
                <p className="text-sm text-gray-500 mt-2">{deal.validUntil}</p>
              </div>
              <div className="flex items-center bg-red-100 text-red-600 px-3 py-1 rounded-full">
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