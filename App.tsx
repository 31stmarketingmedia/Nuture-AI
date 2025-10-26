import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ActivityCard from './components/ActivityCard';
import { generateActivities } from './services/geminiService';
import { Activity } from './types';
import { SKILL_OPTIONS } from './constants';
import LiveChat from './components/LiveChat';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zm0 12a5 5 0 0 1-5-5V5a5 5 0 0 1 10 0v6a5 5 0 0 1-5 5z"/>
        <path d="M19 11a1 1 0 0 1 2 0v1a7 7 0 0 1-14 0v-1a1 1 0 0 1 2 0v1a5 5 0 0 0 10 0v-1z"/>
        <path d="M12 19a1 1 0 0 1-1 1H5a1 1 0 0 1 0-2h6a1 1 0 0 1 1 1z"/>
    </svg>
);


const App: React.FC = () => {
  const [ageYears, setAgeYears] = useState<string>('0');
  const [ageMonths, setAgeMonths] = useState<string>('9');
  const [skill, setSkill] = useState<string>(SKILL_OPTIONS[0].value);
  const [specialNeeds, setSpecialNeeds] = useState<string>('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);


  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setActivities([]);

    try {
      const result = await generateActivities(ageYears, ageMonths, skill, specialNeeds);
      setActivities(result);
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

  const WelcomeMessage = () => (
    <div className="text-center p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-200 mt-8">
        <h2 className="text-2xl font-extrabold text-brand-primary mb-2">Welcome to Nurture AI!</h2>
        <p className="text-text-medium max-w-2xl mx-auto">
            Ready to discover fun and engaging activities tailored to your child's development?
            Just enter their age, select a skill, add any special considerations, and let our AI create a personalized plan!
        </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-light font-sans text-text-dark">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <section id="input-section" className="mb-8 md:mb-12">
            <InputForm
                ageYears={ageYears}
                setAgeYears={setAgeYears}
                ageMonths={ageMonths}
                setAgeMonths={setAgeMonths}
                skill={skill}
                setSkill={setSkill}
                specialNeeds={specialNeeds}
                setSpecialNeeds={setSpecialNeeds}
                onSubmit={handleGenerate}
                isLoading={isLoading}
            />
        </section>

        <section id="image-generator-section" className="mb-8 md:mb-12">
            <ImageGenerator />
        </section>
        
        <section id="image-editor-section">
            <ImageEditor />
        </section>

        <section id="results-section" className="mt-8 md:mt-12">
            {error && (
                <div className="text-center p-6 bg-red-100 border-2 border-red-300 text-red-800 rounded-lg">
                    <h3 className="font-bold">Oops! Something went wrong.</h3>
                    <p>{error}</p>
                </div>
            )}

            {!hasSearched && !isLoading && <WelcomeMessage />}

            {isLoading && (
                 <div className="text-center text-text-medium py-12">
                    <p className="text-xl font-bold text-brand-secondary">Our AI is crafting the perfect activities...</p>
                    <p className="mt-1">This might take a moment. Great things are coming!</p>
                </div>
            )}
            
            {!isLoading && activities.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {activities.map((activity, index) => (
                        <ActivityCard key={index} activity={activity} />
                    ))}
                </div>
            )}
            
            {hasSearched && !isLoading && activities.length === 0 && !error && (
                 <div className="text-center p-8 bg-white rounded-2xl shadow-lg border-2 border-gray-200 mt-8">
                    <h2 className="text-2xl font-extrabold text-brand-primary mb-2">No Activities Found</h2>
                    <p className="text-text-medium max-w-2xl mx-auto">
                        We couldn't generate activities for these details. Please try adjusting the age or skill and try again.
                    </p>
                </div>
            )}
        </section>
      </main>
      <footer className="text-center py-6 text-sm text-gray-500">
        <p>Powered by Gemini. Designed for happy parents.</p>
      </footer>

       {isChatVisible && <LiveChat onClose={() => setIsChatVisible(false)} />}
      
       <button
        onClick={() => setIsChatVisible(true)}
        className="fixed bottom-6 right-6 bg-brand-primary text-white p-4 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transform transition-transform duration-200 hover:scale-110"
        aria-label="Start voice chat with AI assistant"
      >
        <MicIcon />
      </button>

    </div>
  );
};

export default App;