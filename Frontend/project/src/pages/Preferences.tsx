import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Bus,
  Clock,
  Home as HomeIcon,
  Star,
  Wifi,
  Coffee,
  Bath,
  Wind,
  Dog,
  Mountain,
  School as Pool,
} from 'lucide-react';

interface PreferenceData {
  travelStyle: string;
  busComfort: string;
  travelTime: string;
  stayType: string;
  minRating: string;
  amenities: string[];
}

function Preferences() {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<PreferenceData>({
    travelStyle: '',
    busComfort: '',
    travelTime: '',
    stayType: '',
    minRating: '',
    amenities: [],
  });

  const navigate = useNavigate(); // Initialize useNavigate

  const handleAmenityToggle = (amenity: string) => {
    setPreferences((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSavePreferences = () => {
    console.log('Preferences saved:', preferences);
    navigate('/home'); // Redirect to the Home page
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <section className="animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Compass className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Travel Style</h2>
            </div>
            <p className="text-gray-300 mb-4 text-base">
              How do you prefer to travel?
            </p>
            <div className="grid grid-cols-1 gap-2">
              {['Budget', 'Standard', 'Luxury'].map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    setPreferences((prev) => ({ ...prev, travelStyle: style }));
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                    preferences.travelStyle === style
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/50'
                  }`}
                >
                  <span className="text-base font-medium text-white">
                    {style}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      preferences.travelStyle === style
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </section>
        );

      case 2:
        return (
          <section className="animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Bus className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Bus Comfort</h2>
            </div>
            <p className="text-gray-300 mb-4 text-base">
              Select your preferred level of comfort.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {['Economy', 'Standard', 'Luxury'].map((comfort) => (
                <button
                  key={comfort}
                  onClick={() => {
                    setPreferences((prev) => ({
                      ...prev,
                      busComfort: comfort,
                    }));
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                      preferences.busComfort === comfort
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                        : 'border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800/50'
                    }`}
                >
                  <span className="text-base font-medium text-white">
                    {comfort}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      preferences.busComfort === comfort
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </section>
        );

      case 3:
        return (
          <section className="animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Travel Time</h2>
            </div>
            <p className="text-gray-300 mb-4 text-base">
              When do you like to travel?
            </p>
            <div className="grid grid-cols-1 gap-2">
              {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    setPreferences((prev) => ({ ...prev, travelTime: time }));
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                    preferences.travelTime === time
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                      : 'border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800/50'
                  }`}
                >
                  <span className="text-base font-medium text-white">
                    {time}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      preferences.travelTime === time
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </section>
        );

      case 4:
        return (
          <section className="animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <HomeIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Stay Type</h2>
            </div>
            <p className="text-gray-300 mb-4 text-base">
              Choose your preferred accommodation.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {['Shared Guesthouse', 'Private Room', 'No Preference'].map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setPreferences((prev) => ({ ...prev, stayType: type }));
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                      preferences.stayType === type
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="text-base font-medium text-white">
                      {type}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 ${
                        preferences.stayType === type
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-600'
                      }`}
                    />
                  </button>
                )
              )}
            </div>
          </section>
        );

      case 5:
        return (
          <section className="animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Star className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Amenities</h2>
            </div>
            <p className="text-gray-300 mb-4 text-base">
              Select your must-have amenities.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { name: 'WiFi', icon: Wifi },
                { name: 'Breakfast', icon: Coffee },
                { name: 'Private Bathroom', icon: Bath },
                { name: 'Air Conditioning', icon: Wind },
                { name: 'Pet friendly', icon: Dog },
                { name: 'Scenic View', icon: Mountain },
                { name: 'Swimming pool', icon: Pool },
              ].map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => handleAmenityToggle(name)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                    preferences.amenities.includes(name)
                      ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                      : 'border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-white" />
                    <span className="text-base font-medium text-white">
                      {name}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      preferences.amenities.includes(name)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
      }}
    >
      <div className="max-w-md w-full">
        <div className="bg-gray-900/80 backdrop-blur-lg shadow-2xl rounded-2xl p-6 border border-gray-800">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 inline-block text-transparent bg-clip-text">
              Travel Preferences
            </h1>
            <div className="flex justify-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((dot) => (
                <div
                  key={dot}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    dot === step
                      ? 'bg-blue-400 w-4'
                      : dot < step
                      ? 'bg-blue-600'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {renderStep()}

          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-300"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSavePreferences} // Use the new handler
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                Save Preferences
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preferences;