import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGlobalTheme } from '../components/GlobalThemeContext';

const backgrounds = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
].map((url) => `${url}?auto=format&fit=crop&w=2000&q=80`);

const BackgroundCarousel: React.FC = () => {
  const { isDarkMode } = useGlobalTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? backgrounds.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
  };

  return (
    <div className="relative h-[600px] overflow-hidden group">
      {backgrounds.map((bg, index) => (
        <div
          key={bg}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentIndex ? 1 : 0,
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${
          isDarkMode
            ? 'from-black/50 via-black/30 to-gray-900'
            : 'from-black/30 via-black/20 to-white'
        }`}
      />

      {/* Welcome text */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 text-white">
  <h1 className="text-5xl font-bold mb-4">
    Discover Your Next Adventure
  </h1>
  <p className="text-xl">
    Explore the world's most beautiful destinations
  </p>
</div>


      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${
          isDarkMode
            ? 'bg-gray-800/50 hover:bg-gray-700/70 text-white'
            : 'bg-white/30 hover:bg-white/50 text-gray-800'
        }`}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${
          isDarkMode
            ? 'bg-gray-800/50 hover:bg-gray-700/70 text-white'
            : 'bg-white/30 hover:bg-white/50 text-gray-800'
        }`}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots navigation */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {backgrounds.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? isDarkMode
                  ? 'bg-white w-8'
                  : 'bg-gray-800 w-8'
                : isDarkMode
                ? 'bg-white/50 hover:bg-white/80 w-2'
                : 'bg-gray-500/50 hover:bg-gray-500/80 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundCarousel;