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
  amenities: string[];
}

const preferenceSteps = [
  {
    title: "Travel Style",
    icon: Compass,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/20",
    selectedBgColor: "bg-blue-500",
    borderColor: "border-blue-500",
    options: ['Budget', 'Standard', 'Luxury'],
    key: "travelStyle",
    question: "How do you prefer to travel?"
  },
  {
    title: "Bus Comfort",
    icon: Bus,
    iconColor: "text-indigo-400",
    bgColor: "bg-indigo-500/20",
    selectedBgColor: "bg-indigo-500",
    borderColor: "border-indigo-500",
    options: ['Economy', 'Standard', 'Luxury'],
    key: "busComfort",
    question: "Select your preferred level of comfort."
  },
  {
    title: "Travel Time",
    icon: Clock,
    iconColor: "text-indigo-400",
    bgColor: "bg-indigo-500/20",
    selectedBgColor: "bg-indigo-500",
    borderColor: "border-indigo-500",
    options: ['Morning', 'Afternoon', 'Evening', 'Night'],
    key: "travelTime",
    question: "When do you like to travel?"
  },
  {
    title: "Stay Type",
    icon: HomeIcon,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/20",
    selectedBgColor: "bg-purple-500",
    borderColor: "border-purple-500",
    options: ['Apartment', 'Guesthouse', 'Resort', 'Hotel', 'Hostel', 'Villa'],
    key: "stayType",
    question: "Choose your preferred accommodation type."
  },
  {
    title: "Amenities",
    icon: Star,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/20",
    selectedBgColor: "bg-purple-500",
    borderColor: "border-purple-500",
    options: [
      { name: 'WiFi', icon: Wifi },
      { name: 'Breakfast', icon: Coffee },
      { name: 'Private Bathroom', icon: Bath },
      { name: 'Air Conditioning', icon: Wind },
      { name: 'Pet friendly', icon: Dog },
      { name: 'Scenic View', icon: Mountain },
      { name: 'Swimming pool', icon: Pool },
    ],
    key: "amenities",
    isAmenities: true,
    question: "Select your must-have amenities."
  }
];

function Preferences() {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<PreferenceData>({
    travelStyle: '',
    busComfort: '',
    travelTime: '',
    stayType: '',
    amenities: [],
  });

  const navigate = useNavigate();
  const currentStep = preferenceSteps[step - 1];

  const handleOptionSelect = (option: string | { name: string; icon: any }) => {
    if (currentStep.isAmenities) {
      const amenityName = (option as { name: string }).name;
      setPreferences(prev => ({
        ...prev,
        amenities: prev.amenities.includes(amenityName)
          ? prev.amenities.filter(a => a !== amenityName)
          : [...prev.amenities, amenityName]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [currentStep.key]: option as string
      }));
    }
  };

  const isOptionSelected = (option: string | { name: string }) => {
    if (currentStep.isAmenities) {
      return preferences.amenities.includes((option as { name: string }).name);
    }
    return preferences[currentStep.key as keyof PreferenceData] === option;
  };

  const nextStep = () => {
    if (step < preferenceSteps.length) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    if (currentStep.isAmenities) return true; // allow without selection
    const value = preferences[currentStep.key as keyof PreferenceData];
    return value !== '';
  };

  const savePreferences = () => {
    console.log('Preferences saved:', preferences);
    // optionally store in localStorage or send to backend here
    navigate('/home');
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
              {preferenceSteps.map((_, index) => (
                <div
                  key={index + 1}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    step === index + 1
                      ? 'bg-blue-400 w-4'
                      : step > index + 1
                      ? 'bg-blue-600'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {currentStep && (
            <section className="animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 ${currentStep.bgColor} rounded-xl`}>
                  <currentStep.icon className={`w-6 h-6 ${currentStep.iconColor}`} />
                </div>
                <h2 className="text-2xl font-bold text-white">{currentStep.title}</h2>
              </div>
              <p className="text-gray-300 mb-4 text-base">{currentStep.question}</p>
              <div className="grid grid-cols-1 gap-2">
                {currentStep.options.map((option) => {
                  const selected = isOptionSelected(option);
                  const optionKey = typeof option === 'string' ? option : option.name;
                  const IconComponent = currentStep.isAmenities ? (option as { icon: any }).icon : null;

                  return (
                    <button
                      key={optionKey}
                      onClick={() => handleOptionSelect(option)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                        selected
                          ? `${currentStep.borderColor} ${currentStep.selectedBgColor} ${currentStep.iconColor}`
                          : 'border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/50'
                      }`}
                    >
                      {currentStep.isAmenities ? (
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-white" />
                          <span className="text-base font-medium text-white">{optionKey}</span>
                        </div>
                      ) : (
                        <span className="text-base font-medium text-white">{optionKey}</span>
                      )}
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          selected ? `${currentStep.borderColor} ${currentStep.selectedBgColor}` : 'border-gray-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-300"
              >
                Back
              </button>
            )}
            {step < preferenceSteps.length ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md transform ${
                  canProceed()
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={savePreferences}
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
