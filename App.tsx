import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ActivityCard from './components/ActivityCard';
import Planner from './components/Planner';
import { generateActivities } from './services/geminiService';
import { Activity, Plan } from './types';
import { SKILL_OPTIONS } from './constants';

const App: React.FC = () => {
  const [step, setStep] = useState<'profile' | 'activities' | 'planner'>('profile');
  const [ageYears, setAgeYears] = useState<string>('0');
  const [ageMonths, setAgeMonths] = useState<string>('9');
  const [skill, setSkill] = useState<string>(SKILL_OPTIONS[0].value);
  const [specialNeeds, setSpecialNeeds] = useState<string>('');
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateActivities = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setActivities([]);
    setSelectedActivities([]);

    try {
      const result = await generateActivities(ageYears, ageMonths, skill, specialNeeds);
      setActivities(result);
      setStep('activities');
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddToPlan = (activityToAdd: Activity) => {
    setSelectedActivities(prev => {
        if (prev.some(a => a.name === activityToAdd.name)) {
            return prev.filter(a => a.name !== activityToAdd.name); // Deselect
        } else {
            return [...prev, activityToAdd]; // Select
        }
    });
  };

  const handleStartOver = () => {
    setStep('profile');
    setActivities([]);
    setSelectedActivities([]);
    setError(null);
  };

  const WelcomeMessage = () => (
    <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 mt-8">
        <h2 className="text-2xl font-extrabold text-brand-primary mb-2">Welcome to Nurture AI Planner!</h2>
        <p className="text-text-medium max-w-2xl mx-auto">
            Ready to discover and plan fun activities for your child?
            Enter their details, pick your favorite ideas, and let our AI build a personalized daily schedule for you!
        </p>
    </div>
  );

  const LoadingSpinner = () => (
     <div className="text-center text-text-medium py-12">
        <svg className="animate-spin h-10 w-10 text-brand-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-bold text-brand-secondary">Our AI is crafting the perfect activities...</p>
        <p className="mt-1">This might take a moment. Great things are coming!</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-light font-sans text-text-dark">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {step !== 'profile' && (
             <div className="mb-6">
                <button onClick={handleStartOver} className="text-sm font-bold text-text-medium hover:text-text-dark">
                    &larr; Start Over
                </button>
            </div>
        )}
       
        {step === 'profile' && (
            <InputForm
                ageYears={ageYears}
                setAgeYears={setAgeYears}
                ageMonths={ageMonths}
                setAgeMonths={setAgeMonths}
                skill={skill}
                setSkill={setSkill}
                specialNeeds={specialNeeds}
                setSpecialNeeds={setSpecialNeeds}
                onSubmit={handleGenerateActivities}
                isLoading={isLoading}
            />
        )}

        {isLoading && <LoadingSpinner />}
        
        {error && (
            <div className="text-center p-6 bg-red-100 border-2 border-red-300 text-red-800 rounded-lg">
                <h3 className="font-bold">Oops! Something went wrong.</h3>
                <p>{error}</p>
            </div>
        )}

        {step === 'profile' && !isLoading && <WelcomeMessage />}
        
        {step === 'activities' && !isLoading && activities.length > 0 && (
            <section>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-brand-primary mb-2">2. Choose Your Activities</h2>
                    <p className="text-text-medium max-w-2xl mx-auto">Select the activities you'd like to include in your daily plan.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {activities.map((activity, index) => (
                        <ActivityCard 
                            key={index} 
                            activity={activity} 
                            onAddToPlan={handleAddToPlan}
                            isSelected={selectedActivities.some(a => a.name === activity.name)}
                        />
                    ))}
                </div>
                 {selectedActivities.length > 0 && (
                    <div className="sticky bottom-0 py-4 flex justify-center">
                         <button 
                            onClick={() => setStep('planner')}
                            className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full shadow-lg text-white bg-accent-coral hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-coral transition-transform duration-200 hover:scale-105"
                         >
                            Create Plan with {selectedActivities.length} {selectedActivities.length === 1 ? 'Activity' : 'Activities'} &rarr;
                         </button>
                    </div>
                )}
            </section>
        )}
        
        {step === 'planner' && (
            <Planner 
                selectedActivities={selectedActivities}
                ageYears={ageYears}
                ageMonths={ageMonths}
                specialNeeds={specialNeeds}
                onBack={() => setStep('activities')}
            />
        )}

      </main>
      <footer className="text-center py-6 text-sm text-gray-500">
        <p>Powered by Gemini. Designed for happy parents.</p>
      </footer>
    </div>
  );
};

export default App;
